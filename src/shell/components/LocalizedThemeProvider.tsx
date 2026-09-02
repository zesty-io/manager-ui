import { ReactNode, useMemo } from "react";
import { ThemeProvider } from "@mui/material/styles";
import type { Theme } from "@mui/material/styles";
import { useTranslation } from "react-i18next";

import { localizeTheme } from "../i18n/mui-locale";
import type { MuiLocaleString } from "../i18n/mui-locale";
import type { SupportedLocale } from "../i18n";

// Maps app locale tags to MUI locale strings passed to localizeTheme.
// When adding a new locale, verify the MUI string exists as a named export in
// @mui/material/locale (e.g. import { frFR } from "@mui/material/locale") before
// adding it here. An invalid string silently falls back to English in
// shell/i18n/mui-locale.ts.
const MUI_LOCALE: Record<SupportedLocale, MuiLocaleString> = {
  "en-US": "enUS",
  "es-ES": "esES",
  "hi-IN": "hiIN",
  "zh-CN": "zhCN",
  "ru-RU": "ruRU",
  "nl-NL": "nlNL",
};

type LocalizedThemeProviderProps = {
  baseTheme: Theme;
  children: ReactNode;
};

export const LocalizedThemeProvider = ({
  baseTheme,
  children,
}: LocalizedThemeProviderProps) => {
  const { i18n } = useTranslation();

  const localizedTheme = useMemo(
    () =>
      localizeTheme(baseTheme, MUI_LOCALE[i18n.language as SupportedLocale]),
    [baseTheme, i18n.language]
  );

  return <ThemeProvider theme={localizedTheme}>{children}</ThemeProvider>;
};
