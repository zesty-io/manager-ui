import { createTheme } from "@mui/material/styles";
import type { Theme } from "@mui/material/styles";
import {
  enUS as coreEnUS,
  esES as coreEsES,
  hiIN as coreHiIN,
  zhCN as coreZhCN,
  ruRU as coreRuRU,
  nlNL as coreNlNL,
} from "@mui/material/locale";
import {
  enUS as dataGridEnUS,
  esES as dataGridEsES,
  zhCN as dataGridZhCN,
  ruRU as dataGridRuRU,
  nlNL as dataGridNlNL,
} from "@mui/x-data-grid-pro/locales";
import {
  enUS as datePickersEnUS,
  esES as datePickersEsES,
  zhCN as datePickersZhCN,
  ruRU as datePickersRuRU,
  nlNL as datePickersNlNL,
} from "@mui/x-date-pickers-pro/locales";

// Named imports (not `import * as`) so webpack only bundles the locales this
// app actually supports (see SUPPORTED_LOCALES in shell/i18n/index.ts)
// instead of every locale MUI ships across all three packages.
const muiCoreLocales = {
  enUS: coreEnUS,
  esES: coreEsES,
  hiIN: coreHiIN,
  zhCN: coreZhCN,
  ruRU: coreRuRU,
  nlNL: coreNlNL,
};

// hi-IN has no upstream Data Grid / Date Pickers translations (same gap
// noted in CLAUDE.md's i18n section) -- omitted here, so lookups fall
// through to the `|| {}` below and MUI's built-in English defaults apply.
const dataGridLocales = {
  enUS: dataGridEnUS,
  esES: dataGridEsES,
  zhCN: dataGridZhCN,
  ruRU: dataGridRuRU,
  nlNL: dataGridNlNL,
};

const datePickersLocales = {
  enUS: datePickersEnUS,
  esES: datePickersEsES,
  zhCN: datePickersZhCN,
  ruRU: datePickersRuRU,
  nlNL: datePickersNlNL,
};

// Valid MUI locale strings for the locales this app currently supports.
export type MuiLocaleString = keyof typeof muiCoreLocales;

/**
 * Apply MUI locale bundles onto a base theme for the given MUI locale string
 * (e.g. "esES"). Covers MUI core, Data Grid, and Date Pickers.
 *
 * Every locale is resolved dynamically against MUI's own bundles — no
 * hand-authored overrides. Each bundle is already shaped as a theme override
 * (e.g. `{ components: { MuiDataGrid: { defaultProps: { localeText } } } }`),
 * so they're passed straight through to createTheme, which merges them onto
 * the theme. Locales unsupported by a given package resolve to `{}` (a
 * no-op merge for createTheme), falling back to that package's built-in
 * English defaults.
 *
 * The consuming app is responsible for converting its active language tag
 * (e.g. "es-ES") to the MUI locale string (e.g. "esES") before calling this.
 * Unmapped or undefined locales fall back to English.
 */
export const localizeTheme = (
  baseTheme: Theme,
  locale: string | undefined
): Theme =>
  createTheme(
    baseTheme,
    (locale
      ? muiCoreLocales[locale as keyof typeof muiCoreLocales]
      : undefined) ?? coreEnUS,
    (locale && dataGridLocales[locale as keyof typeof dataGridLocales]) || {},
    (locale && datePickersLocales[locale as keyof typeof datePickersLocales]) ||
      {}
  );
