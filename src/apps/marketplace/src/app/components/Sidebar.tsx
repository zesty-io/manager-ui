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

export const Sidebar = () => {
  const installedApps = useSelector((state: AppState) => state.apps.installed);
  const history = useHistory();
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchInstalledApps());
    if (installedApps.length) {
      history.push(`/apps/${installedApps[0]?.ZUID}`);
    }
  }, []);

  const apps: SubMenu[] = useMemo(() => {
    if (!!installedApps.length) {
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
