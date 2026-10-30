---
name: review-acceptance
description: Run the CI "Acceptance Criteria QA" reviewer locally, judging a PR or branch against its linked issue's acceptance criteria from the code alone. Shows the report in the session and saves it under the gitignored .reviews/ folder. Never posts to GitHub. Invoke as /review-acceptance [PR number].
---

Runs the exact prompt from `.github/workflows/claude-change-verifier.yml`, extracted at run time so it can't drift. Read-only toward GitHub: never post comments.

## 0. Preflight

Run `gh auth status`.

- Fails in PR mode (an arg was given): stop before any review work. Tell the user PR mode needs the GitHub CLI, to install it (https://cli.github.com) and run `gh auth login`, then re-run.
- Fails in local mode: continue, take `<owner/repo>` from `git remote get-url origin` (strip `.git`; handle both `git@github.com:o/r` and `https://github.com/o/r`), and note that the issue can't be read (see step 1).
- Works: `<owner/repo>` is `gh repo view --json nameWithOwner --jq .nameWithOwner`.

## 1. Resolve the target and issue

- No arg → local mode (default): reviews the checked-out branch. `<n>` is `local`, and the diff is `git diff $(git merge-base origin/dev HEAD)` (includes uncommitted tracked changes, not untracked files). No PR needed.
- Arg is a PR number → PR mode. **Refuse to run** unless `git rev-parse HEAD` equals `gh pr view <n> --json headRefOid --jq .headRefOid`. The agent reads local source, so a different checkout would review one branch's diff against another's files. Stop, tell the user to check out the PR branch first (`gh pr checkout <n>`, and pull or push if local is out of sync with the PR), and don't run any review.
- Local mode only: run `git fetch origin dev` first so the merge-base can't resolve against a stale `origin/dev`.
- Local mode only: run `git ls-files --others --exclude-standard`. If it lists files, do this BEFORE any review work; never review first and mention it afterward. Tell the user, in plain text, that untracked files were found, list them, and say that untracked files are NOT included in the review and must be added with `git add <file>` first to be reviewed. Then ask with AskUserQuestion, with exactly these options: "Ignore them and continue" (review proceeds without them) and "Cancel so I can git add them" (stop here and make no further tool calls). If they cancel, end by repeating the `git add` instruction and that they can re-run the skill after.
- Linked issue, in CI's order: branch name `<issue#>-slug` (regex `(^|/)[0-9]+-`, using the checked-out branch in local mode or the PR's `headRefName`), then the PR's closing issue references: in PR mode `gh pr view <n> --json closingIssuesReferences`; in local mode `gh pr view --json closingIssuesReferences` for the checked-out branch, if it has an open PR (used only to find the issue, the diff stays local). Neither → empty (change-only mode).
- Local mode without a working `gh`: if the branch name yields an issue number, the sub-agent could not read that issue and would silently fall back to change-only QA. Before any review work, tell the user the issue #N can't be read without `gh`, and that change-only mode means the agent invents its own criteria and the report is NOT graded against the issue. Ask with AskUserQuestion, with exactly these options: "Continue in change-only mode" (pass an empty issue number, and state in the final output that the report is not graded against issue #N) and "Cancel so I can set up gh" (stop, repeating the install and `gh auth login` instructions). If the branch name has no issue number, proceed in change-only mode and note that closing-issue references couldn't be checked.

`OUT=.reviews/<branch>/acceptance`, where `<branch>` is `git branch --show-current` with `/` replaced by `-` (in PR mode the checkout matches the PR head, so this is the PR's branch); `mkdir -p $OUT`, then `rm -f $OUT/qa-comment.md` so a failed run can't leave a stale report behind. Create an empty `$OUT/prior-qa-comment.md` (a local run has no prior report).

## 2. Build the prompt

```bash
node ci/scripts/extract_workflow_prompt.js .github/workflows/claude-change-verifier.yml \
  --set github.repository=<owner/repo> \
  --set github.event.pull_request.number=<n> \
  --set steps.issue.outputs.issue_number=<issue or empty> \
  --set github.workspace=$(pwd)/$OUT
```

If the script errors, stop and tell the user. Don't fall back to a hand-written prompt.

## 3. Run (sub-agent)

Spawn one `general-purpose` Agent. Its prompt is this preamble, verbatim, followed by the extracted prompt:

> LOCAL RUN. These overrides win over anything below. You are not in CI. Never post anything to GitHub. Local mode: if PR_NUMBER is `local`, read the diff with `git diff $(git merge-base origin/dev HEAD)` instead of `gh pr diff`. Write REPORT_FILE exactly as specified. Finish by replying with the full contents of REPORT_FILE.

## 4. Verdict and show

If `$OUT/qa-comment.md` doesn't exist, the run failed: say so and stop. CI computes the verdict in a post step, not the agent, so do the same arithmetic on the report's marks:

- Count `^[0-9]+\. ✅` (passed), `^[0-9]+\. ❌` (failed), and `- ` bullets inside the "Not checkable from the code" details block (runtime).
- Any ❌ → `❌ FAIL — X of N code-checkable criteria not met`. Otherwise `✅ PASS — P/N code-checkable criteria confirmed` (or `✅ PASS — nothing in this change was checkable from the code` when N is 0).
- Append `, 1 needs a running app` or `, K need a running app` when runtime > 0.
- No criteria of either kind → treat as a broken report and say so.

Print the verdict as a heading, then the report. Tell the user it's saved at `$OUT/qa-comment.md`.
