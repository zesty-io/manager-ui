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

/** Flatten mochawesome's nested suites into a flat list of tests. */
function collectTests(suite, acc) {
  if (!suite) return acc;
  for (const t of suite.tests || []) acc.push(t);
  for (const s of suite.suites || []) collectTests(s, acc);
  return acc;
}

// spec path -> { runs, fails }
const specStats = new Map();
// "<spec> :: <test full title>" -> { runs, fails, spec, title }
const testStats = new Map();

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
      }
      testStats.set(key, ts);
    }

    const ss = specStats.get(spec) || { runs: 0, fails: 0 };
    ss.runs++;
    if (specFailed) ss.fails++;
    specStats.set(spec, ss);
  }
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

  lines.push("### Spec-level (sorted by fail rate)");
  lines.push("");
  lines.push("| Spec | Status | Failed / Runs | Fail rate |");
  lines.push("| --- | --- | --- | --- |");
  for (const s of specRows.filter((s) => s.status !== "stable")) {
    const icon = s.status === "flaky" ? "🟡 flaky" : "🔴 broken";
    lines.push(`| \`${s.spec}\` | ${icon} | ${s.fails} / ${s.runs} | ${pct(s.rate)} |`);
  }
  if (specRows.every((s) => s.status === "stable")) {
    lines.push("| _All specs stable across all iterations_ | 🟢 | - | - |");
  }
  lines.push("");

  lines.push("### Flaky / failing tests");
  lines.push("");
  if (flakyTests.length === 0) {
    lines.push("_No individual test variance detected._");
  } else {
    lines.push("| Test | Status | Failed / Runs |");
    lines.push("| --- | --- | --- |");
    for (const t of flakyTests.slice(0, 60)) {
      const icon = t.status === "flaky" ? "🟡" : "🔴";
      lines.push(`| ${t.title.replace(/\|/g, "\\|")} | ${icon} | ${t.fails} / ${t.runs} |`);
    }
    if (flakyTests.length > 60) lines.push(`| _…and ${flakyTests.length - 60} more_ | | |`);
  }
}

const report = {
  filesRead,
  generatedFromDir: root,
  specs: specRows,
  flakyTests,
};
try {
  fs.writeFileSync("flaky-report.json", JSON.stringify(report, null, 2));
} catch {
  /* best effort */
}

process.stdout.write(lines.join("\n") + "\n");
