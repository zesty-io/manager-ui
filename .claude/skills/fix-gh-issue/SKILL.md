---
name: fix-gh-issue
description: Automate end-to-end GitHub issue resolution in manager-ui — fetch the issue, reproduce in Chrome, generate a minimal code change, validate visually, and open a PR with RCA/change notes and a screen recording. Use whenever the user invokes /fix-gh-issue with an issue number, or says things like "fix issue #4094", "implement #4150", "resolve GitHub issue 4200", or "pick up that bug/enhancement ticket and ship a PR". Handles both `bug` and `enhancement` labels.
argument-hint: <issue-number>
disable-model-invocation: true
allowed-tools: Bash(git status) Bash(git fetch *) Bash(git pull *) Bash(git checkout *) Bash(git branch *) Bash(git add *) Bash(git commit *) Bash(git push *) Bash(gh issue *) Bash(gh pr *) Bash(gh api *) Bash(jq *) Bash(npx tsc *) Bash(osascript *) Bash(open *) Bash(imgur-uploader *) Read Write Edit Grep Glob AskUserQuestion ToolSearch mcp__claude-in-chrome__tabs_context_mcp mcp__claude-in-chrome__tabs_create_mcp mcp__claude-in-chrome__tabs_close_mcp mcp__claude-in-chrome__navigate mcp__claude-in-chrome__read_page mcp__claude-in-chrome__get_page_text mcp__claude-in-chrome__find mcp__claude-in-chrome__form_input mcp__claude-in-chrome__javascript_tool mcp__claude-in-chrome__read_console_messages mcp__claude-in-chrome__read_network_requests mcp__claude-in-chrome__gif_creator mcp__claude-in-chrome__computer mcp__claude-in-chrome__browser_batch
---

# GitHub Issue Resolver

Drives the full loop: fetch issue → reproduce → propose plan → branch → code → verify → commit → PR. Two human approval gates keep the user in control: one after the plan, one after visual validation of the change.

Both `bug` and `enhancement` issues flow through the same skeleton. The parts that legitimately differ — plan report wording, branch prefix, recording filename, PR template, label — branch on `$ISSUE_KIND`, which is set in Step 1.

## Prerequisites

- Local git repo cloned with remote `origin` configured.
- GitHub CLI (`gh`) authenticated as a user with write access.
- Claude Code Chrome extension installed and authenticated.
- `imgur-uploader-cli` available (`npm install -g imgur-uploader-cli`) — used to host the validation GIF for the PR body.
- `jq` available (used to read `cypress.env.json` safely).
- A local hosts entry for the dev instance (see `CLAUDE.md` → "Local dev requires a hosts entry"). Without it, the dev server URL won't resolve and the instance ZUID can't be derived.

## Chrome tool setup

Chrome MCP schemas must be loaded once per session before any chrome tool is invoked:

```
ToolSearch: select:mcp__claude-in-chrome__tabs_context_mcp,mcp__claude-in-chrome__tabs_create_mcp,mcp__claude-in-chrome__tabs_close_mcp,mcp__claude-in-chrome__navigate,mcp__claude-in-chrome__read_page,mcp__claude-in-chrome__get_page_text,mcp__claude-in-chrome__find,mcp__claude-in-chrome__form_input,mcp__claude-in-chrome__javascript_tool,mcp__claude-in-chrome__read_console_messages,mcp__claude-in-chrome__read_network_requests,mcp__claude-in-chrome__gif_creator,mcp__claude-in-chrome__computer,mcp__claude-in-chrome__browser_batch
```

Then call `tabs_context_mcp` to discover the active tab/window ID. Use `browser_batch` for multi-step sequences (click → wait → screenshot) — it is significantly faster than firing each tool individually. Use `computer` for single clicks, screenshots, and typing.

The Chrome extension cannot navigate to `github.com` (extension permission boundary). Use the `gh` CLI for anything against GitHub itself.

## High-level flow

