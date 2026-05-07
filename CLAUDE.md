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

…and visit `http://<ZUID>.manager.zesty.io:8080`. The default `npm start` connects to the **production** Zesty API, so any writes hit a real instance. Use `npm run start:stage` against staging when testing destructive changes.

The dev server's `historyApiFallback` selects a different HTML entry based on hostname suffix: `*.zesty.io` → `index-zesty.html`, `*.content.one` → `index-content.html`. Both render the same JS bundle but the theme palette branches on `isContentOne()` in `src/shell/index.js`.

## Architecture

### App shell + sub-apps, single bundle

Despite the README's mention of PRPL/per-app bundles, the current `src/shell/webpack.config.js` produces a single `main` bundle plus a separate `activePreview` entry. All dependencies live in the root `package.json` — sub-apps under `src/apps/*` do **not** have their own installable `package.json` (the file in `src/shell/` exists but is not used for installs).

Layout:

- `src/shell/` — app shell: bootstrap (`index.js`), router (`views/Shell/Shell.tsx`), Redux store, RTK Query services, top-level components (sidebar, topbar, global menus), and the webpack config.
- `src/apps/<name>/src/index.js` — each sub-app exports a default React component and registers its own reducers by calling `injectReducer(store, name, reducer)` against the shared store. `Shell.tsx` imports them statically (`ContentApp`, `DamApp`, `ReleaseApp`, `ReportingApp`, `CodeApp`, `LeadsApp`, `SchemaApp`, `SeoApp`, `SettingsApp`, `HomeApp`, `StudioApp`, `MarketplaceApp`, `BlocksApp`) and routes between them with React Router v5 `<Switch>`.
- `src/engine/` — a ref-registry + action-handler layer (`refRegistry`, `handlers.ts`, `navigator.ts`) that lets external code (notably the AI drawer in `views/Shell/AIDrawer.tsx`) drive UI by `refKey` rather than DOM queries. When adding components that should be controllable this way, register them via `useRegisterRef`.
- `src/utility/` — framework-agnostic helpers (`request.js`, `idb.ts`, `history.ts`, `sentry.js`, `instanceZUID.js`).

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
- **CI runs Cypress only.** `.github/workflows/ci.yaml` runs `npm run ci`, which is `start-server-and-test start … test` — there is **no lint step, no typecheck step, no build gate**. If you've touched TypeScript, run `npx tsc --noEmit` locally before opening a PR; the pipeline will not catch type errors for you.
- Coverage from Cypress is posted as a PR comment by `ci.yaml`. Treat dropping coverage on changed files as a review signal, not a hard gate.
- Pre-commit (`.husky/pre-commit`) runs `pretty-quick --staged` only. There is no pre-push hook.
- Commit/PR titles follow `[Area] - Description` (e.g. `Content - Prevent app from crashing…`); the PR number is appended on merge by GitHub. No conventional-commits prefixes.
