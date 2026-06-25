# Product Localization — Implementation Plan

Spec: https://docs.google.com/document/d/1l5RdyDxQLTwXdz80Gk1_y8GdVv_KoQG5VfSmdvJPmaU

`manager-ui` is being localized with **i18next + react-i18next** across 6 locales.
This doc is the source of truth for **status + conventions**. The actual record of
what's translated is the code and `public/locales/*` — not prose here.

## Supported locales

| Language | BCP 47  |     | Language | BCP 47  |
| -------- | ------- | --- | -------- | ------- |
| English  | `en-US` |     | Mandarin | `zh-CN` |
| Spanish  | `es-ES` |     | Russian  | `ru-RU` |
| Hindi    | `hi-IN` |     | Dutch    | `nl-NL` |

`en-US` is the fallback. Hindi has almost no upstream support in third-party libs,
so we hand-author its bundles everywhere.

## Status at a glance

| Phase                                   | Status                                                                                       |
| --------------------------------------- | -------------------------------------------------------------------------------------------- |
| 1. i18next infrastructure               | ✅ Done                                                                                      |
| 2. Locale switcher + persistence        | ✅ Done                                                                                      |
| 3. `common` + `shell` namespaces        | ✅ Done (incl. all `shell/components/FieldType*` widgets + date-fns wiring)                  |
| 4. Sub-app namespaces                   | 🚧 **In progress** — done: `dashboard`, `media`, `content`. Remaining: see Remaining work    |
| 5. Third-party chrome (MUI/TinyMCE/etc) | 🚧 Partial — MUI + ProseMirror + Bynder done; TinyMCE + a few overrides + upstreaming remain |
| 6. Caching / cache-busting              | ✅ Done                                                                                      |
| 7. Missing-key handling                 | ✅ Done                                                                                      |
| 8. Cypress tests                        | ❌ Not started                                                                               |

---

## How it works (architecture)

- **Config:** `src/shell/i18n/index.ts`, imported in `src/shell/index.js` before the
  React root renders; root is wrapped in `<Suspense>`.
- **Locale data:** `public/locales/<locale>/<namespace>.json`, served at
  `/locales/{{lng}}/{{ns}}.json`.
- **Key syntax:** config sets `nsSeparator: "."` + `keySeparator: false`. So keys are
  **qualified, flat camelCase strings** — `t("content.publishItem")`,
  `t("common.save")`. The namespace is the first dot-segment; the rest is one flat
  key. **Never nest JSON objects and never use a second dot** — a multi-dot key like
  `t("media.dateFilter.today")` resolves to a broken lookup and throws in dev.
- **Components** call `useTranslation()` with **no namespace argument** — the
  namespace lives in the key. (Exception: the lazy-load trigger below, and shared
  widgets that must self-load a namespace.)
- **Namespaces loaded at init:** `common` (default) + `shell`. Every sub-app
  namespace **lazy-loads on first navigation** to that app.
- **Locale switching:** `LocaleSwitcher` (in `GlobalTopbar`) → `i18n.changeLanguage`.
  Persisted to `localStorage` (`app_locale`) and to the DB (`user.prefs.locale` via
  `accounts.updateUser`). On boot the DB pref is applied before first paint.
- **Missing keys:** **dev throws** (names the key + `public/locales/<lng>/<ns>.json`
  path; dev also disables the en-US fallback so gaps in _non-English_ locales surface).
  **Stage/prod** fall back to en-US and `Sentry.captureMessage` once per key.
- **Caching:** git hash is the cache-bust `defaultVersion`. Dev uses `HttpBackend`
  only (edit a JSON, refresh, see it — no stale localStorage).

### Lazy-loading a sub-app namespace (the pattern)

The sub-app root wraps a **local `<Suspense>`** and the inner component calls
`useTranslation("<ns>")` once — this triggers the namespace load and suspends only
that subtree (not the whole shell). Children then use bare `useTranslation()`.
Canonical examples: `HomeApp` → `dashboard`, `ContentApp` (`ContentEditor.js`) →
`content`, `MediaApp` → `media`.

### MUI component labels (separate from i18next)

MUI components have their own built-in label system (DataGrid column menus, DatePicker buttons, Autocomplete labels, etc.) that is entirely separate from i18next. These are localized through the theme, not through `t()`.

**How it works:**

- `@zesty-io/material` exports `localizeTheme(theme, muiLocaleString)`, which applies the correct MUI locale bundles for all three MUI systems (core, Data Grid, Date Pickers) onto the base theme.
- `LocalizedThemeProvider` (`src/shell/components/LocalizedThemeProvider.tsx`) wraps the app in a `<ThemeProvider>` that re-runs `localizeTheme` whenever the active language changes.
- The `MUI_LOCALE` map in `LocalizedThemeProvider` converts the app's BCP 47 tag (e.g. `"es-ES"`) to the MUI locale string (e.g. `"esES"`) that `localizeTheme` expects. This is the only MUI-related thing manager-ui owns.

**Adding a new locale:**

1. Add an entry to `MUI_LOCALE` in `LocalizedThemeProvider.tsx`: `"fr-FR": "frFR"`.
2. Verify `frFR` is a named export in `@mui/material/locale` — an invalid string silently falls back to English.
3. If MUI X doesn't ship the locale (Data Grid / Date Pickers), a hand-authored bundle is needed in `@zesty-io/material`. See `LOCALIZATION.md` in that repo for the full process.

**Type safety:** `MUI_LOCALE` is typed as `Record<SupportedLocale, MuiLocaleString>` where `MuiLocaleString` is exported from `@zesty-io/material` and derived from `@mui/material/locale`'s named exports — invalid MUI locale strings are caught at compile time.

### Dates (date-fns is separate from i18next)

