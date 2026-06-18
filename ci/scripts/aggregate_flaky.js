#!/usr/bin/env node
/*
 * Aggregate flaky-hunter results.
 *
 * Reads every mochawesome JSON produced by ci/scripts/flaky_loop.sh across all
 * runners and iterations, then classifies each spec and each test by how often
 * it failed:
 *
 *   flaky   -> failed in SOME runs but not all   (the thing we're hunting)
 *   broken  -> failed in EVERY run               (genuinely failing, not flaky)
 *   stable  -> never failed
 *
 * Emits a Markdown report to stdout (piped into $GITHUB_STEP_SUMMARY) and writes
 * a machine-readable flaky-report.json next to the cwd.
 *
 * Usage: node ci/scripts/aggregate_flaky.js <artifacts-dir>
 *   <artifacts-dir> contains flaky-results-<split>/iter-<n>/spec-*.json
 */
const fs = require("fs");
const path = require("path");

const root = process.argv[2] || "flaky-artifacts";

/** Recursively find every *.json file under a directory. */
function findJson(dir) {
  const out = [];
  let entries;
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return out;
  }
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...findJson(full));
    else if (e.isFile() && e.name.endsWith(".json")) out.push(full);
  }
  return out;
}

/** Recursively find every file with a given name under a directory. */
function findByName(dir, name) {
  const out = [];
  let entries;
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return out;
  }
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...findByName(full, name));
    else if (e.isFile() && e.name === name) out.push(full);
  }
  return out;
}

/** Flatten mochawesome's nested suites into a flat list of tests. */
function collectTests(suite, acc) {
  if (!suite) return acc;
  for (const t of suite.tests || []) acc.push(t);
  for (const s of suite.suites || []) collectTests(s, acc);
  return acc;
}

