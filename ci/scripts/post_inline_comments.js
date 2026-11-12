#!/usr/bin/env node
/*
 * Deterministically posts one inline PR review comment per finding bullet in a markdown
 * report, instead of relying on a Claude agent to reliably call its own inline-comment tool.
 *
 * Generic by design — any Claude review workflow with a similarly-shaped report can reuse
 * it. Assumes a section heading followed by bullets shaped `- \`path:line\` — message`;
 * skips bullets that don't match (no location to anchor to).
 *
 * A finding is "unplaced" when GitHub can't anchor it: the file isn't in the PR, the line is
 * outside the PR's diff hunks, or GitHub rejects the comment anyway. Unplaced findings are
 * never dropped silently: they're logged and, with --unplaced-out, written as a markdown
 * list the caller can append to a comment that does get posted.
 *
 * De-dupes against existing github-actions[bot] comments with the same path, line and body,
 * so a re-run doesn't repeat itself but a new finding on an already-commented line still posts.
 *
 * Usage:
 *   node ci/scripts/post_inline_comments.js
 *     --report <reportFile>       markdown file containing the section to parse
 *     --section <heading>         exact section heading line to find, e.g. "### 🔴 Blocking"
 *     --pr-files <prFilesJson>    cached `gh api .../pulls/<n>/files` response (changed-file
 *                                 allowlist and per-file diff hunks)
 *     --repo <owner/repo>
 *     --pr <number>
 *     --commit <sha>              PR head commit — comments anchor to this commit
 *     --label <text>              short prefix identifying the source, e.g. "Localization Reviewer"
 *     --unplaced-out <file>       optional; where to write the unplaced findings, if any
 *     --dry-run                   optional; no GitHub calls (--repo/--pr/--commit not needed),
 *                                 prints what would be posted
 */
const fs = require("fs");
const { execFileSync } = require("child_process");

function parseArgs(argv) {
  const out = {};
  for (let i = 0; i < argv.length; i++) {
    const key = argv[i];
    if (key === "--dry-run") out["dry-run"] = true;
    else if (key.startsWith("--")) out[key.slice(2)] = argv[++i];
  }
  return out;
}

function extractBullets(reportText, sectionHeading) {
  const start = reportText.indexOf(sectionHeading);
  if (start === -1) return [];
  const rest = reportText.slice(start + sectionHeading.length);
  const nextSection = rest.indexOf("\n### ");
  const section = nextSection === -1 ? rest : rest.slice(0, nextSection);

  const bullets = [];
  for (const line of section.split("\n")) {
    const m = line.match(/^-\s+`([^`:]+):(\d+)`\s+—\s+(.+)$/);
    if (m) {
      bullets.push({ path: m[1], line: Number(m[2]), message: m[3].trim() });
    }
  }
  return bullets;
}

// New-file line numbers a review comment can anchor to: the added and context lines inside a
// hunk. GitHub rejects a comment on any other line.
function commentableLines(patch) {
  const lines = new Set();
  let right = 0;
  let remaining = 0;
  for (const l of patch.split("\n")) {
    const hunk = l.match(/^@@ -\d+(?:,\d+)? \+(\d+)(?:,(\d+))? @@/);
    if (hunk) {
      right = Number(hunk[1]);
      remaining = hunk[2] === undefined ? 1 : Number(hunk[2]);
      continue;
    }
    if (remaining <= 0 || l.startsWith("\\") || l.startsWith("-")) continue;
    lines.add(right);
    right++;
    remaining--;
  }
  return lines;
}

// filename -> Set of commentable lines, or null when GitHub sent no patch for the file (too
// large to diff): its lines can't be checked up front, so posting is attempted anyway.
function buildCommentableIndex(prFiles) {
  const index = new Map();
  for (const f of prFiles) {
    index.set(f.filename, f.patch ? commentableLines(f.patch) : null);
  }
  return index;
}

function gh(args, input) {
  return execFileSync("gh", args, {
    input,
    encoding: "utf8",
    maxBuffer: 1024 * 1024 * 20,
  });
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const dryRun = Boolean(args["dry-run"]);
  const required = ["report", "section", "pr-files", "label"];
  if (!dryRun) required.push("repo", "pr", "commit");
  const missing = required.filter((k) => !args[k]);
  if (missing.length) {
    console.error(
      `Missing required args: ${missing.map((k) => `--${k}`).join(", ")}`
    );
    process.exit(1);
  }

  const reportText = fs.readFileSync(args.report, "utf8");
  const bullets = extractBullets(reportText, args.section);
  if (bullets.length === 0) {
    console.log(
      `No parseable bullets under "${args.section}" — nothing to inline-comment.`
    );
    return;
  }

  const prFiles = JSON.parse(fs.readFileSync(args["pr-files"], "utf8"));
  const commentable = buildCommentableIndex(prFiles);

  const existing = dryRun
    ? []
    : JSON.parse(
        gh([
          "api",
          `repos/${args.repo}/pulls/${args.pr}/comments`,
          "--paginate",
        ])
      );
  const existingKeys = new Set(
    existing
      .filter((c) => c.user && c.user.login === "github-actions[bot]")
      .map((c) => `${c.path}:${c.line ?? c.original_line}:${c.body}`)
  );

  let posted = 0;
  let skippedDuplicate = 0;
  const unplaced = [];

  for (const b of bullets) {
    const where = `${b.path}:${b.line}`;
    if (!commentable.has(b.path)) {
      console.log(`Unplaced (file not in PR diff): ${where}`);
      unplaced.push({ ...b, reason: "file not in the PR diff" });
      continue;
    }
    const lines = commentable.get(b.path);
    if (lines && !lines.has(b.line)) {
      console.log(`Unplaced (line not in the diff): ${where}`);
      unplaced.push({ ...b, reason: "line not in the diff" });
      continue;
    }
    const body = `**${args.label}:** ${b.message}`;
    const key = `${where}:${body}`;
    if (existingKeys.has(key)) {
      console.log(`Skipping (already commented): ${where}`);
      skippedDuplicate++;
      continue;
    }
    if (dryRun) {
      console.log(`Would post: ${where}`);
      existingKeys.add(key);
      posted++;
      continue;
    }
    const payload = JSON.stringify({
      body,
      commit_id: args.commit,
      path: b.path,
      line: b.line,
      side: "RIGHT",
    });
    try {
      gh(
        [
          "api",
          "-X",
          "POST",
          `repos/${args.repo}/pulls/${args.pr}/comments`,
          "--input",
          "-",
        ],
        payload
      );
      existingKeys.add(key);
      posted++;
    } catch (e) {
      console.log(
        `Unplaced (GitHub rejected it): ${where}: ${e.message.split("\n")[0]}`
      );
      unplaced.push({ ...b, reason: "GitHub rejected the comment" });
    }
  }

  if (unplaced.length && args["unplaced-out"]) {
    const list = unplaced
      .map((u) => `- \`${u.path}:${u.line}\` — ${u.message} _(${u.reason})_`)
      .join("\n");
    fs.writeFileSync(
      args["unplaced-out"],
      `### Findings not attached inline\n\n${list}\n`
    );
  }

  console.log(
    `Inline comments: ${posted} ${dryRun ? "would be posted" : "posted"}, ` +
      `${skippedDuplicate} skipped (duplicate), ${unplaced.length} unplaced.`
  );
}

if (require.main === module) main();

module.exports = { extractBullets, commentableLines };
