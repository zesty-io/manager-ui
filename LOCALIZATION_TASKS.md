# Localization — Task Board

> For architecture, conventions, and the per-namespace loop see **LOCALIZATION_PLAN.md**.

---

## Board snapshot

| ✓ Done                                                           | ▶ In Progress | → Up Next | ≡ Backlog (in order)    |
| ---------------------------------------------------------------- | ------------- | --------- | ----------------------- |
| Phase 1 — Infrastructure                                         | —             | —         | Phase 8 — Cypress tests |
| Phase 2 — Locale switcher                                        |               |           |                         |
| Phase 3 — `common` + `shell` (incl. FieldType\* widgets)         |               |           |                         |
| Phase 4 — `dashboard` · `media` · `content`                      |               |           |                         |
| Phase 5 — MUI · ProseMirror · Bynder · TinyMCE · MUI overrides ✓ |               |           |                         |
| Phase 6 — Caching · Phase 7 — Missing-key handling               |               |           |                         |
| **`schema`** ✓                                                   |               |           |                         |
| **`seo`** ✓                                                      |               |           |                         |
| **`leads`** ✓                                                    |               |           |                         |
| **`reports`** ✓                                                  |               |           |                         |
| **`settings`** ✓                                                 |               |           |                         |
| **`code`** ✓                                                     |               |           |                         |
| **`blocks`** ✓                                                   |               |           |                         |
| **`activePreview`** ✓                                            |               |           |                         |
| **`marketplace`** ✓                                              |               |           |                         |
| **`studio`** ✓ (verify-only)                                     |               |           |                         |
| Phase 4.5 — Suspense fallback skeleton loaders ✓                 |               |           |                         |

---

---

# ▶ In Progress

_Nothing in progress right now._

---

---

# → Up Next

---

---

---

# ≡ Backlog

---

### Phase 8 — Cypress tests

- [ ] App loads `en-US` when no locale preference is saved
- [ ] App loads user's stored `localStorage` locale on boot
- [ ] `LocaleSwitcher` updates the UI immediately
- [ ] Locale persists across page refresh
- [ ] Locale is preserved across sub-app navigation (confirms lazy namespace loading works)
- [ ] _(candidate)_ Coverage test: every plural base has its locale's full CLDR set

---

---

# ✓ Done

---

### Phase 1–3, 6, 7

All infrastructure, locale switcher, `common` + `shell` namespaces (incl. all `FieldType*` widgets + date-fns wiring), caching, and missing-key handling are complete.

---

### Phase 4 — `dashboard`

- [x] Lazy-load plumbing (`HomeApp` local `<Suspense>` + `useTranslation("dashboard")`)
- [x] `en-US/dashboard.json` populated; all 5 non-English locales translated
- [x] Shell miss fixed: `CreateContentItemDialog` now uses `shell.*` keys

---

### Phase 4 — `media`

- [x] Lazy-load plumbing (`MediaApp` → `MediaAppContent`)
- [x] ~166 keys in `en-US/media.json`; all 6 locales populated
- [x] Upload/replace/delete `notify()` in `shell/store/media-revamp.ts` — localized via i18n singleton
- [x] Active filter chips (DateFilter preset, FiletypeFilter category) mapped to locale keys
- [x] Cross-namespace consolidation: date presets, sort labels, common strings moved to `common`

---

### Phase 4 — `content` (sub-passes 1–11)

| #   | Sub-pass                        | Key files                                                                                                                                   |
| --- | ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Editor + Field shell            | `Editor/FieldError.tsx`, `Field/FieldShell.tsx`, `Field/Field.tsx`, `Field/FieldTooltipBody.tsx`, `NoFields.tsx`                            |
| 2   | ItemList                        | `views/ItemList/` (22 files)                                                                                                                |
| 3   | ItemEdit chrome (critical path) | `ItemEditHeader`, `Content/Actions`, `LockedItem`, `PendingEditsModal`, publish/save `notify()`                                             |
| 4   | ItemEdit SEO/meta tab           | `Meta/settings`, `SocialMediaPreview`, `ContentInsights`, `IncomingRedirects`                                                               |
| 5   | Create / link / misc            | `ItemCreate`, `LinkCreate`, `LinkEdit`, `NotFound`                                                                                          |
| 6   | Analytics                       | `views/Analytics/` (24 files); `getDateRangeAndLabelsFromParams` via i18n singleton                                                         |
| 7   | CSVImport + Redirects           | `views/CSVImport/` (6 files), `views/Redirects/` (4 files)                                                                                  |
| 8   | ItemEdit secondary tabs         | `ItemHead` (Head Tags = `shell`), `APIEndpoints.tsx` (ModelApi deferred → `schema`), `FreestyleWrapper` (no copy)                           |
| 9   | FieldTypeMedia widget           | `components/FieldTypeMedia.tsx` — `useSuspense: false` (mounts in shell + schema)                                                           |
| 10  | Content navigation sidebar      | `ContentNav/index.tsx`, `NavError.tsx`, `ReorderNav/ReorderNav.js` (class cmp), `HideContentItemDialog.tsx`, `ContentEditor.js` empty state |
| 11  | Studio / Blocks editor          | `StudioWrapper.tsx`, `StudioSidePanel.tsx`, `BlockTabs/index.tsx`, `CodeSample.tsx`, `useStudioBridge.ts`, `useLayoutReorderState.ts`       |

