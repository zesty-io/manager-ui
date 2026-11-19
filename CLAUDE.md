# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

`manager-ui` is the Zesty.io instance manager — a React 18 SPA bundled with Webpack 5. The only test surface is Cypress (`cypress/e2e/`); there is no Jest/Vitest setup, so don't scaffold unit-test files alongside new components.

## Commands

- Install: `npm install --legacy-peer-deps` (CI uses this flag — peer deps don't resolve cleanly without it).
- Dev server: `npm start` — webpack-dev-server on `http://0.0.0.0:8080` against the **dev** API. Use `npm run start:stage` to point at stage, or `npm run start:local` for `local` config.
- Build: `npm run build:prod` (also `:dev`, `:stage`, `:local`). Output goes to `build/`.
- Cypress E2E: `npm run test:open` or `npm test` (needs root `cypress.env.json` with `{email, password}`); one spec: `./node_modules/.bin/cypress run --spec "cypress/e2e/<area>/<file>.spec.js"`; dev server + tests: `npm run ci`.

Node is pinned to **22.19.0** via Volta and CI. `pretty-quick` runs on staged files via the husky `pre-commit` hook, separately from lint.

## Local dev requires a hosts entry

Every Zesty instance is identified by a ZUID, and the app derives the instance ZUID from `window.location.host.split(".")[0]` (`src/utility/instanceZUID.js`). You **cannot** load the dev server at `localhost:8080` — you must add an entry like:

```
127.0.0.1  <YOUR_INSTANCE_ZUID>.manager.zesty.io
```

…and visit `http://<ZUID>.manager.zesty.io:8080`. `npm start` selects the `development` block of `src/shell/app.config.js`, which points at `*.api.dev.zesty.io` with cookie `DEV_APP_SID` — the same **dev** instance Cypress uses, not production. Writes still hit a real shared instance that every PR's CI run also uses, so clean up anything you create. (The README's claim that `npm start` connects to production is out of date.)

`historyApiFallback` picks the HTML entry by hostname suffix (`*.zesty.io` → `index-zesty.html`, `*.content.one` → `index-content.html`); same JS bundle, but the theme palette branches on `isContentOne()` in `src/shell/index.js`.

## Architecture

### App shell + sub-apps, single bundle

Despite the README's mention of per-app bundles, `src/shell/webpack.config.js` produces a single `main` bundle plus a separate `activePreview` entry. All dependencies live in the root `package.json` — sub-apps under `src/apps/*` do **not** have their own installable `package.json` (the file in `src/shell/` exists but is not used for installs).

Layout:

- `src/shell/` — app shell: bootstrap (`index.js`), router (`views/Shell/Shell.tsx`), Redux store, RTK Query services, top-level components (sidebar, topbar, global menus), and the webpack config.
- `src/apps/<name>/src/index.js` — each sub-app exports a default React component and registers its own reducers by calling `injectReducer(store, name, reducer)` against the shared store. `Shell.tsx` imports them statically and routes between them with React Router v5 `<Switch>`. `studio` is a route shim over a visual builder whose in-iframe agent lives in a **separate repo**: read [`docs/studio.md`](docs/studio.md) before working on it. `active-preview` is **not** routed via `Shell.tsx`; it's the separate webpack entry that renders the preview iframe.
- `src/engine/` — the bridge between the AI drawer (`src/shell/views/Shell/AIDrawer.tsx`, backed by `useGeminiGenerationMutation` from `src/shell/services/mcp.ts`) and the app's UI: a ref-registry + action-handler layer (`refRegistry`, `handlers.ts`, `navigator.ts`). The drawer dispatches actions by `refKey` rather than querying the DOM, so any control the AI should be able to drive must be registered:

  ```ts
  useRegisterRef(key, handle, context?, options?)
  ```

  - `key` — stable string id (must match what the action handlers expect).
  - `handle` — a `RefHandle` exposing the imperative API the action will call (e.g. `{ open: () => void, save: () => void }`). The component owns it and unregisters automatically on unmount.
  - `context` — optional snapshot (object or thunk) describing current state for the AI; the thunk form is re-evaluated on each action.

  Action types and routing live in `src/engine/{actionTypes.ts, handlers.ts, navigator.ts, queue.ts}`. Add new actions there rather than special-casing inside `AIDrawer.tsx`.

