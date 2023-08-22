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
  const activeBgColor = "rgba(255, 93, 10, 0.08)";

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
    <Box component="menu" width="100%" boxSizing="border-box">
      {products.map((product) => {
        // Covert dashes to spaces
        // Uppercase first letter of word
        let name = product
          .split("-")
          .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
          .join(" ");
        const isActive = slug === product;

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
                pr: 1.5,
                pl: isActive ? 1.25 : 1.5,
                py: 0.75,
                height: "36px",
                backgroundColor: isActive ? activeBgColor : "transparent",
                borderLeft: isActive ? "2px solid" : "none",
                borderColor: "primary.main",
                svg: {
                  color: isActive ? "primary.main" : "grey.400",
                },
                "&:hover": {
                  backgroundColor: activeBgColor,
                },
                "& .MuiListItemIcon-root": {
                  minWidth: 0,
                  pr: 1,
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
                    color: isActive ? "primary.main" : "grey.400",
                    fontWeight: 600,
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
