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
  sxOverrides?: SxProps;
};
const BaseTab: FC<BaseTab> = ({
  tab,
  tabWidth,
  variant,
  onClick,
  sxOverrides,
}) => {
  const Pin = variant === "outline" ? OutlinedPinIcon : PinIcon;
  console.log(tab);
  return (
    <Box
      component="li"
      sx={{
        borderWidth: "1px",
        borderColor: "grey.800",
        // TODO how to pull from theme?
        borderRadius: "12px 12px 0px 0px",
        padding: 1.5,
        gap: 1,
        backgroundColor: "grey.800",

        width: `${tabWidth}px`,
        // taken from old less
        alignItems: "center",
        display: "flex",
        flexShrink: 0,
        ...sxOverrides,
      }}
    >
      <MuiLink
        component={Link}
        to={tab.pathname + tab.search}
        sx={{
          color: "grey.400",
          justifyContent: "space-between",
          // taken from old less
          width: "100%",
          display: "inline-block",
          maxWidth: "300px",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          textShadow: "none",
          wordBreak: "keep-all",
          transitionDuration: "unset",
          transitionProperty: "unset",
        }}
      >
        {tab.icon && <FontAwesomeIcon icon={tab.icon} />}
        &nbsp;
        {tab.name ? tab.name : `${tab.pathname.slice(1)}`}
      </MuiLink>
      <Box component="span" onClick={onClick} sx={{ cursor: "pointer" }}>
        <Pin
          fontSize="small"
          sx={{ transform: "rotate(45deg)", marginRight: 0.25 }}
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
      sxOverrides={{
        backgroundColor: "white",
      }}
    />
  );
};