1. Fetch issue → set `$ISSUE_KIND` ∈ {`bug`, `enhancement`}.
2. Pre-change reproduction in Chrome → Plan report → **Gate #1**.
3. Pull latest `dev` → create local branch (no push yet).
4. Read `CLAUDE.md` → generate the minimum code change → add/extend Cypress spec → `npx tsc --noEmit` if TS touched.
5. Post-change verification in a fresh Chrome window → record GIF → upload to imgur → Result report → **Gate #2**.
6. Commit (one semantic change per commit) and push.
7. Open the PR against `dev` with the template matching `$ISSUE_KIND`.

---

## 1. Fetch issue & determine kind

```bash
gh issue view "$ISSUE_NUMBER" --json title,body,state,labels,author
```

Validate:

- `state == "OPEN"` — otherwise stop and report it's already resolved.
- Labels include exactly one of `bug` or `enhancement`. If both or neither, ask the user which kind to use before continuing.

Set for the rest of the flow:

- `ISSUE_KIND` — `bug` or `enhancement`
- `BRANCH_PREFIX` — `fix` if `bug`, `feat` if `enhancement`
- `RECORDING_SLUG` — `fix-<ISSUE_NUMBER>-validation.gif` or `feat-<ISSUE_NUMBER>-validation.gif`

Extract the title for branch naming in Step 3.

## 2. Pre-change reproduction & Plan report

### 2a. Codebase pass

1. Read `CLAUDE.md` at repo root. The architecture, state-management rules, and "Review red flags" section are the contract the change must respect.
2. Locate the files mentioned in the issue (or the UI surface — sidebar, content editor, schema editor, etc.) and read them end-to-end. The goal is to understand current behavior well enough to explain _why_ the bug occurs, or _what's missing_ for the enhancement.

### 2b. Chrome reproduction (fresh window)

Pre-change and post-change validations use **separate Chrome windows** so cached state from reproducing the issue doesn't accidentally make the fix look like it works.

1. Read credentials safely:
   ```bash
   EMAIL=$(jq -r .email cypress.env.json)
   PASSWORD=$(jq -r .password cypress.env.json)
   ```
2. Confirm the dev server is running on the user's configured dev instance URL. Per `CLAUDE.md`, the host pattern is `<ZUID>.manager.zesty.io:8080` (with hosts entry); the example dev instance is `http://8-f48cf3a682-7fthvk.manager.dev.zesty.io:8080/`. If it's not running, ask the user to start it (`npm start`) — don't attempt to start it yourself, since it requires an interactive terminal.
3. Open a fresh Chrome window via `tabs_create_mcp`.
4. Navigate to the dev instance URL and wait 2–3 seconds for it to load.
5. **Check if authentication is needed.** If a login dialog appears, **do not use the HTML form** — it fails with "Invalid username or password" even for valid credentials due to how the form posts. Use JavaScript instead:
   - In `javascript_tool`, POST credentials as `multipart/form-data` using `window.CONFIG` for the correct runtime endpoint and cookie name:
     ```javascript
     const fd = new FormData();
     fd.append("email", "EMAIL_VALUE");
     fd.append("password", "PASSWORD_VALUE");
     fetch(`${window.CONFIG.SERVICE_AUTH}/login`, { method: "POST", body: fd })
       .then((r) => r.json())
       .then((d) => {
         document.cookie = `${window.CONFIG.COOKIE_NAME}=${d.meta.token}; domain=${window.CONFIG.COOKIE_DOMAIN}; path=/`;
         console.log("AUTH_OK:", !!d.meta?.token);
       });
     ```
   - Wait for the `AUTH_OK` console message via `read_console_messages`, then navigate to the target path.
   - Key facts: the API requires `FormData` (not JSON); `window.CONFIG` holds the runtime values (`SERVICE_AUTH`, `COOKIE_NAME`, `COOKIE_DOMAIN`) and is always populated after first page load.
