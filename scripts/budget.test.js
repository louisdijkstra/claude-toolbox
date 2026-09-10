const test = require("node:test");
const assert = require("node:assert");
const { mergeSessions, monthTotal, monthOf, parseArgs, seedLegacy, costStatesFromText, fileStamp } = require("./budget.js");

const entry = (overrides) => ({ sessionId: "s1", month: "2026-09", cost: 1, source: "live", ...overrides });

test("a session seen once is kept as-is", () => {
  const merged = mergeSessions([entry({ cost: 12.5 })]);
  assert.deepEqual(merged, { s1: { month: "2026-09", cost: 12.5, source: "live" } });
});

test("the same session from two sources is counted once, highest cost wins", () => {
  // A live cost file is a snapshot mid-session; the transcript is written at the
  // end. Either can be the fresher number, so take the larger.
  const merged = mergeSessions([
    entry({ cost: 5, source: "live" }),
    entry({ cost: 19.04, source: "transcript" }),
  ]);
  assert.equal(Object.keys(merged).length, 1);
  assert.equal(merged.s1.cost, 19.04);
});

test("a lower-cost later entry does not overwrite a higher one", () => {
  const merged = mergeSessions([
    entry({ cost: 19.04, source: "transcript" }),
    entry({ cost: 5, source: "live" }),
  ]);
  assert.equal(merged.s1.cost, 19.04);
});

test("transcript month wins over live month for the same session", () => {
  // The transcript carries the real startTime; a live file only has its mtime,
  // which drifts to whenever the statusline last rendered.
  const merged = mergeSessions([
    entry({ month: "2026-10", cost: 3, source: "live" }),
    entry({ month: "2026-09", cost: 3, source: "transcript" }),
  ]);
  assert.equal(merged.s1.month, "2026-09");
});

test("distinct sessions are kept apart", () => {
  const merged = mergeSessions([entry({ sessionId: "a", cost: 2 }), entry({ sessionId: "b", cost: 3 })]);
  assert.equal(Object.keys(merged).length, 2);
});

test("monthTotal sums only the requested month", () => {
  const ledger = {
    sessions: {
      a: { month: "2026-09", cost: 10 },
      b: { month: "2026-09", cost: 2.5 },
      c: { month: "2026-08", cost: 100 },
    },
    legacy: {},
  };
  assert.equal(monthTotal(ledger, "2026-09"), 12.5);
});

test("monthTotal includes legacy months recorded before the ledger existed", () => {
  const ledger = { sessions: {}, legacy: { "2026-06": 35544.39 } };
  assert.equal(monthTotal(ledger, "2026-06"), 35544.39);
});

test("legacy and per-session entries add up for the same month", () => {
  const ledger = { sessions: { a: { month: "2026-07", cost: 1.5 } }, legacy: { "2026-07": 10 } };
  assert.equal(monthTotal(ledger, "2026-07"), 11.5);
});

test("monthTotal is 0 for a month with no data", () => {
  assert.equal(monthTotal({ sessions: {}, legacy: {} }, "2026-01"), 0);
});

test("monthTotal tolerates a malformed ledger", () => {
  assert.equal(monthTotal({}, "2026-09"), 0);
  assert.equal(monthTotal(null, "2026-09"), 0);
});

test("monthOf formats a local-time month from epoch ms", () => {
  const ms = new Date(2026, 8, 15, 12, 0, 0).getTime(); // month index 8 = September
  assert.equal(monthOf(ms), "2026-09");
});

test("seedLegacy keeps months that predate the cutover", () => {
  const budget = { "2026-06": 35544.39, "2026-07": 429.18, "2026-08": 4484.23 };
  assert.deepEqual(seedLegacy(budget, "2026-09"), budget);
});

test("seedLegacy drops the cutover month and later, which the ledger owns", () => {
  // Those sessions are recovered per-id from transcripts and live files. Keeping
  // the old running total as well would count them twice.
  const budget = { "2026-08": 4484.23, "2026-09": 16.77, "2026-10": 5 };
  assert.deepEqual(seedLegacy(budget, "2026-09"), { "2026-08": 4484.23 });
});

test("seedLegacy handles a missing or broken budget file", () => {
  assert.deepEqual(seedLegacy(null, "2026-09"), {});
  assert.deepEqual(seedLegacy({ "2026-08": "not a number" }, "2026-09"), {});
});

const costState = (id, cost, startMs) =>
  JSON.stringify({ type: "cost-state", sessionId: id, totalCostUSD: cost, startTime: startMs });

test("costStatesFromText pulls the cost record out of a transcript tail", () => {
  const start = new Date(2026, 8, 2, 9, 0, 0).getTime();
  const text = ['{"type":"user"}', costState("abc", 12.5, start), ""].join("\n");
  assert.deepEqual(costStatesFromText(text, "fallback"), [
    { sessionId: "abc", month: "2026-09", cost: 12.5, source: "transcript" },
  ]);
});

test("costStatesFromText ignores a truncated leading line", () => {
  // A tail read starts mid-line; that fragment must not abort the parse.
  const start = new Date(2026, 8, 2, 9, 0, 0).getTime();
  const text = ['ol":"broken json fragment', costState("abc", 3, start)].join("\n");
  assert.equal(costStatesFromText(text, "fallback").length, 1);
});

test("costStatesFromText falls back to the file's month when startTime is absent", () => {
  const fallbackMs = new Date(2026, 6, 4, 9, 0, 0).getTime();
  const text = JSON.stringify({ type: "cost-state", sessionId: "abc", totalCostUSD: 1 });
  assert.equal(costStatesFromText(text, fallbackMs)[0].month, "2026-07");
});

test("costStatesFromText returns nothing for a transcript without cost records", () => {
  assert.deepEqual(costStatesFromText('{"type":"user"}\n{"type":"assistant"}', 0), []);
});

test("fileStamp changes when a file is appended to", () => {
  assert.notEqual(fileStamp({ mtimeMs: 100, size: 10 }), fileStamp({ mtimeMs: 100, size: 20 }));
  assert.equal(fileStamp({ mtimeMs: 100, size: 10 }), fileStamp({ mtimeMs: 100, size: 10 }));
});

test("parseArgs recognises the commands", () => {
  assert.deepEqual(parseArgs(["--month-total"]), { command: "month-total", month: "" });
  assert.deepEqual(parseArgs(["--report", "2026-08"]), { command: "report", month: "2026-08" });
  assert.deepEqual(parseArgs(["--reconcile"]), { command: "reconcile", month: "" });
  assert.deepEqual(parseArgs([]), { command: "month-total", month: "" });
});
