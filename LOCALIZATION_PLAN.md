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
- [x] Create `src/shell/i18n/index.ts` — configure i18next with:
  - ChainedBackend (LocalStorage → HTTP)
  - LanguageDetector (order: `localStorage` only — `navigator` excluded, `caches: []` so detection never auto-writes)
  - Fallback language: `en-US`
  - Default / initial namespace: `common`; also loads `shell` at init
  - `useSuspense: true`
  - `nsSeparator: "."` and `keySeparator: false` — enables `t("namespace.key")` qualified-key syntax
  - Cache busting via `defaultVersion` tied to the build's git hash (injected via webpack `DefinePlugin` as `__GIT_HASH__`)
  - LocalStorage cache TTL: `i18next-localstorage-backend` default (7 days)
  - HTTP load path: `/locales/{{lng}}/{{ns}}.json`
- [x] Import `src/shell/i18n/index.ts` in `src/shell/index.js` (app entry point) — must be imported before the React root renders
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

All components use `useTranslation()` (no namespace argument). The namespace is expressed in the key string itself. `nsSeparator: "."` and `keySeparator: false` are set in both the runtime config (`src/shell/i18n/index.ts`) and the parser config (`i18next-parser.config.js`) to support this syntax.

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
| `components/GlobalDocsMenu/config.ts` + `index.tsx`                    | 25+     | Module-level `MAIN_DOC_ITEMS` / `SUB_DOC_ITEMS` arrays + `Learn more about {{app}}` interpolation | [x]    |
| `components/AccessDenied.tsx`                                          | 5       | `{userRole?.name}` and `{appRoute}` interpolation                                                 | [x]    |
| `components/InviteMembersModal/index.tsx`                              | 8       | Already uses `useTranslation` inconsistently — needs cleanup pass                                 | [x]    |
| `components/Filters/DateFilter/DateFilter.tsx`                         | 15      | Date-formatted strings (`On ${fmt(...)}`)                                                         | [x]    |
| `components/Filters/DateRangeFilter.tsx`                               | 2       | Optional prop defaults (`headerTitle`, `inactiveButtonText`)                                      | [x]    |
| `components/global-tabs/Dropdown.tsx`                                  | 5       | `${count} Results` plural                                                                         | [x]    |
| `components/global-sidebar/.../InstanceMenu/Flyouts/InstancesList.tsx` | 6       | "No results" message with dynamic query string                                                    | [x]    |
| `components/ConfirmPublishModal.tsx`                                   | 5       | Conditional button label + count                                                                  | [x]    |
| `components/load-instance/NoInstancePermission.tsx`                    | 6       | `{user?.email}` embedded in sentence                                                              | [x]    |
| `components/NoSearchResults/index.tsx`                                 | 8       | Shared empty state with search/filter variants and reset/back/search actions                      | [x]    |

#### Tier 3 — High effort, high risk (complex interpolation, large files, critical paths)

| File                                         | Strings | Risk driver                                                                  | Status |
| -------------------------------------------- | ------- | ---------------------------------------------------------------------------- | ------ |
| `components/GlobalSearch/index.tsx`          | 10+     | 866 lines, complex conditional text, multiple UI states                      | [x]    |
| `components/GlobalSearch/AdvancedSearch.tsx` | 10+     | 634 lines, dynamic date range labels in filter chips                         | [x]    |
| `components/Comment/CommentItem.tsx`         | 6       | HTML injection with regex URL replacement inside strings                     | [x]    |
| `components/withAi/AIGenerator.tsx`          | 15+     | 890 lines, conditional headings, tone options with descriptions              | [x]    |
| `views/Shell/AIDrawer.tsx`                   | 10+     | 780 lines — some "strings" are AI prompt templates; decide what to translate | [x]    |
| `views/SearchPage/`                          | 20+     | Full-page global search results, filters, sort labels, and result chips      | [x]    |

#### Missed in follow-up shell audit

These are still Phase 3 `shell` namespace work. They were missed by the initial
shell audit because some are fallback/error/auth surfaces, partial leftovers in
otherwise-localized components, or legacy shell-level components.

