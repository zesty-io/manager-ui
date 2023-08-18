import { FC, useEffect } from "react";
import { Tooltip, IconButton, SvgIcon, SxProps } from "@mui/material";
import {
  KeyboardDoubleArrowLeft,
  KeyboardDoubleArrowRight,
} from "@mui/icons-material";
import { useSelector, useDispatch } from "react-redux";
import { useLocation } from "react-router";

import { AppState } from "../../store/types";
import { actions } from "../../store/ui";

interface Props {
  inGlobalSidebar?: boolean;
  onToggleCollapse?: (collapse: boolean) => void;
}
export const AppSidebarButton: FC<Props> = ({
  inGlobalSidebar = false,
  onToggleCollapse,
}) => {
  const dispatch = useDispatch();
  const location = useLocation();
  const product = location.pathname.split("/")[1];

  const {
    contentNavCollapsed,
    schemaNavCollapsed,
    mediaNavCollapsed,
    appsNavCollapsed,
    reportsNavCollapsed,
  } = useSelector((state: AppState) => state.ui);

  const state: Record<string, { collapsed: boolean; toggle: () => void }> = {
    content: {
      collapsed: contentNavCollapsed,
      toggle: () => dispatch(actions.toggleContentNav(!contentNavCollapsed)),
    },
    schema: {
      collapsed: schemaNavCollapsed,
      toggle: () => dispatch(actions.toggleSchemaNav(!schemaNavCollapsed)),
    },
    media: {
      collapsed: mediaNavCollapsed,
      toggle: () => dispatch(actions.toggleMediaNav(!mediaNavCollapsed)),
    },
    apps: {
      collapsed: appsNavCollapsed,
      toggle: () => dispatch(actions.toggleAppsNav(!appsNavCollapsed)),
    },
    reports: {
      collapsed: reportsNavCollapsed,
      toggle: () => dispatch(actions.toggleReportsNav(!reportsNavCollapsed)),
    },
  };

  useEffect(() => {
    onToggleCollapse && onToggleCollapse(state[product]?.collapsed);
  }, [state[product]?.collapsed]);

  if (
    (inGlobalSidebar && !state[product]?.collapsed) ||
    (!inGlobalSidebar && state[product]?.collapsed)
  ) {
    return <></>;
  }

  return (
    <Tooltip
      title={state[product]?.collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
      placement="right-start"
      enterDelay={1000}
      enterNextDelay={1000}
    >
      <IconButton
        data-cy="collapseAppSideBar"
        onClick={() => state[product]?.toggle()}
        sx={{
          borderRadius: "50%",
          borderColor: "grey.600",
          borderStyle: "solid",
          borderWidth: "1px",
          backgroundColor: "grey.900",

          width: "24px",
          height: "24px",

          position: "absolute",
          top: inGlobalSidebar ? "72px" : "32px",
          right: "-12px",
          zIndex: (theme) => theme.zIndex.appBar,

          "&:hover": {
            backgroundColor: "grey.900",

            ".MuiSvgIcon-root": {
              color: "common.white",
            },
          },
        }}
      >
        <SvgIcon
          component={
            state[product]?.collapsed
              ? KeyboardDoubleArrowRight
              : KeyboardDoubleArrowLeft
          }
          fontSize="small"
          sx={{
            color: "grey.500",
          }}
        />
      </IconButton>
    </Tooltip>
  );
};
