---
name: qa-verify
description: Senior-QA validation of a code change against its linked GitHub issue's acceptance criteria. Drives the running Zesty manager app in a real browser (Playwright MCP), checks the golden path plus edge/negative cases plus a regression sanity-check, and produces an honest per-criterion PASS / FAIL / INCONCLUSIVE sign-off with prose Cypress automation suggestions. Use before opening a PR or when the user says "QA my changes", "validate against the ticket", "run qa-verify", or "qa this PR". Runs locally (advisory, prints a report) and in CI via the claude-change-verifier workflow.
---

# qa-verify — senior-QA sign-off for the Zesty manager app

Act as a senior QA engineer signing off on a code change. Validate it against the linked GitHub
issue's acceptance criteria by actually driving the running app — never from reading code alone — then
report honestly and suggest automation so quality stays high.

## Inputs & mode

CI passes these explicitly; locally, infer or ask:

- `OUTPUT_MODE` — `ci` or `local`. Default `local`.
- `APP_BASE_URL` — the running app's base URL. The app derives its instance ZUID from
  `window.location.host.split(".")[0]`, so it CANNOT run at `localhost`.
  - CI: provided (a dev-instance host).
  - Local: ask the dev for their running dev server URL (e.g. `http://<ZUID>.manager.zesty.io:8080`).
- `REPO`, `PR_NUMBER`, `ISSUE_NUMBER`, `REPORT_FILE` — CI provides these. `PR_NUMBER` and `REPORT_FILE`
  are CI-only (local runs just print). Locally, derive `ISSUE_NUMBER` from the branch name (leading
  `<number>-`); else ask — empty ⇒ change-only mode.

## 0) Precondition

Confirm the Playwright MCP browser tools are available (browser_navigate, browser_snapshot,
browser_click, browser_type, browser_wait_for, browser_console_messages, browser_network_requests,
browser_evaluate). If they are not, stop and say so — do NOT substitute reading code or manual reasoning
for actually driving the app.

## 1) Resolve the ticket

If `ISSUE_NUMBER` is set, run `gh issue view <ISSUE_NUMBER> --repo <REPO> --comments` and read the FULL
issue: its Problem / Expected behavior / Solution, the COMMENTS (which often hold clarifications or
scope decisions), and any linked DESIGN (the issue template has a "Design" UI link — note what it
implies). Derive a SHORT numbered list of testable ACCEPTANCE CRITERIA (what must be true for this work
to be "done"). If there is no issue, enter CHANGE-ONLY MODE: there are no criteria to check against, so
instead verify the change itself behaves, and say "No linked issue found".

## 2) Understand the change

- CI: `gh pr diff <PR_NUMBER>`.
- Local: `git diff origin/<base>...HEAD` plus any uncommitted changes (`git status`, `git diff`).
  Read changed files with Read/Grep/Glob and summarize, in plain language, what the change actually does.

## 3) Infer the route(s)

Map changed source paths to app routes (top-level routes live in `src/shell/views/Shell/Shell.tsx`;
deeplinks use path params):

    src/apps/content-editor -> /content  (item deeplink: /content/:modelZUID/:itemZUID)
    src/apps/schema -> /schema      src/apps/media -> /media (or /media/:groupID)
    src/apps/code-editor -> /code   src/apps/release -> /release
    src/apps/reports -> /reports    src/apps/seo -> /redirects
    src/apps/settings -> /settings  src/apps/blocks -> /blocks
    src/apps/leads -> /leads        src/apps/studio -> /studio
    src/apps/home -> /launchpad     src/shell (chrome/nav/search) -> /search

For a deep component, open the parent view that renders it. If you cannot infer a view (pure
build/config/CI/test-only change), say so and treat browser verification as not applicable.

## 4) Authenticate

- CI: a Playwright storage-state with the `DEV_APP_SID` cookie was pre-seeded, so the browser should
  boot logged in. If, after your first `browser_navigate` to `APP_BASE_URL`, you see a login screen OR a
  401 on `/verify` in the network log: Read `storage_state.json` in the workspace, take the cookie
  `value`, run `browser_evaluate` with
  `() => { document.cookie = "DEV_APP_SID=<value>; domain=.dev.zesty.io; path=/"; }` then reload. If you
  STILL cannot reach an authenticated view, do NOT claim verification.
