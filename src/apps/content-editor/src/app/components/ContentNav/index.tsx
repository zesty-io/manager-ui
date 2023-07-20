import { FC } from "react";
import {
  Stack,
  Typography,
  TextField,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Button,
  InputAdornment,
  ListItemButton,
  SvgIcon,
  Tooltip,
  IconButton,
  Box,
} from "@mui/material";
import {
  SvgIconComponent,
  BackupTableRounded,
  ScheduleRounded,
} from "@mui/icons-material";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import SearchIcon from "@mui/icons-material/Search";
import InfoRoundedIcon from "@mui/icons-material/InfoRounded";
import ReorderRoundedIcon from "@mui/icons-material/ReorderRounded";
import { useLocation, useHistory } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCaretDown,
  faCaretLeft,
  faEyeSlash,
} from "@fortawesome/free-solid-svg-icons";

import { AppSideBar } from "../../../../../../shell/components/AppSidebar";
import { Nav } from "../../../../../../shell/components/NavTree";
import { NavData } from "../../../store/types";
import { NavTree } from "../../../../../../shell/components/NavTreeV2";

interface SubMenu {
  name: string;
  icon: SvgIconComponent;
  path: string;
}
const SubMenus: Readonly<SubMenu[]> = [
  {
    name: "Dashboard",
    icon: BackupTableRounded,
    path: "/content",
  },
  {
    name: "Releases",
    icon: ScheduleRounded,
    path: "/release",
  },
] as const;

interface Props {
  navData: NavData;
}
export const ContentNav: FC<Readonly<Props>> = ({ navData }) => {
  const location = useLocation();
  const history = useHistory();

  // console.log(navData);
  const actions = [
    <FontAwesomeIcon
      title="Hide from nav"
      icon={faEyeSlash}
      onClick={(path) => {
        // dispatch(hideNavItem(path));
        console.log("hide", path);
      }}
    />,
  ];

  return (
    <AppSideBar
      data-cy="contentNav"
      mode="dark"
      HeaderSubComponent={
        <Stack gap={1.5}>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            px={1.5}
          >
            <Typography
              variant="h6"
              color="text.primary"
              fontWeight={700}
              lineHeight="24px"
              fontSize={18}
            >
              Content
            </Typography>
            <Button
              variant="contained"
              sx={{
                width: 24,
                height: 24,
                minWidth: 0,
                p: 0,
              }}
            >
              <AddRoundedIcon fontSize="small" />
            </Button>
          </Stack>
          <TextField
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            placeholder="Search Content"
            size="small"
            sx={{
              px: 1.5,
            }}
          />
          <List disablePadding>
            {SubMenus.map((menu) => {
              const isActive = location.pathname === menu.path;

              return (
                <ListItem
                  key={menu.name}
                  disablePadding
                  selected={isActive}
                  sx={{
                    borderLeft: isActive ? "2px solid" : "none",
                    borderColor: "primary.main",
                  }}
                >
                  <ListItemButton
                    sx={{
                      height: 36,
                      pl: isActive ? 1.25 : 1.5,
                      pr: 1.5,
                      py: 0.75,
                    }}
                    onClick={() => history.push(menu.path)}
                  >
                    <ListItemIcon sx={{ minWidth: 32 }}>
                      <SvgIcon component={menu.icon} />
                    </ListItemIcon>
                    <ListItemText
                      primary={menu.name}
                      primaryTypographyProps={{
                        variant: "body3",
                        fontWeight: 600,
                      }}
                    />
                  </ListItemButton>
                </ListItem>
              );
            })}
          </List>
        </Stack>
      }
    >
      <NavTree
        HeaderComponent={
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            px={1.5}
            pb={1.5}
          >
            <Stack direction="row" alignItems="center" gap={0.5}>
              <Typography variant="body2" textTransform="uppercase">
                Pages
              </Typography>
              <Tooltip
                placement="right-start"
                title="Pages include single page and multi page models with URLs. Datasets that have been parented also show in this navigation."
              >
                <InfoRoundedIcon sx={{ width: 12, height: 12 }} />
              </Tooltip>
            </Stack>
            <Stack direction="row" gap={1}>
              <IconButton
                sx={{
                  width: 20,
                  height: 20,
                  padding: 0.25,
                  borderRadius: 0.5,
                }}
              >
                <ReorderRoundedIcon sx={{ width: 16, height: 16 }} />
              </IconButton>
              <IconButton
                sx={{
                  width: 20,
                  height: 20,
                  padding: 0.25,
                  borderRadius: 0.5,
                }}
              >
                <AddRoundedIcon sx={{ width: 16, height: 16 }} />
              </IconButton>
            </Stack>
          </Stack>
        }
      />
      {/* <Typography>Main Nav</Typography>
      <Nav
        mode="dark"
        id="MainNavigation"
        activePath={location.pathname}
        onCollapseNode={(path) => console.log("collapse", path)}
        tree={navData.nav}
        actions={actions}
      />
      <Typography>Headless</Typography>
      <Nav
        mode="dark"
        id="MainNavigation"
        activePath={location.pathname}
        onCollapseNode={(path) => console.log("collapse", path)}
        tree={navData.headless}
        actions={actions}
      />
      <Typography>Hidden</Typography>
      <Nav
        mode="dark"
        id="MainNavigation"
        activePath={location.pathname}
        onCollapseNode={(path) => console.log("collapse", path)}
        tree={navData.hidden}
        actions={actions}
      /> */}
    </AppSideBar>
  );
};
