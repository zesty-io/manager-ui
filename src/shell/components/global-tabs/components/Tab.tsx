import { FC, useEffect, useMemo, useState } from "react";
import { useLocation, Link as Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import PinIcon from "@mui/icons-material/PushPin";
import OutlinedPinIcon from "@mui/icons-material/PushPinOutlined";

import MuiLink from "@mui/material/Link";
import Box from "@mui/material/Box";
import SvgIcon from "@mui/material/SvgIcon";
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

export type PinnedTopBarTab = {
  tab: Tab;
  tabWidth: number;
  isDarkMode?: boolean;
  isActive?: boolean;
  isPinned?: boolean;
};
export const PinnedTopBarTab: FC<PinnedTopBarTab> = ({
  tab,
  tabWidth,
  isDarkMode = false,
  isActive = false,
  isPinned = false,
}) => {
  const dispatch = useDispatch();
  const instanceId = useSelector((state: any) => state.instance.ID);
  const ecoId = useSelector((state: any) => state.instance.ecoID);

  const [styles, setStyles] = useState({
    backgroundColor: "grey.100",
    fontColor: "text.secondary",
    iconColor: "action.active",
  });

  useEffect(() => {
    if (isActive) {
      if (isDarkMode) {
        setStyles({
          backgroundColor: "#1e1e1e",
          fontColor: "common.white",
          iconColor: "grey.500",
        });
      } else {
        setStyles({
          backgroundColor: "common.white",
          fontColor: "text.primary",
          iconColor: "action.active",
        });
      }
    } else {
      // Revert to default style once unselected as active
      setStyles({
        backgroundColor: "grey.100",
        fontColor: "text.secondary",
        iconColor: "action.active",
      });
    }
  }, [isDarkMode, isActive]);

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

  const Pin = isPinned ? PinIcon : OutlinedPinIcon;

  const handlePinClick = () => {
    // force unpin because we don't want to show the modal on the active tab
    if (isPinned) {
      dispatch(unpinTab(tab, isActive, queryData));
    } else {
      dispatch(pinTab(tab, queryData));
    }
  };

  return (
    <Box
      component="div"
      className="tab-item"
      data-cy="ActiveTab"
      data-active={isActive}
      width={`${tabWidth}px`}
      py={0.5}
      height={34}
      bgcolor={styles.backgroundColor}
      flex="1 0 0"
      borderRadius="8px 8px 0px 0px"
      sx={{
        "&:hover": {
          backgroundColor: isActive ? styles.backgroundColor : "grey.50",
        },
      }}
    >
      <Stack
        component="div"
        direction="row"
        height={24}
        alignItems="center"
        justifyContent="space-between"
        borderLeft={1}
        borderColor={isActive ? "transparent" : "grey.300"}
        sx={{
          "&:hover": {
            borderColor: "transparent",
          },
        }}
      >
        <Box
          display="flex"
          flex="1 0 0"
          component="div"
          whiteSpace="nowrap"
          overflow="hidden"
          textOverflow="ellipsis"
          pl={1.5}
        >
          <Box
            display="inline-block"
            mr={1.25}
            color={styles.iconColor}
            fontSize={16}
          >
            {tab.icon && <SvgIcon component={tab.icon} fontSize="inherit" />}
          </Box>
          <MuiLink
            component={Link}
            to={tab.pathname + tab.search}
            // @ts-expect-error missing body3 module augmentation
            variant="body3"
            color={styles.fontColor}
            fontWeight={600}
            underline="none"
            flex="1 0 0"
            noWrap
          >
            {tab.name ? tab.name : `${tab.pathname.slice(1)}`}
          </MuiLink>
        </Box>
        <Box
          component="div"
          onClick={handlePinClick}
          width={24}
          height={24}
          display="flex"
          alignItems="center"
          justifyContent="center"
          pr={1}
          pl={0.5}
          color="action.active"
          sx={{
            cursor: "pointer",
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

export type UnpinnedTopBarTab = {
  tabWidth: number;
};
export const UnpinnedTopBarTab: FC<UnpinnedTopBarTab> = ({ tabWidth }) => {
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
    <PinnedTopBarTab
      isActive
      isPinned={false}
      tabWidth={tabWidth}
      tab={activeTab}
      isDarkMode={activeTab.app === "Code"}
    />
  );
};
