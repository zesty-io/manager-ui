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
  - Environment-specific backend:
    - `stage`/`production`: ChainedBackend (LocalStorage → HTTP)
    - `development`/`local`: HttpBackend only, so locale JSON edits show after
      refresh without manually clearing stale `i18next_res_*` localStorage
      entries
  - LanguageDetector (order: `localStorage` only — `navigator` excluded, `caches: []` so detection never auto-writes)
  - Fallback language: `en-US`
  - Default / initial namespace: `common`; also loads `shell` at init
  - `useSuspense: true`
  - `nsSeparator: "."` and `keySeparator: false` — enables `t("namespace.key")` qualified-key syntax
  - Production-like cache busting via `defaultVersion` tied to the build's git hash (injected via webpack `DefinePlugin` as `__GIT_HASH__`)
  - Production-like LocalStorage cache TTL: `i18next-localstorage-backend` default (7 days)
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

> **Keys are flat camelCase — never dotted, never nested.** Because the config sets `nsSeparator: "."` **and** `keySeparator: false`, i18next splits a key on _every_ `.`, takes the first segment as the namespace, then rejoins the rest with `keySeparator` — which is `false`, coerced to the literal string `"false"`. So a multi-dot key like `t("media.dateFilter.today")` resolves to the lookup `dateFilterfalsetoday` → not found → the dev handler throws. Group by **camelCase prefix** instead (`dateFilterToday`, `fileModalContentTitleLabel`), exactly like the existing `navApps` / `accountLogOut` / `columnName` keys. Do **not** nest objects in the JSON.

### Pluralization — every language's full CLDR plural-form set is mandatory

Any key carrying a plural suffix (`_one`, `_other`, …) is a **plural key**. When it's used with `{ count }`, i18next selects the form by the **active language's CLDR plural categories** and fires the missing-key handler (→ **dev throw**) for _any_ category that has no key. The categories differ per language, so a plural key must define **all** of them for **each** locale:

| Locale           | CLDR plural forms required        |
| ---------------- | --------------------------------- |
| `en-US`          | `_one`, `_other`                  |
| `hi-IN`, `nl-NL` | `_one`, `_other`                  |
| `es-ES`          | `_one`, `_many`, `_other`         |
| `ru-RU`          | `_one`, `_few`, `_many`, `_other` |
| `zh-CN`          | `_other`                          |

Consequences and rules:

- **Plural keys legitimately have different key-sets per locale** (Russian has 4 forms, Chinese has 1). This is the **one exception** to "all locale files mirror the same keys" — do not enforce strict key-parity on plural bases.
- **The thrown error can name the wrong form.** When any form is missing, i18next batch-reports the whole plural family, and the dev handler throws on the first one it sees — so you may get `Missing … _one` when `_one` exists and the real gap is `_few`/`_many`. Check the whole family.
- **Single (non-suffixed) keys used with `{ count }` are fine** — e.g. `"matchesFound": "{{count}} matches found"`. With no plural variants present, i18next falls back to the base key. Only add `_one`/`_other`… when the wording actually changes by count (so the noun/verb inflects).
- **Authoritative source:** the [Unicode CLDR plural rules](https://www.unicode.org/cldr/charts/latest/supplemental/language_plural_rules.html); i18next computes the same via `Intl.PluralRules`. Get the exact suffixes for a locale with `i18n.services.pluralResolver.getSuffixes(tag)`.
- **Spanish `_many`** is for compact/large numbers and uses the same wording as `_other` for these strings — set them equal rather than leaving `_many` absent.
- A coverage test asserting every plural base has its locale's full CLDR set would catch gaps in CI (Phase 8 candidate).

### `common`

Simple, universal words and short phrases reused across the entire app. If a string is a single generic word or short action label, it belongs here.

Examples: `Save`, `Cancel`, `Edit`, `Delete`, `Confirm`, `Close`, `Back`, `Next`, `Search`, `Loading`, `Error`, `Success`

**Cross-namespace rule:** If the same word or phrase ends up in two or more namespace files (e.g. both `shell.json` and `content.json` define `"comment": "Comment"`), that is a signal it belongs in `common` instead. Consolidate it there and update all call sites to `t("common.key")`.

- [x] Identify and list all common words/phrases used across sub-apps
- [x] Populate `public/locales/en-US/common.json`
- [x] Add `public/locales/{locale}/common.json` for all 5 non-English locales (translations added)
- [x] Replace occurrences with `t("common.key")` using `useTranslation()` (no namespace arg — namespace is in the key)
- [x] Remove temporary `defaultValue` props from all `t()` calls
- [x] Cross-namespace consolidation pass (run during `media`, Phase 4): moved
      strings that duplicated existing translations across namespaces into
      `common` — date presets (`last7Days`…), date on/before/after values, sort
      A–Z/Z–A, `searchAgain`, `name`, `mediaRequests`, `media`, `code` (+ reused
      existing `today`/`yesterday`/`more`). Existing es/ru/zh/etc. values were
      carried over from `shell`/`dashboard`; 53 call sites repointed; the dupes
      removed from `shell`/`dashboard`/`media`. Left `shell.code` untouched — it
      is the 2FA verification-code label (different meaning, must not merge).

### `shell`

Strings specific to the app shell — sidebar, topbar, global search, notifications, AI drawer, loading screen, and other chrome-level UI. These are not sub-app strings but are too specific to belong in `common`.

- [x] Audit `src/shell/components/` and `src/shell/views/` for hardcoded strings — including **functions that return strings** (helpers, getters, conditional label functions), **module-level object maps/arrays** whose string values are rendered as UI copy (`t()` can't be called at module level — move the lookup inside the component), and **strings passed as props** (translate at the call site, not inside the receiving component). Skip strings that originate from the database.
- [x] Create `public/locales/{locale}/shell.json` for all 6 locales (empty placeholders)
- [x] Populate `public/locales/en-US/shell.json`
- [x] Replace hardcoded strings with `t("shell.key")` / `t("common.key")` using `useTranslation()` (no namespace arg)
- [ ] Run `i18next-parser` to validate no keys are missing (key parity verified
      manually across all 6 locales — only CLDR plural-form differences remain,
      which are correct; parser run is a CI nicety, not outstanding work)
- [x] Translate `shell.json` into all 5 non-English locales
- [x] CLDR plural-form backfill (per the Pluralization rule above): audited all
      namespaces × locales for plural keys missing required forms. Backfilled
      `shell` es-ES `_many` and ru-RU `_few`/`_many` for `tabsResults`,
      `searchPageResults`, `searchPageResultsFor`, `invitesSentPartial`,
      `invitesSentSuccess`, `unableToInviteUsers` (would have thrown in dev at
      those counts). `common`/`dashboard`/`media` were clean.

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

#### Phase 3 verification sweep (2026-06-18) — parallel re-audit of `shell`

After `FieldTypeRepeater` was found mislabeled "covered," ran a full parallel
read-only re-audit of `src/shell/components` + `src/shell/views` (6 Explore
agents) to stop trusting the checkboxes. Field-type widgets came back clean;
**~60 untranslated strings remained across 12 live shell files** that were never
in the audit tables. All backfilled to `shell` (58 new keys + reused
`common.yes`/`no`, `common.cancel`, `shell.unknownUser`); full key parity across
6 locales, `tsc` clean. Agents under-counted several files — the interpolated
subtitles, `notify()` messages, and captions below were caught by reading the
files directly, not from the agent reports.

| File                                               | Strings | Notes                                                                                                                                                                             | Status |
| -------------------------------------------------- | ------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| `components/SchedulePublish/index.tsx`             | 9       | Publish/unpublish dialog: titles, **2 interpolated subtitles** (`{{version}}/{{date}}/{{timezone}}`, `{{distance}}/{{name}}`), alerts, buttons                                    | [x]    |
| `components/Head/HeadTag/HeadTag.js`               | 16      | Tag editor: form labels, `- None -`, add/delete/save/create buttons + titles, **4 `notify()` messages**. HTML element names Script/Meta/Link kept literal (technical identifiers) | [x]    |
| `components/LegacyContentSearch/index.js`          | 13      | Release-app content search: sort/filter UI, `notify()` error, no-results (`<Trans>`), item/created/version captions; reuses `shell.unknownUser`                                   | [x]    |
| `components/Head/Head.js`                          | 4       | Create-tag button/title, two notices, empty state                                                                                                                                 | [x]    |
| `components/InAppAnnouncement/index.tsx`           | 4       | Announcement dialog action buttons (Ignore / Read / Show Video / Schedule Training)                                                                                               | [x]    |
| `components/legacy/Select/index.js`                | 3       | `withTranslation`: filter placeholder, searching, no-options (used by `FieldTypeInternalLink`). Static `defaultProps` misconfigured-text left (not rendered)                      | [x]    |
| `components/global-sidebar/.../OnboardingCall.tsx` | 3       | Avatar alt, title, schedule-call button                                                                                                                                           | [x]    |
| `components/load-instance/index.js`                | 3       | "Failed to load instance", "Go to Accounts", "Zesty Account" link title (via `i18n` singleton)                                                                                    | [x]    |
| `components/Comment/InputField.tsx`                | 1       | Add-comment network error message                                                                                                                                                 | [x]    |
| `components/GlobalSearch/utils.ts`                 | 1       | `getContentTitle` "Missing Meta Title" fallback (via `i18n` singleton)                                                                                                            | [x]    |
| `components/LoadingQuote/index.tsx`                | 1       | Logo `alt` (a11y). **Loading quotes left English by decision** — data-driven via `window.randomQuote`/localStorage; attributed quotes not translated                              | [x]    |
| `views/Shell/AIDrawer.tsx`                         | 1       | "Apply" suggestion button (the only remaining UI string; rest are AI prompt templates)                                                                                            | [x]    |

**Decisions:** `withAi` "AI" button left English (per request); `LocaleSwitcher`
language names left as-is (component slated for replacement); loading quotes not
translated. Still trust-but-verify: the machine translations (esp. Hindi, no
upstream fallback) and the `<Trans>` markup in `legacySearchNoResultsRich` want a
native/QA pass.

#### Field-type widgets — `shell` namespace backfill (surfaced during `content` pre-audit)

The field-input widgets a user types into live in `src/shell/components/FieldType*`
(not in content-editor). They're imported by `content`, `schema`, and `blocks`, so
per "translate once in home namespace" their strings are **`shell` keys**. The
initial shell audit claimed to cover `FieldTypeDate` / `FieldTypeIntegration` /
`FieldTypeRepeater`, but **`FieldTypeDate` and `FieldTypeIntegration` were only
partially done** (see notes below); the rest were missed entirely. ProseMirror
(`FieldTypeEditor`) and TinyMCE chrome are tracked under Phase 5 — this row is
for the widgets' own copy.

> **`FieldTypeDate` had leftover misses** (its initial pass only wired the
> picker calendar locale): the standalone value preview (`Stored as …`) and the
> `Clear` button were still English — backfilled via `shell.storedAs` (shared
> with `FieldTypeDateTime`, renamed from `dateTimeStored`) and a new
> `common.clear`. Its `Mon DD YYYY` placeholder stays English with the
> Phase 3.5 parsing follow-up — `parseDateInput` only accepts English month
> names, so a localized placeholder would lie about what the parser accepts.
>
> **`FieldTypeIntegration` was also only partially done** — despite the
> "covered" label it has just 6 `t()` calls across 4 files, with ~35-45 strings
> still hardcoded. Re-added as a pending row below. (Lesson: the initial audit's
> "covered" claims for pre-existing-i18n widgets were unreliable — verify, don't
> trust the label. `FieldTypeRepeater` should be re-verified too.)
>
> **`FieldTypeRepeater/*` was substantially un-localized** despite the
> "covered" label — full re-verify done across all 4 files (`index.tsx`,
> `AddRowFooter.tsx`, `RowDialog.tsx`, `SubField.tsx`). Backfilled:
>
> - `SubField.tsx`: the two sub-field placeholders (`shell.uuidAutoGeneratedPlaceholder` > [new] + reused `shell.selectPlaceholder`), the yes/no toggle fallbacks
>   (`common.yes`/`common.no`), the currency tooltip (`shell.repeaterCurrencyTooltip`,
>   `{{locale}}`), and the missing-options error (`shell.repeaterMissingOptionsRich`
>   via `<Trans>` to preserve the `<em>` around the field label).
> - `RowDialog.tsx` (had partial i18n): dialog title (`shell.repeaterEditRow`/
>   `shell.repeaterAddRowTo`), `Remove Row`, `Add another field`, and the
>   `INVALID_RANGE` validation message (`shell.repeaterValueBetween`, `{{min}}`/`{{max}}`).
> - `AddRowFooter.tsx` + `index.tsx`: wired `useTranslation()`; footer button
>   reuses `shell.repeaterAddRowTo`; grid yes/no cell value uses `common.yes`/`no`.
> - Kept as data/dev (not UI copy): the `throw new Error("Input is missing name
attribute")` dev guard, the `"USD"` currency-code default, and
>   `Intl.NumberFormat("en-US")` value formatting (deferred with the
>   `react-number-format` product decision).
> - shell values mirror content's own `uuidAutoGeneratedPlaceholder`/`selectPlaceholder`,
>   kept separate per the shell/content namespace boundary.

| File                                  | Files | Notes                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       | Status |
| ------------------------------------- | ----- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| `components/FieldTypeEditor/*`        | 42    | **Done.** The widget wrappers (`FieldTypeEditor`/`Converter`/`Basic`/`Html`/`Inline`/`Markdown`) + resize node-views carry **no** copy of their own — all translatable strings are the ProseMirror toolbar tooltips + the two modals, which overlapped the Phase 5 ProseMirror task. Did both at once (per user): 46 `editor*` keys in `shell` (all 6 locales). Threaded `t` through `menu(options)`/`inline(options)` (called with `t` from `useTranslation()` in `Basic`/`Inline`), localized the `window.prompt` strings (rows/cols/URL), and wrapped `LinkModal`/`EmbedModal` (class comps) with `withTranslation`. Kept literal: `H1`–`H6`/`HR` button glyphs, Instagram/YouTube/Twitter brand names, and the `https://`/`e.g. puXYPrrsrA` sample placeholders (data). | [x]    |
| `components/RelationalFieldBase/*`    | 16    | Relational picker dialog, search/empty states. 36 keys (35 `relational*` + generic `flagAlt`); refactored `SORT_ORDER`/exported `STATUS_FILTER`/`CHIP_CONFIG` module maps to i18n key-strings; `VersionChip` date now locale-aware; `NoSearchResults` reused (already localized)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            | [x]    |
| `components/FieldTypeIntegration/*`   | 17    | **Mislabeled "covered" — only 6 `t()` calls, ~35-45 strings remain.** `ConnectToApi` status-config map (Connecting/Successful/Failed + Stop/Next/Try Again), `API URL`/`HTTP Headers` labels; `SelectDisplayOptions` OPTIONS/OTHER OPTIONS/NOT AVAILABLE headings; `Configure/index` Reconfigure/Connect to API; `ItemSelectionDialog` Resync Values/Done/Save Changes/Filter Items; `DisplayCard` Add Heading/Subheading/Detail; `constants.ts` card-type map (titles+descriptions = copy; sample heading/subHeading values = demo data, skip)                                                                                                                                                                                                                             | [x]    |
| `components/FieldTypeTinyMCE/*`       | 4     | Manager-owned TinyMCE wrapper/plugin copy translated in `shell` (custom media buttons, slash commands, social embed dialog, image resizer dialog). Vendor TinyMCE chrome/language packs remain tracked under Phase 5.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       | [x]    |
| `components/FieldTypeBlockSelector/*` | 3     | Block picker labels/empty states                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            | [x]    |
| `components/FieldTypeCurrency/*`      | 1     | Flag-image `alt` (`currencyFlagAlt`, `{{country}}`); `0.00` placeholder + currency symbols are data                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         | [x]    |
| `components/FieldTypeDateTime/*`      | 3     | `dateTimeStored*` previews + `dateTimeInvalidTime`. Time-only `h:mm a` parsing/options still coupled w/ Phase 3.5 follow-up (separate)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | [x]    |
| `components/FieldTypeImage/*`         | 1     | Plural `imageFieldLimit`. **Class component** → wrapped with `withTranslation`. Used by `settings/Styles`, **not** the content media field (that's `FieldTypeMedia`, in content's dir → `content` namespace)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                | [x]    |
| `components/FieldTypeInternalLink/*`  | 2     | `internalLinkSearchPlaceholder` + `internalLinkNone`. Shared: content (`internal_link` field, `LinkCreate`/`LinkEdit`) + schema (`DefaultValueInput`)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       | [x]    |
| `components/FieldTypeNumber.tsx`      | 0     | No user-facing copy (icon-only stepper) — verified, nothing to translate                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    | [x]    |
| `components/FieldTypeColor/*`         | 0     | No user-facing copy (icon-only picker button) — verified                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    | [x]    |
| `components/FieldTypeSort/*`          | 0     | No user-facing copy (icon-only stepper) — verified                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | [x]    |
| `components/FieldTypeUUID/*`          | 1     | `uuidFieldReadOnly` tooltip ("This field cannot be edited")                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 | [x]    |

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
- [ ] Follow-up: `FieldTypeDate` `Mon DD YYYY` input placeholder + `parseDateInput`
      accept English month names only. Localize the placeholder and parser together
      (same coupling as `FieldTypeDateTime`) — left English for now so the hint
      matches what the parser actually accepts.

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
- [ ] `content` — content-editor's **own** dir only
      (`src/apps/content-editor/src`); field-input widgets live in
      `shell/components/FieldType*` and are tracked separately under the Phase 3
      shell backfill. Broken into 8 sub-passes (one commit/PR each; `content.json`
      grows additively). **Full breakdown + per-slice audits in the dedicated
      "`content` namespace — sub-pass breakdown" section below the sub-app list.**
- [ ] `schema`
- [x] `media` — fully localized (en-US). Followed the dashboard lazy-load
      pattern: `MediaApp` wraps a local `<Suspense>`; `MediaAppContent` calls
      `useTranslation("media")`. ~166 flat-camelCase keys in `en-US/media.json`;
      the 5 non-English files are scaffolds (blank, translated manually — es-ES
      and ru-RU partially done). Scope beyond the visible components: - **Notifications** (upload / replace / delete) live in the redux thunk
      `shell/store/media-revamp.ts`, not in components — localized via the
      i18n singleton (`i18n.t(...)`, no hook), with i18next pluralization for
      the upload-header noun (`uploadModalNounFile` / `uploadModalNounReplacedFile`). - **Active filter chips** rendered the raw stored value, not the menu's
      localized label. `DateFilter` (preset) and `FiletypeFilter` (category)
      now map the value → the same key the menu uses; specific image/video
      format chips (PNG, MP4, …) render the raw identifier (not translated).
      Removed the now-dead English `pluralize` helper.
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

### `content` namespace — sub-pass breakdown

`content` is content-editor's **own** dir only (`src/apps/content-editor/src`,
~186 files). It is split into 8 independent sub-passes so each is a reviewable
commit/PR; `content.json` grows additively, and only sub-pass 1 carries the
one-time namespace plumbing (`ContentApp` `<Suspense>` + `useTranslation("content")`

- empty placeholder files for all 6 locales). Do sub-pass 1 first — the
  Editor/Field shell is reused by `schema` and `blocks`.

**Cross-cutting rules (every sub-pass):**

- **Audit `notify(` / `dispatch(` for message strings, not just JSX.** A pre-audit
  found **56 `notify()` redux messages** scattered across views, **hooks**
  (`useStudioBridge.ts`), and the studio bridge — a render-only scan misses them
  (the same lesson as `media`'s thunk notifications). Also check string-returning
  helpers, module-level maps/arrays, and strings passed as props.
- **Field-input widgets are out of scope for `content`.** The widgets a user types
  into live in `src/shell/components/FieldType*` and belong to the **`shell`**
  namespace (shared by content/schema/blocks → translate once in their home dir).
  Tracked under the Phase 3 "Field-type widgets — shell backfill" table.
- **Namespace boundary nuance:** components that physically live in content-editor's
  dir are `content` keys **even when** schema/blocks import them. e.g. `FieldShell` /
  `FieldError` are rendered by schema/blocks too, but their files are in
  content-editor, so their strings are `content.*` (decided 2026-06-17).
- **Skip DB-sourced data** (model/field labels, field-type identifiers like
  `one_to_one`, user content) — data, not UI copy. See
  `feedback_localization_backend_mirror_strings`.
- Per-slice loop: audit → `t()` w/ `defaultValue` → grow `en-US/content.json` →
  drop `defaultValue` → translate 5 locales (flat camelCase keys; full CLDR plural
  forms per locale) → commit.

| #   | Sub-pass                               | Scope                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    | Effort | Status |
| --- | -------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------ | ------ |
| 1   | Editor + Field shell                   | `components/Editor/*`, `Editor/Field/*`, `NoFields` — field _wrapper_/validation (not the widgets) + namespace plumbing                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  | M      | [x]    |
| 2   | ItemList                               | `views/ItemList` (22 files): columns, filters, bulk actions (`UpdateListActions` notifications), empty states                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            | M-L    | [ ]    |
| 3   | ItemEdit chrome                        | `ItemEditHeader` (incl. the module-level **tab-bar label array** — Content/SEO/Redirects/Analytics/Head Tags/APIs/Publish Status/Freestyle — move lookup inside component), `Content/Actions` widgets, breadcrumbs, `LockedItem`, `PendingEditsModal`, publish/save + `notify()`                                                                                                                                                                                                                                                                                                                                         | L      | [ ]    |
| 4   | ItemEdit Meta panels (= the "SEO" tab) | `Meta/settings`, `SocialMediaPreview`, `ContentInsights`, `IncomingRedirects` — this tab is labeled "SEO" in the UI but is content-item meta, **not** the standalone `seo` app                                                                                                                                                                                                                                                                                                                                                                                                                                           | M      | [ ]    |
| 5   | Create/link/misc                       | `ItemCreate`, `LinkCreate`, `LinkEdit`, `NotFound` (+ their notifications)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               | S      | [ ]    |
| 6   | Analytics                              | `views/Analytics` (24 files); dates mostly mitigated by `formatLocalized`, mainly labels/filters                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         | M      | [ ]    |
| 7   | CSVImport + Redirects                  | `views/CSVImport` (6 files), `views/Redirects` (4 files) — **content-side redirects only**; the wrapping `RedirectsDialogProvider` is imported from the `seo` app → stays `seo` namespace                                                                                                                                                                                                                                                                                                                                                                                                                                | S      | [ ]    |
| 8   | ItemEdit secondary tabs                | `ItemHead` (Head Tags tab), `components/APIEndpoints.tsx` (APIs tab), `FreestyleWrapper` (Freestyle tab) — all `content`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 | S-M    | [ ]    |
| 9   | Media field widget                     | `components/FieldTypeMedia.tsx` (~1000 lines) — renders the `files`/`images` datatypes. Lives in content-editor's dir so it's a **`content`** key (not the shell `FieldTypeImage`, which is settings-only). Swap/Edit/More-Options tooltips, asset-picker chrome, empty states + `notify()`. **Note:** also imported by shell components (`Favicon`, `FieldTypeRepeater/SubField`) and schema (`DefaultValueInput`) — kept `content` per the file-location rule (decided 2026-06-17, chosen over `shell` to avoid a refactor); consequence: those shell surfaces must load the `content` namespace to render these keys. | M      | [ ]    |

> Sub-pass 3 (ItemEdit chrome) is the publish/save critical path → highest QA
> bar; do it after the pattern is settled on lower-risk slices.
>
> **Content-item editor tabs** (routes under `/content/:model/:item/*`, labels in
> `ItemEditHeader`): Content → 1 · SEO/Meta → 4 · Redirects → 7 · Analytics → 6 ·
> Head Tags/APIs/Freestyle → 8 · Publish Status → 3. The tab-bar labels live in 3.

#### Sub-pass 1 — Editor + Field shell (pre-audit complete, ~34 strings)

13 files; only 6 carry strings. The rest are re-exports (`Editor/index.js`,
`Editor/Field/index.ts`, `PreviewMode/index.js`), skeleton loaders
(`FieldsLoader.tsx`), the preview iframe (`PreviewMode.js` — data only), and
`ResolvedOption.tsx` (none). None are currently localized.

**Files with strings:**

| File                                               | Strings | Notes                                                                                                                                                        |
| -------------------------------------------------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `Editor/FieldError.tsx`                            | ~9      | `SEO_FIELD_LABELS` module map (6) + `getErrorMessage` returns (Required/Exceeding/Requires/block-variant) + invalid-values heading + correct-N-fields plural |
| `Editor/Field/FieldShell.tsx`                      | ~9      | `EditorTypes` module map (Markdown/WYSIWYG/Inline/HTML) + duplicate `getErrorMessage` + min/max display labels                                               |
| `Editor/Field/Field.tsx`                           | ~6      | UUID placeholder, Yes/No fallbacks, missing-options error, Select placeholder, currency tooltip (`{{language}}`), load-failed error                          |
| `Editor/Field/FieldTooltipBody.tsx`                | 7       | "Edit Field", "View Model Activity Log", `CopyField` title/tooltip props, "Field added on", "…Field" suffix                                                  |
| `NoFields.tsx`                                     | 4       | heading, conditional body w/ `{{label}}` interpolation, "Add Fields in Schema" button, image alt                                                             |
| `Editor/Field/InternalLink.tsx` + `LinkOption.tsx` | 2       | "Selected item not found: {{value}}"; "…is missing a meta title"                                                                                             |
| `Editor/Editor.js`                                 | 1       | min/max value validation message (`{{min}}`/`{{max}}` interpolation)                                                                                         |

**Structural changes (not just inline `t()`):**

- **Refactor 2 module-level maps** (unreachable by `t()` at module scope → move
  lookup inside component): `SEO_FIELD_LABELS` (`FieldError.tsx:14`) and
  `EditorTypes` (`FieldShell.tsx:26`).
- **Consolidate duplicate `getErrorMessage`** — identical in `FieldError.tsx:28`
  and `FieldShell.tsx:77` (Required Field / Exceeding by N / Requires N more /
  block-variant). Extract to one shared helper, localize once.
- **4 plural keys** (replace the custom `pluralizeWord` helper → i18next CLDR
  plurals; delete `pluralizeWord` once its sites are converted): `Exceeding by
{{count}} character(s)`, `Requires {{count}} more character(s)`, `min. {{count}}
character(s)`, `correct the following {{count}} field(s) before saving`. Each
  needs `_one`/`_other` (+ es `_many`, ru `_few`+`_many`).

**Reuse / interpolation notes:** `common.edit` ("Edit") already exists; `Yes`/`No`
are strong `common` candidates (not yet in `common`). Keep data out of keys via
interpolation: `NoFields` `({{label}})`, `InternalLink` `{{value}}`, currency
`{{language}}`.

**Done (sub-pass 1 implemented).** 43 `content` keys in `en-US/content.json`,
fully translated into all 5 non-English locales (with full CLDR plural forms;
machine-assisted — flag for native review). Added `yes`/`no` to all 6
`common.json`. Extracted the shared `Editor/Field/getFieldErrorMessages.ts` and
removed the duplicated `getErrorMessage` from `FieldError`/`FieldShell`;
`pluralizeWord` left in place (still used by ItemList dialogs + schema). Kept the
`EditorTypes` English map exported (schema's `DefaultValueInput` consumes it) and
added a local `EDITOR_TYPE_LABEL_KEYS` for FieldShell's localized labels. Wired
`ContentEditor` with a local `<Suspense>` + `useTranslation("content")`; shared
field components call `useTranslation("content")` directly so they self-load the
namespace under schema/blocks too. `tsc --noEmit` clean. Not yet localized in
`ContentEditor.js` (app chrome): the empty-state "Please create a new content
model" + "Schema" link — deferred (app-chrome, not Editor/Field shell).

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
6. Handle string interpolation (`{{variable}}`) and pluralization where needed. **Plural keys must define every CLDR form for every language** (es adds `_many`; ru adds `_few` + `_many`; zh only `_other`) — see "Pluralization" under Phase 3. Missing forms throw in dev. Keep keys flat camelCase (no dots/nesting).

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

| Package                                       | Where / chrome                                                                                                                                       | Strings ship in package?                                                                                                                                                 | What we do                                                                                                                                                        | Effort            |
| --------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------- |
| **MUI core** (`@mui/material`)                | `Autocomplete` (No options/Loading…, 31 files), `TablePagination`, `Dialog` close aria (89 files), `Alert`, `Breadcrumbs`, `Pagination`, `SpeedDial` | ✅ **All 6 incl. Hindi** (`@mui/material/locale`)                                                                                                                        | Select the locale bundle; make the theme reactive (below). `t()` the few manual overrides                                                                         | Low               |
| **MUI X Data Grid**                           | Grid chrome (column menu, footer, no-rows)                                                                                                           | ⚠️ es/zh/ru/nl only — **Hindi missing**                                                                                                                                  | Resolver + hand-written hi-IN **already exist**; propagate to remaining grids                                                                                     | Med (propagation) |
| **MUI X Date Pickers**                        | `localeText`: OK/Cancel/Clear/Today, toolbar, clock/field aria (separate from date-fns calendar adapter, already wired)                              | ⚠️ es/zh/ru/nl only — **Hindi missing**                                                                                                                                  | New resolver + **hand-write hi-IN bundle**; pass `localeText` per `LocalizationProvider`                                                                          | Med               |
| **ProseMirror** (`@aeaton/react-prosemirror`) | `FieldTypeEditor` markdown/article_writer toolbar tooltips + link/embed modals                                                                       | ❌ No locale system — strings live in **our own** menu files                                                                                                             | `t()` the in-repo `react-prosemirror-menu/*` + modal labels; add keys to all locales                                                                              | Low-Med           |
| **TinyMCE 6**                                 | `FieldTypeTinyMCE` (primary wysiwyg surface): vendor toolbar tooltips, format dropdown, link/media/table/find-replace dialogs, wordcount             | ⚠️ Supported via `language` opt but **not bundled in npm**; **no Hindi exists at all**                                                                                   | Self-host lang packs (`/vendors/tinymce/langs/`), map from `i18n.language`, **hand-author `hi.js`**                                                               | High              |
| **Bynder Compact View**                       | Bynder DAM integration modal opened by `src/utility/openBynder.ts`; SDK script loaded from `ucv.bynder.com` in both HTML entries                     | ⚠️ SDK ships partial locale support; `en`/`es`/`nl` CloudFront locale files are available, but `zh`/`ru`/`hi` return 403; no public custom-translation object is exposed | Pass the SDK's `language` option from `openBynder`; map only fully available app locales to Bynder IDs; fall back `zh-CN`/`ru-RU`/`hi-IN`/unknown tags to `en_US` | Low               |
| **Monaco**                                    | Code app editor: context menu, command palette, find/replace widget                                                                                  | ⚠️ NLS exist for the **AMD** build only; app uses the **ESM** build (no runtime locale). No Dutch/Hindi anyway                                                           | **Leave English** (developer-facing tool; degrade gracefully like an unmapped grid tag)                                                                           | Very High → skip  |
| **CodeMirror 5**                              | HTML source view of `FieldTypeEditor`                                                                                                                | n/a — **no chrome**; no search/dialog addons are loaded                                                                                                                  | **No action**                                                                                                                                                     | None              |

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
  ProseMirror menu labels, Bynder Compact View language mapping). Language
  _selection_ stays in the app; reusable MUI language _data_ moves to the
  package.
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

- [x] **MUI-chrome resolvers — built locally in manager-ui** _(upstream to `@zesty-io/material` still pending)_ — `getMuiCoreLocale(tag)` (maps our 6 tags to `@mui/material/locale`, default `enUS`), `getDataGridLocaleText(tag)`, `getDatePickersLocaleText(tag)`, and the hand-authored **hi-IN** bundles for grid + pickers (MUI ships neither). All live i18next-free (tag in, locale out) so they can move wholesale:
  - `src/shell/i18n/mui-locale.ts` — `getMuiCoreLocale` + the `localizeTheme(theme, tag)` helper that merges the core locale bundle and sets grid/picker `localeText` as `defaultProps`.
  - `src/shell/i18n/datagrid.ts` — `getDataGridLocaleText` (the i18next-reading `dataGridLocaleText()` convenience reader was **deleted** — redundant under `localizeTheme`, which passes the tag in).
  - `src/shell/i18n/datepickers.ts` + `datepickers-locales/hi-IN.ts` — new, mirroring the grid resolver.
  - **Next:** migrate all four files (incl. both `*-locales/hi-IN.ts`) into `@zesty-io/material` once the keys settle; manager-ui then imports `localizeTheme`/resolvers from the package, call sites unchanged.
- [x] **Reactive theme → manager-ui** — the theme was built once at boot (`src/shell/index.js`); now wrapped in `LocalizedThemeProvider` (`src/shell/components/LocalizedThemeProvider.tsx`) that calls `useTranslation()` and `useMemo`s `localizeTheme(appTheme, i18n.language)` keyed on `i18n.language`. `useTranslation` re-renders on i18next's `languageChanged` → theme rebuilds → MUI core **and every grid/picker** (via `defaultProps`) re-render localized. The overrides object was hoisted to a `themeOverrides` module constant.
  - Grid/picker localization is now **automatic for all instances** — dissolves the "only 1 of ~25 `DataGridPro` grids wired" problem. The one explicit `localeText` prop (`apps/home/app/components/ResourceTable.tsx`) was **removed** as now-redundant.
- [ ] **MUI manual overrides → `t()`** — a few spots bypass the theme default and must be `t()`'d to be reactive: `noOptionsText`/`loadingText` in `seo/.../CreateRedirects/SearchField.tsx` and `shell/.../GlobalSearch/AdvancedSearch.tsx`; and the hardcoded literals in `FieldTypeDate` (`"Clear"`, `"Stored as"`, `placeholder="Mon DD YYYY"`) that are separate from MUI's picker `localeText`.
- [x] **ProseMirror** — `t()`'d the English `title:`/`content:`/`label:` literals in `src/shell/components/FieldTypeEditor/Editors/react-prosemirror-menu/{menu.js,inline-menu.js}` and the `LinkModal`/`EmbedModal` components (+ the `window.prompt` strings); 46 `shell.editor*` keys added to all 6 locales. Done together with the Phase 3 FieldTypeEditor widget row (they were the same strings). `t` is threaded into `menu(options)`/`inline(options)` from `useTranslation()` in `Basic`/`Inline`; the class-component modals use `withTranslation`. No external packs needed.
- [ ] **TinyMCE** — self-host language packs under `/vendors/tinymce/langs/` (matching the existing `skin_url`/`icon_url` self-hosting), add `language`/`language_url` to the `init` block in `src/shell/components/FieldTypeTinyMCE/index.tsx` derived from `i18n.language` via a tag map (`es-ES`→`es`, `zh-CN`→`zh_CN`, `ru-RU`→`ru`, `nl-NL`→`nl`; en-US→default). **Hand-author `langs/hi.js`** (`tinymce.addI18n("hi", {...})`). Manager-owned wrapper/plugin copy is already localized in Phase 3.
- [x] **Bynder Compact View** — `src/utility/openBynder.ts` opens the SDK-owned
      DAM modal via `BynderCompactView.open({ portal, mode, language, onSuccess })`. The
      current SDK script (`https://ucv.bynder.com/5.0.5/modules/compactview/bynder-compactview-3-latest.js`,
      bundle banner `bynder-compactview v4.3.3`) validates an optional
      `language?: string` option and passes it into the modal tree. Added a
      small resolver in `openBynder.ts` that imports the i18n singleton and maps
      the active app locale to the SDK's underscore IDs: - `en-US` → `en_US` - `es-ES` → `es_ES` - `zh-CN` → `en_US` (Bynder's external `zh.json` returns 403) - `ru-RU` → `en_US` (Bynder's external `ru.json` returns 403) - `nl-NL` → `nl_NL` - `hi-IN` → `en_US` (Bynder does **not** ship Hindi; degrade gracefully) - unknown tags → `en_US`
      The SDK has two localization paths: bundled design-system locale files
      keyed by underscore IDs (`ru_RU`, `zh_CN`, etc.) and an external
      CloudFront fetch that slices the first two letters and requests
      `/5.0.5/modules/compactview/i18n/{code}.json`. Direct checks showed
      `en.json`, `es.json`, and `nl.json` return 200, while `zh.json`,
      `ru.json`, and `hi.json` return 403; mapping those app locales to English
      avoids SDK-owned failed requests.
      Also updated `src/shell/byder.d.ts` to include `language?: string` in the
      open options; the local type was behind the SDK. Decision: do **not**
      patch/self-host Bynder for Hindi. The inspected SDK has an internal
      translation merge path, but `BynderCompactView.open(...)` does not expose
      a caller-provided localization/messages object, so `hi-IN` intentionally
      falls back to English. Also replaced the Bynder settings login-flow close
      helper's translated `button[title='Close']` dependency with a
      language-independent CSS location selector inside the SDK shadow DOM:
      `[data-testid='modal'] nav > button:last-of-type`.
- [ ] **Monaco** — no action; leave English (ESM build can't switch locale at runtime; Dutch/Hindi unshipped). Document the decision.
- [ ] **CodeMirror** — no action (no chrome-bearing addons loaded). Revisit only if a search addon is added.
- [ ] _(optional cleanup)_ remove the unused `flatpickr`/`react-flatpickr` deps (CSS-only, no JS mounts).

### Recommended sequence

Ordered low-risk-first. Build & prove each MUI piece in manager-ui, then
upstream the stable bundles to `@zesty-io/material` (avoids two-repo iteration):

1. ~~**MUI core + reactive theme**~~ ✅ — `LocalizedThemeProvider` + `localizeTheme(theme, tag)` built and proven in manager-ui.
2. ~~**MUI X Data Grid**~~ ✅ — folded into `localizeTheme` as `defaultProps`; explicit `localeText` prop removed from `ResourceTable`.
3. ~~**MUI X Date Pickers**~~ ✅ — `getDatePickersLocaleText` resolver + hand-written `datepickers-locales/hi-IN.ts`; same `defaultProps` path as the grid.
4. **Upstream to `@zesty-io/material`** ← _next_ — once the core/grid/picker resolvers + hi-IN bundles + `localizeTheme` are stable, move them into the package and import from there; other apps then inherit MUI localization for free.
5. ~~**ProseMirror**~~ ✅ — purely in-repo `t()` (stays in manager-ui); 46 `shell.editor*` keys, all 6 locales.
6. **Bynder Compact View** — low-effort SDK option pass-through in `openBynder`;
   do before or alongside settings QA because it affects the Bynder login/asset
   picker modal directly.
7. **TinyMCE** — highest effort (self-host packs + author Hindi + custom buttons), stays in manager-ui; the primary content surface, so high value but save for when the pattern is proven on the smaller ones.
8. **Monaco / CodeMirror** — decision/no-op; document and close out.

---

## Phase 6 — Caching & Cache Busting

- [x] Confirm production-like chained backend config (LocalStorage first, HTTP fallback) is working correctly — verify no redundant fetches on navigation
- [x] Bypass LocalStorageBackend in `development`/`local` and use HttpBackend
      directly so translation updates do not require manually clearing
      localStorage
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