6. Navigate to the UI path described in the issue.
7. Walk through the exact reproduction steps from the issue body.
8. Capture evidence: console errors via `read_console_messages`, network failures via `read_network_requests`, and a UI screenshot of the broken state.
9. **Close the tab** with `tabs_close_mcp` using the tab ID from step 3. This prevents stale session state from leaking into the post-change validation window.

### 2c. Plan report — for `bug`

```
# Pre-Fix Plan Report

Issue valid: <yes|no>
Cause: <technical explanation of why the bug occurs, referencing file path(s) and line(s)>
Proposed fix: <single best fix with minimal code change; reference file path>
Regression test: <which Cypress spec will be extended/created; which it() name>
```

### 2c. Plan report — for `enhancement`

```
# Pre-Feature Plan Report

Issue valid: <yes|no>
Current state: <what the UI/system does today that the issue asks to change>
Proposed change: <user-facing behavior to add or modify, plus implementation approach>
Affected files: <list of files that will change, in priority order>
New test coverage: <which Cypress spec will be extended/created; which it() names>
```

### Gate #1 — Plan approval

Show the report, then call:

```
AskUserQuestion: "Plan looks good — should I proceed with the code changes?"
Options: "Yes, proceed" / "No, stop here"
```

Continue only on explicit approval. On "No, stop here", stop entirely — don't create the branch.

---

## 3. Branch creation (local only)

```bash
git fetch origin
git checkout dev
git pull origin dev
```

Compose the branch name:

```
$BRANCH_PREFIX/$ISSUE_NUMBER-<kebab-title-4-to-7-words>
```

Examples:

- `fix/4094-button-click-handler-undefined`
- `feat/4150-bulk-delete-content-items`

```bash
git checkout -b "$BRANCH_PREFIX/$ISSUE_NUMBER-<slug>"
```

Don't push yet — Gate #2 has to approve the actual change first. Pushing prematurely leaks WIP branches to remote and tempts CI runs on incomplete work.

## 4. Code generation

The goal is the **minimum diff that resolves the issue**. Don't refactor unrelated code even if you see opportunities; reviewers will treat unrelated changes as scope creep and bounce the PR.

For each change:

1. Read the file. Understand the surrounding patterns first.
2. Apply the patch with `Edit`.
3. Match the conventions in `CLAUDE.md` — high-impact rules to honor:
   - New HTTP endpoints extend an existing `src/shell/services/<service>.ts` RTK Query slice. Don't introduce raw `fetch`/`axios` or new `FETCH_RESOURCE` call sites.
   - New slices use `createSlice` from `@reduxjs/toolkit` — no hand-rolled switch reducers.
   - Functional components + hooks only. No class components.
   - React Router v5 syntax (`useHistory`, `<Switch>`, `<Redirect>`) — not v6 (`useNavigate`, `<Routes>`, `element={}`).
   - Style with the MUI `sx` prop in new feature code. Avoid `styled()` unless `sx` genuinely can't express the rule.
   - Service URLs come from `window.CONFIG` at runtime; never import `app.config.js` directly.
   - New TypeScript files explicit-type their props with `type FooProps = { … }`; reach for `interface` only when extending.
   - New interactive controls (buttons, inputs, menu items, modal triggers, table rows) MUST expose a stable `data-cy="…"` — Cypress selects by `data-cy` exclusively, so without it your control is untestable.

### 4a. Regression / coverage test

Add or extend a Cypress spec that fails on `dev` without the change and passes with it. Use the custom commands from `cypress/support/commands.js` (`cy.login`, `cy.apiRequest`, `cy.getBySelector`, `cy.blockLock`, `cy.blockAnnouncements`, `cy.waitOn`). Seed any required instance data via the helpers in `cypress/support/api.js` (`cy.createModel`, `cy.createField`, `cy.createStatusLabel`, etc.) and clean it up in `after` — leaked records pollute later runs.

Record the spec path and each `it()` name — the PR body references them.

### 4b. TypeScript check

CI does **not** run a typecheck. If you've touched any `.ts`/`.tsx` files, run it locally before continuing:

