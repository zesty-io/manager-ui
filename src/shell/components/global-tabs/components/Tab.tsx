import { FC, useEffect, useMemo, useState, useLayoutEffect } from "react";
import { useLocation, Link as Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import PinIcon from "@mui/icons-material/PushPin";
import OutlinedPinIcon from "@mui/icons-material/PushPinOutlined";
import { SxProps } from "@mui/system";

import { theme } from "@zesty-io/material";
import MuiLink from "@mui/material/Link";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";

import {
  pinTab,
  unpinTab,
  parsePath,
  Tab,
  createTab,
  tabLocationEquality,
} from "../../../../shell/store/ui";
import { AppState } from "../../../store/types";
import {
  useGetAllBinGroupsQuery,
  useGetBinsQuery,
} from "../../../services/mediaManager";

/*
  we need a descending z-index to make the drop shadow render correctly
*/
const zIndex = 25;

type BaseTab = {
  tab: Tab;
  tabWidth: number;
  variant: "outline" | "fill";
  onClick: () => void;
  sx?: SxProps;
  isDarkMode?: boolean;
  isActive?: boolean;
  isAdjacentTabHovered?: boolean;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
};
const BaseTab: FC<BaseTab> = ({
  tab,
  tabWidth,
  variant,
  onClick,
  sx,
  isDarkMode = false,
  isActive = false,
  isAdjacentTabHovered = false,
  onMouseEnter,
  onMouseLeave,
}) => {
  const [styles, setStyles] = useState({
    backgroundColor: theme.palette.grey[100],
    fontColor: theme.palette.text.secondary,
    iconColor: theme.palette.action.active,
  });

  useEffect(() => {
    if (isActive) {
      if (isDarkMode) {
        setStyles({
          backgroundColor: "#1E1E1E",
          fontColor: "white",
          iconColor: theme.palette.grey[500],
        });
      } else {
        setStyles({
          backgroundColor: "white",
          fontColor: theme.palette.text.primary,
          iconColor: theme.palette.action.active,
        });
      }
    }
  }, [isDarkMode, isActive]);

  const Pin = variant === "outline" ? OutlinedPinIcon : PinIcon;
  // This removes the right border if the tab is to the left of a hovered tab
  // or is an active tab
  const isBorderHidden = isActive || isAdjacentTabHovered;

  return (
    <Box
      component="li"
      data-cy="ActiveTab"
      sx={{
        overflow: "hidden",
        width: `${tabWidth}px`,
        backgroundColor: styles.backgroundColor,
        boxSizing: "border-box",
        alignItems: "center",
        height: "34px",
        padding: "5px 0px 5px 14px",
        ...sx,
      }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <Stack
        component="div"
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{
          height: "24px",
          boxSizing: "border-box",
          borderRight: "1px solid",
          borderColor: isBorderHidden ? "transparent" : theme.palette.grey[300],
          "&:hover": {
            borderColor: theme.palette.grey[50],
          },
        }}
      >
        <Box
          component="span"
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "12px",
            height: "12px",
            marginRight: "10px",
            color: styles.iconColor,
          }}
        >
          {tab.icon && (
            <FontAwesomeIcon icon={tab.icon} style={{ fontSize: 16 }} />
          )}
        </Box>
        <MuiLink
          component={Link}
          to={tab.pathname + tab.search}
          variant={theme.typography.body3}
          sx={{
            color: styles.fontColor,
            textDecoration: "none",
            flex: "1",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            fontWeight: 600,
          }}
        >
          {tab.name ? tab.name : `${tab.pathname.slice(1)}`}
        </MuiLink>
        <Box
          component="span"
          onClick={onClick}
          sx={{
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0px 8px 0px 4px",
          }}
        >
          <Pin
            fontSize="small"
            sx={{
              width: "16px",
              height: "16px",
              transform: "rotate(45deg)",
              color: styles.iconColor,
            }}
          />
        </Box>
      </Stack>
    </Box>
  );
};

export type InactiveTabGroup = {
  tabs: Tab[];
  tabWidth: number;
};

