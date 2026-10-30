---
name: review-localization
description: Run the CI "Localization Reviewer" locally (objective i18n checks plus missed-string and translation-quality review) on a PR or the current branch. Shows findings in the session and saves them under the gitignored .reviews/ folder. Never posts to GitHub. Invoke as /review-localization [PR number].
---

Runs the exact prompt from `.github/workflows/claude-localization-reviewer.yml`, extracted at run time so it can't drift. Read-only toward GitHub: never post comments or reviews.

## 0. Preflight

Run `gh auth status`.

- Fails in PR mode (an arg was given): stop before any review work. Tell the user PR mode needs the GitHub CLI, to install it (https://cli.github.com) and run `gh auth login`, then re-run.
- Fails in local mode: continue, and take `<owner/repo>` from `git remote get-url origin` (strip `.git`; handle both `git@github.com:o/r` and `https://github.com/o/r`).
- Works: `<owner/repo>` is `gh repo view --json nameWithOwner --jq .nameWithOwner`.

## 1. Resolve the target

- No arg → local mode (default): reviews the checked-out branch. `<n>` is `local`, and the base is `$(git merge-base origin/dev HEAD)` (includes uncommitted tracked changes, not untracked files). No PR needed.
- Arg is a PR number → PR mode. **Refuse to run** unless `git rev-parse HEAD` equals `gh pr view <n> --json headRefOid --jq .headRefOid`. The agent reads local source, so a different checkout would review one branch's diff against another's files. Stop, tell the user to check out the PR branch first (`gh pr checkout <n>`, and pull or push if local is out of sync with the PR), and don't run any review.
- Local mode only: run `git fetch origin dev` first so the merge-base can't resolve against a stale `origin/dev`.
- Local mode only: run `git ls-files --others --exclude-standard`. If it lists files, do this BEFORE any review work; never review first and mention it afterward. Tell the user, in plain text, that untracked files were found, list them, and say that untracked files are NOT included in the review and must be added with `git add <file>` first to be reviewed. Then ask with AskUserQuestion, with exactly these options: "Ignore them and continue" (review proceeds without them) and "Cancel so I can git add them" (stop here and make no further tool calls). If they cancel, end by repeating the `git add` instruction and that they can re-run the skill after.

`OUT=.reviews/localization-<n or branch name>`; `mkdir -p $OUT`.

## 2. Gather inputs

PR mode:

```bash
gh api repos/<owner/repo>/pulls/<n>/files --paginate > $OUT/pr_files.json
jq -r '.[].filename' $OUT/pr_files.json > $OUT/changed_files.txt
```

Local mode: `git diff --name-only $(git merge-base origin/dev HEAD) > $OUT/changed_files.txt`.

Stop with "no i18n-relevant changes" unless `changed_files.txt` matches `^src/.*\.(js|jsx|ts|tsx)$|^public/locales/`.

Then, from the repo root:

```bash
node ci/scripts/check_localization_objective.js --changed-files $OUT/changed_files.txt
mv i18n-objective-results.json $OUT/
node ci/scripts/build_localization_diff.js $OUT/pr_files.json 200000 > $OUT/i18n-relevant.diff 2> $OUT/diff-stderr.txt   # PR mode
```

Local mode: write `git diff $(git merge-base origin/dev HEAD) -- 'src/**/*.js' 'src/**/*.jsx' 'src/**/*.ts' 'src/**/*.tsx' 'public/locales/**'` to `$OUT/i18n-relevant.diff`. If `diff-stderr.txt` contains `TRUNCATED`, DIFF_TRUNCATED is `true`, else `false` (always `false` in local mode).

## 3. Build the prompt

```bash
node ci/scripts/extract_workflow_prompt.js .github/workflows/claude-localization-reviewer.yml \
  --set github.repository=<owner/repo> \
  --set github.event.pull_request.number=<n> \
  --set github.workspace=$(pwd)/$OUT \
  --set steps.diff.outputs.truncated=<true|false>
```

If the script errors, stop and tell the user. Don't fall back to a hand-written prompt.

## 4. Run (sub-agent)

Spawn one `general-purpose` Agent. Its prompt is this preamble, verbatim, followed by the extracted prompt:

> LOCAL RUN. These overrides win over anything below. You are not in CI. Never post anything to GitHub. The workspace root is the directory containing REPORT_FILE; `i18n-objective-results.json` and `i18n-relevant.diff` are there. Keep the report shape, including the Blocking/Advisory sections and verdict marker. Finish by replying with the full contents of REPORT_FILE.

## 5. Show

Print the sub-agent's report in the session as-is. Tell the user it's saved at `$OUT/i18n-comment.md`.
