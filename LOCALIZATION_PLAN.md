# Product Localization — Implementation Plan

Spec: https://docs.google.com/document/d/1l5RdyDxQLTwXdz80Gk1_y8GdVv_KoQG5VfSmdvJPmaU

## Supported languages (initial)

| Language | BCP 47 tag |
| -------- | ---------- |
| English  | `en-US`    |
| Spanish  | `es-ES`    |
| Hindi    | `hi-IN`    |
| Mandarin | `zh-CN`    |
| Russian  | `ru-RU`    |
| Dutch    | `nl-NL`    |

---

## Phase 1 — Infrastructure Setup

- [x] Install packages
  - `react-i18next`
  - `i18next`
  - `i18next-http-backend`
  - `i18next-localstorage-backend`
  - `i18next-chained-backend`
  - `i18next-browser-languagedetector`
  - `i18next-parser` (dev dependency — key extraction CLI)
- [x] Create `src/shell/i18n.ts` — configure i18next with:
  - ChainedBackend (LocalStorage → HTTP)
  - LanguageDetector (order: localStorage → navigator)
  - Fallback language: `en-US`
  - Default / initial namespace: `common`
  - `useSuspense: true`
  - Cache busting via `defaultVersion` tied to the build's git hash (injected via webpack `DefinePlugin` as `__GIT_HASH__`)
  - LocalStorage cache TTL: use `i18next-localstorage-backend` default
  - HTTP load path: `/locales/{{lng}}/{{ns}}.json`
- [x] Import `src/shell/i18n.ts` in `src/shell/index.js` (app entry point) — must be imported before the React root renders
- [x] Create `public/locales/` directory structure:
  ```
  public/locales/
    en-US/
      common.json
    es-ES/
      common.json
    hi-IN/
      common.json
    zh-CN/
      common.json
    ru-RU/
      common.json
    nl-NL/
      common.json
  ```
- [x] Add `i18next-parser.config.js` to project root for key extraction
- [x] Wrap the React root in `<Suspense>` (required when `useSuspense: true`) in `src/shell/index.js`

---

## Phase 2 — Locale Switcher Integration

- [x] Build `LocaleSwitcher` UI component (`src/shell/components/GlobalTopbar/LocaleSwitcher.tsx`)
- [x] Mount `LocaleSwitcher` in `GlobalTopbar` before the Brain icon
- [x] Set `document.documentElement.lang` to the active BCP 47 tag on mount and on every locale change
- [x] Wire `LocaleSwitcher` to `i18n.changeLanguage(tag)` on selection
  - i18next automatically writes the new locale to `localStorage` (`app_locale`) via LanguageDetector's `caches` config — no manual write needed
- [x] Add `updateUser` mutation to `src/shell/services/accounts.ts`:
  - PUTs `/users/{userZUID}` with a body of `{ prefs: JSON.stringify({ ...existingPrefs, locale }) }`
  - Must merge into existing `prefs` to avoid clobbering keys like `favorite_sites`
  - Add `"User"` to `tagTypes` in `accountsApi` and tag the existing `fetchUser` plain-Redux call's data source so both layers stay in sync
  - On mutation success, invalidate the `"User"` RTK Query tag so any RTK Query consumers re-fetch fresh user data
  - Also dispatch `FETCH_USER_SUCCESS` to update the plain Redux `user` slice directly — RTK Query invalidation alone won't update the Redux store since `fetchUser` is a legacy thunk, not an RTK Query endpoint
- [x] Call `updateUser` on every locale change (fire-and-forget, non-blocking) — this keeps the DB in sync so the correct locale is available on first login from a new device
- [x] On app boot, apply DB locale preference before first render (`src/shell/components/load-instance/index.js:43`):
  - Chain `.then()` onto the existing `fetchUser` dispatch
  - Parse `user.prefs`, extract `locale`, and compare against `localStorage.getItem("app_locale")`
  - Only call `i18n.changeLanguage(locale)` if they differ — avoids an unnecessary localStorage write and re-render
  - The `LoadingQuote` naturally gates this: it stays visible until `isAppLoaded` is true, which requires `!!user.ID` — `user.ID` is only set after `fetchUser` resolves, so the correct locale is always applied before the first paint