| File                                                     | Strings | Notes                                                                                          | Status |
| -------------------------------------------------------- | ------- | ---------------------------------------------------------------------------------------------- | ------ |
| `components/AppError/AppError.tsx`                       | 4       | Shell-level error fallback: image alt, heading, body, reload action                            | [x]    |
| `components/global-notifications/GlobalNotifications.js` | 4       | Topbar notification drawer chrome; notification message bodies remain data-driven              | [x]    |
| `components/InviteMembersModal/ConfirmationDialog.tsx`   | 7       | Invite confirmation headings, list helper text, success status, and repeat-invite action       | [x]    |
| `components/NoPermission.tsx`                            | 2       | Default invite-permission title/body; caller-provided overrides remain caller-owned            | [x]    |
| `components/InvalidUrl.tsx`                              | 1       | Remaining hardcoded image alt in an otherwise-localized component                              | [x]    |
| `components/login/Login.js`                              | 11      | Login form and auth-code UI are shell/auth entry surfaces and should use the `shell` namespace | [x]    |
| `components/private-route/index.js` + `store/auth.js`    | 8       | Auth/session notifications shown through shell notification system; include as shell copy      | [x]    |
| `components/Comment/CommentsList.tsx`                    | 1       | Draft/new-comment timestamp label (`right now`) missed in the comment popup                    | [x]    |

---

## Phase 3.5 — Date & Time Localization

Calendar and date text come from `date-fns`, which is independent of the
i18next UI locale and must be wired up separately. This splits into two parts.

**Part A — Date-picker calendar locale (DONE).** MUI X date pickers render
their weekday/month names through `AdapterDateFns`, which defaulted to en-US
regardless of the UI language.

- [x] Add a centralized resolver `src/shell/i18n/dates.ts` — `getDateFnsLocale(tag)`
      maps each supported locale to its date-fns locale, falling back to `en-US`
      for any unmapped tag (degrades to English dates, never crashes).
- [x] Export `SUPPORTED_LOCALES` / `SupportedLocale` from `src/shell/i18n/index.ts`
      (single source of truth) and type the map as `Record<SupportedLocale, Locale>`,
      so adding a supported locale without a date-fns entry is a `tsc` error
      (verified — no silent drift).
- [x] Pass `adapterLocale={getDateFnsLocale(i18n.language)}` to all 5
      `LocalizationProvider`s: `Filters/DateFilter/DateFilterModal`,
      `Filters/DateFilter/DateRangeFilterModal`, `Filters/DateRangeFilter`,
      `FieldTypeDate`, and `apps/media/.../DateFilterModal`.

**Part B — Standalone `format()` / `formatDistanceToNow()` display strings (DONE).**
Date strings built with `date-fns` `format()` / `formatDistanceToNow()` _outside_
the pickers still render in en-US (e.g. comment timestamps, date-filter chip
labels). ~119 date-fns call sites exist and must be split by purpose:

- [x] Identify ~43 **machine** formats (`"yyyy-MM-dd"`, etc. → URL params,
      API bodies, IndexedDB keys) that must stay locale-independent —
      localizing them silently breaks search params / storage.
- [x] Identify and convert ~43 **display** formats (`"MMM d, yyyy"`, etc.) +
      16 `formatDistanceToNow` calls to pass the current date-fns locale via
      shared helpers.
- [x] Add a shared `formatLocalized(date, fmt)` helper that reads `i18n.language`
      from the i18n singleton (so non-component utils work too).
- [x] Add `formatDistanceToNowLocalized(date, options)` for relative display
      timestamps.
- [x] Audit each call site (display vs. machine) and convert only the display ones.
- [x] Localize `utility/formatDate.ts` literal display labels (`Today`,
      `Yesterday`, `Invalid Date`) through `common` keys; callers now use
      date-based helpers instead of inspecting English display output.
- [x] Keep machine formats such as `yyyy-MM-dd`, `yyyy-MM-dd HH:mm:ss`,
      analytics/API payload dates, URL params, CSV filename date ranges, and
      storage/search keys locale-independent.
- [x] Keep search/filter helper text that is not rendered UI, such as
      `RelationalFieldBase/FieldSelectorDialog/keywordSearchFilter.ts`,
      locale-independent so keyword matching remains stable against stored data.
- [ ] Follow-up: `FieldTypeDateTime` time-only `h:mm a` display is coupled to
      English-only parsing and static time options. Localizing only the
      formatter would make localized AM/PM strings fail the existing parser, so
      it needs a localized parsing/options pass.

