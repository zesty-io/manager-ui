import { useState, useEffect, FC, useMemo } from "react";
import { useLocation } from "react-router";
import SettingsRoundedIcon from "@mui/icons-material/SettingsRounded";
import FormatSizeRoundedIcon from "@mui/icons-material/FormatSizeRounded";
import LanguageRoundedIcon from "@mui/icons-material/LanguageRounded";
import PaletteRoundedIcon from "@mui/icons-material/PaletteRounded";
import { Typography, Box } from "@mui/material";
import { startCase } from "lodash";

import { AppSideBar } from "../../../../../../shell/components/AppSidebar";
import { NavTree, TreeItem } from "../../../../../../shell/components/NavTree";
import {
  useGetInstanceSettingsQuery,
  useGetInstanceStylesCategoriesQuery,
} from "../../../../../../shell/services/instance";

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

      return Array.from(categories)?.map((category) => ({
        label: startCase(category.replace(/_|-/g, " ")),
        path: `/settings/instance/${category}`,
        icon: SettingsRoundedIcon,
        children: [],
      }));
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

  return (
    <AppSideBar
      data-cy="SettingsNav"
      headerTitle="Settings"
      mode="dark"
      searchPlaceholder="Filter Settings"
      withTitleButton={false}
      onFilterChange={(keyword) => setKeyword(keyword.toLowerCase())}
    >
      <NavTree
        id="InstanceSettingsTree"
        HeaderComponent={<HeaderComponent title="Instance Settings" />}
        tree={
          keyword
            ? instanceSettings?.filter((setting) =>
                setting.label.toLowerCase().includes(keyword)
              )
            : instanceSettings
        }
        selected={location.pathname}
      />
      <Box pt={1.5}>
        <NavTree
          id="MetaTree"
          HeaderComponent={<HeaderComponent title="Global Meta & SEO" />}
          tree={
            keyword
              ? GLOBAL_META_CAT?.filter((setting) =>
                  setting.label.toLowerCase().includes(keyword)
                )
              : GLOBAL_META_CAT
          }
          selected={location.pathname}
        />
      </Box>
      <Box pt={1.5}>
        <NavTree
          id="StylesTree"
          HeaderComponent={<HeaderComponent title="Styles" />}
          tree={
            keyword
              ? styleSettings?.filter((setting) =>
                  setting.label.toLowerCase().includes(keyword)
                )
              : styleSettings
          }
          selected={location.pathname}
        />
      </Box>
      <Box pt={1.5}>
        <NavTree
          id="FontsTree"
          HeaderComponent={<HeaderComponent title="Fonts" />}
          tree={
            keyword
              ? FONTS_CAT?.filter((setting) =>
                  setting.label.toLowerCase().includes(keyword)
                )
              : FONTS_CAT
          }
          selected={location.pathname}
        />
      </Box>
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
