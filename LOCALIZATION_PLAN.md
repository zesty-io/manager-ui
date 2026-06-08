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
  - LocalStorage cache TTL: 24 h
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
- [ ] Wire `LocaleSwitcher` to `i18n.changeLanguage(tag)` on selection
- [ ] Persist selected locale to `localStorage` key `app_locale` on change
- [ ] On app boot, read locale from DB user profile (if available) and call `i18n.changeLanguage()` — falls back to LanguageDetector (localStorage → browser language)
- [ ] Save selected locale to DB user profile via API on change (fire-and-forget, non-blocking)

---

## Phase 3 — Common Namespace

Covers shared UI strings used across all sub-apps: button labels, generic notifications, form actions, error messages, loading states.

- [ ] Audit shell-level components for hardcoded strings:
  - `src/shell/components/`
  - `src/shell/views/`
- [ ] Populate `public/locales/en-US/common.json` with extracted keys
- [ ] Replace hardcoded strings with `t("key")` calls (using `useTranslation()` or `useTranslation("common")`)
- [ ] Run `i18next-parser` to validate no keys are missing
- [ ] Translate `common.json` into all 5 non-English locales

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
