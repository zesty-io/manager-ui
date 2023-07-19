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
} from "@mui/material";
import {
  SvgIconComponent,
  BackupTableRounded,
  ScheduleRounded,
} from "@mui/icons-material";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import SearchIcon from "@mui/icons-material/Search";
import { useLocation, useHistory } from "react-router-dom";

import { AppSideBar } from "../../../../../../shell/components/AppSidebar";

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

export const ContentNav = () => {
  const location = useLocation();
  const history = useHistory();

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
                    <ListItemText>{menu.name}</ListItemText>
                  </ListItemButton>
                </ListItem>
              );
            })}
          </List>
        </Stack>
      }
    />
  );
};