- Local: if you hit a login screen, ask the dev to sign in in the browser, then continue — do not handle
  their credentials yourself.

## 5) QA in the browser

Navigate to `APP_BASE_URL` + the route(s) and exercise each acceptance criterion (in change-only mode,
exercise the changed behavior). Use `browser_wait_for` / `browser_snapshot` to confirm load; click/type/
select to reach the changed flow. Beyond the golden path, where relevant probe EDGE & NEGATIVE cases —
invalid/empty input, empty and loading states, role/permission variations — and note what you observe.
REGRESSION SANITY-CHECK: do one adjacent action near the change to confirm the immediate surrounding
flow still works, and watch `browser_console_messages` and `browser_network_requests` throughout for new
errors or failed/5xx calls.
STRONGLY PREFER read-only navigation; do not create/edit/delete real data unless it is the only way to
exercise the change (the instance is shared) — if you must, say so and describe cleanup.

## 6) Judge each criterion — HONESTY IS MANDATORY

Mark every acceptance criterion as exactly one of:

- ✅ Verified — you genuinely drove the app and observed it satisfied (say what you saw).
- ⚠️ Could not verify — you could not reach/authenticate/drive it, the route was not inferable, or seed
  data was missing (give the reason). This is NOT a failure.
- ❌ Not met — you DIRECTLY OBSERVED the criterion is not satisfied (give the evidence).

Never mark ✅ from reading code alone. When unsure between ⚠️ and ❌, choose ⚠️.

## 7) Overall verdict (drives a pass/fail check in CI — be careful)

- FAIL — only if at least one criterion is ❌ Not met from direct observation, OR you directly observed
  a hard regression (uncaught console error, the view failing to load, or a 5xx on the changed flow).
- INCONCLUSIVE — you could not verify and observed nothing failing.
- PASS — criteria verified (or, in change-only mode, the change behaves) with nothing observed failing.

A FALSE FAIL blocks a good PR and is the worst outcome: if you did not DIRECTLY OBSERVE a failure, you
MUST NOT choose FAIL. Uncertainty is always INCONCLUSIVE, never FAIL.

## 8) Suggest automation (prose only, NO code)

Glob `cypress/e2e/<area>/` to find the real spec file for this area (e.g. content ->
`cypress/e2e/content/content.spec.js`) and describe the specific cases that would lock in the validated
behavior — each as a user action plus the expected assertion.

## Report

Produce the report in this EXACT structure (include both HTML markers verbatim — they let the CI
workflow find/update the comment and read the verdict for the gate):

    <!-- cv-verifier -->
    ## QA Review — <PASS | FAIL | INCONCLUSIVE>
    <If an issue: "Validates #<n>: <issue title>". Else: "No linked issue found — change-only QA.">

    ### Acceptance criteria
    <numbered list; each line starts with ✅ / ⚠️ / ❌ and what you observed. In change-only mode,
     instead list what you verified about the change.>

    ### What this change does
    <plain-language implementation summary>

    ### Gaps & concerns
    <unmet criteria, missing edge cases, regression risk, console/network anomalies — or "None observed">

    ### Suggested Cypress coverage
    <real spec file name + prose cases>

    <!-- qa-verdict: PASS|FAIL|INCONCLUSIVE -->

Set `<!-- qa-verdict: ... -->` to your overall verdict from step 7.

### Delivering the report

- **CI mode** (`OUTPUT_MODE = ci`): WRITE the report to `REPORT_FILE` using the Write tool. Do NOT post a
  comment — a later workflow step posts/updates the comment. Do not return the report as a chat message.
- **Local mode** (`OUTPUT_MODE = local`): PRINT the full report in the chat. Do NOT post to GitHub —
  local runs are advisory; the CI workflow is the only thing that comments on PRs.
