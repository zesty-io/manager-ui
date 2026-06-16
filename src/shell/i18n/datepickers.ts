import type { PickersLocaleText } from "@mui/x-date-pickers-pro";
import { esES, zhCN, ruRU, nlNL } from "@mui/x-date-pickers-pro/locales";

import type { SupportedLocale } from "./index";
import { hiIN } from "./datepickers-locales/hi-IN";

// Maps each supported app locale (BCP 47 tag) to the MUI X Date Pickers
// `localeText` bundle, applied as the `MuiLocalizationProvider` default props
// (via localizeTheme in ./mui-locale) so picker chrome — OK/Cancel/Clear/Today
// buttons, toolbar titles, clock/field aria labels — localizes with the UI.
//
// MUI X is a separate localization system from i18next (our t() calls cover
// labels and content, not the picker's built-in strings) and from the date-fns
// calendar adapter (month/day names), which is wired in ./dates.
//
// es/zh/ru/nl come from MUI X's shipped bundles; MUI X ships no Hindi (hi-IN)
// Date Pickers locale, so we supply our own from ./datepickers-locales/hi-IN.
// Any tag not in this map falls through to undefined, leaving the pickers'
// built-in English localeText — degrading gracefully, the same approach as
// getDataGridLocaleText in ./datagrid.
const DATE_PICKERS_LOCALES: Partial<
  Record<SupportedLocale, Partial<PickersLocaleText<any>>>
> = {
  "es-ES": esES.components.MuiLocalizationProvider.defaultProps.localeText,
  "zh-CN": zhCN.components.MuiLocalizationProvider.defaultProps.localeText,
  "ru-RU": ruRU.components.MuiLocalizationProvider.defaultProps.localeText,
  "nl-NL": nlNL.components.MuiLocalizationProvider.defaultProps.localeText,
  "hi-IN": hiIN,
};

/**
 * Resolve the MUI X Date Pickers `localeText` for an i18next language tag.
 * Returns `undefined` for en-US (and any unmapped tag) so the pickers use their
 * built-in English strings.
 */
export const getDatePickersLocaleText = (
  tag: string | undefined
): Partial<PickersLocaleText<any>> | undefined =>
  DATE_PICKERS_LOCALES[tag as SupportedLocale];