---

## Phase 3 — Common & Shell Namespaces

### `common`

Simple, universal words and short phrases reused across the entire app. If a string is a single generic word or short action label, it belongs here.

Examples: `Save`, `Cancel`, `Edit`, `Delete`, `Confirm`, `Close`, `Back`, `Next`, `Search`, `Loading`, `Error`, `Success`

- [ ] Identify and list all common words/phrases used across sub-apps
- [ ] Populate `public/locales/en-US/common.json`
- [ ] Add `public/locales/{locale}/common.json` for all 5 non-English locales
- [ ] Replace occurrences with `t("key")` using `useTranslation()` (defaults to `common` namespace)

### `shell`

Strings specific to the app shell — sidebar, topbar, global search, notifications, AI drawer, loading screen, and other chrome-level UI. These are not sub-app strings but are too specific to belong in `common`.

- [ ] Audit `src/shell/components/` and `src/shell/views/` for hardcoded strings
- [ ] Populate `public/locales/en-US/shell.json`
- [ ] Create `public/locales/{locale}/shell.json` for all 5 non-English locales
- [ ] Replace hardcoded strings with `t("key")` using `useTranslation("shell")`
- [ ] Run `i18next-parser` to validate no keys are missing
- [ ] Translate both `common.json` and `shell.json` into all 5 non-English locales

---

## Phase 4 — Sub-app Namespaces

Each sub-app maps to one namespace. Namespaces are lazy-loaded on first navigation to that sub-app.

| Sub-app dir      | Namespace     |
| ---------------- | ------------- |
| `home`           | `dashboard`   |
| `content-editor` | `content`     |
| `schema`         | `schema`      |
| `media`          | `media`       |
| `code-editor`    | `code`        |
| `settings`       | `settings`    |
| `seo`            | `seo`         |
| `release`        | `release`     |
| `reports`        | `reports`     |
| `leads`          | `leads`       |
| `marketplace`    | `marketplace` |
| `blocks`         | `blocks`      |
| `studio`         | `studio`      |

For each sub-app:

- [ ] `dashboard`
- [ ] `content`
- [ ] `schema`
- [ ] `media`
- [ ] `code`
- [ ] `settings`
- [ ] `seo`
- [ ] `release`
- [ ] `reports`
- [ ] `leads`
- [ ] `marketplace`
- [ ] `blocks`
- [ ] `studio`

Per-namespace checklist (repeat for each):

1. Audit sub-app source for hardcoded user-facing strings
2. Replace strings with `t("key")` using `useTranslation("namespace")`
3. Use `defaultValue` temporarily during migration so i18next-parser can auto-populate the English locale file
4. Run `i18next-parser` to generate / update `public/locales/en-US/<namespace>.json`
5. Remove `defaultValue` from `t()` calls once locale file is confirmed correct
6. Translate into all 5 non-English locales
7. Handle string interpolation (`{{variable}}`) and pluralization (`_one` / `_other` key suffixes) where needed

---

## Phase 5 — Caching & Cache Busting

- [ ] Confirm chained backend config (LocalStorage first, HTTP fallback) is working correctly — verify no redundant fetches on navigation
- [ ] Inject git hash at build time via webpack `DefinePlugin` (`__GIT_HASH__`)
- [ ] Pass `__GIT_HASH__` as `defaultVersion` in the LocalStorage backend options so deploying a new build invalidates the cache
- [ ] Verify first-load blocks render until translation data is ready (no UI flicker / raw key flash)

---

## Phase 6 — Missing Key Handling

- [ ] Configure i18next to throw / log an error in development when a translation key is missing
- [ ] Add a `missingKeyHandler` in `src/shell/i18n.ts` that throws in `NODE_ENV === "development"` and silently reports to Sentry in production (fall back to the key string so the UI never breaks)

---

## Phase 7 — Testing (Cypress)

- [ ] Verify app loads `en-US` locale when no user preference is saved
- [ ] Verify app loads user locale preference if stored in `localStorage`
- [ ] Verify switching locale via `LocaleSwitcher` updates the UI correctly
- [ ] Verify locale selection persists through page refresh
- [ ] Verify locale is preserved across sub-app navigation (confirms lazy namespace loading works)
