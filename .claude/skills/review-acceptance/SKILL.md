---
name: review-acceptance
description: Run the CI "Claude QA" acceptance-criteria reviewer locally, judging a PR or branch against its linked issue's acceptance criteria from the code alone. Shows the report in the session and saves it under the gitignored .reviews/ folder. Never posts to GitHub. Invoke as /review-acceptance [PR number].
---

Runs the review prompt in `.claude/skills/review-acceptance/prompt.md`, the same file the `ac` job in `.github/workflows/claude-qa.yml` uses in CI. Only the acceptance-criteria half runs locally; the CI browser pass needs a running app and stays CI-only. Read-only toward GitHub: never post comments.

## 0. Preflight

Run `gh auth status`.

- Fails in PR mode (an arg was given): stop before any review work. Tell the user PR mode needs the GitHub CLI, to install it (https://cli.github.com) and run `gh auth login`, then re-run.
- Fails in local mode: continue, take `<owner/repo>` from `git remote get-url origin` (strip `.git`; handle both `git@github.com:o/r` and `https://github.com/o/r`), and note that the issue can't be read (see step 1).
- Works: `<owner/repo>` is `gh repo view --json nameWithOwner --jq .nameWithOwner`.

## 1. Resolve the target and issue

- No arg → local mode (default): reviews the checked-out branch. `<n>` is `local`, and DIFF_COMMAND is `git diff $(git merge-base origin/dev HEAD)` (includes uncommitted tracked changes, not untracked files). No PR needed.
- Arg is a PR number → PR mode: DIFF_COMMAND is `gh pr diff <n> --repo <owner/repo>`. **Refuse to run** unless `git rev-parse HEAD` equals `gh pr view <n> --json headRefOid --jq .headRefOid`. The agent reads local source, so a different checkout would review one branch's diff against another's files. Stop, tell the user to check out the PR branch first (`gh pr checkout <n>`, and pull or push if local is out of sync with the PR), and don't run any review.
- Local mode only: run `git fetch origin dev` first so the merge-base can't resolve against a stale `origin/dev`.
- Local mode only: run `git ls-files --others --exclude-standard`. If it lists files, do this BEFORE any review work; never review first and mention it afterward. Tell the user, in plain text, that untracked files were found, list them, and say that untracked files are NOT included in the review and must be added with `git add <file>` first to be reviewed. Then ask with AskUserQuestion, with exactly these options: "Ignore them and continue" (review proceeds without them) and "Cancel so I can git add them" (stop here and make no further tool calls). If they cancel, end by repeating the `git add` instruction and that they can re-run the skill after.
- Linked issue, in CI's order: branch name `<issue#>-slug` (regex `(^|/)[0-9]+-`, using the checked-out branch in local mode or the PR's `headRefName`), then the PR's closing issue references: in PR mode `gh pr view <n> --json closingIssuesReferences`; in local mode `gh pr view --json closingIssuesReferences` for the checked-out branch, if it has an open PR (used only to find the issue, the diff stays local). Neither → empty (change-only mode).
- Local mode without a working `gh`: if the branch name yields an issue number, the sub-agent could not read that issue and would silently fall back to change-only QA. Before any review work, tell the user the issue #N can't be read without `gh`, and that change-only mode means the agent invents its own criteria and the report is NOT graded against the issue. Ask with AskUserQuestion, with exactly these options: "Continue in change-only mode" (pass an empty issue number, and state in the final output that the report is not graded against issue #N) and "Cancel so I can set up gh" (stop, repeating the install and `gh auth login` instructions). If the branch name has no issue number, proceed in change-only mode and note that closing-issue references couldn't be checked.

`OUT=.reviews/<branch>/acceptance`, where `<branch>` is `git branch --show-current` with `/` replaced by `-` (in PR mode the checkout matches the PR head, so this is the PR's branch); `mkdir -p $OUT`, then `rm -f $OUT/qa-comment.md` so a failed run can't leave a stale report behind.

## 2. Run (sub-agent)

Spawn one `general-purpose` Agent with this prompt, filling in the values. `REPORT_FILE` is the absolute path `$(pwd)/$OUT/qa-comment.md`; `ISSUE_NUMBER` is empty for change-only mode.

```
Inputs:
  REPO         = <owner/repo>
  PR_NUMBER    = <PR number, or local>
  ISSUE_NUMBER = <issue number or empty>
  DIFF_COMMAND = <the DIFF_COMMAND from step 1>
  REPORT_FILE  = <absolute path>

Never post anything to GitHub.
Read .claude/skills/review-acceptance/prompt.md and follow it exactly.
```

Ignore the agent's chat reply: the report file is the result.

## 3. Verdict and show

If `$OUT/qa-comment.md` doesn't exist, the run failed: say so and stop. CI computes the verdict in the `post` job, not the agent, so do the same arithmetic on the report's marks. This mirrors the "Compute Verdict and Assemble Comment" step in `.github/workflows/claude-qa.yml`; if you change one, change the other.

- Count `^[0-9]+\. ✅` (passed), `^[0-9]+\. ❌` (failed), and `- ` bullets inside the "Not checkable from the code" details block (runtime).
- No criteria of either kind → `NO REPORT`: treat it as a broken report and say so.
- Any ❌ → `❌ FAIL — X of N code-checkable criteria not met`. Otherwise `✅ PASS — P/N code-checkable criteria confirmed` (or `✅ PASS — nothing in this change was checkable from the code` when N is 0).
- Append `, 1 needs a running app` or `, K need a running app` when runtime > 0.

Print the verdict as a heading, then the report exactly as written. Add nothing of your own: no commentary, summary, assessment, agreement or disagreement with the report, and no suggested next steps. The only exceptions are the notes this skill requires (such as the report not being graded against an issue). The only text after the report is one line saying it's saved at `$OUT/qa-comment.md`.
