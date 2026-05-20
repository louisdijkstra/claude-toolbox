// ~/.claude/skills/plan-explorer/static/app.js
const TOKEN = new URLSearchParams(location.search).get("t");

async function fetchPlan() {
  const r = await fetch(`/plan?t=${TOKEN}`);
  if (!r.ok) throw new Error(`load: ${r.status}`);
  return { body: await r.text(), etag: r.headers.get("ETag") };
}

window.addEventListener("DOMContentLoaded", async () => {
  try {
    const { body } = await fetchPlan();
    document.getElementById("content").textContent = body;
    document.getElementById("title").textContent = "(raw)";
  } catch (e) {
    document.getElementById("title").textContent = "Failed to load";
    console.error(e);
  }
});
