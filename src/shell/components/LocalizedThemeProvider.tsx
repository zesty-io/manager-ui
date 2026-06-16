import { ReactNode, useMemo } from "react";
import { ThemeProvider } from "@mui/material/styles";
import type { Theme } from "@mui/material/styles";
import { useTranslation } from "react-i18next";

import { localizeTheme } from "../i18n/mui-locale";

type LocalizedThemeProviderProps = {
  baseTheme: Theme;
  children: ReactNode;
};

/**
 * The reactive trigger for MUI component-chrome localization. The app theme is
 * built once at boot (src/shell/index.js) and is otherwise inert to language
 * changes; this provider rebuilds it whenever the active locale changes.
 *
 * `useTranslation()` re-renders on i18next's `languageChanged` event, so a
 * `LocaleSwitcher` change flows straight through here: the memo re-runs keyed
 * on `i18n.language`, `localizeTheme` re-merges the MUI core/grid/picker locale
 * bundles, and every Autocomplete / DataGrid / picker beneath re-renders
 * localized — without any per-component wiring.
 *
 * The i18next dependency is deliberately kept in the app (not in
 * `@zesty-io/material`): the design system stays i18next-free and exposes only
 * the pure `localizeTheme(theme, tag)` resolver this component calls.
 */
export const LocalizedThemeProvider = ({
  baseTheme,
  children,
}: LocalizedThemeProviderProps) => {
  const { i18n } = useTranslation();

  const localizedTheme = useMemo(
    () => localizeTheme(baseTheme, i18n.language),
    [baseTheme, i18n.language]
  );

  return <ThemeProvider theme={localizedTheme}>{children}</ThemeProvider>;
};