- `src/utility/` — framework-agnostic helpers (`request.js`, `idb.ts`, `history.ts`, `sentry.js`, `instanceZUID.js`).

### State management

- **Redux** (classic `createStore` + thunk + custom middleware in `src/shell/store/middleware/`) is the source of truth. Reducers are wired in `src/shell/store/index.js`.
- **RTK Query** services live in `src/shell/services/*.ts`. Each is registered both as a reducer (`[api.reducerPath]: api.reducer`) and as middleware. Prefer extending these for new HTTP calls instead of writing raw thunks.
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

Mixed JS/TS (`allowJs: true`, `noImplicitAny: true`; config in `tsconfig.json`, webpack aliases `shell`, `utility`, `apps`).

`skipLibCheck: true` skips checking inside every `.d.ts`, including this repo's own. Ambient declarations still fail at their use sites, but a derived type (`typeof import(...)`, `ReturnType<...>`) fails silently and degrades to `any` — keep those in a real `.ts` file, which is what `src/shell/configTypes.ts` is for.

Coverage instrumentation (`babel-plugin-istanbul`) is hard-coded `on` in the webpack config — leave it that way unless intentionally changing CI coverage behavior.

### Theming

Uses `@zesty-io/material` (MUI v5 + MUI X wrapper; license key set in `src/shell/index.js`). The theme is built once at boot in `index.js` and provided via `<ThemeProvider>`. Preview local changes with `npm link @zesty-io/material` (see README).

### Observability

- Sentry is initialized in `src/utility/sentry.js` and wraps the root component; a redux-sentry-middleware allowlists which slices are sent.
- Amplitude (`@amplitude/analytics-browser`) is initialized in `index.js` and identified per-user in `Shell.tsx`. Event names live in `src/amplitude-events.ts`.

## Testing with Cypress

Detailed guidance (custom commands, seeding, selectors, no hard waits, `uuidv4` names) lives in [`cypress/CLAUDE.md`](cypress/CLAUDE.md); read it before writing or changing specs. Cypress is the only test surface. **Every interactive element needs a `data-cy` attribute** (the only selector strategy tests use).

## Localization (i18next)

`manager-ui` is localized with **i18next + react-i18next** across 6 locales: `en-US` (fallback), `es-ES`, `hi-IN`, `zh-CN`, `ru-RU`, `nl-NL`. Hindi bundles are hand-authored everywhere (little upstream support).

Read [`docs/i18n.md`](docs/i18n.md) before changing i18n config, locale loading, dates or MUI localization, or when `npm run lint` fails on an i18n rule. It also covers the `localize` workflow and `npm run i18n:extract`.

### Core

- **Locale data:** `public/locales/<locale>/<namespace>.json`. Components call `useTranslation()` with **no namespace argument**; the namespace lives in the key.
- **Key syntax:** config sets `nsSeparator: "."` + `keySeparator: false`. Keys are **qualified, flat camelCase strings** — `t("content.publishItem")`, `t("common.save")`. The namespace is the first dot-segment; the rest is one flat key. **Never nest JSON objects and never use a second dot** — a multi-dot key like `t("media.dateFilter.today")` resolves to a broken lookup and throws in dev.
- **All namespaces load eagerly at init, deliberately.** Per-sub-app lazy-loading was tried and reverted (a race: Redux-driven code calling `i18n.t()` before the namespace loaded). Don't "fix" this back to lazy-loading without addressing that race first (history in `docs/i18n.md`).
- **Missing keys:** dev throws; stage/prod fall back to en-US and report to Sentry.
- **Dates and MUI component labels are separate from i18next** (see `docs/i18n.md`). Keep machine formats (`yyyy-MM-dd`, API/CSV payloads, URL params, IndexedDB/search keys) locale-independent.