Surfaced during Part A (untranslated **UI copy**, not date formatting): the `Filters/DateRangeFilter` prop defaults (`"Select a date range..."`, `"Date range"`) have been folded into the shell cleanup pass. The media `DateFilterModal` `{type}` title still belongs to the `media` namespace (Phase 4).

---

## Phase 4 — Sub-app Namespaces

Each sub-app maps to one namespace. Namespaces are lazy-loaded on first navigation to that sub-app.

| Sub-app dir      | Namespace        |
| ---------------- | ---------------- |
| `home`           | `dashboard`      |
| `content-editor` | `content`        |
| `schema`         | `schema`         |
| `media`          | `media`          |
| `code-editor`    | `code`           |
| `settings`       | `settings`       |
| `seo`            | `seo`            |
| `release`        | `release`        |
| `reports`        | `reports`        |
| `leads`          | `leads`          |
| `marketplace`    | `marketplace`    |
| `blocks`         | `blocks`         |
| `studio`         | `studio`         |
| `active-preview` | `active-preview` |

For each sub-app:

- [x] `dashboard` — `home` sub-app. Established the lazy-load pattern: `HomeApp`
      wraps a local `<Suspense>` and the inner component calls
      `useTranslation("dashboard")` to trigger the namespace load + suspend the
      sub-app subtree only (not the whole shell). `en-US/dashboard.json`
      populated; the 5 non-English `dashboard.json` files are empty placeholders
      (translated manually). Also fixed a Phase 3 shell miss surfaced here:
      `CreateContentItemDialog` (imported by the dashboard) was only partially
      localized — its title/subtitle/label/placeholder/option/error strings are
      now `shell.*` keys. The `InviteMembersModal` `roles` array was left as-is
      (frontend mirror of backend-generated role names).
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
- [ ] `active-preview`

### Audit — complexity / risk / effort ranking

Audited the 12 remaining namespaces (`dashboard` done). Effort is a relative
T-shirt size, not an hour estimate. String counts are rough buckets.

**Namespaces are coupled — several apps reuse components from others.** A
surface-only audit misses this; the table accounts for cross-namespace imports
(verified by grepping each sub-app's imports against the other apps' dirs):

- `studio` renders **nothing of its own** — it's a route alias to
  content-editor's `StudioWrapper`. No strings live in `studio`.
- `blocks` imports content-editor's `ItemCreate`/`ItemEdit` and schema's
  `CreateModelDialogue`/`ModelList`. The block editing experience a
  user sees is mostly `content` + `schema` strings; `blocks` owns only ~30-40.
- `content-editor` pulls in `media` (asset picker), `schema` (FieldIcon,
  configs, ModelApi), `seo` (RedirectsDialogProvider), `release`, and `blocks`.
- `schema` renders content-editor's `Editor`/`Field` components and `reports`'
  ActivityLog components.
- `code-editor`, `settings`, `reports` import schema's `NoResults`; `settings`
  imports `media`.

Each shared component is translated **once in its home namespace** and reused —
no double work, but it means **sequence matters** (do dependencies first).

