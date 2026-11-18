#!/usr/bin/env node
/*
 * Builds the Code Review verdict comment from the reviewer's findings report, so the verdict
 * is counted from the findings instead of written by the agent.
 *
 * The report is the `### Findings` section described in
 * .claude/skills/review-code/prompt.md: one bullet per finding, shaped
 * `- \`path:line\` — **🔴|🟡 ...**`.
 *
 * Usage:
 *   node ci/scripts/code_review_verdict.js <reportFile> [--unplaced <file>] [--local]
 *     --unplaced <file>  findings post_inline_comments.js couldn't attach inline; appended
 *     --local            no inline comments exist, so omit "see inline comments"
 *
 * Prints the comment to stdout. Exits 1 if the report is missing or has no Findings section.
 */
const fs = require("fs");

const args = process.argv.slice(2);
const report = args.find((a) => !a.startsWith("--"));
const flagValue = (name) => {
  const i = args.indexOf(name);
  return i === -1 ? undefined : args[i + 1];
};

if (!report || !fs.existsSync(report)) {
  console.error(`Report not found: ${report}`);
  process.exit(1);
}

const text = fs.readFileSync(report, "utf8");
if (!/^### Findings\s*$/m.test(text)) {
  console.error("Report has no '### Findings' section.");
  process.exit(1);
}

const count = (mark) =>
  text.split("\n").filter((l) => {
    return new RegExp(`^-\\s+\`[^\`:]+:\\d+\`\\s+—\\s+\\*\\*${mark}`).test(l);
  }).length;
const blockers = count("🔴");
const warnings = count("🟡");

const suffix = args.includes("--local") ? "" : " — see inline comments";
const segments = [];
if (blockers) segments.push(`🔴 ${blockers} blocker(s)`);
if (warnings) segments.push(`🟡 ${warnings} warning(s)`);

let verdict;
if (blockers) verdict = segments.join(" · ") + suffix;
else if (warnings) verdict = `✅ No blockers · ${segments[0]}${suffix}`;
else verdict = "✅ No blockers";

let out = `<!-- claude-code-review -->\n## Code Review — ${verdict}\n`;

const unplacedFile = flagValue("--unplaced");
if (unplacedFile && fs.existsSync(unplacedFile)) {
  out += `\n${fs.readFileSync(unplacedFile, "utf8")}`;
}

process.stdout.write(out);