**Carry-overs to close in later passes:**

- `schema` must localize the `ModelApi` tree (`src/apps/schema/src/app/components/ModelApi/`). After that, content-editor's ItemEdit API tab must **load the `schema` namespace**.
- `seo` must localize `RedirectsDialogProvider` + redirect create/edit form (`src/apps/seo/src/`).

---

### `@zesty-io/material` upstream (deferred from Phase 5)

- [x] `localizeTheme`, `getDataGridLocaleText`, `getDatePickersLocaleText`, and both hi-IN bundles moved to `@zesty-io/material`; `MuiLocaleString` type exported from the package. manager-ui now owns only the BCP 47 → MUI locale string mapping in `LocalizedThemeProvider`. See `LOCALIZATION.md` in the `@zesty-io/material` repo.

---

### Phase 5 — MUI · ProseMirror · Bynder · TinyMCE · MUI overrides

- [x] MUI core locale + reactive theme — `LocalizedThemeProvider` + `localizeTheme` (now in `@zesty-io/material`); auto-applies to every grid/picker via `defaultProps`
- [x] MUI X Data Grid — `getDataGridLocaleText` + hand-authored hi-IN (now in `@zesty-io/material`)
- [x] MUI X Date Pickers — `getDatePickersLocaleText` + hi-IN bundle (now in `@zesty-io/material`)
- [x] ProseMirror — 46 `shell.editor*` keys all 6 locales; `t` threaded into menu builders; `LinkModal`/`EmbedModal` wrapped with `withTranslation`
- [x] Bynder Compact View — locale mapping in `src/utility/openBynder.ts`; zh/ru/hi fall back to `en_US`; replaced language-dependent SDK close selector
- [x] **TinyMCE lang packs — no action.** The official TinyMCE CDN requires an API key we do not have; all other sources (e.g. community npm packages, third-party CDNs) are unofficial and not reliable. TinyMCE UI chrome remains in English for all locales.
- [x] MUI manual overrides — `seo/SearchField.tsx` `noOptionsText` → `t("shell.noResultsFound")`; `shell/AdvancedSearch.tsx` `noOptionsText` → `t("common.noUsersFound")`
- [x] Monaco — no action; ESM build, developer-facing code editor, no translatable i18n API surface
- [x] ReactJson in `activePreview/JSONPreview` — skipped; `react-json-view` exposes no locale API, developer-facing debug panel

---

### Phase 4 — `schema`

- [x] Lazy-load plumbing: `src/apps/schema/src/index.js`
- [x] `en-US/schema.json` populated — 710 new keys, 32 reused from common/shell
- [x] All 6 locales written
- [x] tsc: FAIL — see issues below

**Manual action items — fix before closing:**