| #   | Namespace        | Strings  | Complexity | Risk     | Effort | Existing i18n               | Notes                                                                                                                                                                   |
| --- | ---------------- | -------- | ---------- | -------- | ------ | --------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | `content`        | 100-200+ | High       | High     | XL     | ~13 files (analytics/dates) | Primary editing surface. Pluralization, date labels, interpolation, validation + publish critical paths, huge files. Dependency for blocks, studio, schema.             |
| 2   | `schema`         | 100-200  | High       | Med-High | L-XL   | ~17-20 files, shallow       | Two massive config maps — `configs.ts` (841L) + `StarterBlocks/configs.ts` (920L) of field-type metadata. Vowel-grammar interpolation. Dependency for blocks, content.  |
| 3   | `settings`       | 100-200  | Med-High   | High     | L      | ~6 files, ~1 key            | Destructive flows (font uninstall, workflow-status deactivation) → high QA bar. Module-level color/role maps.                                                           |
| 4   | `seo`            | 100-150  | Med        | Med-High | M      | 3 files, 1 key              | ~60% in `constants.ts` (TOOL_TIPS/FORM_LABELS with rich/HTML + examples). Inline pluralization. Live-traffic 301 vs 302 semantics.                                      |
| 5   | `media`          | 50-100   | Med        | Med      | M-L    | ~15 files (modals fuller)   | Thumbnail (1.8k L) + 7 filter components un-i18n'd. Separate file-type _labels_ (translate) from extensions/filenames (skip). Dependency for content, schema, settings. |
| 6   | `code`           | 50-100   | Med        | Med      | M      | 4 files partial             | Scattered; multi-paragraph file-type help text in CreateFile. Live code editor.                                                                                         |
| 7   | `reports`        | 50-100   | Med        | Med      | M      | ~10 files, incomplete       | Heavy date formatting (mostly mitigated by `formatLocalized`). Filter-option arrays + Metrics labels still hardcoded. Reused by schema.                                 |
| 8   | `active-preview` | 30-35    | Med-Low    | Low      | S-M    | None                        | No i18n infra yet. Toolbar = manager chrome (translate); iframe = previewed site (skip). Device-template object maps need refactor.                                     |
| 9   | `release`        | 20-50    | Low-Med    | Med      | S      | 3 files, common keys        | Simple forms/buttons/instructions; little interpolation. Quick win.                                                                                                     |
| 10  | `blocks`         | 30-40\*  | Low-Med    | Low      | S      | 2 files partial             | \*Own strings small + multi-slide OnboardingDialog. Real surface = content + schema, so only fully localized once those land.                                           |
| 11  | `marketplace`    | 10-20    | Very Low   | Low      | XS     | None                        | Thin wrapper — empty state + CTA redirecting to external (already-localized) marketplace.                                                                               |
| 12  | `leads`          | <20      | Very Low   | Low      | XS     | None                        | Table headers + filter labels. Greenfield but trivial.                                                                                                                  |
| 13  | `studio`         | 0        | —          | —        | None   | —                           | Route alias → content-editor's `StudioWrapper`. Nothing to translate here.                                                                                              |

Recurring risk across `content`/`schema`/`media`: distinguishing UI copy from
DB-sourced data (model/field labels, file names, field-type identifiers like
`one_to_one`) — those must be **skipped**, same call as the dashboard's role
names (see `feedback_localization_backend_mirror_strings`).

### Recommended sequence (dependency-aware)

Effort order alone backfires — finishing `blocks` before `content`/`schema`
leaves most of what a block user sees in English. Do leaf dependencies first:

1. **`media`** — leaf dependency feeding content/schema/settings; medium effort. Unblocks others.
2. **`content` + `schema`** — the coupled core. Biggest effort, but everything visual flows through them (blocks and studio come almost for free after).
3. **`seo`, `reports`** — medium; partially reused by content/schema.
4. **`settings`, `code`** — standalone, medium; settings needs careful QA on destructive copy.
5. **`release`, `active-preview`, `blocks` (own strings), `leads`, `marketplace`** — small finishers.
6. **`studio`** — verify-only; no work.

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

## Phase 5 — Third-party Component Localization

Several third-party packages render their **own** user-facing chrome (toolbar
tooltips, menus, dialogs, "No options" text, pagination labels, picker action
buttons) that i18next/`t()` does not touch. Each package localizes differently.

> **Execution order — interleave with Phase 4, don't fully sequence.** Phase 4
> and Phase 5 are technically independent, but the recommended order is
> **infra-first, bulk-second**, not "finish one then the other":
>
> 1. **Do Phase 5 step 1 _now_, before the Phase 4 bulk** — the reactive
>    `LocalizedThemeProvider` + MUI core locale + grid/picker `localeText` as
>    theme `defaultProps`. It's low-effort, one-time, and it's _infrastructure_:
>    it auto-localizes every Autocomplete/grid/picker across all sub-apps at
>    once, so locale-switch QA during Phase 4 reflects the real end state.
> 2. **Then resume the Phase 4 bulk** in dependency order (`media` →
>    `content`+`schema` → …).
> 3. **The rest of Phase 5 belongs _inside_ Phase 4**: TinyMCE and ProseMirror
>    live in content-editor, so localize them as part of the `content`
>    namespace rather than as a separate pass.
> 4. **Upstream to `@zesty-io/material`** once the MUI bundles stop changing —
>    batch as one additive release.
>
> **Avoid** finishing 100% of Phase 4 before the Phase 5 theme infra — you'd
> verify every sub-app with English grid/picker chrome and have to re-verify
> once it flips. Equally, don't try to finish _all_ of Phase 5 up front —
> TinyMCE is high-effort and is most efficient done alongside `content`.