### Rules for translating new copy

**Where strings hide (audit _all_ of these, not just JSX):**

- JSX text + string props (`label`, `placeholder`, `title`, `aria-label`, `alt`).
- Functions that return strings (`getLabel`, `getErrorMessage`, …).
- Module-level object maps/arrays: `t()` can't run at module scope. Store i18n _keys_ in the map and resolve with `t()` in the component. Verify the const isn't imported elsewhere first.
- Strings passed as props: translate at the **call site**.
- `notify()` / `dispatch()` messages, including in **redux thunks and hooks**. In non-component modules use the **i18n singleton**: `import i18n from "shell/i18n"; i18n.t("ns.key")`.
- Class components: `withTranslation()`, `this.props.t`.

**What to SKIP (data / not UI copy):**

- DB-sourced values: model/field labels, field-type identifiers (`one_to_one`), user content, backend-generated role names, passed-through backend error text.
- Brand/product names: Zesty, Bynder, Google Analytics, Content One, "Zesty Manager". Technical tokens: ZUID, HTML element names (Script/Meta/Link), code snippets, raw HTML attributes (`target=_blank`).
- Developer-facing: `throw new Error(...)` invariants, `console.*` logs.

**Value formatting rules:**

- **No decorative special characters** prefixing/suffixing the value (trailing colons, surrounding em-dashes, wrapping parentheses, `-- --` prompts); add them back in the component at every render site. Violations: `"— None —"`, `"(optional)"`, `"({{count}} fields)"`. Not violations: `"Archives (zip)"` (semantic parenthetical). Large JSON diffs across 6 locales are expected.
- **No ALL CAPS values.** Apply `textTransform: "uppercase"` in the component instead (or rely on `variant="overline"` / MUI `Button`, which already uppercase). Two keys (`"Fields"` vs `"FIELDS"`) for the same concept is a dedup problem across locales.
- **No HTML in translation values.** Use `<Trans components={{...}}>` in React; `{{var}}` interpolation only in thunks/`notify()`/`i18n.t()`. Since `escapeValue: false`, `t()` on a value with raw tags renders them as literal text, silently. Keys whose value contains component placeholders **must** carry a `Rich` suffix (e.g. `shell.filterNoResultsRich`) so only `<Trans i18nKey="...">` is used for them, never `t()`.
- **No hardcoded URLs or asset paths** — use `{{var}}` and pass the value at the call site.

**Which namespace a string belongs to:** the app dir the file physically lives in, _even when_ another app imports it (`src/shell/components/FieldType*` → `shell`; `src/apps/content-editor/src/*` → `content`). Namespace names are **flat camelCase** (`activePreview`, not `active-preview`). A shared component that can mount where its home namespace isn't loaded should self-load it: `useTranslation("<homeNs>", { useSuspense: false })`.

**Pluralization is mandatory: every CLDR form, every locale.** A plural key (`_one`, `_other`, …) used with `{ count }` **throws in dev for any missing category**. Forms differ per locale — define all of them:

| Locale                    | Required forms                    |
| ------------------------- | --------------------------------- |
| `en-US`, `hi-IN`, `nl-NL` | `_one`, `_other`                  |
| `es-ES`                   | `_one`, `_many`, `_other`         |
| `ru-RU`                   | `_one`, `_few`, `_many`, `_other` |
| `zh-CN`                   | `_other`                          |

This is the **one exception** to strict key-parity across locales. A non-suffixed key with `{count}` is fine; Spanish `_many` usually equals `_other`; exact suffixes via `i18n.services.pluralResolver.getSuffixes(tag)`.

**Verification**: `npm run lint` (ESLint incl. `i18next/no-literal-string` and `zesty-i18n/key-format`, then `scripts/lint-i18n-locales.js` for locale-JSON checks and 6-locale key/plural parity) and `npx tsc --noEmit` are required before merge; run both yourself.

**Suppressing `i18next/no-literal-string`** for a genuinely non-translatable literal (brand name, email, URL, `v{version}`, `MP4`): wrap _only_ that literal in a fragment (`<>...</>`) and put `{/* eslint-disable-next-line i18next/no-literal-string -- <reason> */}` directly above the fragment's opening `<>`:

