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
  - LanguageDetector (order: `localStorage` only — `navigator` excluded, `caches: []` so detection never auto-writes)
  - Fallback language: `en-US`
  - Default / initial namespace: `common`; also loads `shell` at init
  - `useSuspense: true`
  - `nsSeparator: "."` and `keySeparator: false` — enables `t("namespace.key")` qualified-key syntax
  - Cache busting via `defaultVersion` tied to the build's git hash (injected via webpack `DefinePlugin` as `__GIT_HASH__`)
  - LocalStorage cache TTL: `i18next-localstorage-backend` default (7 days)
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

### Key naming convention

**Always qualify keys with their namespace prefix** — `t("common.save")`, `t("shell.expandSidebar")`, `t("content.publishItem")`. Never use bare `t("save")` even when the default namespace would resolve it. This makes the source namespace unambiguous at a glance.

All components use `useTranslation()` (no namespace argument). The namespace is expressed in the key string itself. `nsSeparator: "."` and `keySeparator: false` are set in both the runtime config (`src/shell/i18n.ts`) and the parser config (`i18next-parser.config.js`) to support this syntax.

### `common`

Simple, universal words and short phrases reused across the entire app. If a string is a single generic word or short action label, it belongs here.

Examples: `Save`, `Cancel`, `Edit`, `Delete`, `Confirm`, `Close`, `Back`, `Next`, `Search`, `Loading`, `Error`, `Success`

**Cross-namespace rule:** If the same word or phrase ends up in two or more namespace files (e.g. both `shell.json` and `content.json` define `"comment": "Comment"`), that is a signal it belongs in `common` instead. Consolidate it there and update all call sites to `t("common.key")`.

- [x] Identify and list all common words/phrases used across sub-apps
- [x] Populate `public/locales/en-US/common.json`
- [x] Add `public/locales/{locale}/common.json` for all 5 non-English locales (translations added)
- [x] Replace occurrences with `t("common.key")` using `useTranslation()` (no namespace arg — namespace is in the key)
- [x] Remove temporary `defaultValue` props from all `t()` calls

### `shell`

Strings specific to the app shell — sidebar, topbar, global search, notifications, AI drawer, loading screen, and other chrome-level UI. These are not sub-app strings but are too specific to belong in `common`.

