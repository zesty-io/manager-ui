# Localization — Task Board

> For architecture, conventions, and the per-namespace loop see **LOCALIZATION_PLAN.md**.

---

## Board snapshot

| ✓ Done                                                   | ▶ In Progress | → Up Next     | ≡ Backlog (in order)                                              |
| -------------------------------------------------------- | ------------- | ------------- | ----------------------------------------------------------------- |
| Phase 1 — Infrastructure                                 | —             | **`reports`** | `settings` · `code`                                               |
| Phase 2 — Locale switcher                                |               |               | `release` · `active-preview` · `blocks` · `leads` · `marketplace` |
| Phase 3 — `common` + `shell` (incl. FieldType\* widgets) |               |               | `studio` (verify-only)                                            |
| Phase 4 — `dashboard` · `media` · `content`              |               |               | Phase 5: TinyMCE · MUI overrides · `@zesty-io/material` upstream  |
| Phase 5 — MUI · ProseMirror · Bynder                     |               |               | Phase 8 — Cypress tests                                           |
| Phase 6 — Caching · Phase 7 — Missing-key handling       |               |               |                                                                   |
| **`schema`**                                             |               |               |                                                                   |
| **`seo`**                                                |               |               |                                                                   |

---

---

# ▶ In Progress

_Nothing in progress right now — pick up `reports` next._

---

---

# → Up Next

---

_`seo` complete — pick up `reports` next._

---

---

# ≡ Backlog

---

### `reports` — Effort: M

_Do before `schema` if needed — `schema` renders `reports`' ActivityLog components._

- [ ] Add lazy-load plumbing to `ReportingApp`
- [ ] Create empty `public/locales/<locale>/reports.json` for all 6 locales
- [ ] Audit + localize `src/apps/reports/src/`:
  - [ ] Filter-option arrays + Metrics labels (still hardcoded)
  - [ ] Date formatting — mostly handled by `formatLocalized`; verify all call sites
- [ ] Verify: `npx tsc --noEmit`, JSON valid, key parity across all 6 locales

---

### `settings` — Effort: L

- [ ] Add lazy-load plumbing to `SettingsApp`
- [ ] Create empty `public/locales/<locale>/settings.json` for all 6 locales
- [ ] Audit + localize `src/apps/settings/src/`:
  - [ ] Destructive flows: font uninstall, workflow deactivation — high QA bar
  - [ ] Module-level color/role maps (backend role names → skip; UI role-picker labels → translate)
  - [ ] `settings` imports `media` components — strings already in `media` keys, don't duplicate
- [ ] Verify `FieldTypeImage` (`shell` ns, used by `settings/Styles`) has no gaps
- [ ] Verify: `npx tsc --noEmit`, JSON valid, key parity across all 6 locales

---

### `code` — Effort: M

- [ ] Add lazy-load plumbing to `CodeApp`
- [ ] Create empty `public/locales/<locale>/code.json` for all 6 locales
- [ ] Audit + localize `src/apps/code-editor/src/`:
  - [ ] Multi-paragraph file-type help text in `CreateFile` — largest single block
  - [ ] Strings scattered across the editor views
  - [ ] Monaco editor has no chrome to translate (ESM build, developer-facing — skip)
- [ ] Verify: `npx tsc --noEmit`, JSON valid, key parity across all 6 locales

---

### `release` — Effort: S (quick win)

- [ ] Add lazy-load plumbing to `ReleaseApp`
- [ ] Create empty `public/locales/<locale>/release.json` for all 6 locales
- [ ] Audit + localize `src/apps/release/src/` — mostly simple forms and buttons
- [ ] Verify: `npx tsc --noEmit`, JSON valid, key parity across all 6 locales

---

### `active-preview` — Effort: S-M

- [ ] Add i18n infra (separate webpack entry — no lazy-load pattern yet; may need its own Suspense root)
- [ ] Create empty `public/locales/<locale>/active-preview.json` for all 6 locales
- [ ] Audit + localize `src/apps/active-preview/src/`:
  - [ ] Toolbar = manager chrome → translate
  - [ ] iframe content = previewed site → **skip entirely**
  - [ ] Device-template object maps — refactor before `t()` can be applied
