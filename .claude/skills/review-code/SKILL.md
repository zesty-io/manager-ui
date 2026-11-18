---
name: review-code
description: Run the CI "Claude: Code Review" reviewer locally (bugs, security, performance, CLAUDE.md red flags) on a PR or the current branch. Shows findings in the session and saves them under the gitignored .reviews/ folder. Never posts to GitHub. Invoke as /review-code [PR number].
---

Runs the review prompt in `.claude/skills/review-code/prompt.md`, the same file `.github/workflows/claude-auto-reviewer.yml` uses in CI. Read-only toward GitHub: never post comments or reviews.

## 0. Preflight

Run `gh auth status`.

- Fails in PR mode (an arg was given): stop before any review work. Tell the user PR mode needs the GitHub CLI, to install it (https://cli.github.com) and run `gh auth login`, then re-run.
- Fails in local mode: continue, and take `<owner/repo>` from `git remote get-url origin` (strip `.git`; handle both `git@github.com:o/r` and `https://github.com/o/r`).
- Works: `<owner/repo>` is `gh repo view --json nameWithOwner --jq .nameWithOwner`.

## 1. Resolve the target

- No arg → local mode (default): reviews the checked-out branch. PR_NUMBER is `local`, and DIFF_COMMAND is `git diff $(git merge-base origin/dev HEAD)`, which includes committed and uncommitted tracked changes but not untracked files. No PR needed.
- Arg is a PR number → PR mode: DIFF_COMMAND is `gh pr diff <n> --repo <owner/repo>`. **Refuse to run** unless `git rev-parse HEAD` equals `gh pr view <n> --json headRefOid --jq .headRefOid`. The agent reads local source, so a different checkout would review one branch's diff against another's files. Stop, tell the user to check out the PR branch first (`gh pr checkout <n>`, and pull or push if local is out of sync with the PR), and don't run any review.
- Local mode only: run `git fetch origin dev` first so the merge-base can't resolve against a stale `origin/dev`.
- Local mode only: run `git ls-files --others --exclude-standard`. If it lists files, do this BEFORE any review work; never review first and mention it afterward. Tell the user, in plain text, that untracked files were found, list them, and say that untracked files are NOT included in the review and must be added with `git add <file>` first to be reviewed. Then ask with AskUserQuestion, with exactly these options: "Ignore them and continue" (review proceeds without them) and "Cancel so I can git add them" (stop here and make no further tool calls). If they cancel, end by repeating the `git add` instruction and that they can re-run the skill after.

`OUT=.reviews/<branch>/code`, where `<branch>` is `git branch --show-current` with `/` replaced by `-` (in PR mode the checkout matches the PR head, so this is the PR's branch); `mkdir -p $OUT`, then `rm -f $OUT/review-comment.md` so a failed run can't leave a stale report behind.

## 2. Run (sub-agent)

Spawn one `general-purpose` Agent with this prompt, filling in the values. `REPORT_FILE` is the absolute path `$(pwd)/$OUT/review-comment.md`.

```
Inputs:
  REPO         = <owner/repo>
  PR_NUMBER    = <PR number, or local>
  DIFF_COMMAND = <the DIFF_COMMAND from step 1>
  REPORT_FILE  = <absolute path>

Never post anything to GitHub.
Read .claude/skills/review-code/prompt.md and follow it exactly.
```

Ignore the agent's chat reply: the report file is the result.

## 3. Show

If `$OUT/review-comment.md` doesn't exist, the run failed: say so and don't show anything as a result. Otherwise run `node ci/scripts/code_review_verdict.js $OUT/review-comment.md --local`, the same script CI uses for the verdict. If it exits non-zero the report is malformed: say so and show the file as is. Otherwise print its `## Code Review — …` line as a heading, then the findings from the file exactly as written. Add nothing of your own: no commentary, summary, assessment, agreement or disagreement with the findings, and no suggested next steps. The only text after the report is one line saying it's saved at `$OUT/review-comment.md`.