- Display strings: `formatLocalized(date, fmt)` / `formatDistanceToNowLocalized(...)`
  (`src/shell/i18n/dates.ts`; they read `i18n.language` from the singleton, so
  non-component utils work too).
- MUI pickers: pass `adapterLocale={getDateFnsLocale(i18n.language)}`.
- **Keep machine formats locale-independent** — `yyyy-MM-dd`, API/CSV payloads, URL
  params, IndexedDB/search keys. Localizing them silently breaks storage/search.

---

## Rules for translating a namespace

### Where strings hide (audit _all_ of these, not just JSX)

- JSX text + string props (`label`, `placeholder`, `title`, `aria-label`, `alt`).
- **Functions that return strings** (`getLabel`, `getErrorMessage`, …).
- **Module-level object maps/arrays** — `t()` can't run at module scope. Store i18n
  _keys_ in the map and resolve with `t()` inside the component (or move the lookup
  in). Verify the const isn't imported elsewhere before changing it.
- **Strings passed as props** — translate at the **call site**, not in the receiving
  component.
- **`notify()` / `dispatch()` messages**, including in **redux thunks and hooks** — a
  render-only scan misses these. In non-component modules/thunks use the **i18n
  singleton**: `import i18n from "shell/i18n"; i18n.t("ns.key")`.
- **Class components** → wrap with `withTranslation()`, use `this.props.t`.

### What to SKIP (data / not UI copy)

- **DB-sourced values:** model/field labels, field-type identifiers (`one_to_one`),
  user content, backend-generated role names, passed-through backend error text.
  (Memory: `feedback_localization_backend_mirror_strings`.)
- **Brand/product names:** Zesty, Bynder, Google Analytics, Content One, "Zesty
  Manager". **Technical tokens:** ZUID, HTML element names (Script/Meta/Link), code
  snippets, raw HTML attributes (`target=_blank`).
- **Developer-facing:** `throw new Error(...)` invariants, `console.*` logs.

### Which namespace a string belongs to

**The namespace is the app dir the file physically lives in** (decided 2026-06-17),
_even when_ another app imports it. So `src/shell/components/FieldType*` → `shell`
(shared); a component under `src/apps/content-editor/src` → `content` even though
schema/blocks import it.

**Namespace names must be flat camelCase** — e.g. `activePreview`, not `active-preview`. Hyphens break the i18next key lookup because the config uses `nsSeparator: "."` and `keySeparator: false`; a hyphenated namespace name is technically safe but inconsistent with the camelCase key convention and easy to confuse with a key separator. Always use camelCase when the app dir contains a hyphen (e.g. `src/apps/active-preview` → namespace `activePreview`).

- **Consequence:** a shared component renders keys from its _home_ namespace. If it
  can mount inside an app that doesn't load that namespace, it must **self-load** it:
  `useTranslation("<homeNs>", { useSuspense: false })` (non-suspense so it never
  crashes a tree that lacks a Suspense boundary; no-op where already loaded).
  Precedent: `FieldTypeMedia` (a `content` key) mounts in shell + schema.

### Pluralization (mandatory: every CLDR form, every locale)

A plural key (`_one`, `_other`, …) used with `{ count }` selects the form by the
active locale's CLDR categories and **throws in dev for any missing category**. Forms
differ per locale, so define **all** of them per locale:

| Locale                  | Required forms                    |
| ----------------------- | --------------------------------- |
| `en-US`,`hi-IN`,`nl-NL` | `_one`, `_other`                  |
| `es-ES`                 | `_one`, `_many`, `_other`         |
| `ru-RU`                 | `_one`, `_few`, `_many`, `_other` |
| `zh-CN`                 | `_other`                          |

This is the **one exception** to strict key-parity across locales. Notes: a non-suffixed
key used with `{count}` is fine (no inflection); Spanish `_many` usually equals `_other`;
get exact suffixes via `i18n.services.pluralResolver.getSuffixes(tag)`.

### Per-namespace loop

1. First time: add the lazy-load plumbing (local `<Suspense>` + `useTranslation("<ns>")`);
   create empty `public/locales/<locale>/<ns>.json` for all 6 locales.
2. Audit + replace with `t("<ns>.key")` (interpolate data via `{{var}}`; embedded
   markup via `<Trans components={{...}}>`).
3. Fill `en-US/<ns>.json`, then translate the other 5 (machine-assisted OK — flag for
   native/QA review).
4. **Verify** (CI runs **no** typecheck/lint — do it yourself): `npx tsc --noEmit`;
   JSON valid; key parity across all 6 locales (non-plural keys identical; plural keys
   carry each locale's full CLDR set).

---

## Reference — where the done infrastructure lives

- **i18next config / helpers:** `src/shell/i18n/` — `index.ts` (config, `SUPPORTED_LOCALES`,
  missing-key handler), `dates.ts` (`getDateFnsLocale`, `formatLocalized`,
  `formatDistanceToNowLocalized`).
- **MUI localization:** `src/shell/components/LocalizedThemeProvider.tsx` — owns the
  BCP 47 → MUI locale string mapping (`MUI_LOCALE`) and calls `localizeTheme` from
  `@zesty-io/material` on language change. For the MUI locale bundle side, see
  `LOCALIZATION.md` in the `@zesty-io/material` repo.
- **Switcher / boot:** `components/GlobalTopbar/LocaleSwitcher.tsx`; boot apply in
  `components/load-instance/index.js`; `accounts.updateUser` mutation.
- **Reactive theme:** `components/LocalizedThemeProvider.tsx`.
- **Locale data:** `public/locales/<locale>/{common,shell,dashboard,media,content}.json`.
- **Key-extraction CLI (optional):** `i18next-parser.config.js`.
