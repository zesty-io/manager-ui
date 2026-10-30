---
name: review-code
description: Run the CI "Claude: Code Review" reviewer locally (bugs, security, performance, CLAUDE.md red flags) on a PR or the current branch. Shows findings in the session and saves them under the gitignored .reviews/ folder. Never posts to GitHub. Invoke as /review-code [PR number].
---

Runs the exact prompt from `.github/workflows/claude-auto-reviewer.yml`, extracted at run time so it can't drift. Read-only toward GitHub: never post comments or reviews.

## 0. Preflight

Run `gh auth status`.

- Fails in PR mode (an arg was given): stop before any review work. Tell the user PR mode needs the GitHub CLI, to install it (https://cli.github.com) and run `gh auth login`, then re-run.
- Fails in local mode: continue, and take `<owner/repo>` from `git remote get-url origin` (strip `.git`; handle both `git@github.com:o/r` and `https://github.com/o/r`).
- Works: `<owner/repo>` is `gh repo view --json nameWithOwner --jq .nameWithOwner`.

## 1. Resolve the target

- No arg → local mode (default): reviews the checked-out branch. PR_NUMBER is `local`, and the diff is `git diff $(git merge-base origin/dev HEAD)`, which includes committed and uncommitted tracked changes but not untracked files. No PR needed.
- Arg is a PR number → PR mode: the diff comes from `gh pr diff`. **Refuse to run** unless `git rev-parse HEAD` equals `gh pr view <n> --json headRefOid --jq .headRefOid`. The agent reads local source, so a different checkout would review one branch's diff against another's files. Stop, tell the user to check out the PR branch first (`gh pr checkout <n>`, and pull or push if local is out of sync with the PR), and don't run any review.
- Local mode only: run `git fetch origin dev` first so the merge-base can't resolve against a stale `origin/dev`.
- Local mode only: run `git ls-files --others --exclude-standard`. If it lists files, do this BEFORE any review work; never review first and mention it afterward. Tell the user, in plain text, that untracked files were found, list them, and say that untracked files are NOT included in the review and must be added with `git add <file>` first to be reviewed. Then ask with AskUserQuestion, with exactly these options: "Ignore them and continue" (review proceeds without them) and "Cancel so I can git add them" (stop here and make no further tool calls). If they cancel, end by repeating the `git add` instruction and that they can re-run the skill after.

`OUT=.reviews/code-<n or branch name>`; `mkdir -p $OUT`.

## 2. Build the prompt

```bash
node ci/scripts/extract_workflow_prompt.js .github/workflows/claude-auto-reviewer.yml \
  --set github.repository=<owner/repo> \
  --set github.event.pull_request.number=<n> \
  --set github.workspace=$(pwd)/$OUT
```

`<owner/repo>` is from the preflight. If the script errors (workflow restructured, new unresolved expression), stop and tell the user. Don't fall back to a hand-written prompt.

## 3. Run (sub-agent)

Spawn one `general-purpose` Agent. Its prompt is this preamble, verbatim, followed by the extracted prompt:

> LOCAL RUN. These overrides win over anything below. You are not in CI. Never post anything to GitHub and never call `mcp__github_inline_comment__create_inline_comment`. Ignore any instruction to post comments or emit HTML marker comments. Where the prompt says to post an inline comment, instead add that finding to REPORT_FILE as `- \`path:line\` — **<🔴|🟡> <one-line finding>** <the 3-sentence body>`. REPORT_FILE should contain the verdict line followed by the findings (not just the verdict). Local mode: if PR_NUMBER is `local`, read the diff with `git diff $(git merge-base origin/dev HEAD)`instead of`gh pr diff`. Finish by replying with the full contents of REPORT_FILE.

## 4. Show

Print the sub-agent's report in the session as-is, findings first. Tell the user it's saved at `$OUT/review-comment.md`.
