import { useEffect, useState } from "react";
import { Button, Menu, MenuItem, Box, Tooltip } from "@mui/material";
import { KeyboardArrowDownRounded } from "@mui/icons-material";
import { Flag, getCountryCode } from "../Flag";

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
  const [activeLocale, setActiveLocale] = useState<Locale>(LOCALES[0]);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  useEffect(() => {
    document.documentElement.lang = activeLocale.tag;
  }, [activeLocale.tag]);

  const handleSelect = (locale: Locale) => {
    setActiveLocale(locale);
    setAnchorEl(null);
  };

  return (
    <>
      <Tooltip
        title="Switch UI Language"
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