// Failure error messages that indicate backend instability (not test/app bugs).
// Covers BOTH 5xx responses AND timeouts/no-response — a degraded instance often
// hangs rather than returning a 502, so error-message matching is the catch-all
// that the response-status middleware can't see.
const BACKEND_ERR_RE =
  /\b(50[0-9])\b|bad gateway|service unavailable|gateway time-?out|timed out (retrying )?.*(request to the route|for a response|waiting)|cy\.request\(\) timed out|cy\.task\(['"]seed:content['"]\) timed out|failed to create model|econnrefused|esockettimedout|etimedout|socket hang up|network error|ehostunreach/i;

function extractErr(t) {
  return t?.err?.message || t?.err?.estack || t?.err?.name || "";
}

// spec path -> { runs, fails }
const specStats = new Map();
// "<spec> :: <test full title>" -> { runs, fails, spec, title }
const testStats = new Map();
// "<spec> :: <test>" -> { count, statuses:Set, urls:Set } — failures whose error
// text matches backend instability. Merged with the middleware 5xx markers below.
const backendByErr = new Map();

let filesRead = 0;
const files = findJson(root);

for (const file of files) {
  let data;
  try {
    data = JSON.parse(fs.readFileSync(file, "utf8"));
  } catch {
    continue;
  }
  // mochawesome shape: { stats, results: [ { file, fullFile, suites, tests } ] }
  if (!data || !Array.isArray(data.results)) continue;
  filesRead++;

  for (const result of data.results) {
    const spec =
      result.file ||
      (result.fullFile ? result.fullFile.split(/[\\/]/).slice(-3).join("/") : "unknown-spec");

    // collectTests already walks result.tests and recurses result.suites.
    const tests = collectTests(result, []);

    // A spec "run" failed if any of its tests failed.
    let specFailed = false;
    for (const t of tests) {
      const failed = t.fail === true || t.state === "failed";
      if (t.state === "pending" || t.pending === true) continue; // skipped, ignore
      const key = `${spec} :: ${t.fullTitle || t.title}`;
      const ts = testStats.get(key) || { runs: 0, fails: 0, spec, title: t.fullTitle || t.title };
      ts.runs++;
      if (failed) {
        ts.fails++;
        specFailed = true;
        // Attribute to backend instability if the error text says so (timeouts,
        // 5xx, connection failures, seed-task timeouts).
        const errText = extractErr(t);
        if (BACKEND_ERR_RE.test(errText)) {
          const rec = backendByErr.get(key) || { count: 0, statuses: new Set(), urls: new Set() };
          rec.count += 1;
          const status = (errText.match(/\b(50[0-9])\b/) || [])[1];
          if (status) rec.statuses.add(Number(status));
          else rec.statuses.add("timeout/no-response");
          backendByErr.set(key, rec);
        }
      }
      testStats.set(key, ts);
    }

    const ss = specStats.get(spec) || { runs: 0, fails: 0 };
    ss.runs++;
    if (specFailed) ss.fails++;
    specStats.set(spec, ss);
  }
}

// Backend 5xx markers (recorded by the afterEach hook in cypress/support/e2e.js)
// let us attribute failures to backend instability rather than test flakiness.
// "<spec> :: <test>" -> { count, statuses:Set, urls:Set }
const backendByTest = new Map();
const backendBySpec = new Map(); // spec -> total 5xx-coincident failures
for (const file of findByName(root, "backend-5xx.jsonl")) {
  let text;
  try {
    text = fs.readFileSync(file, "utf8");
  } catch {
    continue;
  }
  for (const line of text.split("\n")) {
    if (!line.trim()) continue;
    let entry;
    try {
      entry = JSON.parse(line);
    } catch {
      continue;
    }
    const spec = (entry.spec || "").replace(/^.*cypress\/e2e\//, "cypress/e2e/");
    const key = `${spec} :: ${entry.test}`;
    const rec = backendByTest.get(key) || { count: 0, statuses: new Set(), urls: new Set() };
    rec.count += entry.count || 1;
    for (const r of entry.responses || []) {
      rec.statuses.add(r.status);
      rec.urls.add((r.url || "").replace(/\?.*$/, ""));
    }
    backendByTest.set(key, rec);
    backendBySpec.set(spec, (backendBySpec.get(spec) || 0) + 1);
  }
}

// Merge in error-message-based backend attribution (timeouts / no-response that
// the 5xx middleware can't see). This is what catches a full backend outage.
for (const [key, rec] of backendByErr.entries()) {
  const existing = backendByTest.get(key) || { count: 0, statuses: new Set(), urls: new Set() };
  existing.count += rec.count;
  for (const s of rec.statuses) existing.statuses.add(s);
  backendByTest.set(key, existing);
  const spec = key.split(" :: ")[0];
  backendBySpec.set(spec, (backendBySpec.get(spec) || 0) + 1);
}

function classify(runs, fails) {
  if (fails === 0) return "stable";
  if (fails === runs) return "broken";
  return "flaky";
}

const specRows = [...specStats.entries()]
  .map(([spec, { runs, fails }]) => ({
    spec,
    runs,
    fails,
    rate: runs ? fails / runs : 0,
    status: classify(runs, fails),
  }))
  .sort((a, b) => b.rate - a.rate || b.runs - a.runs);

const flakyTests = [...testStats.values()]
  .map((t) => ({ ...t, rate: t.runs ? t.fails / t.runs : 0, status: classify(t.runs, t.fails) }))
  .filter((t) => t.status !== "stable")
  .sort((a, b) => {
    // flaky first, then by fail rate
    if (a.status !== b.status) return a.status === "flaky" ? -1 : 1;
    return b.rate - a.rate;
  });

const pct = (r) => `${(r * 100).toFixed(0)}%`;
const flakySpecs = specRows.filter((s) => s.status === "flaky");
const brokenSpecs = specRows.filter((s) => s.status === "broken");

const lines = [];
lines.push("## 🎯 Flaky-Hunter Report");
lines.push("");
if (filesRead === 0) {
  lines.push(
    "> ⚠️ No mochawesome result files were found. The suite may have crashed before producing reports — check the runner logs."
  );
} else {
  lines.push(
    `Parsed **${filesRead}** spec-result files. ` +
      `**${flakySpecs.length}** flaky spec(s), **${brokenSpecs.length}** consistently-failing spec(s), ` +
      `**${specRows.filter((s) => s.status === "stable").length}** stable.`
  );
  lines.push("");

  // Run-level backend-health banner. If many specs hit EXPLICIT backend errors
  // (5xx / timeouts), the instance was degraded during this run — the whole run
  // is suspect (including downstream "element not found" failures whose error
  // text looks like a test bug but was really data that never loaded). Tell the
  // reader to rerun before triaging individual specs.
  const backendSpecCount = backendBySpec.size;
  const nonStableCount = specRows.filter((s) => s.status !== "stable").length;
  if (backendSpecCount > 0 && (backendSpecCount >= 3 || backendSpecCount >= nonStableCount / 2)) {
    lines.push(
      `> 🚑 **Likely a backend-degraded run.** ${backendSpecCount} spec(s) hit explicit ` +
        `backend errors (5xx / timeouts). The dev instance was unhealthy, so many of the ` +
        `${nonStableCount} non-stable specs — including ones that just show "element not found" ` +
        `(data never loaded) — are probably **not** real failures. **Escalate to the backend ` +
        `team and re-run** before triaging individual specs.`
    );
    lines.push("");
  }

  const specHadBackend = (spec) => backendBySpec.has(spec);

  lines.push("### Spec-level (sorted by fail rate)");
  lines.push("");
  lines.push("| Spec | Status | Failed / Runs | Fail rate | Backend 5xx? |");
  lines.push("| --- | --- | --- | --- | --- |");
  for (const s of specRows.filter((s) => s.status !== "stable")) {
    const icon = s.status === "flaky" ? "🟡 flaky" : "🔴 broken";
    const backend = specHadBackend(s.spec) ? "🔧 yes — backend" : "";
    lines.push(
      `| \`${s.spec}\` | ${icon} | ${s.fails} / ${s.runs} | ${pct(s.rate)} | ${backend} |`
    );
  }
  if (specRows.every((s) => s.status === "stable")) {
    lines.push("| _All specs stable across all iterations_ | 🟢 | - | - | - |");
  }
  lines.push("");

  // Backend-caused failures: failures that coincided with a backend 5xx. These
  // are infrastructure issues to route to the backend team, NOT test flakiness.
  if (backendByTest.size > 0) {
    lines.push("### 🔧 Backend-caused failures (escalate to backend team)");
    lines.push("");
    lines.push(
      "These tests failed while the backend was unhealthy — **5xx responses or " +
        "timeouts / no response** (e.g. seed/`cy.request` timed out). Likely not " +
        "test/app bugs: re-run once the backend is healthy, and flag the endpoints below to the backend team."
    );
    lines.push("");
    lines.push("| Test | Failures | Statuses | Endpoint(s) |");
    lines.push("| --- | --- | --- | --- |");
    for (const [key, rec] of [...backendByTest.entries()].sort(
      (a, b) => b[1].count - a[1].count
    )) {
      const urls = [...rec.urls].slice(0, 3).join("<br>");
      lines.push(
        `| ${key.replace(/\|/g, "\\|")} | ${rec.count} | ${[...rec.statuses].join(", ")} | ${urls} |`
      );
    }
    lines.push("");
  } else {
    lines.push("_No failures were attributable to backend 5xx responses this run._");
    lines.push("");
  }

  lines.push("### Flaky / failing tests");
  lines.push("");
  if (flakyTests.length === 0) {
    lines.push("_No individual test variance detected._");
  } else {
    lines.push("| Test | Status | Failed / Runs | Backend 5xx? |");
    lines.push("| --- | --- | --- | --- |");
    for (const t of flakyTests.slice(0, 60)) {
      const icon = t.status === "flaky" ? "🟡" : "🔴";
      const backend = backendByTest.has(`${t.spec} :: ${t.title}`) ? "🔧 backend" : "";
      lines.push(
        `| ${t.title.replace(/\|/g, "\\|")} | ${icon} | ${t.fails} / ${t.runs} | ${backend} |`
      );
    }
    if (flakyTests.length > 60) lines.push(`| _…and ${flakyTests.length - 60} more_ | | | |`);
  }
}

const report = {
  filesRead,
  generatedFromDir: root,
  specs: specRows.map((s) => ({ ...s, backend5xx: backendBySpec.has(s.spec) })),
  flakyTests: flakyTests.map((t) => ({
    ...t,
    backend5xx: backendByTest.has(`${t.spec} :: ${t.title}`),
  })),
  backendFailures: [...backendByTest.entries()].map(([key, rec]) => ({
    test: key,
    count: rec.count,
    statuses: [...rec.statuses],
    endpoints: [...rec.urls],
  })),
};
try {
  fs.writeFileSync("flaky-report.json", JSON.stringify(report, null, 2));
} catch {
  /* best effort */
}

process.stdout.write(lines.join("\n") + "\n");
