#!/usr/bin/env node
/**
 * Month-to-date Claude Code spend, keyed by session id.
 *
 *   node ~/.claude/scripts/budget.js --month-total     # one number, for the statusline
 *   node ~/.claude/scripts/budget.js --report          # human breakdown, for auditing
 *   node ~/.claude/scripts/budget.js --reconcile       # rescan sources, update the ledger
 *
 * Why a ledger instead of a running total: the old scheme added a session's cost
 * to budget.json when the SessionEnd hook fired, and dropped it entirely when the
 * hook did not. Keying every observation by session id makes the merge idempotent,
 * so a source can be re-read any number of times without double counting, and a
 * session is only missing if no source ever saw it.
 *
 * Two independent sources are merged:
 *   live       — .session_costs/<session_id>, rewritten by the statusline hook on
 *                every render, so it covers sessions that are still running.
 *   transcript — the `cost-state` record in projects/<slug>/<session_id>.jsonl,
 *                written when a session ends. Carries startTime, so the month is
 *                exact rather than inferred from a file mtime.
 */

const fs = require("node:fs");
const path = require("node:path");

const MONTHLY_BUDGET = Number(process.env.CLAUDE_MONTHLY_BUDGET) || 2000;

function claudeDir() {
  return process.env.CLAUDE_CONFIG_DIR || path.join(process.env.HOME || "", ".claude");
}

const LEDGER_NAME = "budget-ledger.json";