- [x] Audit `src/shell/components/` and `src/shell/views/` for hardcoded strings — including **functions that return strings** (helpers, getters, conditional label functions), **module-level object maps/arrays** whose string values are rendered as UI copy (`t()` can't be called at module level — move the lookup inside the component), and **strings passed as props** (translate at the call site, not inside the receiving component). Skip strings that originate from the database.
- [x] Create `public/locales/{locale}/shell.json` for all 6 locales (empty placeholders)
- [x] Populate `public/locales/en-US/shell.json`
- [x] Replace hardcoded strings with `t("shell.key")` / `t("common.key")` using `useTranslation()` (no namespace arg)
- [ ] Run `i18next-parser` to validate no keys are missing
- [ ] Translate `shell.json` into all 5 non-English locales

#### Tier 1 — Low effort, low risk (static strings, small components)

| File                                                          | Strings | Status |
| ------------------------------------------------------------- | ------- | ------ |
| `components/ResizeableContainer.tsx`                          | 2       | [x]    |
| `components/InvalidUrl.tsx`                                   | 4       | [x]    |
| `components/Filters/UserFilter.tsx`                           | 3       | [x]    |
| `components/global-tabs/GlobalDirtyCodeModal.tsx`             | 2       | [x]    |
| `components/Comment/ConfirmDeleteModal.tsx`                   | 3       | [x]    |
| `components/global-sidebar/.../InstanceMenu/DropdownMenu.tsx` | 12      | [x]    |
| `components/Comment/index.tsx`                                | 2       | [x]    |
| `components/Favicon/index.tsx`                                | 1       | [x]    |
| `components/GlobalDomainsMenu/index.tsx`                      | 5       | [x]    |

#### Tier 1 (additions) — missed in initial audit

| File                                          | Strings | Notes                                                                                                                             | Status |
| --------------------------------------------- | ------- | --------------------------------------------------------------------------------------------------------------------------------- | ------ |
| `components/GlobalAccountMenu/config.ts`      | 7       | Module-level `MENU_ITEMS` array — move `text` lookup inside component                                                             | [x]    |
| `components/global-sidebar/GlobalSidebar.tsx` | 1       | `title="View source code commit"` tooltip on a `<Link>`                                                                           | [x]    |
| `components/global-menu/index.tsx`            | 14      | Replaced slug-to-name conversion with `productLabels` map using `t()`; tooltip uses `navAppTooltip` with `{{name}}` interpolation | [x]    |

#### Tier 2 — Medium effort, medium risk (some dynamic interpolation)

| File                                                                   | Strings | Risk driver                                                                                       | Status |
| ---------------------------------------------------------------------- | ------- | ------------------------------------------------------------------------------------------------- | ------ |
| `components/GlobalDocsMenu/config.ts` + `index.tsx`                    | 25+     | Module-level `MAIN_DOC_ITEMS` / `SUB_DOC_ITEMS` arrays + `Learn more about {{app}}` interpolation | [ ]    |
| `components/AccessDenied.tsx`                                          | 5       | `{userRole?.name}` and `{appRoute}` interpolation                                                 | [ ]    |
| `components/InviteMembersModal/index.tsx`                              | 8       | Already uses `useTranslation` inconsistently — needs cleanup pass                                 | [ ]    |
| `components/Filters/DateFilter/DateFilter.tsx`                         | 15      | Date-formatted strings (`On ${fmt(...)}`)                                                         | [ ]    |
| `components/global-tabs/Dropdown.tsx`                                  | 5       | `${count} Results` plural                                                                         | [ ]    |
| `components/global-sidebar/.../InstanceMenu/Flyouts/InstancesList.tsx` | 6       | "No results" message with dynamic query string                                                    | [ ]    |
| `components/ConfirmPublishModal.tsx`                                   | 5       | Conditional button label + count                                                                  | [ ]    |
| `components/load-instance/NoInstancePermission.tsx`                    | 6       | `{user?.email}` embedded in sentence                                                              | [ ]    |

#### Tier 3 — High effort, high risk (complex interpolation, large files, critical paths)

| File                                         | Strings | Risk driver                                                                  | Status |
| -------------------------------------------- | ------- | ---------------------------------------------------------------------------- | ------ |
| `components/GlobalSearch/index.tsx`          | 10+     | 866 lines, complex conditional text, multiple UI states                      | [ ]    |
| `components/GlobalSearch/AdvancedSearch.tsx` | 10+     | 634 lines, dynamic date range labels in filter chips                         | [ ]    |
| `components/Comment/CommentItem.tsx`         | 6       | HTML injection with regex URL replacement inside strings                     | [ ]    |
| `components/withAi/AIGenerator.tsx`          | 15+     | 890 lines, conditional headings, tone options with descriptions              | [ ]    |
| `views/Shell/AIDrawer.tsx`                   | 10+     | 780 lines — some "strings" are AI prompt templates; decide what to translate | [ ]    |

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
   - Check JSX text nodes and string props (`label`, `placeholder`, `title`, `aria-label`, etc.)
   - **Also check functions that return strings** — helpers like `getLabel()`, `getPrimaryButtonText()`, `getErrorMessage()`, `renderTitle()` and similar are a common source of untranslated strings. Translate these the same way. Skip strings that come from the database (API responses, user-entered content, model labels, field names) — those are data, not UI copy.
   - **Also check module-level object maps and arrays** — constants like `const CHIP_TITLE = { live: "Prod", dev: "Stage" }` defined outside a component are unreachable by `t()`. Move the lookup inside the component (ternary or function that receives `t`) and delete the constant. Verify the constant isn't imported/used elsewhere before removing it.
   - **Also check strings passed as props** — if a hardcoded string is passed as a prop (e.g. `<Dialog title="Delete Item" />`), it must be translated at the call site, not inside the receiving component. The component receiving the prop is not responsible for translation — the parent passing it is.
2. Replace strings with `t("namespace.key", { defaultValue: "..." })` using `useTranslation()` (no namespace arg — namespace is always in the key)
3. Run `i18next-parser` to generate / update `public/locales/en-US/<namespace>.json`
4. Remove `defaultValue` from `t()` calls once locale file is confirmed correct
5. Translate into all 5 non-English locales
6. Handle string interpolation (`{{variable}}`) and pluralization (`_one` / `_other` key suffixes) where needed

---

## Phase 5 — Caching & Cache Busting

- [ ] Confirm chained backend config (LocalStorage first, HTTP fallback) is working correctly — verify no redundant fetches on navigation
- [x] Inject git hash at build time via webpack `DefinePlugin` (`__GIT_HASH__`)
- [x] Pass `__GIT_HASH__` as `defaultVersion` in the LocalStorage backend options so deploying a new build invalidates the cache
- [x] Verify first-load blocks render until translation data is ready (no UI flicker / raw key flash)

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
