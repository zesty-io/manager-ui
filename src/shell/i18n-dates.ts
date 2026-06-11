import type { Locale } from "date-fns";
import {
  format as dateFnsFormat,
  formatDistanceToNow as dateFnsFormatDistanceToNow,
} from "date-fns";
import { enUS, es, hi, zhCN, ru, nl } from "date-fns/locale";

import i18n from "./i18n";
import type { SupportedLocale } from "./i18n";

// Maps each supported app locale (BCP 47 tag) to its date-fns locale, used as
// `adapterLocale` on MUI X date pickers so calendar internals (weekday/month
// names) localize with the UI.
//
// Typed as Record<SupportedLocale, Locale>: adding a tag to SUPPORTED_LOCALES
// in i18n.ts without a matching entry here is a compile error, so this can
// never silently drift behind the supported-locale list.
//
// date-fns locales are imported individually (per-locale) so only the ones we
// ship are bundled. When adding a new locale: add its import above and one
// entry here.
const DATE_FNS_LOCALES: Record<SupportedLocale, Locale> = {
  "en-US": enUS,
  "es-ES": es,
  "hi-IN": hi,
  "zh-CN": zhCN,
  "ru-RU": ru,
  "nl-NL": nl,
};

/**
 * Resolve a date-fns Locale for an i18next language tag. Falls back to en-US
 * for any unmapped tag so date rendering never breaks if a locale is added to
 * i18next before this map (degrades to English dates rather than crashing).
 */
export const getDateFnsLocale = (tag: string | undefined): Locale =>
  DATE_FNS_LOCALES[tag as SupportedLocale] ?? enUS;

export const formatLocalized = (
  date: Date | number,
  formatStr: string,
  options?: Omit<NonNullable<Parameters<typeof dateFnsFormat>[2]>, "locale">
): string =>
  dateFnsFormat(date, formatStr, {
    ...options,
    locale: getDateFnsLocale(i18n.language),
  });

export const formatDistanceToNowLocalized = (
  date: Date | number,
  options?: Omit<
    NonNullable<Parameters<typeof dateFnsFormatDistanceToNow>[1]>,
    "locale"
  >
): string =>
  dateFnsFormatDistanceToNow(date, {
    ...options,
    locale: getDateFnsLocale(i18n.language),
  });