**The core distinction: do the translations ship in the package?**

| Package                                       | Where / chrome                                                                                                                                       | Strings ship in package?                                                                                       | What we do                                                                                                                                                            | Effort            |
| --------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------- |
| **MUI core** (`@mui/material`)                | `Autocomplete` (No options/Loading…, 31 files), `TablePagination`, `Dialog` close aria (89 files), `Alert`, `Breadcrumbs`, `Pagination`, `SpeedDial` | ✅ **All 6 incl. Hindi** (`@mui/material/locale`)                                                              | Select the locale bundle; make the theme reactive (below). `t()` the few manual overrides                                                                             | Low               |
| **MUI X Data Grid**                           | Grid chrome (column menu, footer, no-rows)                                                                                                           | ⚠️ es/zh/ru/nl only — **Hindi missing**                                                                        | Resolver + hand-written hi-IN **already exist**; propagate to remaining grids                                                                                         | Med (propagation) |
| **MUI X Date Pickers**                        | `localeText`: OK/Cancel/Clear/Today, toolbar, clock/field aria (separate from date-fns calendar adapter, already wired)                              | ⚠️ es/zh/ru/nl only — **Hindi missing**                                                                        | New resolver + **hand-write hi-IN bundle**; pass `localeText` per `LocalizationProvider`                                                                              | Med               |
| **ProseMirror** (`@aeaton/react-prosemirror`) | `FieldTypeEditor` markdown/article_writer toolbar tooltips + link/embed modals                                                                       | ❌ No locale system — strings live in **our own** menu files                                                   | `t()` the in-repo `react-prosemirror-menu/*` + modal labels; add keys to all locales                                                                                  | Low-Med           |
| **TinyMCE 6**                                 | `FieldTypeTinyMCE` (primary wysiwyg surface): toolbar tooltips, format dropdown, link/media/table/find-replace dialogs, wordcount                    | ⚠️ Supported via `language` opt but **not bundled in npm**; **no Hindi exists at all**                         | Self-host lang packs (`/vendors/tinymce/langs/`), map from `i18n.language`, **hand-author `hi.js`**, `t()` the 2 custom media-button tooltips + custom-plugin strings | High              |
| **Monaco**                                    | Code app editor: context menu, command palette, find/replace widget                                                                                  | ⚠️ NLS exist for the **AMD** build only; app uses the **ESM** build (no runtime locale). No Dutch/Hindi anyway | **Leave English** (developer-facing tool; degrade gracefully like an unmapped grid tag)                                                                               | Very High → skip  |
| **CodeMirror 5**                              | HTML source view of `FieldTypeEditor`                                                                                                                | n/a — **no chrome**; no search/dialog addons are loaded                                                        | **No action**                                                                                                                                                         | None              |

**No work needed (headless / dead):** `chart.js` (+datalabels/adapter),
`notistack`, `react-dropzone`, `react-window` & other virtualization,
`csv-parse`, `json-to-csv-export`, `showdown`, `clipboard` — all visible text
is ours and is covered by the namespace audits. `flatpickr`/`react-flatpickr`
is **dead code** (only its CSS is bundled; zero JS mounts) — candidate for
removal. `react-number-format` only affects thousands/decimal separators on
**content-data field values** (not UI chrome) — defer as a separate product
decision, not part of this effort.

**Recurring gap — Hindi.** Almost nothing ships a Hindi bundle (MUI _core_ is
the exception). Wherever we localize a third-party component we hand-author the
hi-IN bundle, following the pattern set by `src/shell/i18n/datagrid-locales/hi-IN.ts`.

### Ownership — MUI-chrome locale lives in `@zesty-io/material`

`@zesty-io/material` is the **central MUI wrapper used across multiple Zesty
apps**, so the MUI _component-chrome_ locale belongs there, not in manager-ui.
Split by concern:

- **In `@zesty-io/material` (upstream):** the `@mui/material/locale` selection,
  the MUI X Data Grid + Date Picker `localeText` resolvers, and the
  hand-authored **hi-IN** bundles. Rationale: these are pure MUI artifacts,
  version-locked to the MUI/MUI X the wrapper pins (co-locating keeps the Hindi
  bundles from drifting when MUI bumps), and reusable by every consumer —
  author Hindi once. The package stays i18next-free: it exposes **resolvers
  that take a language tag as input**; it never reads the active language.
  - Recommended package API: `getMuiCoreLocale(tag)`, `getDataGridLocaleText(tag)`,
    `getDatePickersLocaleText(tag)` (+ internal hi-IN bundles), and ideally a
    `localizeTheme(theme, tag)` helper that returns a theme with the core locale
    merged **and** grid/picker `localeText` set as `defaultProps`.
  - Setting grid/picker `localeText` as theme `defaultProps` means **every grid
    and picker inherits localization automatically** — this dissolves the
    "only 1 of ~25 grids wired" propagation problem (no per-instance prop), for
    manager-ui and every other consumer.
- **Stays in manager-ui (app):** the i18next instance, `public/locales/*`, all
  `t()` namespace work, the **reactive `LocalizedThemeProvider` trigger** (it
  depends on `useTranslation()`/i18next — the design system must not), and
  **app-specific third-party strings** (TinyMCE packs + custom buttons,
  ProseMirror menu labels). Language _selection_ stays in the app; language
  _data_ moves to the package.
- **Migration — only the MUI half moves.** `src/shell/i18n/datagrid.ts` +
  `datagrid-locales/hi-IN.ts` are mostly pure MUI artifacts, but `datagrid.ts`
  also has an i18next foot that must stay behind:
  - **Upstream to `@zesty-io/material`:** the locale-bundle map (`esES/zhCN/ruRU/nlNL`
    from `@mui/x-data-grid-pro/locales` + the `hiIN` bundle) and the
    tag-in/locale-out `getDataGridLocaleText(tag)`. `datagrid-locales/hi-IN.ts`
    moves wholesale.
  - **Stays in manager-ui:** anything that reads `i18n.language` — i.e. the
    `import i18n from "./index"` and the `dataGridLocaleText()` convenience
    reader. Under `localizeTheme` this reader is no longer needed at all
    (`LocalizedThemeProvider` passes the tag in), so it's deleted rather than
    relocated. The package must stay i18next-free.
  - manager-ui then imports `getDataGridLocaleText` from `@zesty-io/material`
    instead of `./i18n/datagrid`; the call site is otherwise unchanged.
- **Cross-repo / cadence:** the package is a separate repo with a publish + dep-
  bump cycle. Practical path: **build & prove each piece in manager-ui first,
  then upstream the stable MUI-locale bundles** once the keys settle, rather
  than iterating across two repos from the start.
- **Backward compatibility (other consumers) — hard constraint.**
  `@zesty-io/material` is consumed by other Zesty apps we don't control here,
  so the upstream change **must be additive and non-breaking**:
  - **New exports only.** Add `getMuiCoreLocale`/`getDataGridLocaleText`/`getDatePickersLocaleText`/`localizeTheme` + internal hi-IN bundles. **Do not change or remove** the existing `theme` export or any component export's props/behavior — that's the only surface other apps touch.
  - **Keep localization opt-in.** Do **not** bake locale `defaultProps` into the default `theme` export; localization activates only when a consumer calls `localizeTheme(theme, tag)`. Apps that don't call it render exactly as today (English MUI chrome). New exports nobody imports have no runtime effect.
  - **No new peer dependency.** The locale subpaths (`@mui/material/locale`, `@mui/x-data-grid-pro/locales`, `@mui/x-date-pickers-pro/locales`) come from MUI packages the wrapper already depends on — nothing new for consumers to install.
  - **Preserve tree-shaking.** Ship ESM with `sideEffects: false` so consumers that never import `localizeTheme` shake the locale bundles out of their runtime bundle (install footprint grows slightly regardless).
  - **Release as a minor semver bump.** Additive features, no breaking changes; other apps are unaffected until they bump the dep and deliberately adopt `localizeTheme`.
  - **Smoke-test the packaged build** against manager-ui via `npm link @zesty-io/material` before cutting the release (the call site is import-line-identical to the local build, so no rework).