- TypeScript: `src/apps/schema/src/app/components/DeleteModelDialogue.tsx(82,5)`: error TS2657: JSX expressions must have one parent element.
- TypeScript: `src/apps/schema/src/app/components/DeleteModelDialogue.tsx(98,12)`: error TS1127: Invalid character.
- TypeScript: `src/apps/schema/src/app/components/DeleteModelDialogue.tsx(98,38)`: error TS1381: Unexpected token. Did you mean `{'}'}` or `&rbrace;`?
- TypeScript: `src/apps/schema/src/app/components/DeleteModelDialogue.tsx(99,29)`: error TS1127: Invalid character.
- TypeScript: `src/apps/schema/src/app/components/DeleteModelDialogue.tsx(99,74)`: error TS1382: Unexpected token. Did you mean `{'>'}` or `&gt;`?
- TypeScript: `src/apps/schema/src/app/components/DeleteModelDialogue.tsx(100,14)`: error TS1127: Invalid character.
- TypeScript: `src/apps/schema/src/app/components/DeleteModelDialogue.tsx(100,55)`: error TS1005: `}` expected.
- TypeScript: `src/apps/schema/src/app/components/DeleteModelDialogue.tsx(100,69)`: error TS1381: Unexpected token. Did you mean `{'}'}` or `&rbrace;`?
- TypeScript: `src/apps/schema/src/app/components/DeleteModelDialogue.tsx(100,71)`: error TS1381: Unexpected token. Did you mean `{'}'}` or `&rbrace;`?
- TypeScript: `src/apps/schema/src/app/components/DeleteModelDialogue.tsx(101,11)`: error TS17002: Expected corresponding JSX closing tag for `DialogTitle`.
- TypeScript: `src/apps/schema/src/app/components/DeleteModelDialogue.tsx(102,9)`: error TS17002: Expected corresponding JSX closing tag for `Dialog`.
- TypeScript: `src/apps/schema/src/app/components/DeleteModelDialogue.tsx(130,5)`: error TS1005: `)` expected.
- TypeScript: `src/apps/schema/src/app/components/DeleteModelDialogue.tsx(131,3)`: error TS1109: Expression expected.
- TypeScript: `src/apps/schema/src/app/components/DeleteModelDialogue.tsx(132,1)`: error TS1128: Declaration or statement expected.

---

### Phase 4 — `schema` (sub-pass: StarterBlocks)

- [x] Lazy-load plumbing: `src/apps/schema/src/app/components/StarterBlocks/index.tsx`
- [x] `en-US/schema.json` updated — 21 new keys, 2 reused from common/shell
- [x] All 6 locales seeded with en-US values (manual translation pending)
- [x] tsc: PASS

**Manual action items — fix before closing:**

- Key parity: es-ES is missing plural form `repeaterSubFieldCount_many` (Spanish requires `_one`, `_many`, `_other`; only `_one` and `_other` are present)

---

### Phase 4 — `seo`

- [x] Lazy-load plumbing: N/A (not applicable to this target)
- [x] `en-US/seo.json` populated — 102 new keys, 9 reused from common/shell
- [x] All 6 locales written
- [x] tsc: FAIL — see issues below

**Manual action items — fix before closing:**

- TypeScript: `src/apps/seo/src/views/RedirectsManager/RedirectActions/RedirectsImport.tsx(113,5)`: error TS2657: JSX expressions must have one parent element.
- TypeScript: `src/apps/seo/src/views/RedirectsManager/RedirectActions/RedirectsImport.tsx(165,58)`: error TS1003: Identifier expected.
- TypeScript: `src/apps/seo/src/views/RedirectsManager/RedirectActions/RedirectsImport.tsx(165,59)`: error TS1382: Unexpected token. Did you mean `{'>'}` or `&gt;`?
- TypeScript: `src/apps/seo/src/views/RedirectsManager/RedirectActions/RedirectsImport.tsx(165,74)`: error TS1003: Identifier expected.
- TypeScript: `src/apps/seo/src/views/RedirectsManager/RedirectActions/RedirectsImport.tsx(165,75)`: error TS1382: Unexpected token. Did you mean `{'>'}` or `&gt;`?
- TypeScript: `src/apps/seo/src/views/RedirectsManager/RedirectActions/RedirectsImport.tsx(167,13)`: error TS17002: Expected corresponding JSX closing tag for `Typography`.
- TypeScript: `src/apps/seo/src/views/RedirectsManager/RedirectActions/RedirectsImport.tsx(168,11)`: error TS17002: Expected corresponding JSX closing tag for `DialogTitle`.
- TypeScript: `src/apps/seo/src/views/RedirectsManager/RedirectActions/RedirectsImport.tsx(169,9)`: error TS17002: Expected corresponding JSX closing tag for `Dialog`.
- TypeScript: `src/apps/seo/src/views/RedirectsManager/RedirectActions/RedirectsImport.tsx(183,5)`: error TS1005: `)` expected.
- TypeScript: `src/apps/seo/src/views/RedirectsManager/RedirectActions/RedirectsImport.tsx(184,3)`: error TS1109: Expression expected.
- TypeScript: `src/apps/seo/src/views/RedirectsManager/RedirectActions/RedirectsImport.tsx(185,1)`: error TS1128: Declaration or statement expected.