export const InactiveTabGroup: FC<InactiveTabGroup> = ({ tabs, tabWidth }) => {
  const [hoveredTabIdx, setHoveredTabIdx] = useState(null);

  return (
    <>
      {tabs.map((tab, i) => (
        <InactiveTab
          isAdjacentTabHovered={hoveredTabIdx - 1 === i}
          tab={tab}
          key={tab.pathname + tab.search}
          tabWidth={tabWidth}
          onMouseEnter={() => setHoveredTabIdx(i)}
          onMouseLeave={() => setHoveredTabIdx(null)}
          sx={{ zIndex: zIndex - i - 1 }}
        />
      ))}
    </>
  );
};

export type InactiveTab = {
  tab: Tab;
  tabWidth: number;
  sx?: SxProps;
  isAdjacentTabHovered: boolean;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
};

export const InactiveTab: FC<InactiveTab> = ({
  tab,
  tabWidth,
  sx,
  isAdjacentTabHovered,
  onMouseEnter,
  onMouseLeave,
}) => {
  const dispatch = useDispatch();
  const location = useLocation();
  const instanceId = useSelector((state: any) => state.instance.ID);
  const ecoId = useSelector((state: any) => state.instance.ecoID);
  // RTK QUERY FOR HOOKING INTO ALL MEDIA BIN GROUPS
  const { data: bins } = useGetBinsQuery({ instanceId, ecoId });
  const { data: binGroups } = useGetAllBinGroupsQuery(
    bins?.map((bin) => bin.id),
    {
      skip: !bins?.length,
    }
  );
  const queryData = useMemo(() => {
    return {
      mediaManager: {
        bins,
        binGroups: binGroups?.flat(),
      },
    };
  }, [binGroups]);
  if (tabLocationEquality(location, tab)) return null;
  return (
    <BaseTab
      variant="fill"
      tab={tab}
      tabWidth={tabWidth}
      onClick={() => dispatch(unpinTab(tab, false, queryData))}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      isAdjacentTabHovered={isAdjacentTabHovered}
      sx={{
        "&:hover": {
          backgroundColor: theme.palette.grey[50],
          borderRadius: "8px 8px 0px 0px",
          borderColor: "white",
        },
        ...sx,
      }}
    />
  );
};

export type ActiveTab = {
  tabWidth: number;
};
export const ActiveTab: FC<ActiveTab> = ({ tabWidth }) => {
  const dispatch = useDispatch();
  const instanceId = useSelector((state: any) => state.instance.ID);
  const ecoId = useSelector((state: any) => state.instance.ecoID);
  const pinnedTabs = useSelector((state: AppState) => state.ui.pinnedTabs);
  const state = useSelector((state: AppState) => state);
  const location = useLocation();
  // RTK QUERY FOR HOOKING INTO ALL MEDIA BIN GROUPS
  const { data: bins } = useGetBinsQuery({ instanceId, ecoId });
  const { data: binGroups } = useGetAllBinGroupsQuery(
    bins?.map((bin) => bin.id),
    {
      skip: !bins?.length,
    }
  );
  const queryData = useMemo(() => {
    return {
      mediaManager: {
        bins,
        binGroups: binGroups?.flat(),
      },
    };
  }, [binGroups]);

  const activeTab = createTab(state, parsePath(location), queryData);

  const isPinned =
    pinnedTabs.findIndex((t: Tab) => tabLocationEquality(t, activeTab)) >= 0;

  return (
    <BaseTab
      isActive
      variant={isPinned ? "fill" : "outline"}
      tabWidth={tabWidth}
      tab={activeTab}
      isDarkMode={activeTab.app === "Code"}
      onClick={() => {
        // force unpin because we don't want to show the modal on the active tab
        if (isPinned) {
          dispatch(unpinTab(activeTab, true, queryData));
        } else {
          dispatch(pinTab(activeTab, queryData));
        }
      }}
      sx={{
        borderRadius: "8px 8px 0px 0px",
        border: "none",
        zIndex,
      }}
    />
  );
};
