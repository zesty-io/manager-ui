import { useState, useMemo, memo } from "react";
import { useLocation } from "react-router";
import SettingsRoundedIcon from "@mui/icons-material/SettingsRounded";
import FormatSizeRoundedIcon from "@mui/icons-material/FormatSizeRounded";
import LanguageRoundedIcon from "@mui/icons-material/LanguageRounded";
import PaletteRoundedIcon from "@mui/icons-material/PaletteRounded";
import { Typography, Box, Stack } from "@mui/material";
import { startCase } from "lodash";
import { useTranslation } from "react-i18next";

import { AppSideBar } from "../../../../../../shell/components/AppSidebar";
import { NavTree, TreeItem } from "../../../../../../shell/components/NavTree";
import {
  useGetInstanceSettingsQuery,
  useGetInstanceStylesCategoriesQuery,
} from "../../../../../../shell/services/instance";
import noSearchResults from "../../../../../../../public/images/noSearchResults.svg";

// Maps a raw instance-settings `category` value to its settings.json i18n key.
// "Proxy" and "proxy" both resolve through the lowercase "proxy" entry since
// they're the same category with a casing mismatch in the source data.
const CATEGORY_TRANSLATION_KEYS: Record<string, string> = {
  Exporter: "categoryExporter",
  "For Custom Endpoint ": "categoryForCustomEndpoint",
  Overrides: "categoryOverrides",
  proxy: "categoryProxy",
  analytics: "categoryAnalytics",
  blog: "categoryBlog",
  bynder: "categoryBynder",
  "contact-form": "categoryContactForm",
  custom: "categoryCustom",
  developer: "categoryDeveloper",
  extensions: "categoryExtensions",
  general: "categoryGeneral",
  groupby: "categoryGroupby",
  i18n: "categoryI18n",
  integrations: "categoryIntegrations",
  "logo-section": "categoryLogoSection",
  logosection: "categoryLogosection",
  petdesk: "categoryPetdesk",
  routing: "categoryRouting",
  security: "categorySecurity",
  seo: "categorySeo",
  sitelink: "categorySitelink",
  "social-links": "categorySocialLinks",
  stripe: "categoryStripe",
  tag_managers: "categoryTagManagers",
  twitter: "categoryTwitter",
  ups: "categoryUps",
  verification: "categoryVerification",
  youtube: "categoryYoutube",
};

// Translates a raw `category` value for display, falling back to the existing
// startCase behavior for any category that hasn't been added to the map above.
const getCategoryLabel = (
  category: string,
  t: (key: string) => string
): string => {
  const i18nKey = CATEGORY_TRANSLATION_KEYS[category];
  return i18nKey
    ? t(`settings.${i18nKey}`)
    : startCase(category.replace(/_|-/g, " "));
};

const getFontsCat = (t: (key: string) => string): TreeItem[] => [
  {
    label: t("settings.navFontsInstalled"),
    path: "/settings/fonts/installed",
    icon: FormatSizeRoundedIcon,
    children: [],
  },
  {
    label: t("settings.navFontsBrowse"),
    path: "/settings/fonts/browse",
    icon: FormatSizeRoundedIcon,
    children: [],
  },
];

const getGlobalMetaCat = (t: (key: string) => string): TreeItem[] => [
  {
    label: t("settings.navHeadTags"),
    path: "/settings/head",
    icon: LanguageRoundedIcon,
    children: [],
  },
  {
    label: t("settings.navRobotsTxt"),
    path: "/settings/robots",
    icon: LanguageRoundedIcon,
    children: [],
  },
];

const getUserSettingsCat = (t: (key: string) => string): TreeItem[] => [
  {
    label: t("settings.navWorkflows"),
    path: "/settings/user/workflows",
    icon: LanguageRoundedIcon,
    children: [],
  },
];

