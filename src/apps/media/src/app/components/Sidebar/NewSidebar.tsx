import { FC, useEffect, useState, useRef } from "react";
import { ScheduleRounded, InsightsRounded } from "@mui/icons-material";
import { useHistory } from "react-router";
import { useSelector } from "react-redux";

import {
  AppSideBar,
  SubMenu,
} from "../../../../../../shell/components/AppSidebar";
import { UploadButton } from "../UploadButton";
import { useParams } from "../../../../../../shell/hooks/useParams";
import { useGetBinsQuery } from "../../../../../../shell/services/mediaManager";
import { AppState } from "../../../../../../shell/store/types";

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
  const instanceId = useSelector((state: AppState) => state.instance.ID);
  const ecoId = useSelector((state: AppState) => state.instance.ecoID);

  const { data: bins } = useGetBinsQuery({
    instanceId,
    ecoId,
  });

  useEffect(() => {
    setSearchTerm(term || "");
  }, [term]);

  useEffect(() => {
    if (clearAndFocus) {
      appSideBarRef.current?.clearAndFocusTextField();
    }
  }, [clearAndFocus]);

  const defaultBin = bins?.find((bin) => bin.default) || bins?.[0];
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
    <>
      <AppSideBar
        data-cy="media-nav"
        mode="dark"
        headerTitle={isSelectDialog ? "Insert from Media" : "Media"}
        subMenus={lockedToGroupId ? null : subMenu}
        ref={appSideBarRef}
        searchPlaceholder="Search Media"
        hideSubMenuOnSearch={false}
        filterKeyword={searchTerm}
        onFilterEnter={(keyword) =>
          history.push(`/media/search?term=${keyword}`)
        }
        TitleButtonComponent={
          isSelectDialog ? (
            <></>
          ) : (
            <UploadButton
              currentBinId={defaultBin?.id}
              isIconButton
              caller="sidebar"
            />
          )
        }
      />
    </>
  );
};
