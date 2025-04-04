import { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchInstalledApps } from "../../../../../shell/store/apps";
import { StorefrontRounded, PowerRounded } from "@mui/icons-material";
import { AppState } from "../../../../../shell/store/types";
import { useHistory } from "react-router";
import {
  AppSideBar,
  SubMenu,
} from "../../../../../shell/components/AppSidebar";
import { Box, Stack, Skeleton, Typography } from "@mui/material";
import { IconButton as IconButtonCustom } from "@zesty-io/material";
import { AddRounded } from "@mui/icons-material";

export const Sidebar = () => {
  const installedApps = useSelector((state: AppState) => state.apps.installed);
  const isLoadingApps = useSelector(
    (state: AppState) => state.apps.isLoadingApps
  );
  const history = useHistory();
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchInstalledApps());
    if (installedApps.length) {
      history.push(`/apps/${installedApps[0]?.ZUID}`);
    }
  }, []);

  const apps: SubMenu[] = useMemo(() => {
    if (installedApps.length) {
      return installedApps.map((app) => {
        return {
          name: app.label,
          path: `/apps/${app.ZUID}`,
          icon: PowerRounded,
        };
      });
    }

    return [];
  }, [installedApps]);

  if (isLoadingApps) {
    return (
      <Box
        sx={{
          backgroundColor: "grey.900",
          height: "100%",
          width: "inherit",
          color: "common.white",
          py: 1.5,
        }}
      >
        <Stack sx={{ gap: 1.5, mb: 1.5 }}>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            px={1.5}
          >
            <Typography
              variant="h6"
              fontWeight={700}
              lineHeight="24px"
              fontSize={18}
            >
              Apps
            </Typography>

            <IconButtonCustom variant="contained" size="xsmall">
              <AddRounded fontSize="small" />
            </IconButtonCustom>
          </Stack>
        </Stack>
        <Stack
          sx={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            height: 36,
            ml: 1.5,
            mr: 2,
            gap: 1,
          }}
        >
          <Skeleton
            variant="circular"
            width={24}
            height={24}
            sx={{ backgroundColor: "grey.700", flexShrink: 0 }}
          />
          <Skeleton
            variant="rounded"
            width="100%"
            height={24}
            sx={{ backgroundColor: "grey.700" }}
          />
        </Stack>
      </Box>
    );
  }

  return (
    <AppSideBar
      data-cy="apps-nav"
      mode="dark"
      headerTitle="Apps"
      onAddClick={() =>
        window.open("https://www.zesty.io/marketplace/apps/", "_blank")
      }
      subMenus={[
        {
          name: "Marketplace",
          path: "",
          icon: StorefrontRounded,
          disableActive: true,
          onClick: () =>
            window.open("https://www.zesty.io/marketplace/apps/", "_blank"),
        },
        ...apps,
      ]}
      withSearch={false}
      titleButtonTooltip="Visit Marketplace"
    />
  );
};