- **MUI X version bumps — maintenance guardrail (hand-authored hi-IN only).**
  The hi-IN Data Grid + Date Picker bundles are **shape-locked** to the
  `@mui/x-data-grid-pro` / `@mui/x-date-pickers-pro` versions. **Do not bump
  those MUI X versions without re-checking the Hindi bundles.** Why it's
  sneaky: `Partial<GridLocaleText>`/`Partial<PickersLocaleText>` typing means
  `tsc` catches a **removed/renamed** key (stale property → type error) but a
  **newly added** key compiles clean and silently renders **English**. A
  careless bump introduces an invisible Hindi regression no type check catches.
  - **Enforce with a coverage test in `@zesty-io/material`** (where the bundles
    and the MUI X dep live together): assert each hand-authored hi-IN bundle's
    keys cover the **full** default `GridLocaleText` / `PickersLocaleText` key
    set, failing on any gap. A MUI X bump that adds keys then **breaks CI**
    until the Hindi is filled in — forcing the version bump and the translation
    update to travel together. (es/zh/ru/nl need no such check — MUI ships and
    maintains those.)

### Tasks

- [ ] **MUI-chrome resolvers → `@zesty-io/material`** — add `getMuiCoreLocale(tag)` (maps our 6 tags to `@mui/material/locale`, default `enUS`), `getDataGridLocaleText(tag)`, `getDatePickersLocaleText(tag)`, and the hand-authored **hi-IN** bundles for grid + pickers (MUI ships neither). Migrate the existing `src/shell/i18n/datagrid.ts` + `datagrid-locales/hi-IN.ts` upstream. Ideally export a `localizeTheme(theme, tag)` helper that merges the core locale and sets grid/picker `localeText` as `defaultProps`. Package stays i18next-free (tag in, locale out).
- [ ] **Reactive theme → manager-ui** — the theme is currently built once at boot (`src/shell/index.js`), so it isn't reactive to `LocaleSwitcher` changes. Wrap it in a `LocalizedThemeProvider` that calls `useTranslation()` and `useMemo`s `localizeTheme(appTheme, i18n.language)` keyed on `i18n.language`. `useTranslation` re-renders on i18next's `languageChanged` event → theme rebuilds → MUI core, **and every grid/picker** (via `defaultProps`), re-render localized. Hoist the existing overrides object to a module constant first.
  - This makes grid/picker localization **automatic for all instances** — it dissolves the "only 1 of ~25 `DataGridPro` grids wired" problem (`apps/home/app/components/ResourceTable.tsx` is the only one currently passing `localeText`). Remove that now-redundant explicit prop once the theme default is in place.
