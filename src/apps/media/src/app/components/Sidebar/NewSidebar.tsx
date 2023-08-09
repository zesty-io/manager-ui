import React, { FC, useEffect, useState, useRef } from "react";
import {
  ScheduleRounded,
  InsightsRounded,
  FileUploadRounded,
} from "@mui/icons-material";
import { useHistory } from "react-router";

import {
  AppSideBar,
  SubMenu,
} from "../../../../../../shell/components/AppSidebar";
import { useParams } from "../../../../../../shell/hooks/useParams";

interface Props {
  lockedToGroupId?: string;
  isSelectDialog?: boolean;
}
export const Sidebar: FC<Props> = ({ lockedToGroupId, isSelectDialog }) => {
  const history = useHistory();
  const [params] = useParams();
  const appSideBarRef = useRef(null);
  const term = (params as URLSearchParams).get("term");
  const clearAndFocus = (params as URLSearchParams).get("cf");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    setSearchTerm(term || "");
  }, [term]);

  useEffect(() => {
    if (clearAndFocus) {
      appSideBarRef.current?.clearAndFocusTextField();
    }
  }, [clearAndFocus]);

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
      ref={appSideBarRef}
      searchPlaceholder="Search Media"
      titleButtonTooltip="Upload"
      hideSubMenuOnSearch={false}
      titleButtonIcon={FileUploadRounded}
      filterKeyword={searchTerm}
      onFilterEnter={(keyword) => history.push(`/media/search?term=${keyword}`)}
    />
  );
};
