import { memo } from "react";
import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import { Link } from "react-router-dom";

import { ListItem, ListItemIcon, ListItemText, Box } from "@mui/material";
import RocketLaunchIcon from "@mui/icons-material/RocketLaunch";
import EditIcon from "@mui/icons-material/Edit";
import ImageIcon from "@mui/icons-material/Image";
import CodeIcon from "@mui/icons-material/Code";
import RecentActorsIcon from "@mui/icons-material/RecentActors";
import BarChartIcon from "@mui/icons-material/BarChart";
import SettingsIcon from "@mui/icons-material/Settings";
import ExtensionIcon from "@mui/icons-material/Extension";
import ShuffleRoundedIcon from "@mui/icons-material/ShuffleRounded";
import { Database } from "@zesty-io/material";

import { AppState } from "../../store/types";
import { Products } from "../../services/types";

export default memo(function GlobalMenu() {
  const location = useLocation();
  const openNav = useSelector((state: AppState) => state.ui.openNav);
  const products: Products[] = useSelector((state: AppState) => state.products);

  const slug = location.pathname.split("/")[1];
  const icons = {
    launchpad: RocketLaunchIcon,
    content: EditIcon,
    media: ImageIcon,
    schema: Database,
    code: CodeIcon,
    leads: RecentActorsIcon,
    reports: BarChartIcon,
    redirects: ShuffleRoundedIcon,
    settings: SettingsIcon,
    release: RocketLaunchIcon,
    apps: ExtensionIcon,
  };

  const MenuItemIcon = ({ product }: { product: Products }) => {
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
    <Box
      component="menu"
      width="100%"
      px={1}
      boxSizing="border-box"
      overflow="auto"
    >
      {products.map((product) => {
        // Covert dashes to spaces
        // Uppercase first letter of word
        let name = product
          .split("-")
          .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
          .join(" ");

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
                px: 1.5,
                py: 0.75,
                mb: 0.5,
                height: "36px",
                borderRadius: "4px",
                backgroundColor: slug === product ? "grey.800" : "transparent",
                "&:hover": {
                  backgroundColor: slug === product ? "grey.800" : "grey.900",
                  svg: {
                    color: "primary.main",
                  },
                  "& .menu-item-text": {
                    color: "common.white",
                  },
                },
              }}
            >
              <MenuItemIcon product={product} />

              {openNav && (
                <ListItemText
                  className="menu-item-text"
                  primary={name}
                  primaryTypographyProps={{
                    variant: "body3",
                  }}
                  sx={{
                    color: slug === product ? "common.white" : "grey.500",
                  }}
                >
                  {name}
                </ListItemText>
              )}
            </ListItem>
          </Link>
        );
      })}
    </Box>
  );
});