/** YYYY-MM in local time, matching how a monthly budget is actually read. */
function monthOf(epochMs) {
  const d = new Date(epochMs);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function currentMonth() {
  return monthOf(Date.now());
}

/**
 * Collapse observations to one entry per session.
 *
 * Cost: the largest wins. A live file is a mid-session snapshot and a transcript
 * is the final figure, but a session still running has no transcript yet, so
 * neither source is reliably the fresher one.
 * Month: a transcript's startTime beats a live file's mtime, which only records
 * the last statusline render.
 */
function mergeSessions(entries) {
  const merged = {};
  for (const { sessionId, month, cost, source } of entries) {
    const prev = merged[sessionId];
    if (!prev) {
      merged[sessionId] = { month, cost, source };
      continue;
    }
    if (cost > prev.cost) {
      prev.cost = cost;
      prev.source = source;
    }
    if (source === "transcript" && prev.month !== month) prev.month = month;
  }
  return merged;
}

/** Spend recorded for one month: per-session entries plus any pre-ledger total. */
function monthTotal(ledger, month) {
  if (!ledger) return 0;
  const sessions = ledger.sessions || {};
  let total = 0;
  for (const entry of Object.values(sessions)) {
    if (entry && entry.month === month) total += Number(entry.cost) || 0;
  }
  total += Number((ledger.legacy || {})[month]) || 0;
  return Math.round(total * 1e6) / 1e6;
}

/**
 * Carry the old budget.json forward as opaque per-month totals, but only for
 * months the ledger cannot reconstruct itself. From the cutover month on, spend
 * is derived per session id, so keeping the old running total too would double
 * count every session that both sources know about.
 */
function seedLegacy(budget, cutoverMonth) {
  const legacy = {};
  if (!budget || typeof budget !== "object") return legacy;
  for (const [month, value] of Object.entries(budget)) {
    if (month >= cutoverMonth) continue;
    const amount = Number(value);
    if (Number.isFinite(amount)) legacy[month] = amount;
  }
  return legacy;
}

function readLedger(dir = claudeDir()) {
  try {
    const parsed = JSON.parse(fs.readFileSync(path.join(dir, LEDGER_NAME), "utf8"));
    return {
      sessions: parsed.sessions || {},
      legacy: parsed.legacy || {},
      scanned: parsed.scanned || {},
      reconciledAt: parsed.reconciledAt || null,
    };
  } catch {
    return { sessions: {}, legacy: {}, scanned: {}, reconciledAt: null };
  }
}

/** Write via a temp file so a concurrent reader never sees a half-written ledger. */
function writeLedger(ledger, dir = claudeDir()) {
  const target = path.join(dir, LEDGER_NAME);
  const tmp = `${target}.${process.pid}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(ledger, null, 2));
  fs.renameSync(tmp, target);
}

/** Cost files the statusline hook keeps current, one per live session. */
function readLive(dir = claudeDir()) {
  const costsDir = path.join(dir, ".session_costs");
  const entries = [];
  let names = [];
  try {
    names = fs.readdirSync(costsDir);
  } catch {
    return entries;
  }
  for (const name of names) {
    const file = path.join(costsDir, name);
    let stat;
    try {
      stat = fs.statSync(file);
    } catch {
      continue;
    }
    if (!stat.isFile()) continue;
    const cost = parseFloat(fs.readFileSync(file, "utf8").trim());
    if (!Number.isFinite(cost)) continue;
    entries.push({ sessionId: name, month: monthOf(stat.mtimeMs), cost, source: "live" });
  }
  return entries;
}

// A transcript can run to tens of megabytes, but the cost-state record is written
// at the very end of a session and in practice sits in the last few lines. Reading
// a bounded tail keeps the scan fast and memory flat.
const TAIL_BYTES = 1024 * 1024;

/** Last TAIL_BYTES of a file as text, or "" if it cannot be read. */
function readTail(file, bytes = TAIL_BYTES) {
  let fd;
  try {
    const { size } = fs.statSync(file);
    const length = Math.min(size, bytes);
    const buffer = Buffer.allocUnsafe(length);
    fd = fs.openSync(file, "r");
    fs.readSync(fd, buffer, 0, length, size - length);
    return buffer.toString("utf8");
  } catch {
    return "";
  } finally {
    if (fd !== undefined) {
      try {
        fs.closeSync(fd);
      } catch {}
    }
  }
}

/** Parse cost-state records out of transcript text. Partial first lines are fine. */
function costStatesFromText(text, fallbackMs) {
  const entries = [];
  if (!text.includes('"cost-state"')) return entries;
  for (const line of text.split("\n")) {
    if (!line.includes('"cost-state"')) continue;
    let record;
    try {
      record = JSON.parse(line);
    } catch {
      continue; // truncated head of a tail read, or a partially flushed write
    }
    if (record.type !== "cost-state") continue;
    const cost = Number(record.totalCostUSD);
    if (!Number.isFinite(cost)) continue;
    entries.push({
      sessionId: record.sessionId,
      month: monthOf(record.startTime || fallbackMs),
      cost,
      source: "transcript",
    });
  }
  return entries;
}

/** Cheap identity for "this file has not changed since the last scan". */
function fileStamp(stat) {
  return `${stat.mtimeMs}:${stat.size}`;
}

/**
 * `cost-state` records across all transcripts. Files whose stamp is unchanged
 * since the previous reconcile are skipped, so only the first run pays for the
 * whole tree.
 */
function readTranscripts(dir = claudeDir(), scanned = {}) {
  const projectsDir = path.join(dir, "projects");
  const entries = [];
  const stamps = {};
  let projects = [];
  try {
    projects = fs.readdirSync(projectsDir);
  } catch {
    return { entries, stamps };
  }
  for (const project of projects) {
    const projectPath = path.join(projectsDir, project);
    let files = [];
    try {
      files = fs.readdirSync(projectPath).filter((f) => f.endsWith(".jsonl"));
    } catch {
      continue;
    }
    for (const file of files) {
      const full = path.join(projectPath, file);
      let stat;
      try {
        stat = fs.statSync(full);
      } catch {
        continue;
      }
      const stamp = fileStamp(stat);
      stamps[full] = stamp;
      if (scanned[full] === stamp) continue; // already folded into the ledger
      for (const entry of costStatesFromText(readTail(full), stat.mtimeMs)) {
        entries.push({ ...entry, sessionId: entry.sessionId || path.basename(file, ".jsonl") });
      }
    }
  }
  return { entries, stamps };
}

/**
 * Rebuild the ledger from both sources. Idempotent: existing entries are folded
 * back in, so a source that has since been pruned from disk is not forgotten.
 */
function reconcile(dir = claudeDir()) {
  const first = !fs.existsSync(path.join(dir, LEDGER_NAME));
  const ledger = readLedger(dir);
  if (first) {
    let budget = null;
    try {
      budget = JSON.parse(fs.readFileSync(path.join(dir, "budget.json"), "utf8"));
    } catch {}
    ledger.legacy = seedLegacy(budget, currentMonth());
  }
  const existing = Object.entries(ledger.sessions).map(([sessionId, e]) => ({ sessionId, ...e }));
  const { entries, stamps } = readTranscripts(dir, ledger.scanned);
  const merged = mergeSessions([...existing, ...entries, ...readLive(dir)]);
  const next = {
    sessions: merged,
    legacy: ledger.legacy,
    scanned: stamps,
    reconciledAt: new Date().toISOString(),
  };
  writeLedger(next, dir);
  return next;
}

/** Ledger plus live files, without the expensive transcript scan. */
function fastLedger(dir = claudeDir()) {
  const ledger = readLedger(dir);
  const existing = Object.entries(ledger.sessions).map(([sessionId, e]) => ({ sessionId, ...e }));
  return { ...ledger, sessions: mergeSessions([...existing, ...readLive(dir)]) };
}

function parseArgs(argv) {
  const opts = { command: "month-total", month: "" };
  for (const arg of argv) {
    if (arg === "--month-total") opts.command = "month-total";
    else if (arg === "--report") opts.command = "report";
    else if (arg === "--reconcile") opts.command = "reconcile";
    else if (arg === "--statusline") opts.command = "statusline";
    else if (/^\d{4}-\d{2}$/.test(arg)) opts.month = arg;
  }
  return opts;
}

function report(dir, month) {
  const ledger = reconcile(dir);
  const rows = Object.entries(ledger.sessions)
    .filter(([, e]) => e.month === month)
    .sort((a, b) => b[1].cost - a[1].cost);
  const total = monthTotal(ledger, month);
  const legacy = Number((ledger.legacy || {})[month]) || 0;

  const lines = [`Claude Code spend — ${month}`, ""];
  lines.push(`  ${"session".padEnd(38)}${"source".padEnd(12)}${"USD".padStart(10)}`);
  for (const [id, e] of rows) {
    lines.push(`  ${id.padEnd(38)}${e.source.padEnd(12)}${e.cost.toFixed(2).padStart(10)}`);
  }
  if (legacy) lines.push(`  ${"(pre-ledger total)".padEnd(38)}${"legacy".padEnd(12)}${legacy.toFixed(2).padStart(10)}`);
  lines.push("");
  lines.push(`  sessions:  ${rows.length}`);
  lines.push(`  spent:     $${total.toFixed(2)}`);
  lines.push(`  budget:    $${MONTHLY_BUDGET.toFixed(2)}`);
  lines.push(`  remaining: $${(MONTHLY_BUDGET - total).toFixed(2)}  (${((total / MONTHLY_BUDGET) * 100).toFixed(1)}% used)`);
  lines.push("");
  lines.push(`  reconciled ${ledger.reconciledAt}`);
  return lines.join("\n");
}

function main() {
  const { command, month: requested } = parseArgs(process.argv.slice(2));
  const dir = claudeDir();
  const month = requested || currentMonth();

  if (command === "month-total" || command === "statusline") {
    // Hot path: runs on every statusline render, so the transcript scan is skipped.
    const total = monthTotal(fastLedger(dir), month).toFixed(4);
    // "--statusline" also emits the limit, so the budget lives in one place only.
    process.stdout.write(command === "statusline" ? `${total} ${MONTHLY_BUDGET}` : total);
    return;
  }
  if (command === "reconcile") {
    const ledger = reconcile(dir);
    process.stdout.write(`${Object.keys(ledger.sessions).length} sessions, ${month} total $${monthTotal(ledger, month).toFixed(2)}\n`);
    return;
  }
  process.stdout.write(`${report(dir, month)}\n`);
}

if (require.main === module) {
  try {
    main();
  } catch {
    // A statusline must never break because accounting failed.
    process.stdout.write("0");
  }
  process.exit(0);
}

module.exports = { mergeSessions, monthTotal, monthOf, currentMonth, parseArgs, seedLegacy, costStatesFromText, fileStamp, readTail, readLive, readTranscripts, readLedger, writeLedger, reconcile, fastLedger, MONTHLY_BUDGET };
