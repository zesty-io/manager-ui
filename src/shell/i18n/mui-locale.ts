import { createTheme } from "@mui/material/styles";
import type { Theme } from "@mui/material/styles";
import { enUS, esES, hiIN, zhCN, ruRU, nlNL } from "@mui/material/locale";
import type { Localization } from "@mui/material/locale";

import type { SupportedLocale } from "./index";
import { getDataGridLocaleText } from "./datagrid";
import { getDatePickersLocaleText } from "./datepickers";

// MUI *core* component chrome (Autocomplete "No options"/"Loading…",
// TablePagination, Dialog close aria, Alert, Breadcrumbs, Pagination) is
// localized through the theme: each `@mui/material/locale` bundle is a theme
// fragment that createTheme deep-merges. Unlike MUI X, core ships all 6 of our
// locales including Hindi, so no hand-authored bundle is needed here.
const MUI_CORE_LOCALES: Record<SupportedLocale, Localization> = {
  "en-US": enUS,
  "es-ES": esES,
  "hi-IN": hiIN,
  "zh-CN": zhCN,
  "ru-RU": ruRU,
  "nl-NL": nlNL,
};

/**
 * Resolve the `@mui/material/locale` bundle for a language tag, defaulting to
 * en-US for any unmapped tag so core chrome always has a valid (English)
 * bundle.
 */
export const getMuiCoreLocale = (tag: string | undefined): Localization =>
  MUI_CORE_LOCALES[tag as SupportedLocale] ?? enUS;

/**
 * Return a theme localized for `tag`, layering three MUI localization systems
 * onto `baseTheme`:
 *
 * 1. MUI core — the `@mui/material/locale` bundle (deep-merged as-is).
 * 2. MUI X Data Grid — `localeText` set as `MuiDataGrid` default props.
 * 3. MUI X Date Pickers — `localeText` set as `MuiLocalizationProvider` default
 *    props.
 *
 * Setting the grid/picker `localeText` as theme `defaultProps` means *every*
 * grid and picker under the provider inherits localization automatically — no
 * per-instance `localeText` prop. For en-US (and any unmapped tag) the grid/
 * picker resolvers return `undefined`, leaving MUI's built-in English strings.
 *
 * This is the helper intended to move to `@zesty-io/material` (tag in, theme
 * out, i18next-free); the reactive trigger that calls it stays in manager-ui
 * (see LocalizedThemeProvider).
 */
export const localizeTheme = (
  baseTheme: Theme,
  tag: string | undefined
): Theme =>
  createTheme(
    baseTheme,
    getMuiCoreLocale(tag),
    {
      components: {
        MuiDataGrid: {
          defaultProps: { localeText: getDataGridLocaleText(tag) },
        },
      },
    },
    {
      components: {
        MuiLocalizationProvider: {
          defaultProps: { localeText: getDatePickersLocaleText(tag) },
        },
      },
    }
  );