- [ ] Verify: `npx tsc --noEmit`, JSON valid, key parity across all 6 locales

---

### `blocks` — Effort: S

_Depends on `content` (done) + `schema` (pending) — most of the blocks editing surface is those namespaces._

- [ ] Add lazy-load plumbing to `BlocksApp`
- [ ] Create empty `public/locales/<locale>/blocks.json` for all 6 locales
- [ ] Audit + localize `src/apps/blocks/src/` — ~30-40 own strings; OnboardingDialog multi-slide is the bulk
- [ ] Verify: `npx tsc --noEmit`, JSON valid, key parity across all 6 locales

---

### `leads` — Effort: XS

- [ ] Add lazy-load plumbing to `LeadsApp`
- [ ] Create empty `public/locales/<locale>/leads.json` for all 6 locales
- [ ] Audit + localize `src/apps/leads/src/` — table headers + filter labels only
- [ ] Verify: `npx tsc --noEmit`, JSON valid, key parity across all 6 locales

---

### `marketplace` — Effort: XS

- [ ] Add lazy-load plumbing to `MarketplaceApp`
- [ ] Create empty `public/locales/<locale>/marketplace.json` for all 6 locales
- [ ] Audit + localize `src/apps/marketplace/src/` — empty state + CTA only
- [ ] Verify: `npx tsc --noEmit`, JSON valid, key parity across all 6 locales

---

### `studio` — verify-only

- [ ] Confirm `src/apps/studio/src/` has no own user-facing strings (route alias to content-editor's `StudioWrapper`; all strings are `content` keys, done in sub-pass 11)

---

### Phase 4.5 — Suspense fallback skeleton loaders

- [ ] Replace the empty `Box` fallback in each sub-app's `<Suspense>` with a full-page skeleton loader that matches the app's layout chrome (sidebar shape, content area grid, etc.) so the UI doesn't flash blank grey during namespace lazy-load

---

### Phase 5 — Remaining

- [ ] **MUI manual overrides → `t()`** — `noOptionsText`/`loadingText` bypassing the theme:
  - [ ] `seo/.../CreateRedirects/SearchField.tsx`
  - [ ] `shell/.../GlobalSearch/AdvancedSearch.tsx`
- [ ] **TinyMCE lang packs** — self-host under `/vendors/tinymce/langs/`; map `i18n.language` → lang code in `src/shell/components/FieldTypeTinyMCE/index.tsx`; hand-author `langs/hi.js`
- [ ] **Upstream to `@zesty-io/material`** — move `getMuiCoreLocale` / `getDataGridLocaleText` / `getDatePickersLocaleText` / `localizeTheme` + both hi-IN bundles. Constraints: additive-only, opt-in (`localizeTheme(theme, tag)`), no new peer deps, `sideEffects:false`, minor semver, add hi-IN coverage test to the package
- [ ] **Monaco** — document no-action decision (ESM build, developer-facing) and close out
- [ ] _(optional)_ Remove dead `flatpickr`/`react-flatpickr` deps

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

### Phase 5 — MUI · ProseMirror · Bynder

- [x] MUI core locale + reactive theme — `LocalizedThemeProvider` + `localizeTheme` in `src/shell/i18n/mui-locale.ts`; auto-applies to every grid/picker via `defaultProps`
- [x] MUI X Data Grid — `getDataGridLocaleText` + hand-authored hi-IN (`src/shell/i18n/datagrid.ts` + `datagrid-locales/hi-IN.ts`)
- [x] MUI X Date Pickers — `getDatePickersLocaleText` + `datepickers-locales/hi-IN.ts`
- [x] ProseMirror — 46 `shell.editor*` keys all 6 locales; `t` threaded into menu builders; `LinkModal`/`EmbedModal` wrapped with `withTranslation`
- [x] Bynder Compact View — locale mapping in `src/utility/openBynder.ts`; zh/ru/hi fall back to `en_US`; replaced language-dependent SDK close selector

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
