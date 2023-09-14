import { useState, useEffect, FC, useMemo } from "react";
import { connect } from "react-redux";
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
      return instanceStylesCategories.map((setting) => ({
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
    >
      <NavTree
        id="InstanceSettingsTree"
        HeaderComponent={<HeaderComponent title="Instance Settings" />}
        tree={instanceSettings}
        selected={location.pathname}
      />
      <Box pt={1.5}>
        <NavTree
          id="MetaTree"
          HeaderComponent={<HeaderComponent title="Global Meta & SEO" />}
          tree={GLOBAL_META_CAT}
          selected={location.pathname}
        />
      </Box>
      <Box pt={1.5}>
        <NavTree
          id="StylesTree"
          HeaderComponent={<HeaderComponent title="Styles" />}
          tree={styleSettings}
          selected={location.pathname}
        />
      </Box>
      <Box pt={1.5}>
        <NavTree
          id="FontsTree"
          HeaderComponent={<HeaderComponent title="Fonts" />}
          tree={FONTS_CAT}
          selected={location.pathname}
        />
      </Box>
    </AppSideBar>
  );
};

interface HeaderComponentProps {
  title: string;
}
const HeaderComponent: FC<HeaderComponentProps> = ({ title }) => {
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
// export default connect((state) => {
//   return {
//     instanceNav: state.settings.catInstance,
//     stylesNav: state.settings.catStyles,
//     fontsNav: state.settings.catFonts,
//   };
// })(function SettingsNav(props) {
//   const location = useLocation();
//   const [selected, setSelected] = useState(location.pathname);
//   useEffect(() => {
//     setSelected(location.pathname);
//   }, [location]);

//   const tree = [
//     {
//       label: "WebEngine",
//       children: props.instanceNav,
//       path: "#",
//       icon: faGlobe,
//     },
//   ];
//   const treeGlobal = [
//     {
//       label: "Head Tags",
//       path: "/settings/head",
//       icon: faCode,
//     },
//     {
//       label: "Robots.txt",
//       path: "/settings/robots",
//       icon: faFileAlt,
//     },
//   ];
//   const treeAlt = [
//     {
//       label: "Styles",
//       children: props.stylesNav,
//       path: "#",
//       icon: faPenFancy,
//     },

//     {
//       label: "Fonts",
//       children: props.fontsNav,
//       path: "#",
//       icon: faFont,
//     },
//   ];
//   return (
//     <nav className={cx(styles.SettingsNav)} data-cy="SettingsNav">
//       <h1 className={styles.NavTitle}>Instance Settings</h1>
//       <div className={styles.ModelList}>
//         <Nav
//           className={styles.PageSets}
//           id="settings"
//           lightMode="true"
//           name="settings"
//           selected={selected}
//           tree={tree}
//         />
//         <h1 className={styles.NavTitle}>WebEngine Global</h1>
//         <Nav
//           className={styles.PageSets}
//           id="settings2"
//           lightMode="true"
//           name="settings2"
//           selected={selected}
//           tree={treeGlobal}
//         />
//         <h1 className={styles.NavTitle}>WebEngine Styles &amp; Fonts</h1>
//         <Nav
//           className={styles.PageSets}
//           id="settings3"
//           lightMode="true"
//           name="settings3"
//           selected={selected}
//           tree={treeAlt}
//         />
//       </div>
//     </nav>
//   );
// });
