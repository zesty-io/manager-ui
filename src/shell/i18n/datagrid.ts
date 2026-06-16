import type { GridLocaleText } from "@mui/x-data-grid-pro";
import { esES, zhCN, ruRU, nlNL } from "@mui/x-data-grid-pro/locales";

import type { SupportedLocale } from "./index";
import { hiIN } from "./datagrid-locales/hi-IN";

// Maps each supported app locale (BCP 47 tag) to the MUI X Data Grid
// `localeText` bundle, used as the `localeText` prop so grid chrome (column
// menu items, header tooltips, no-rows/footer labels) localizes with the UI.
//
// MUI X is a separate localization system from i18next — our t() calls only
// cover headerName/cell content, not the grid's built-in strings.
//
// es/zh/ru/nl come from MUI X's shipped bundles; MUI X ships no Hindi (hi-IN)
// Data Grid locale, so we supply our own bundle from ./datagrid-locales/hi-IN.
// Any tag not in this map falls through to the grid's built-in English
// localeText (see getDataGridLocaleText), degrading gracefully rather than
// crashing — the same approach as getDateFnsLocale in ./dates.
const DATA_GRID_LOCALES: Partial<
  Record<SupportedLocale, Partial<GridLocaleText>>
> = {
  "es-ES": esES.components.MuiDataGrid.defaultProps.localeText,
  "zh-CN": zhCN.components.MuiDataGrid.defaultProps.localeText,
  "ru-RU": ruRU.components.MuiDataGrid.defaultProps.localeText,
  "nl-NL": nlNL.components.MuiDataGrid.defaultProps.localeText,
  "hi-IN": hiIN,
};

/**
 * Resolve the MUI X Data Grid `localeText` for an i18next language tag.
 * Returns `undefined` for en-US (and any unmapped tag) so the grid uses its
 * built-in English strings.
 */
export const getDataGridLocaleText = (
  tag: string | undefined
): Partial<GridLocaleText> | undefined =>
  DATA_GRID_LOCALES[tag as SupportedLocale];