```bash
npx tsc --noEmit
```

Fix any errors caused by your changes. If you see unrelated pre-existing errors, leave them alone — fixing them would expand scope.

---

## 5. Post-change verification

### 5a. Seed test data

Before opening Chrome, create the records the scenario needs — content items, models, status labels, leads, releases, whatever the issue exercises. Use `gh api` or `curl` with the session cookie, or call the Instances API via `cy.apiRequest` in a quick scratch spec. Missing data is the #1 cause of false-positive validations.

### 5b. Confirm dev server is still running

If it stopped between Gate #1 and now, ask the user to restart it.

### 5c. Validate in a fresh Chrome window

1. Open a **brand-new Chrome window** (not a tab in the pre-change window — a separate browser session avoids cached state hiding regressions).
2. Navigate to the dev instance URL and wait for it to load.
3. **Authenticate via JavaScript if the login dialog appears** — use the same `FormData` + `window.CONFIG` technique from Step 2b item 5. Do not use the HTML login form.
4. Navigate to the UI path and reproduce the exact steps from the issue, using the data seeded in 5a.
5. Confirm the bug no longer reproduces, or the new feature behaves as proposed.
6. Capture evidence: clean console, expected UI state, expected network calls.
7. Record the screen showing the working behavior. Save to `~/Downloads/$RECORDING_SLUG`. Keep the file under **2 MB** — GitHub silently strips inline `<img>` PR attachments above that size. Trim trailing dead time if you need to shrink it.
8. Upload to imgur and capture the URL:
   ```bash
   IMGUR_URL=$(imgur-uploader "$HOME/Downloads/$RECORDING_SLUG")
   ```
   If `IMGUR_URL` doesn't start with `http`, the upload failed — stop and surface the error so the user can host it manually.

### 5d. Close the validation window

Call `tabs_close_mcp` with the tab ID from step 5c item 1. A clean close keeps the user's other browser sessions untouched and signals "this window's job is done".

### 5e. Result report

```
# Post-Change Result Report

Outcome: <Bug resolved | Feature working | Partial | Bug still present>
Behavior: <what happens now with the change applied>
Steps performed: <exact path + actions used during validation>
Console: <clean | errors listed below>
Recording: <local path> → <imgur URL>
```

### Gate #2 — Change approval

```
AskUserQuestion: "Validation looks good — should I commit, push, and open the PR?"
Options: "Yes, ship it" / "No, revert"
```

If "No, revert": `git checkout dev && git branch -D <branch>` and stop. The local edits are gone — the user can re-run the skill with corrections.

---

## 6. Commit & push

Group the diff into semantic commits — one logical change per commit. If the change touched multiple concerns (e.g., an RTK Query endpoint + a component that consumes it), that's two commits, not one "Fix issue #X" dump.

Commit message format: a single declarative sentence. No conventional-commits prefixes (`feat:`, `fix:`) — `CLAUDE.md` is explicit about this.

Examples:

- `Fix undefined button click handler in LoginForm`
- `Add bulkDelete endpoint to instanceApi`
- `Wire bulk-delete modal into content list toolbar`

```bash
git add <files>
git commit -m "<message>"
git push --set-upstream origin "$BRANCH_PREFIX/$ISSUE_NUMBER-<slug>"
```

## 7. Open the PR

**Reviewers.** Default pool: `agalin920`, `finnar-bin`, `geodem127`. GitHub rejects self-review, so filter the author handle out:

```bash
AUTHOR=$(gh api user --jq .login)
REVIEWERS=$(printf '%s\n' agalin920 finnar-bin geodem127 | grep -v "^$AUTHOR$" | paste -sd, -)
```

**Title format**: `[Area] - Description` (per `CLAUDE.md`). Reuse the commit-message phrasing where it fits. GitHub appends the PR number on merge — don't add it yourself.

**Body**: pick the template matching `$ISSUE_KIND`. Do not mix sections from the other template.

### PR body — `bug`