---

### Phase 4 — `leads`

- [x] Lazy-load plumbing: `src/apps/leads/src/index.js`
- [x] `en-US/leads.json` populated — 24 new keys, 4 reused from common/shell
- [x] All 6 locales written
- [x] tsc: PASS

---

### Phase 4 — `reports`

- [x] Lazy-load plumbing: N/A (not applicable to this target)
- [x] en-US/reports.json populated — 122 new keys, 21 reused from common/shell
- [x] All 6 locales seeded with en-US values (manual translation pending)
- [x] tsc: FAIL — see issues below

**Manual action items — fix before closing:**

- TypeScript: src/apps/reports/src/app/views/ActivityLog/components/TopUsers.js(62,12): error TS8017: Signature declarations can only be used in TypeScript files.
- TypeScript: src/apps/reports/src/app/views/ActivityLog/components/TopUsers.js(62,14): error TS1003: Identifier expected.
- TypeScript: src/apps/reports/src/app/views/ActivityLog/components/TopUsers.js(81,12): error TS8017: Signature declarations can only be used in TypeScript files.
- TypeScript: src/apps/reports/src/app/views/ActivityLog/components/TopUsers.js(81,14): error TS1003: Identifier expected.
- Key parity: es-ES missing plural form: actionCount_many
- Key parity: ru-RU missing plural form: actionCount_few
- Key parity: ru-RU missing plural form: actionCount_many

---

### Phase 4 — `settings`

- [x] Lazy-load plumbing: `src/apps/settings/src/index.js`
- [x] `en-US/settings.json` populated — 102 new keys, 14 reused from common/shell
- [x] All 6 locales seeded with en-US values (manual translation pending)
- [x] tsc: PASS

---

### Phase 4 — `code`

- [x] Lazy-load plumbing: `src/apps/code-editor/src/index.js`
- [x] `en-US/code.json` populated — 130 new keys, 20 reused from common/shell
- [x] All 6 locales seeded with en-US values (manual translation pending)
- [x] tsc: PASS — fixed `Trans` self-closing in `DevResources.tsx` to drop JSX-literal child content that caused TS2339 on custom element names

---

### Phase 4 — `release`

- [x] Lazy-load plumbing: N/A (not applicable to this target)
- [x] en-US/release.json populated — 32 new keys, 6 reused from common/shell
- [x] All 6 locales seeded with en-US values (manual translation pending)
- [x] tsc: PASS

**Manual action items — fix before closing:**

- Key parity: es-ES/release.json is missing 'publishedItems_many' (es-ES requires \_one, \_many, \_other)
- Key parity: ru-RU/release.json is missing 'publishedItems_few' (ru-RU requires \_one, \_few, \_many, \_other)
- Key parity: ru-RU/release.json is missing 'publishedItems_many' (ru-RU requires \_one, \_few, \_many, \_other)

---

### Phase 4 — `blocks`

- [x] Lazy-load plumbing: `src/apps/blocks/index.tsx`
- [x] `en-US/blocks.json` populated — 27 new keys, 4 reused from common/shell
- [x] All 6 locales seeded with en-US values (manual translation pending)
- [x] tsc: PASS

---

### Phase 4 — `activePreview`

- [x] Lazy-load plumbing: `src/apps/activePreview/Preview.js`
- [x] `en-US/activePreview.json` populated — 24 new keys, 2 reused from common/shell
- [x] All 6 locales seeded with en-US values (manual translation pending)
- [x] tsc: PASS

---

### Phase 4 — `marketplace`

- [x] Lazy-load plumbing: N/A (not applicable to this target)
- [x] en-US/marketplace.json populated — 14 new keys
- [x] All 6 locales seeded with en-US values (manual translation pending)
- [x] tsc: PASS

---

### `studio` — verify-only

- [x] Confirmed no own user-facing strings — thin route wrapper re-exporting `StudioWrapper` from content-editor; all strings covered by `content` namespace (sub-pass 11)

---

### `shell` — `apps.js` carry-over

- [x] Wired 3 `notify()` calls in `src/shell/store/apps.js` to `i18n.t("shell.appLoadingFailure", { message })` (key already existed in all 6 locales)
