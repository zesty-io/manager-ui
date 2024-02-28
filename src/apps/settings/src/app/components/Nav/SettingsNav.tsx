import { useState, useMemo } from "react";
import { useLocation } from "react-router";
import SettingsRoundedIcon from "@mui/icons-material/SettingsRounded";
import FormatSizeRoundedIcon from "@mui/icons-material/FormatSizeRounded";
import LanguageRoundedIcon from "@mui/icons-material/LanguageRounded";
import PaletteRoundedIcon from "@mui/icons-material/PaletteRounded";
import { Typography, Box, Stack } from "@mui/material";
import { startCase } from "lodash";

import { AppSideBar } from "../../../../../../shell/components/AppSidebar";
import { NavTree, TreeItem } from "../../../../../../shell/components/NavTree";
import {
  useGetInstanceSettingsQuery,
  useGetInstanceStylesCategoriesQuery,
} from "../../../../../../shell/services/instance";
import noSearchResults from "../../../../../../../public/images/noSearchResults.svg";

const FONTS_CAT: TreeItem[] = [
  {
    label: "Installed fonts",
    path: "/settings/fonts/installed",
    icon: FormatSizeRoundedIcon,
    children: [],
  },
  {
    label: "Browse fonts",
    path: "/settings/fonts/browse",
    icon: FormatSizeRoundedIcon,
    children: [],
  },
];
const GLOBAL_META_CAT: TreeItem[] = [
  {
    label: "Head Tags",
    path: "/settings/head",
    icon: LanguageRoundedIcon,
    children: [],
  },
  {
    label: "Robots.txt",
    path: "/settings/robots",
    icon: LanguageRoundedIcon,
    children: [],
  },
];

export const SettingsNav = () => {
  const location = useLocation();
  const [keyword, setKeyword] = useState("");

  const { data: rawInstanceSettings } = useGetInstanceSettingsQuery();
  const { data: instanceStylesCategories } =
    useGetInstanceStylesCategoriesQuery();

  const instanceSettings: TreeItem[] = useMemo(() => {
    if (rawInstanceSettings?.length) {
      const categories: Set<string> = new Set();

      rawInstanceSettings.forEach((setting) =>
        categories.add(setting.category)
      );

      const instancecSettingsCategories = Array.from(categories)?.map(
        (category) => ({
          label: startCase(category.replace(/_|-/g, " ")),
          path: `/settings/instance/${category}`,
          icon: SettingsRoundedIcon,
          children: [],
        })
      );

      instancecSettingsCategories.push({
        label: "Bynder",
        path: "/settings/instance/bynder",
        icon: SettingsRoundedIcon,
        children: [],
      });

      return instancecSettingsCategories;
    }

    return [];
  }, [rawInstanceSettings]);

  const styleSettings: TreeItem[] = useMemo(() => {
    if (instanceStylesCategories?.length) {
      return [...instanceStylesCategories]
        .sort((a, b) => (a.sort > b.sort ? 1 : -1))
        .map((setting) => ({
          label: setting.name,
          path: `/settings/styles/${setting.ID}`,
          icon: PaletteRoundedIcon,
          children: [],
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
      meta: GLOBAL_META_CAT,
      styles: styleSettings,
      fonts: FONTS_CAT,
    };
  }, [keyword, instanceSettings, styleSettings]);

  return (
    <AppSideBar
      data-cy="SettingsNav"
      headerTitle="Settings"
      mode="dark"
      searchPlaceholder="Filter Settings"
      withTitleButton={false}
      onFilterChange={(keyword) => setKeyword(keyword.toLowerCase())}
    >
      {keyword &&
      !navItems.fonts?.length &&
      !navItems.instance?.length &&
      !navItems.meta?.length &&
      !navItems.styles?.length ? (
        <Stack gap={1.5} alignItems="center">
          <Box
            component="img"
            src={noSearchResults}
            height={64}
            width={70}
            alt="No Search Results"
          />
          <Typography variant="body2" color="grey.400">
            No results for "{keyword}"
          </Typography>
        </Stack>
      ) : (
        <>
          <NavTree
            id="InstanceSettingsTree"
            HeaderComponent={<HeaderComponent title="Instance Settings" />}
            tree={navItems.instance}
            selected={location.pathname}
          />
          <Box pt={1.5}>
            <NavTree
              id="MetaTree"
              HeaderComponent={<HeaderComponent title="Global Meta & SEO" />}
              tree={navItems.meta}
              selected={location.pathname}
            />
          </Box>
          <Box pt={1.5}>
            <NavTree
              id="StylesTree"
              HeaderComponent={<HeaderComponent title="Styles" />}
              tree={navItems.styles}
              selected={location.pathname}
            />
          </Box>
          <Box pt={1.5}>
            <NavTree
              id="FontsTree"
              HeaderComponent={<HeaderComponent title="Fonts" />}
              tree={navItems.fonts}
              selected={location.pathname}
            />
          </Box>
        </>
      )}
    </AppSideBar>
  );
};

type HeaderComponentProps = {
  title: string;
};
const HeaderComponent = ({ title }: HeaderComponentProps) => {
  return (
    <Typography
      variant="body2"
      textTransform="uppercase"
      color="text.secondary"
      sx={{ px: 1.5 }}
    >
      {title}
    </Typography>
  );
};
