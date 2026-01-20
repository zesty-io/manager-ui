import { memo } from "react";
import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import { Link } from "react-router-dom";

import {
  ListItem,
  ListItemIcon,
  ListItemText,
  Box,
  Skeleton,
  alpha,
} from "@mui/material";
import RocketLaunchIcon from "@mui/icons-material/RocketLaunch";
import EditIcon from "@mui/icons-material/Edit";
import ImageIcon from "@mui/icons-material/Image";
import CodeIcon from "@mui/icons-material/Code";
import RecentActorsIcon from "@mui/icons-material/RecentActors";
import BarChartIcon from "@mui/icons-material/BarChart";
import SettingsIcon from "@mui/icons-material/Settings";
import ExtensionIcon from "@mui/icons-material/Extension";
import { Database, Block, ShuffleVariant } from "@zesty-io/material";

import { AppState } from "../../store/types";
import { Products } from "../../services/types";

export default memo(function GlobalMenu() {
  const location = useLocation();
  const openNav = useSelector((state: AppState) => state.ui.openNav);
  const {
    products,
    isLoadingProducts,
  }: { products: Products[]; isLoadingProducts: boolean } = useSelector(
    (state: AppState) => state.products
  );

  const slug = location.pathname.split("/")[1];
  const icons = {
    launchpad: RocketLaunchIcon,
    content: EditIcon,
    blocks: Block,
    media: ImageIcon,
    schema: Database,
    code: CodeIcon,
    leads: RecentActorsIcon,
    reports: BarChartIcon,
    redirects: ShuffleVariant,
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

  if (isLoadingProducts) {
    return (
      <Box component="menu" width="100%" boxSizing="border-box">
        {Array(10)
          .fill(0)
          .map((_, index) => (
            <Box
              key={index}
              sx={{
                height: "36px",
                display: "flex",
                alignItems: "center",
                gap: 1,
                pr: openNav ? 3 : 1.5,
                pl: 1.5,
              }}
            >
              <Skeleton
                variant="circular"
                width={24}
                height={24}
                sx={{ bgcolor: "grey.700" }}
              />
              {openNav && (
                <Skeleton
                  variant="rounded"
                  width={132}
                  height={12}
                  sx={{ bgcolor: "grey.700" }}
                />
              )}
            </Box>
          ))}
      </Box>
    );
  }

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
            data-cy={`${name}App`}
          >
            <ListItem
              sx={{
                pr: 1.5,
                pl: isActive ? 1.25 : 1.5,
                py: 0.75,
                height: "36px",
                backgroundColor: (theme) =>
                  isActive
                    ? alpha(theme.palette.primary.main, 0.08)
                    : "transparent",
                borderLeft: isActive ? "2px solid" : "none",
                borderColor: "primary.main",
                svg: {
                  color: isActive ? "primary.main" : "grey.400",
                },
                "&:hover": {
                  backgroundColor: (theme) =>
                    alpha(theme.palette.primary.main, 0.08),
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