```
### **RCA:**
- <one bullet per root-cause finding from the Plan Report>

### **FIX:**
- <one bullet per code change, naming the file and what changed>
- Regression test added: `cypress/e2e/<area>/<feature>.spec.js` — `<it() name>`

### **TESTING PLAN:**
- <test data prerequisites created in Step 5a, with API calls or "n/a">
- <navigation path and exact reproduction steps run against the fix>
- <expected outcome and how it was verified (UI state, console, network)>
- Cypress: `cypress run --spec "cypress/e2e/<area>/<feature>.spec.js"` — all <N> test(s) pass; fails on `dev` without this change

### **RECORDING:**
<img width='1470' height='779' alt='fix-<ISSUE_NUMBER>-validation' src='${IMGUR_URL}'/>

Closes #<ISSUE_NUMBER>

🤖 Generated with [Claude Code](https://claude.com/claude-code)
```

### PR body — `enhancement`

```
### **CHANGE:**
- <user-facing behavior added or modified — what reviewers will see in the UI>
- <pull from the Plan Report's "Proposed change" section>

### **IMPLEMENTATION:**
- <technical approach — files changed, pattern used (RTK Query endpoint, new slice, sx prop, etc.)>
- <new hooks, dependencies, or data-cy attributes introduced>
- Cypress spec added/extended: `cypress/e2e/<area>/<feature>.spec.js` — list each `it()`

### **TESTING PLAN:**
- <test data prerequisites created in Step 5a, with API calls or "n/a">
- <navigation path and exact steps run against the new behavior>
- <expected outcome and how it was verified (UI state, console, network)>
- Cypress: `cypress run --spec "cypress/e2e/<area>/<feature>.spec.js"` — <N> test(s) cover happy path, error, validation, permission, edge data, and cancel/dismiss; all passing locally

### **RECORDING:**
<img width='1470' height='779' alt='feat-<ISSUE_NUMBER>-validation' src='${IMGUR_URL}'/>

Closes #<ISSUE_NUMBER>

🤖 Generated with [Claude Code](https://claude.com/claude-code)
```

### Create the PR

```bash
gh pr create \
  --base dev \
  --title "<[Area] - Description>" \
  --assignee "@me" \
  --label "$ISSUE_KIND" \
  --reviewer "$REVIEWERS" \
  --body "$(cat <<EOF
<body matching $ISSUE_KIND>
EOF
)"
```

Return the PR URL to the user.

---

## Why the two gates exist

Gate #1 (before code) catches misdiagnosed issues — you've reproduced the bug and articulated the cause, but the user often knows context you don't ("we already tried that and it broke X"). Cheap to stop here, expensive to stop after the diff exists.

Gate #2 (before commit/push) catches changes that "work" in your validation window but miss the actual user complaint, or quietly regress something only the user would notice. The recording and report are exactly what PR reviewers will see — the user vets them before they go out.

## Error handling

- **Issue not found** — `gh issue view` exits non-zero. Report and stop.
- **Issue already closed** — stop. Offer to reopen if the user actually wants to redo the work.
- **Label ambiguous (both or neither `bug` and `enhancement`)** — ask the user to pick `$ISSUE_KIND` interactively, then continue.
- **Branch already exists locally** — `git checkout <branch>` instead of `-b` and continue. If it exists on remote too, `git pull` first.
- **Dev server not running** — pause and ask the user to start it. Don't attempt to start it yourself (it needs an interactive shell and binds to the user's hosts entry).
- **Chrome automation fails or stalls** — fall back to a guided manual walkthrough: tell the user the steps, ask them to confirm the bug repros / fix works, and proceed.
- **`npx tsc --noEmit` errors on your changes** — fix them before Gate #2.
- **`imgur-uploader` fails** — surface the error and ask the user to upload the GIF manually; substitute their URL into `$IMGUR_URL` before composing the PR body.
- **`gh pr create` fails** — print the full `gh pr create` invocation so the user can run it manually after adjusting credentials, labels, or reviewer access.