- [ ] **MUI manual overrides → `t()`** — a few spots bypass the theme default and must be `t()`'d to be reactive: `noOptionsText`/`loadingText` in `seo/.../CreateRedirects/SearchField.tsx` and `shell/.../GlobalSearch/AdvancedSearch.tsx`; and the hardcoded literals in `FieldTypeDate` (`"Clear"`, `"Stored as"`, `placeholder="Mon DD YYYY"`) that are separate from MUI's picker `localeText`.
- [ ] **ProseMirror** — `t()` the English `title:`/`label:` literals in `src/shell/components/FieldTypeEditor/Editors/react-prosemirror-menu/{menu.js,inline-menu.js}` and the `LinkModal`/`EmbedModal` components; add keys to all 6 locales. No external packs needed.
- [ ] **TinyMCE** — self-host language packs under `/vendors/tinymce/langs/` (matching the existing `skin_url`/`icon_url` self-hosting), add `language`/`language_url` to the `init` block in `src/shell/components/FieldTypeTinyMCE/index.tsx` derived from `i18n.language` via a tag map (`es-ES`→`es`, `zh-CN`→`zh_CN`, `ru-RU`→`ru`, `nl-NL`→`nl`; en-US→default). **Hand-author `langs/hi.js`** (`tinymce.addI18n("hi", {...})`). `t()` the 2 custom media-button tooltips and any custom-plugin strings.
- [ ] **Monaco** — no action; leave English (ESM build can't switch locale at runtime; Dutch/Hindi unshipped). Document the decision.
- [ ] **CodeMirror** — no action (no chrome-bearing addons loaded). Revisit only if a search addon is added.
- [ ] _(optional cleanup)_ remove the unused `flatpickr`/`react-flatpickr` deps (CSS-only, no JS mounts).

### Recommended sequence

Ordered low-risk-first. Build & prove each MUI piece in manager-ui, then
upstream the stable bundles to `@zesty-io/material` (avoids two-repo iteration):

1. **MUI core + reactive theme** — lowest effort (Hindi ships for core), one-time wiring; the reactive `LocalizedThemeProvider` is the foundation everything else rides on. Prove `localizeTheme(theme, tag)` here.
2. **MUI X Data Grid** — resolver + hi-IN already exist in manager-ui; fold into `localizeTheme` as `defaultProps` so all grids localize automatically, then remove the one explicit prop. Finishes started work.
3. **MUI X Date Pickers** — add resolver + hand-write hi-IN; same `defaultProps` path as the grid.
4. **Upstream to `@zesty-io/material`** — once the core/grid/picker resolvers + hi-IN bundles + `localizeTheme` are stable, move them into the package and import from there; other apps then inherit MUI localization for free.
5. **ProseMirror** — purely in-repo `t()` (stays in manager-ui); no external dependency, predictable.
6. **TinyMCE** — highest effort (self-host packs + author Hindi + custom buttons), stays in manager-ui; the primary content surface, so high value but save for when the pattern is proven on the smaller ones.
7. **Monaco / CodeMirror** — decision/no-op; document and close out.

---

## Phase 6 — Caching & Cache Busting

- [ ] Confirm chained backend config (LocalStorage first, HTTP fallback) is working correctly — verify no redundant fetches on navigation
- [x] Inject git hash at build time via webpack `DefinePlugin` (`__GIT_HASH__`)
- [x] Pass `__GIT_HASH__` as `defaultVersion` in the LocalStorage backend options so deploying a new build invalidates the cache
- [x] Verify first-load blocks render until translation data is ready (no UI flicker / raw key flash)

---

## Phase 7 — Missing Key Handling

Goal: **full translation coverage** — every key must exist in every locale, never silently papered over by the en-US fallback.

- [x] Disable the en-US `fallbackLng` in dev (`development`/`local`) so a key missing from the **active** locale (e.g. `es-ES`) resolves to nothing and trips the handler. With the fallback on, a key present in en-US but missing elsewhere would render the English value and the gap would go undetected. Stage/production keep `fallbackLng: "en-US"` so real users never see a raw key.
- [x] Pin an explicit initial `lng` in dev (`devInitialLng` = stored `app_locale`, else `en-US`). With the fallback off, i18next has nothing to fall back to when the language detector comes up empty (e.g. cleared localStorage) and would init with an **undefined** language → crash on the first lookup (`getResource(undefined, …)`). Pinning the language — which mirrors what the localStorage detector would have resolved — avoids that. Stage/production leave `lng` undefined (detector + fallback handle it).
- [x] Add a `missingKeyHandler` in `src/shell/i18n/index.ts` (gated on `__CONFIG__.ENV`, matching Sentry's own init gate). Behavior:
  - Requires `saveMissing: true`; providing the handler short-circuits the default backend save (no network POST for missing keys). `saveMissingTo: "current"` so reports name the locale actually being viewed.
  - Skips keys whose namespace bundle hasn't loaded yet (`hasResourceBundle` guard, plus a falsy-`lng` guard) — lazy sub-app namespaces load on first navigation, and a still-in-flight load is a timing artifact, not a missing key. An empty placeholder file counts as loaded (keyless), so an untranslated namespace still throws for every key.
  - **Dev (development/local): throw.** A missing key crashes the app (caught by the root `Sentry.ErrorBoundary` / webpack dev overlay) with the exact key and `public/locales/<lng>/<ns>.json` path — impossible to miss, no need to scan the console. An incomplete locale is meant to be unusable in dev until every key is filled in. The dev path never dedupes, so the error boundary keeps surfacing it on every render until fixed. (Escape hatch from a crash-looping incomplete locale: clear localStorage or reset `app_locale` to `en-US`.)
  - **Stage/production:** `Sentry.captureMessage` once per key (deduped, `warning` level) with `{ key, namespace, languages, fallbackValue }` context; i18next still falls back to en-US so the UI never breaks for users.

---

## Phase 8 — Testing (Cypress)

- [ ] Verify app loads `en-US` locale when no user preference is saved
- [ ] Verify app loads user locale preference if stored in `localStorage`
- [ ] Verify switching locale via `LocaleSwitcher` updates the UI correctly
- [ ] Verify locale selection persists through page refresh
- [ ] Verify locale is preserved across sub-app navigation (confirms lazy namespace loading works)
