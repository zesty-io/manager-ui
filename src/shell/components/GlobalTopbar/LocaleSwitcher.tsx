import { useState } from "react";
import { Button, Menu, MenuItem, Box, Tooltip } from "@mui/material";

import { KeyboardArrowDownRounded } from "@mui/icons-material";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { Flag, getCountryCode } from "../Flag";
import { useUpdateUserMutation } from "../../services/accounts";
import { AppState } from "../../store/types";

type Locale = {
  tag: string;
  label: string;
};

const LOCALES: Locale[] = [
  { tag: "en-US", label: "English" },
  { tag: "es-ES", label: "Spanish" },
  { tag: "hi-IN", label: "Hindi" },
  { tag: "zh-CN", label: "Mandarin" },
  { tag: "ru-RU", label: "Russian" },
  { tag: "nl-NL", label: "Dutch" },
];

export const LocaleSwitcher = () => {
  const { t, i18n } = useTranslation();
  const activeLocale =
    LOCALES.find((l) => l.tag === i18n.language) ?? LOCALES[0];
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const user = useSelector((state: AppState) => state.user);
  const [updateUser] = useUpdateUserMutation();

  const handleSelect = (locale: Locale) => {
    i18n.changeLanguage(locale.tag);
    localStorage.setItem("app_locale", locale.tag);
    document.documentElement.lang = locale.tag;

    const existingPrefs = user.prefs ? JSON.parse(user.prefs) : {};
    updateUser({
      userZUID: user.ZUID,
      firstName: user.firstName,
      lastName: user.lastName,
      prefs: JSON.stringify({ ...existingPrefs, locale: locale.tag }),
    });

    setAnchorEl(null);
  };

  return (
    <>
      <Tooltip
        title={t("shell.switchUiLanguage")}
        enterDelay={1000}
        enterNextDelay={1000}
        placement="top-start"
      >
        <Button
          sx={{
            color: "text.disabled",
            minWidth: "unset",
            padding: "2px 4px",
            whiteSpace: "nowrap",
            " .MuiButton-endIcon": {
              marginLeft: "4px",
            },
          }}
          color="inherit"
          endIcon={<KeyboardArrowDownRounded color="action" />}
          onClick={(e) => setAnchorEl(e.currentTarget)}
          data-cy="locale-switcher"
        >
          <Box component="span" color="text.primary">
            <Flag countryCode={getCountryCode(activeLocale.tag)} />
          </Box>{" "}
          {activeLocale.tag.split("-")[0].toUpperCase()} (
          {getCountryCode(activeLocale.tag)})
        </Button>
      </Tooltip>
      <Menu
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: -10,
          horizontal: "right",
        }}
        anchorEl={anchorEl}
        open={!!anchorEl}
        PaperProps={{
          sx: {
            boxShadow: (theme) => theme.shadows[8],
            width: "280px",
          },
        }}
      >
        {LOCALES.map((locale) => (
          <MenuItem
            key={locale.tag}
            onClick={() => handleSelect(locale)}
            selected={locale.tag === activeLocale.tag}
          >
            <Box component="span" mr={1}>
              <Flag countryCode={getCountryCode(locale.tag)} />
            </Box>
            {locale.label} ({locale.tag})
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};
