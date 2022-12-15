import { memo } from "react";
import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import { Link } from "react-router-dom";
import cx from "classnames";

import { Typography, ListItem, ListItemIcon } from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEdit,
  faImage,
  faAddressCard,
  faDatabase,
  faChartLine,
  faCog,
  faBullseye,
  faCode,
  faRocket,
  faHome,
} from "@fortawesome/free-solid-svg-icons";
import RocketLaunchIcon from "@mui/icons-material/RocketLaunch";
import EditIcon from "@mui/icons-material/Edit";
import ImageIcon from "@mui/icons-material/Image";
import CodeIcon from "@mui/icons-material/Code";
import RecentActorsIcon from "@mui/icons-material/RecentActors";
import RecommendIcon from "@mui/icons-material/Recommend";
import BarChartIcon from "@mui/icons-material/BarChart";
import ExtensionIcon from "@mui/icons-material/Extension";
import SettingsIcon from "@mui/icons-material/Settings";
import StorageIcon from "@mui/icons-material/Storage";

import styles from "./styles.less";
export default memo(function GlobalMenu() {
  const location = useLocation();
  const openNav = useSelector((state) => state.ui.openNav);
  const products = useSelector((state) => state.products);

  const slug = location.pathname.split("/")[1];
  const icons = {
    home: RocketLaunchIcon,
    content: EditIcon,
    media: ImageIcon,
    schema: StorageIcon,
    code: CodeIcon,
    leads: RecentActorsIcon,
    reports: BarChartIcon,
    seo: RecommendIcon,
    settings: SettingsIcon,
    release: RocketLaunchIcon,
  };

  const MenuItemIcon = ({ product }) => {
    const SpecificIcon = icons[product];
    return (
      <ListItemIcon>
        <SpecificIcon sx={{ color: "grey.500" }} />
      </ListItemIcon>
    );
  };

  return (
    <menu className={cx(styles.GlobalMenu, openNav ? null : styles.Closed)}>
      {products.map((product) => {
        // Covert dashes to spaces
        // Uppercase first letter of word
        let name = product
          .split("-")
          .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
          .join(" ");

        if (product === "seo") {
          name = name.toUpperCase();
        }

        return (
          <ListItem sx={{ p: 0 }}>
            <Link
              key={product}
              className={cx(
                styles.SubAppLink,
                slug === product ? styles.current : null
              )}
              to={`/${product}`}
              title={`${name} App`}
            >
              <MenuItemIcon product={product} />

              {openNav && (
                <Typography variant="body3" sx={{ color: "grey.500" }}>
                  {name}
                </Typography>
              )}
            </Link>
          </ListItem>
        );
      })}
    </menu>
  );
});