```jsx
<Link>
  <FontAwesomeIcon icon={faTwitterSquare} />
  {/* eslint-disable-next-line i18next/no-literal-string -- brand name */}
  <>Twitter</>
</Link>
```

Never put the comment above a bare JSXText child (it silently does nothing), never use `eslint-disable-line` for this rule, and never add to a global `words.exclude` list. Why: `docs/i18n.md`.

## Conventions

- **New endpoints → RTK Query.** Extend an existing `src/shell/services/<service>.ts` with a new `endpoints` builder and reuse `prepareHeaders` / `getResponseData` from `src/shell/services/util.js`. Don't write a new thunk for HTTP. The legacy `FETCH_RESOURCE` middleware in `src/shell/store/middleware/api.js` is still wired for existing call sites — don't add new ones.
- **New slices → `createSlice`** from `@reduxjs/toolkit` (see `src/shell/store/{ui,users,...}`). No hand-rolled switch reducers.
- **`useSelector` is typed against `AppState`** (`src/shell/store/types.ts`): `useSelector((state: AppState) => state.ui.openNav)`. When you add a slice, extend `AppState` (most members are still `any`; type yours).
- **Sub-app reducers** register via `injectReducer` (see State management; canonical example `src/apps/content-editor/src/index.js`).
- **Components.** Functional + hooks only. Default to flat `Foo.tsx`; promote to `Foo/index.tsx` only when it grows colocated files. Type props with `type FooProps = { … }` (`interface` only when extending). `memo()` only for high-rerender cases (tabs, sidebars, list rows).
- **Routing is React Router v5.** Use `<Switch>`, `<Route>`, `useHistory`, `useLocation`, `<Redirect>`. Do not use v6 syntax (`useNavigate`, `<Routes>`, `element={}`). Top-level routes live in `src/shell/views/Shell/Shell.tsx`; sub-app internal routes nest inside the sub-app.
- **Styling.** Prefer the MUI `sx` prop. LESS modules only for existing shell-level layout (sidebar, topbar), not new feature code. Avoid `styled()` unless `sx` cannot express the rule. For _which value_, see [`docs/design-system.md`](docs/design-system.md): a hex literal or raw `fontSize` in `src/` is a bug unless that doc covers it.
- **Service URLs come from `window.CONFIG`**, never hardcoded or imported from `src/shell/app.config.js` at runtime.
- **TypeScript first**: new modules are `.ts`/`.tsx` with explicit types.
- **Long lists virtualize** (`react-window`, `react-virtualized-auto-sizer`, `react-virtualized-sticky-tree`). Virtualize new tables and long content lists.
- **Deeplinks use path params, not query params**, for "which view"; query params only refine a view (README "Deeplinks").
- **MUI `ToggleButtonGroup`** with `exclusive` returns `null` when nothing is selected; follow the existing `toggleHandlers` null-guard pattern.
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
- **Lint and typecheck gate, no build gate.** `.github/workflows/ci.yaml` runs Cypress (`npm run ci`), plus `npm run lint` and `npx tsc --noEmit` in the `setup` job, which gates the e2e jobs; `all_tests_passed` requires all of them. Nothing runs `npm run build:*` in CI.
- Three Claude workflows also run on PRs (`claude-auto-reviewer.yml`, `claude-issue-critique.yml`, `claude-qa.yml`), none blocking. CI internals (e2e concurrency queue, QA jobs, reviewer prompt split, `cypress-split` runners, `timings.json`, coverage comment) are in [`.github/CLAUDE.md`](.github/CLAUDE.md); read it before editing workflows or `ci/`.
- Pre-commit (`.husky/pre-commit`) runs `pretty-quick --staged` only. There is no pre-push hook.
- Commit/PR titles follow `[Area] - Description` (e.g. `Content - Prevent app from crashing…`); the PR number is appended on merge by GitHub. No conventional-commits prefixes.
