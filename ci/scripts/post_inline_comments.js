#!/usr/bin/env node
/*
 * Deterministically posts one inline PR review comment per finding bullet in a
 * markdown report, instead of relying on a Claude agent to reliably call its own
 * inline-comment tool. Observed on a real run of claude-i18n-verifier.yml: the report
 * correctly listed 2 findings with file:line references, the agent completed in far
 * fewer turns than usual, but created 0 inline comments despite the prompt explicitly
 * requiring one per finding — the requirement just isn't reliably honored by the model.
 *
 * Generic by design so any Claude-based review workflow that writes a similarly-shaped
 * report can reuse it — it only assumes a section heading followed by bullets shaped
 * `- \`path:line\` — message`, nothing i18n-specific. Skips bullets that don't match
 * that shape (can't anchor an inline comment without a location — those still exist in
 * the report itself, just not inline), skips paths not in the PR's changed-file list
 * (GitHub rejects comments on files outside the diff), and de-dupes against existing
 * github-actions[bot] comments at the same path+line so re-runs on the same PR don't
 * repost duplicates on every push.
 *
 * Usage:
 *   node ci/scripts/post_inline_comments.js
 *     --report <reportFile>       markdown file containing the section to parse
 *     --section <heading>         exact section heading line to find, e.g. "### 🔴 Blocking"
 *     --pr-files <prFilesJson>    cached `gh api .../pulls/<n>/files` response (for the
 *                                 changed-file allowlist)
 *     --repo <owner/repo>
 *     --pr <number>
 *     --commit <sha>              PR head commit — comments anchor to this commit
 *     --label <text>              short prefix identifying the source, e.g. "i18n Verifier"
 */
const fs = require("fs");
const { execFileSync } = require("child_process");

function parseArgs(argv) {
  const out = {};
  for (let i = 0; i < argv.length; i++) {
    const key = argv[i];
    if (key.startsWith("--")) out[key.slice(2)] = argv[++i];
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

function gh(args, input) {
  return execFileSync("gh", args, {
    input,
    encoding: "utf8",
    maxBuffer: 1024 * 1024 * 20,
  });
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const required = [
    "report",
    "section",
    "pr-files",
    "repo",
    "pr",
    "commit",
    "label",
  ];
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
  const changedPaths = new Set(prFiles.map((f) => f.filename));

  const existing = JSON.parse(
    gh(["api", `repos/${args.repo}/pulls/${args.pr}/comments`, "--paginate"])
  );
  const existingKeys = new Set(
    existing
      .filter((c) => c.user && c.user.login === "github-actions[bot]")
      .map((c) => `${c.path}:${c.line ?? c.original_line}`)
  );

  let posted = 0;
  let skippedNotInDiff = 0;
  let skippedDuplicate = 0;
  let failed = 0;

  for (const b of bullets) {
    const key = `${b.path}:${b.line}`;
    if (!changedPaths.has(b.path)) {
      console.log(`Skipping (file not in PR diff): ${key}`);
      skippedNotInDiff++;
      continue;
    }
    if (existingKeys.has(key)) {
      console.log(`Skipping (already commented): ${key}`);
      skippedDuplicate++;
      continue;
    }
    const payload = JSON.stringify({
      body: `**${args.label}:** ${b.message}`,
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
      posted++;
    } catch (e) {
      console.log(`Failed to post inline comment for ${key}: ${e.message}`);
      failed++;
    }
  }

  console.log(
    `Inline comments: ${posted} posted, ${skippedNotInDiff} skipped (not in diff), ` +
      `${skippedDuplicate} skipped (duplicate), ${failed} failed.`
  );
}

main();
