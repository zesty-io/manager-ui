import React, { FC } from "react";
import {
  ScheduleRounded,
  InsightsRounded,
  FileUploadRounded,
} from "@mui/icons-material";

import {
  AppSideBar,
  SubMenu,
} from "../../../../../../shell/components/AppSidebar";

interface Props {
  lockedToGroupId?: string;
  isSelectDialog?: boolean;
}
export const Sidebar: FC<Props> = ({ lockedToGroupId, isSelectDialog }) => {
  const subMenu: SubMenu[] = [
    {
      name: "Recents",
      path: "/media",
      icon: ScheduleRounded,
    },
    {
      name: "Insights",
      path: "/media/insights",
      icon: InsightsRounded,
    },
  ];

  return (
    <AppSideBar
      data-cy="media-nav"
      mode="dark"
      headerTitle={isSelectDialog ? "Insert from Media" : "Media"}
      subMenus={lockedToGroupId ? null : subMenu}
      searchPlaceholder="Search Media"
      titleButtonTooltip="Upload"
      hideSubMenuOnSearch={false}
      titleButtonIcon={FileUploadRounded}
    />
  );
};
