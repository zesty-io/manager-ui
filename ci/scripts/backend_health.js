#!/usr/bin/env node
/*
 * Reads backend-5xx markers (from cypress/support/e2e.js) and prints a Markdown
 * banner if any failures were backend-caused; prints nothing otherwise.
 * Usage: node ci/scripts/backend_health.js <markers-dir>
 */
const fs = require("fs");
const path = require("path");

const root = process.argv[2] || "backend-markers";

function findJsonl(dir) {
  const out = [];
  let entries;
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return out;
  }
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...findJsonl(full));
    else if (e.isFile() && e.name.endsWith(".jsonl")) out.push(full);
  }
  return out;
}

const byTest = new Map();
const specs = new Set();

for (const file of findJsonl(root)) {
  let text;
  try {
    text = fs.readFileSync(file, "utf8");
  } catch {
    continue;
  }
  for (const line of text.split("\n")) {
    if (!line.trim()) continue;
    let e;
    try {
      e = JSON.parse(line);
    } catch {
      continue;
    }
    const spec = (e.spec || "").replace(/^.*cypress\/e2e\//, "cypress/e2e/");
    const key = `${spec} :: ${e.test}`;
    const rec =
      byTest.get(key) || { reasons: new Set(), statuses: new Set(), urls: new Set(), err: "" };
    if (e.reason) rec.reasons.add(e.reason);
    for (const r of e.responses || []) {
      if (r.status) rec.statuses.add(r.status);
      if (r.url) rec.urls.add(String(r.url).replace(/\?.*$/, ""));
    }
    if (e.errorSnippet && !rec.err) rec.err = e.errorSnippet;
    byTest.set(key, rec);
    specs.add(spec);
  }
}

if (byTest.size === 0) {
  // No backend-attributed failures — say nothing (real failure or green run).
  process.exit(0);
}

const lines = [];
lines.push("<!-- backend-health -->");
lines.push("## 🚑 Backend-caused failures detected");
lines.push("");
lines.push(
  `**${byTest.size}** test failure(s) across **${specs.size}** spec(s) coincided with backend ` +
    `errors (**5xx / timeouts**). This run was most likely hit by **dev-instance instability**, ` +
    `not test or app bugs — **escalate to the backend team and re-run** before triaging these specs.`
);
lines.push("");
lines.push("| Test | Reason | Status / detail |");
lines.push("| --- | --- | --- |");
for (const [key, rec] of [...byTest.entries()].slice(0, 50)) {
  const detail =
    [...rec.statuses].join(", ") ||
    (rec.err ? rec.err.replace(/\|/g, "\\|").slice(0, 90) : "");
  lines.push(
    `| ${key.replace(/\|/g, "\\|")} | ${[...rec.reasons].join(", ")} | ${detail} |`
  );
}
if (byTest.size > 50) lines.push(`| _…and ${byTest.size - 50} more_ | | |`);

process.stdout.write(lines.join("\n") + "\n");