export const SettingsNav = memo(() => {
  const location = useLocation();
  const [keyword, setKeyword] = useState("");
  const { t } = useTranslation();

  const FONTS_CAT = getFontsCat(t);
  const GLOBAL_META_CAT = getGlobalMetaCat(t);
  const USER_SETTINGS_CAT = getUserSettingsCat(t);

  const { data: rawInstanceSettings, isLoading: isLoadingInstanceSettings } =
    useGetInstanceSettingsQuery();
  const {
    data: instanceStylesCategories,
    isLoading: isLoadingInstanceStylesCategories,
  } = useGetInstanceStylesCategoriesQuery();

  const instanceSettings: TreeItem[] = useMemo(() => {
    if (rawInstanceSettings?.length) {
      const categories: Set<string> = new Set();

      rawInstanceSettings.forEach((setting) =>
        categories.add(setting.category)
      );

      const instanceSettingsCategories = Array.from(categories)?.map(
        (category) => ({
          label: getCategoryLabel(category, t),
          path: `/settings/instance/${category}`,
          icon: SettingsRoundedIcon,
          children: [] as TreeItem[],
        })
      );

      // Makes sure that the Bynder settings item is present if the user hasn't added any Bynder integration setting yet
      const bynderLabel = t("settings.categoryBynder");
      if (
        !instanceSettingsCategories.find(
          (category) => category.label === bynderLabel
        )
      ) {
        instanceSettingsCategories.push({
          label: bynderLabel,
          path: "/settings/instance/bynder",
          icon: SettingsRoundedIcon,
          children: [] as TreeItem[],
        });
      }

      return instanceSettingsCategories;
    }

    return [];
  }, [rawInstanceSettings, t]);

  const styleSettings: TreeItem[] = useMemo(() => {
    if (instanceStylesCategories?.length) {
      return [...instanceStylesCategories]
        .sort((a, b) => (a.sort > b.sort ? 1 : -1))
        .map((setting) => ({
          label: setting.name,
          path: `/settings/styles/${setting.ID}`,
          icon: PaletteRoundedIcon,
          children: [] as TreeItem[],
        }));
    }

    return [];
  }, [instanceStylesCategories]);

  const navItems = useMemo(() => {
    if (keyword) {
      return {
        instance: instanceSettings?.filter((setting) =>
          setting.label.toLowerCase().includes(keyword)
        ),
        user: USER_SETTINGS_CAT?.filter((setting) =>
          setting.label.toLowerCase().includes(keyword)
        ),
        meta: GLOBAL_META_CAT?.filter((setting) =>
          setting.label.toLowerCase().includes(keyword)
        ),
        styles: styleSettings?.filter((setting) =>
          setting.label.toLowerCase().includes(keyword)
        ),
        fonts: FONTS_CAT?.filter((setting) =>
          setting.label.toLowerCase().includes(keyword)
        ),
      };
    }

    return {
      instance: instanceSettings,
      user: USER_SETTINGS_CAT,
      meta: GLOBAL_META_CAT,
      styles: styleSettings,
      fonts: FONTS_CAT,
    };
  }, [
    keyword,
    instanceSettings,
    styleSettings,
    FONTS_CAT,
    GLOBAL_META_CAT,
    USER_SETTINGS_CAT,
  ]);

  return (
    <AppSideBar
      data-cy="SettingsNav"
      headerTitle={t("shell.navSettings")}
      mode="dark"
      searchPlaceholder={t("settings.filterSettings")}
      withTitleButton={false}
      onFilterChange={(keyword) => setKeyword(keyword.toLowerCase())}
    >
      {keyword &&
      !navItems.fonts?.length &&
      !navItems.user?.length &&
      !navItems.instance?.length &&
      !navItems.meta?.length &&
      !navItems.styles?.length ? (
        <Stack gap={1.5} alignItems="center">
          <Box
            component="img"
            src={noSearchResults}
            height={64}
            width={70}
            alt={t("settings.noSearchResultsAlt")}
          />
          <Typography variant="body2" color="grey.400">
            {t("settings.noResultsFor", { keyword })}
          </Typography>
        </Stack>
      ) : (
        <>
          <NavTree
            id="InstanceSettingsTree"
            HeaderComponent={
              <HeaderComponent title={t("settings.sectionInstanceSettings")} />
            }
            tree={navItems.instance}
            selected={location.pathname}
            isLoading={
              isLoadingInstanceSettings || isLoadingInstanceStylesCategories
            }
          />
          <Box pt={1.5}>
            <NavTree
              id="UserTree"
              HeaderComponent={
                <HeaderComponent title={t("settings.sectionUserSettings")} />
              }
              tree={navItems.user}
              selected={location.pathname}
            />
          </Box>
          <Box pt={1.5}>
            <NavTree
              id="MetaTree"
              HeaderComponent={
                <HeaderComponent title={t("settings.sectionGlobalMetaSeo")} />
              }
              tree={navItems.meta}
              selected={location.pathname}
              isLoading={
                isLoadingInstanceSettings || isLoadingInstanceStylesCategories
              }
            />
          </Box>
          <Box pt={1.5}>
            <NavTree
              id="StylesTree"
              HeaderComponent={
                <HeaderComponent title={t("settings.sectionStyles")} />
              }
              tree={navItems.styles}
              selected={location.pathname}
              isLoading={
                isLoadingInstanceSettings || isLoadingInstanceStylesCategories
              }
            />
          </Box>
          <Box pt={1.5}>
            <NavTree
              id="FontsTree"
              HeaderComponent={
                <HeaderComponent title={t("settings.sectionFonts")} />
              }
              tree={navItems.fonts}
              selected={location.pathname}
              isLoading={
                isLoadingInstanceSettings || isLoadingInstanceStylesCategories
              }
            />
          </Box>
        </>
      )}
    </AppSideBar>
  );
});

SettingsNav.displayName = "SettingsNav";

type HeaderComponentProps = {
  title: string;
};
const HeaderComponent = ({ title }: HeaderComponentProps) => {
  return (
    <Typography
      variant="body2"
      textTransform="uppercase"
      color="text.secondary"
      sx={{ px: 1.5, pb: 1.5 }}
    >
      {title}
    </Typography>
  );
};
