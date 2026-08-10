# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

`manager-ui` is the Zesty.io instance manager — a React 18 SPA bundled with Webpack 5. The only test surface is Cypress (`cypress/e2e/`); there is no Jest/Vitest setup, so don't scaffold unit-test files alongside new components.

## Commands

- Install: `npm install --legacy-peer-deps` (CI uses this flag — peer deps don't resolve cleanly without it).
- Dev server: `npm start` — webpack-dev-server on `http://0.0.0.0:8080` against the **dev** API. Use `npm run start:stage` to point at stage, or `npm run start:local` for `local` config.
- Build: `npm run build:prod` (also `:dev`, `:stage`, `:local`). Output goes to `build/`.
- Cypress E2E: `npm run test:open` (interactive) or `npm test` (headless electron). `cypress.env.json` with `{email, password}` credentials must exist at the repo root.
- Run a single Cypress spec: `./node_modules/.bin/cypress run --spec "cypress/e2e/<area>/<file>.spec.js"`.
- Combined dev-server + tests: `npm run ci` (uses `start-server-and-test`).

Node is pinned to **22.19.0** via Volta and CI. There is no separate lint script — `pretty-quick` runs on staged files via the husky `pre-commit` hook.

## Local dev requires a hosts entry

Every Zesty instance is identified by a ZUID, and the app derives the instance ZUID from `window.location.host.split(".")[0]` (`src/utility/instanceZUID.js`). You **cannot** load the dev server at `localhost:8080` — you must add an entry like:

```
127.0.0.1  <YOUR_INSTANCE_ZUID>.manager.zesty.io
```

…and visit `http://<ZUID>.manager.zesty.io:8080`. `npm start` selects the `development` block of `src/shell/app.config.js`, which points at `*.api.dev.zesty.io` with cookie `DEV_APP_SID` — the same **dev** instance Cypress uses, not production. Writes still hit a real shared instance that every PR's CI run also uses, so clean up anything you create. Use `npm run start:stage` for staging. (The README still claims `npm start` connects to production; it is out of date.)

The dev server's `historyApiFallback` selects a different HTML entry based on hostname suffix: `*.zesty.io` → `index-zesty.html`, `*.content.one` → `index-content.html`. Both render the same JS bundle but the theme palette branches on `isContentOne()` in `src/shell/index.js`.

## Architecture

### App shell + sub-apps, single bundle

Despite the README's mention of PRPL/per-app bundles, the current `src/shell/webpack.config.js` produces a single `main` bundle plus a separate `activePreview` entry. All dependencies live in the root `package.json` — sub-apps under `src/apps/*` do **not** have their own installable `package.json` (the file in `src/shell/` exists but is not used for installs).

Layout:

- `src/shell/` — app shell: bootstrap (`index.js`), router (`views/Shell/Shell.tsx`), Redux store, RTK Query services, top-level components (sidebar, topbar, global menus), and the webpack config.
- `src/apps/<name>/src/index.js` — each sub-app exports a default React component and registers its own reducers by calling `injectReducer(store, name, reducer)` against the shared store. `Shell.tsx` imports them statically (`ContentApp`, `DamApp`, `ReleaseApp`, `ReportingApp`, `CodeApp`, `LeadsApp`, `SchemaApp`, `SeoApp`, `SettingsApp`, `HomeApp`, `StudioApp`, `MarketplaceApp`, `BlocksApp`) and routes between them with React Router v5 `<Switch>`.
- `src/engine/` — a ref-registry + action-handler layer (`refRegistry`, `handlers.ts`, `navigator.ts`) that lets external code (notably the AI drawer in `views/Shell/AIDrawer.tsx`) drive UI by `refKey` rather than DOM queries. When adding components that should be controllable this way, register them via `useRegisterRef`.
- `src/utility/` — framework-agnostic helpers (`request.js`, `idb.ts`, `history.ts`, `sentry.js`, `instanceZUID.js`).

### Sub-apps inventory

Each `src/apps/<name>/src/index.js` exports the app's root component and (optionally) calls `injectReducer`. Mapping directory → `Shell.tsx` import:

- `content-editor` → `ContentApp` — content item editor (the primary editing surface).
- `schema` → `SchemaApp` — content model and field editor.
- `media` → `DamApp` — digital asset manager / file uploads.
- `release` → `ReleaseApp` — versioned release management.
- `reports` → `ReportingApp` — analytics and audit reports.
- `code-editor` → `CodeApp` — instance code (templates, scripts, stylesheets).
- `seo` → `SeoApp` — SEO settings.
- `settings` → `SettingsApp` — instance settings.
- `home` → `HomeApp` — dashboard / landing.
- `leads` → `LeadsApp` — lead capture.
- `studio` → `StudioApp` — visual builder. `index.tsx` is a route shim over `StudioWrapper.tsx`; the in-iframe agent it drives lives in a **separate repo**. Read [`docs/studio.md`](docs/studio.md) before working on it.
- `marketplace` → `MarketplaceApp` — app/integration directory.
- `blocks` → `BlocksApp` — reusable content blocks.
- `active-preview` — **not** routed via `Shell.tsx`; it's the separate webpack entry that renders the preview iframe.

### State management

- **Redux** (classic `createStore` + thunk + custom middleware) is the source of truth. Reducers are wired in `src/shell/store/index.js`.
- **RTK Query** services live in `src/shell/services/*.ts` (`instanceApi`, `accountsApi`, `mediaManagerApi`, `metricsApi`, `cloudFunctionsApi`, `marketingApi`, `analyticsApi`, `mcpApi`). Each is registered both as a reducer (`[api.reducerPath]: api.reducer`) and as middleware. Prefer extending these for new HTTP calls instead of writing raw thunks.
- Custom middleware in `src/shell/store/middleware/`:
  - `api.js` — handles `FETCH_RESOURCE` actions with inflight de-duplication.
  - `local-storage.js`, `session.js` — sync slices to storage.
  - `app-bus.js` — event bus across sub-apps.
  - `nav.js` — content nav tree updates.
- Sub-apps add reducers asynchronously via `injectReducer(store, name, reducer)` (`src/shell/store/index.js`). This is how content-editor adds `modal` and `listFilters`, and how the shell itself adds `navContent`.
- Some legacy code reads from a global `window.zesty` (a `@riotjs/observable`) and `window.zestyStore` — both are set up in `src/shell/index.js`. Don't add new dependencies on these.

### Auth & session

Auth lives in the legacy thunk-based reducer `src/shell/store/auth.js` (not RTK Query — leave as-is). Bootstrap order:

1. On boot, `verify()` GETs `${CONFIG.SERVICE_AUTH}/verify`. Success dispatches `VERIFY_SUCCESS` and writes the returned `meta.token` to a cookie named `CONFIG.COOKIE_NAME` on `CONFIG.COOKIE_DOMAIN`. Failure renders `<Login>`.
2. `login(email, password)` POSTs `${CONFIG.SERVICE_AUTH}/login`; `verifyTwoFactor` and `pollTwoFactor` handle the 2FA flow.
3. RTK Query services pick up the cookie automatically via `prepareHeaders` in `src/shell/services/util.js` — don't read the cookie or set the bearer manually.
4. On 401 from any RTK Query call, `endSession()` dispatches `SESSION_ENDING`, shows a notification, and after 5s flips `SESSION_INVALID` to redirect to login.

Auth state shape: `{ checking, valid, sessionEnding, token }`. Treat `state.auth.valid === true` as "logged in"; `checking` is the boot-time race.

### Permissions: `usePermission`

Use `usePermission(action, zuid?)` from `src/shell/hooks/use-permissions.js` to gate UI on the current user's role. Actions are `"CREATE" | "READ" | "UPDATE" | "DELETE" | "PUBLISH" | "CODE"`. `zuid` defaults to `instanceZUID`; pass a resource ZUID to check granular roles for that resource (falls back to the instance-level granular role, then to the system role).

Quirks:

- `user.staff === true` (Zesty staff) and `userRole.systemRole.super === true` short-circuit to `true` for every action.
- `"CODE"` is a _role-name_ check, not a CRUD bit — only `Owner`, `Admin`, `Developer` pass. New product gates that look like `CODE` belong here too rather than as new CRUD actions.
- For "user can't do X" UI, render `<NoPermission>` from `src/shell/components/NoPermission.tsx` instead of hiding the control silently.

### Config injection

`src/shell/app.config.js` defines per-environment service URLs. Webpack inlines the selected environment via a `DefinePlugin` `__CONFIG__`. At runtime `src/shell/index.js` merges in `getRuntimeEnv` and assigns to `window.CONFIG`, then rewrites `API_INSTANCE` to include the current ZUID. Read service URLs from `window.CONFIG`, not from imports of the config file.

### IndexedDB warm cache

On boot, `src/shell/index.js` reads several keys from IndexedDB (`<ZUID>:languages`, `<ZUID>:models`, `<ZUID>:fields`, `<ZUID>:content`, `<ZUID>:ui`, etc.) and dispatches `LOADED_LOCAL_*` actions before rendering. If you change a slice's shape, also update the corresponding `LOADED_LOCAL_*` reducer or stale data will hydrate it incorrectly. (`LOADED_LOCAL_CONTENT_NAV` is currently disabled because of this — see the FIXME in `index.js`.)

### TypeScript

Mixed JS/TS. `tsconfig.json` sets `allowJs: true`, `noImplicitAny: true`, `jsx: "react-jsx"`, and a single path alias `shell/* → ./src/shell/*`. Webpack adds matching aliases for `shell`, `utility`, and `apps`. `ts-loader` compiles `.ts(x)`; `babel-loader` handles `.js`. Coverage instrumentation (`babel-plugin-istanbul`) is hard-coded `on` in the webpack config — leave it that way unless intentionally changing CI coverage behavior.

### Theming

Uses `@zesty-io/material` (a wrapper around MUI v5 + MUI X with a paid license key set in `src/shell/index.js`). The theme is built once at boot in `index.js` and provided via `<ThemeProvider>`. To preview local changes to `@zesty-io/material`, use `npm link @zesty-io/material` (the README has the full flow).

### Observability

- Sentry is initialized in `src/utility/sentry.js` and wraps the root component (`Sentry.withProfiler`, `Sentry.ErrorBoundary`). A redux-sentry-middleware allowlists which slices are sent.
- Amplitude (`@amplitude/analytics-browser`) is initialized in `index.js` and identified per-user in `Shell.tsx`. Event names live in `src/amplitude-events.ts`.

### Engine and the AI drawer

`src/engine/` is the bridge between the AI drawer (`src/shell/views/Shell/AIDrawer.tsx`, backed by `useGeminiGenerationMutation` from `src/shell/services/mcp.ts`) and the app's UI. The drawer dispatches actions by `refKey` rather than querying the DOM, so any control the AI should be able to drive must be registered:

```ts
useRegisterRef(key, handle, context?, options?)
```

- `key` — stable string id (must match what the action handlers expect).
- `handle` — a `RefHandle` exposing the imperative API the action will call (e.g. `{ open: () => void, save: () => void }`). The component owns it and unregisters automatically on unmount.
- `context` — optional snapshot (object or thunk) describing current state for the AI; the thunk form is re-evaluated on each action.

Action types and routing live in `src/engine/{actionTypes.ts, handlers.ts, navigator.ts, queue.ts}`. Add new actions there rather than special-casing inside `AIDrawer.tsx`.

## Testing with Cypress

Specs live in `cypress/e2e/<area>/<file>.spec.js`. Required setup: a `cypress.env.json` at the repo root with `{ "email", "password" }` plus the env vars consumed by the custom commands (`API_AUTH`, `COOKIE_NAME`, etc. — see `cypress.config.js`).

Custom commands (`cypress/support/commands.js`) — use these instead of hand-rolling:

- `cy.login()` — POSTs `${API_AUTH}/login` and writes the `COOKIE_NAME` cookie. Call in `beforeEach`.
- `cy.apiRequest({ method, url, body })` — wraps `cy.request` and auto-injects the bearer from the cookie. Use for setup/teardown HTTP, not raw `cy.request`.
- `cy.getBySelector("foo")` — selects `[data-cy="foo"]`. New components should expose `data-cy` attributes for anything tests will target; don't lean on class names or text.
- `cy.blockLock()` — stubs `/door/knock*` to defeat the "instance is locked" modal. Call before any edit-page test.
- `cy.blockAnnouncements()` — stubs the announcements feed. Use when announcements would otherwise interrupt the flow.
- `cy.waitOn(path, cb)` — runs `cb` after intercepting `path` and waits up to 30s for the request.

Fixtures (`cypress/fixtures/`) seed instance/content/model JSON. Don't hand-roll fixtures inline in specs.

**Tests hit a real dev instance, not mocks.** `cypress/support/api.js` exposes seeding helpers — `cy.createModel`, `cy.deleteModel(s)`, `cy.createField`, `cy.createStatusLabel`, `cy.deleteStatusLabels` — that POST/DELETE against the dev API (`API_ENDPOINTS.devInstance`). Use them in `before` / `after` hooks and clean up everything you create; leaked records pollute later runs within the same day. Hardcoded ZUIDs in specs (e.g. `/content/6-0c960c-d1n0kx`) reference seed data on the configured instance — don't repoint specs at a different instance without re-seeding.

**The dev instance is synced nightly from prod.** Test data created during a run is wiped on the next nightly sync, so specs must not rely on data from a previous day's run still being present — always seed what you need in `before` hooks. Instance-level configuration (integrations, fonts, analytics connections) reflects prod state after each sync.

**`data-cy` is the only selector strategy.** Tests use `cy.getBySelector("Foo")` exclusively; class-based selectors, MUI class hooks, and text-matching for clicks are flake risks. When writing or modifying a component, add a `data-cy="…"` attribute to every interactive element (button, input, menu item, table row) that a test may need to target — never rely on class names or MUI internals. New interactive controls without a `data-cy` are effectively untestable.

**No hard waits.** Do not use `cy.wait(ms)` with a fixed number. Use `cy.waitOn(path, cb)` to wait for a network request, or Cypress's built-in retry-ability (`.should(…)`, `.contains(…)` with a `timeout` option). Hard waits make tests slow and mask real timing issues.

**Use `uuidv4` for unique test data names, not timestamps.** Import `{ v4 as uuidv4 } from "uuid"` and append the result to test record names (e.g. `` `My Model | ${uuidv4()}` ``). UUIDs are collision-resistant across parallel runners; timestamps are not. Derive any dependent values (e.g. reference IDs) programmatically from the same constant rather than hardcoding expected strings.

## Code conventions

These are the in-use patterns. Match them when adding new code.

- **New endpoints → RTK Query.** Extend an existing `src/shell/services/<service>.ts` with a new `endpoints` builder and reuse `prepareHeaders` / `getResponseData` from `src/shell/services/util.js`. Don't write a new thunk for HTTP. The legacy `FETCH_RESOURCE` middleware in `src/shell/store/middleware/api.js` is still wired for existing call sites — don't add new ones.
- **New slices → `createSlice`** from `@reduxjs/toolkit`. All current shell slices follow this pattern (`src/shell/store/{ui,users,releases,releaseMembers,media,...}`). Don't introduce hand-rolled switch reducers.
- **`useSelector` is typed against `AppState`** from `src/shell/store/types.ts`. Pattern: `useSelector((state: AppState) => state.ui.openNav)`. When you add a slice, extend `AppState` (note its TODO — most members are still `any`; type yours as you go).
- **Sub-app reducers register via `injectReducer`** in the sub-app's `src/index.js`. Canonical example: `src/apps/content-editor/src/index.js` (it injects `modal` and `listFilters`).
- **Components.** Functional + hooks only — there are no class components. Default to flat `Foo.tsx`; promote to `Foo/index.tsx` only when the component grows colocated files (`Foo.less`, child components, types). Type props with `type FooProps = { … }`; reach for `interface` only when extending. `memo()` is used selectively for high-rerender cases (tabs, sidebars, large list rows) — not by default.
- **Routing is React Router v5.** Use `<Switch>`, `<Route>`, `useHistory`, `useLocation`, `<Redirect>`. Do not use v6 syntax (`useNavigate`, `<Routes>`, `element={}`). Top-level routes live in `src/shell/views/Shell/Shell.tsx`; sub-app internal routes nest inside the sub-app.
- **Styling.** Prefer the MUI `sx` prop (the dominant pattern). LESS modules (`Component.less` + `import styles from "./Component.less"`) exist for shell-level layout (sidebar, topbar) and are fine to maintain there, but don't reach for them in new feature code. Avoid `styled()` from `@mui/material/styles` unless `sx` genuinely cannot express the rule.
- **Service URLs come from `window.CONFIG`** (populated in `src/shell/index.js`), never hardcoded and never imported from `src/shell/app.config.js` directly at runtime.
- **TypeScript first for new files.** `allowJs: true` keeps existing `.js` working; new modules should be `.ts`/`.tsx` with explicit types.
- **Long lists virtualize.** This codebase ships `react-window`, `react-virtualized-auto-sizer`, and `react-virtualized-sticky-tree` for a reason — re-render perf matters here, and `why-did-you-render` is wired up in `src/shell/wdyr.js`. Virtualize new tables and long content lists.
- **Deeplinks use path params, not query params**, for "which view." Query params are reserved for refining a view. See README "Deeplinks" for examples.
- **MUI `ToggleButtonGroup`** with `exclusive` returns `null` when nothing is selected, which can break the UI. Existing code uses `toggleHandlers` helpers to guard against `null` — follow that pattern.
- **Issue titles** follow `[APP NAME] - [DESCRIPTION]` (e.g. `Content - Laggy Horizontal Scrolling`).
- **Assets** (images, SVGs) belong on the Zesty CDN at `assets.zesty.io/manager/...`, not committed to the repo.

## Review red flags

Things the codebase actively avoids — flag if you see them in a PR:

- New dependency added to a `src/apps/<sub-app>/package.json` — those files are vestigial. Deps belong in the root `package.json` only.
- New top-level dep added without justification in the PR description (the bundle ships to every Zesty instance).
- React Router v6 syntax (`useNavigate`, `<Routes>`, `element={}`).
- Raw `fetch`/`axios` calls or new uses of `utility/request.js` instead of extending an RTK Query service.
- Direct writes to `window.zesty` or `window.zestyStore`. Both are legacy compatibility shims; reads are tolerated, writes are not.
- Hardcoded service URLs that should resolve through `window.CONFIG`.
- New `any` in TS without a comment explaining why. Existing `any` is mostly legacy and isn't a license to add more.
- Code that bypasses `instanceZUID` (hardcodes a ZUID, parses the host independently, etc.).
- A new component re-wrapping the app in `<ThemeProvider>` — the theme is provided once at root.
- New top-level `<Route>` added inside a sub-app instead of `src/shell/views/Shell/Shell.tsx`.

## Branch & PR flow

- PRs target **`dev`**. After merge, automation cascades changes through `dev → stage → beta → stable` via auto-generated PRs (`.github/workflows/cd-*.yaml`). Each promotion still requires a human merge.
- **Cypress is the only test gate.** `.github/workflows/ci.yaml` runs `npm run ci`, which is `start-server-and-test start … test` — there is **no lint step, no typecheck step, no build gate**. If you've touched TypeScript, run `npx tsc --noEmit` locally before opening a PR; the pipeline will not catch type errors for you.
- **Four Claude workflows also run on PRs**, none of them blocking except the change verifier: `claude-auto-reviewer.yml` (code-level review, inline comments), `claude-change-verifier.yml` (acceptance criteria from the code; fails the check on `FAIL`), `claude-issue-critique.yml` (issue triage), and `claude-negative-qa.yml` (below).
- **`claude-negative-qa.yml` drives the real app in a browser.** It boots the dev server against a **dedicated instance** (`8-acabf6a8d6-bj9tr2`, INTERNAL-NEGATIVE-QA) whose fixtures are authored once in production and reach dev through the nightly prod→dev sync — that sync is also the cleanup, so the agent may mutate anything and nothing is torn down per run. `ci/scripts/qa_session.mjs` resolves the fixture model by name and hands Playwright MCP a pre-authenticated session through a `--storage-state` file (so the token never reaches the agent's prompt), then a senior-QA persona attacks the surfaces the PR diff touches. Findings post as an upserted PR comment keyed on `<!-- negative-qa -->`, with screenshots pushed to `gs://cypress_screenshots/negative-qa/…`. It is **advisory and always exits 0**, and runs **once per PR** — on `opened`/`ready_for_review` only, deliberately not on `synchronize`, because a pass costs ~9 minutes of agent time. Re-run it manually from the Actions tab (`workflow_dispatch` with the PR number, selecting the PR's branch as the ref) or with "Re-run jobs" on the previous run. It uses its own `manager-ui-negative-qa` concurrency group rather than ci.yaml's `manager-ui-e2e-dev-instance`: GitHub allows only one _pending_ run per group, so sharing ci.yaml's group meant this job was routinely cancelled before starting whenever another PR queued a Cypress run. The group now only stops two QA agents fighting over the same instance — isolation from other PRs comes from the instance being dedicated to this workflow in the first place.
- **CI is parallelized across 5 runners** using `cypress-split`. Runner 4 is dedicated to publish-related specs (`content/actions`, `content/list`, `content/redirects`, `settings/workflows`) to prevent cross-runner interference — `workflows.spec.js` creates a publish-blocking workflow label that causes concurrent publish tests on other runners to fail. Runners 0–3 split the remaining specs using `SPLIT=4` and `SKIP_SPEC`. To add more general runners, increment the matrix array and `SPLIT` together and update the `if: matrix.split_index != 4` condition. A `timings.json` at the repo root enables runtime-based distribution for runners 0–3; if absent, cypress-split falls back to spec count. Refresh `timings.json` by downloading the `merged-timings` artifact after a CI run and committing it. Update it every 1–2 months or when runners become noticeably unbalanced.
- Coverage from Cypress is posted as a PR comment by `ci.yaml`. Treat dropping coverage on changed files as a review signal, not a hard gate.
- Pre-commit (`.husky/pre-commit`) runs `pretty-quick --staged` only. There is no pre-push hook.
- Commit/PR titles follow `[Area] - Description` (e.g. `Content - Prevent app from crashing…`); the PR number is appended on merge by GitHub. No conventional-commits prefixes.
