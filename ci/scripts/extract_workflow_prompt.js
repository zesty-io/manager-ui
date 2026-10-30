#!/usr/bin/env node
/*
 * Prints the `prompt: |` block of a claude-code-action workflow step with its
 * `${{ ... }}` expressions substituted, so local review skills run the exact prompt CI
 * runs instead of a hand-copied one that can drift.
 *
 * No YAML parser on purpose (js-yaml is only a transitive dep): the block is the
 * indented run of lines after `prompt: |`. Fails loudly if the workflow has zero or
 * several such blocks, or if any expression is left unresolved.
 *
 * Usage:
 *   node ci/scripts/extract_workflow_prompt.js <workflow.yml> [--set <expr>=<value>]...
 *   e.g. --set github.repository=zesty-io/manager-ui --set github.event.pull_request.number=123
 */
const fs = require("fs");

function fail(msg) {
  console.error(`extract_workflow_prompt: ${msg}`);
  process.exit(1);
}

const [file, ...rest] = process.argv.slice(2);
if (!file) fail("missing workflow file");

const vars = {};
for (let i = 0; i < rest.length; i++) {
  if (rest[i] !== "--set") fail(`unexpected arg: ${rest[i]}`);
  const pair = rest[++i] || "";
  const eq = pair.indexOf("=");
  if (eq === -1) fail(`--set needs expr=value, got: ${pair}`);
  vars[pair.slice(0, eq).trim()] = pair.slice(eq + 1);
}

const lines = fs.readFileSync(file, "utf8").split("\n");
const starts = lines
  .map((l, i) => (/^\s*prompt:\s*\|[-+]?\s*$/.test(l) ? i : -1))
  .filter((i) => i !== -1);
if (starts.length !== 1) {
  fail(
    `expected exactly 1 \`prompt: |\` block in ${file}, found ${starts.length}`
  );
}

const keyIndent = lines[starts[0]].match(/^\s*/)[0].length;
const block = [];
for (let i = starts[0] + 1; i < lines.length; i++) {
  const l = lines[i];
  if (l.trim() !== "" && l.match(/^\s*/)[0].length <= keyIndent) break;
  block.push(l);
}
while (block.length && block[block.length - 1].trim() === "") block.pop();

const blockIndent = Math.min(
  ...block.filter((l) => l.trim() !== "").map((l) => l.match(/^\s*/)[0].length)
);
const text = block.map((l) => l.slice(blockIndent)).join("\n");

const unresolved = new Set();
const out = text.replace(/\$\{\{\s*([^}]+?)\s*\}\}/g, (m, expr) => {
  if (expr in vars) return vars[expr];
  unresolved.add(expr);
  return m;
});
if (unresolved.size) {
  fail(
    `unresolved expressions (pass with --set): ${[...unresolved].join(", ")}`
  );
}
process.stdout.write(out + "\n");
