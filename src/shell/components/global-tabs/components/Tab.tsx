import { FC } from "react";
import { useLocation, Link as Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import PinIcon from "@mui/icons-material/PushPin";
import OutlinedPinIcon from "@mui/icons-material/PushPinOutlined";
import { SxProps } from "@mui/system";

import MuiLink from "@mui/material/Link";
import Box from "@mui/material/Box";

import {
  pinTab,
  unpinTab,
  parsePath,
  Tab,
  createTab,
  tabLocationEquality,
} from "../../../../shell/store/ui";
import { AppState } from "../../../store/types";

type BaseTab = {
  tab: Tab;
  tabWidth: number;
  variant: "outline" | "fill";
  onClick: () => void;
  sx?: SxProps;
  linkProps?: SxProps;
};
const BaseTab: FC<BaseTab> = ({
  tab,
  tabWidth,
  variant,
  onClick,
  sx,
  linkProps,
}) => {
  const Pin = variant === "outline" ? OutlinedPinIcon : PinIcon;

  return (
    <Box
      component="li"
      sx={{
        overflow: "hidden",
        width: `${tabWidth}px`,
        display: "grid",
        gridTemplateColumns: "20px 1fr 20px",
        backgroundColor: "grey.800",
        borderRadius: "12px 12px 0px 0px",
        borderWidth: "2px 2px 0px 0px",
        borderColor: "grey.700",
        borderStyle: "solid",
        boxSizing: "border-box",
        padding: "0 12px 0 12px",
        alignItems: "center",
        //TODO make sure this is right
        filter: "drop-shadow(0px 4px 4px #000000)",
        ...sx,
      }}
    >
      <Box component="span" color="grey.400">
        {tab.icon && <FontAwesomeIcon icon={tab.icon} />}
      </Box>
      <MuiLink
        component={Link}
        to={tab.pathname + tab.search}
        underline="none"
        sx={{
          color: "white",
          textDecoration: "none",
          flex: "1",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
          ...linkProps,
        }}
      >
        {tab.name ? tab.name : `${tab.pathname.slice(1)}`}
      </MuiLink>
      <Box component="span" onClick={onClick} sx={{ cursor: "pointer" }}>
        <Pin
          fontSize="small"
          sx={{
            transform: "rotate(45deg)",
            color: "grey.400",
            marginRight: 0.25,
          }}
        />
      </Box>
    </Box>
  );
};

export type InactiveTabGroup = {
  tabs: Tab[];
  tabWidth: number;
};

export const InactiveTabGroup: FC<InactiveTabGroup> = ({ tabs, tabWidth }) => {
  return (
    <>
      {tabs.map((tab) => (
        <InactiveTab
          tab={tab}
          key={tab.pathname + tab.search}
          tabWidth={tabWidth}
        />
      ))}
    </>
  );
};

export type InactiveTab = {
  tab: Tab;
  tabWidth: number;
};

export const InactiveTab: FC<InactiveTab> = ({ tab, tabWidth }) => {
  const dispatch = useDispatch();
  const location = useLocation();
  if (tabLocationEquality(location, tab)) return null;
  return (
    <BaseTab
      variant="fill"
      tab={tab}
      tabWidth={tabWidth}
      onClick={() => dispatch(unpinTab(tab))}
      sx={{
        "&:hover": {
          backgroundColor: "grey.700",
        },
      }}
    />
  );
};

export type ActiveTab = {
  tabWidth: number;
};
export const ActiveTab: FC<ActiveTab> = ({ tabWidth }) => {
  const dispatch = useDispatch();
  const pinnedTabs = useSelector((state: AppState) => state.ui.pinnedTabs);
  const state = useSelector((state: AppState) => state);
  const location = useLocation();
  const activeTab = createTab(state, parsePath(location));

  const isPinned =
    pinnedTabs.findIndex((t: Tab) => tabLocationEquality(t, activeTab)) >= 0;
  return (
    <BaseTab
      variant={isPinned ? "fill" : "outline"}
      tabWidth={tabWidth}
      tab={activeTab}
      onClick={() => {
        if (isPinned) dispatch(unpinTab(activeTab));
        else dispatch(pinTab(activeTab));
      }}
      sx={{
        backgroundColor: "white",
      }}
      linkProps={{
        color: "grey.800",
      }}
    />
  );
};
