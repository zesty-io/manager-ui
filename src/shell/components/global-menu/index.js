import { memo } from "react";
import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import { Link } from "react-router-dom";
import cx from "classnames";

import { ListItem, ListItemIcon, Typography } from "@mui/material";
import RocketLaunchIcon from "@mui/icons-material/RocketLaunch";
import EditIcon from "@mui/icons-material/Edit";
import ImageIcon from "@mui/icons-material/Image";
import CodeIcon from "@mui/icons-material/Code";
import RecentActorsIcon from "@mui/icons-material/RecentActors";
import RecommendIcon from "@mui/icons-material/Recommend";
import BarChartIcon from "@mui/icons-material/BarChart";
import SettingsIcon from "@mui/icons-material/Settings";
import { Database } from "@zesty-io/material";

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
    schema: Database,
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
      <ListItemIcon sx={{ minWidth: "36px" }}>
        <SpecificIcon
          sx={{
            color: slug === product ? "primary.main" : "grey.500",
          }}
        />
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
          <Link
            key={product}
            style={{
              textDecoration: "none",
            }}
            to={`/${product}`}
            title={`${name} App`}
          >
            <ListItem
              sx={{
                px: "10px",
                mb: "10px",
                height: "36px",
                borderRadius: "4px",
                backgroundColor: slug === product ? "grey.800" : "transparent",
              }}
            >
              <MenuItemIcon product={product} />

              {openNav && (
                <Typography
                  variant="body2"
                  sx={{
                    color: slug === product ? "common.white" : "grey.500",
                  }}
                >
                  {name}
                </Typography>
              )}
            </ListItem>
          </Link>
        );
      })}
    </menu>
  );
});
