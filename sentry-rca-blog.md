# The Road to a Self-Healing Codebase

Sentry has a "Create GitHub Issue" button, so when someone spots an error worth tracking, they click it and Sentry opens a new GitHub issue with a stack trace and a permalink attached. That's where the manual part used to end and the tedious part began. Someone still had to open Sentry, read the trace, dig through the code, and figure out what broke and how bad it is before any real work could start. We built a workflow (`.github/workflows/claude-sentry-rca.yml`) that picks up right where that click leaves off, handles that first pass automatically, and in some cases finishes the job entirely.

## Here's the flow

<!-- Drop the flow diagram image here, for example: -->
<!-- ![Sentry RCA workflow diagram](./docs/assets/sentry-rca-flow.png) -->

_(diagram goes here)_

## So what does it actually do

A regex check looks at the first line of a new issue for Sentry's permalink format and confirms the issue was posted by a bot account, since a human could paste that same first line into a normal issue and we don't want that mistaken for Sentry's word. Neither check involves the model, so anything that doesn't match exits immediately: no comment, no API calls, no cost.

For issues that do match, Claude fetches the real Sentry data (stack trace, culprit, affected users, event frequency) through Sentry's hosted MCP server, reads the actual source around the broken lines, and attempts a real fix in the working tree, an actual edit, not just a description of one.

Then it decides whether that fix is safe to ship on its own, against four fixed criteria kept in `.github/claude/sentry-rca-classification.md` so the bar can be tuned without touching the workflow itself:

1. **Root-cause certainty.** The faulty line is identified and the fix isn't a judgment call between multiple plausible options.
2. **Blast radius.** A hard veto: if the fix touches auth, permission gating, the IndexedDB warm-cache hydration, RTK Query base config, webpack config, or any workflow file, it's automatically classified as complex regardless of how confident the other three criteria are.
3. **Verifiable by inspection.** The correctness of the fix has to be obvious from reading the diff, a null check, a stale ref, a missing await. Anything that needs a test run or a design call to confirm doesn't pass.
4. **Cohesion, not count.** A fix can span several files and still be simple, as long as they're one conceptual unit. What fails this is a change that reaches across unrelated parts of the app, not the number of files touched.

All four have to pass for a fix to go out automatically. Otherwise the trial fix is discarded and Claude posts a structured RCA comment instead, naming exactly which criterion failed and why. A severity label goes on the issue either way.

## The nuts and bolts

**Claude never touches git or `gh`.** Its tool grant for this workflow is limited to `mcp__sentry`, `Read`, `Grep`, `Glob`, `Write`, and `Edit`, nothing that can push a branch, open a PR, or post to GitHub directly. Sentry issue text is untrusted input as far as this workflow is concerned, and we didn't want a design where a model reading untrusted text also holds credentials for git and GitHub. Instead, Claude's job ends once it writes its verdict and content to a fixed set of files (`classification.json`, plus `rca-comment.md` or `pr-description.md` depending on the outcome). Every actual side effect, applying labels, posting comments, committing, pushing, opening the PR, happens in separate, plain shell steps that read those files. This keeps the trust boundary narrow and makes each run easy to audit from the Actions log alone, since you can see exactly which deterministic step ran without reading the full transcript.

**There are two checkpoints, not one.** Before anything branches on Claude's output, a validation step parses `classification.json` and fails the job outright if the verdict, severity, or fetch-failure flag don't match the expected shape. After the run, a second check confirms an outcome actually landed on GitHub, either the RCA comment or the PR body, using a marker scoped to that specific run ID. That second check exists because a workflow step can silently no-op, and we wanted a way to catch that instead of assuming success just because nothing errored.

**Runs are safe to retry.** Because the outcome check is scoped to the run ID rather than deduplicated against prior runs, re-running the job against the same issue doesn't get confused by an older comment or PR still sitting there. It just produces its own.

## Bumps along the way

A few things came up during live testing that are worth recording, since they weren't obvious until we saw a real run fail.

**A false failure right after a successful PR.** The final verification step originally looked up the new auto-fix PR by searching for its title through `gh pr list --search`. On one run, the PR was created correctly, title, branch, label, reviewers, everything, but the verification step still failed the job. The cause was GitHub's search index lagging a few seconds behind a resource that had just been created, not anything wrong with the PR itself. The fix was to stop searching entirely: the "open PR" step now captures the PR number straight from `gh pr create`'s own output and passes it forward, and the verification step looks that PR up directly by number instead of searching for it.

**Our own review workflows were rejecting the auto-fix PRs.** `claude-auto-reviewer.yml` and `claude-change-verifier.yml` both run `claude-code-action` against every PR into dev, but that action refuses to run at all for a PR opened by a non-human actor unless that actor is explicitly allowlisted. Since the Sentry RCA workflow opens its PRs as `github-actions[bot]` (the default token identity), both review workflows were failing outright before they ever looked at the diff. Adding that identity to each workflow's `allowed_bots` input fixed it. We also checked whether this broadens things further than intended, since the CD promotion workflows open PRs under the same bot identity, but those PRs always target `stage`, `beta`, or `stable`, never `dev`, so they never trigger these two workflows regardless of the allowlist.

**Making sure the auto-fix commit would still count as verified.** This repo requires verified commits on `dev`, and the commits the workflow makes on its fix branch are not signed. That turned out not to be a problem in practice: `dev` only allows squash merges, and a squash merge is a brand new commit that GitHub creates and signs itself on the server side, discarding the original branch commits from the target branch's history entirely. As long as that merge setting doesn't change, an unsigned commit on the fix branch still results in a verified commit landing on `dev`.

## The bigger picture (and why we're not going full autopilot yet)

The direction here is a self-healing pipeline: an error gets reported, root cause gets found, a fix gets written, and it ships, with as little manual work in between as possible. This workflow gets us a real step into that, especially for the class of bugs that are genuinely mechanical to fix.

That said, we're deliberately keeping a human step in the loop for now. Auto-fix PRs still go through the same review process as any other PR, our automated code review and QA-verification workflows run against them, specific reviewers are tagged, and nothing merges without someone approving it. The workflow does not auto-merge, and it won't until we've built enough confidence in the classification bar to trust it further. We're also intentionally not letting the workflow react on its own to review feedback yet. Having it iterate on PR comments without a person in the loop opens up questions around context loss between sessions and runaway back-and-forth with the review workflows, and that needs proper guardrails before it's worth building. For now, the model gets one shot to investigate and propose a fix, a human decides if it's good enough to merge, and the loop closes there.
