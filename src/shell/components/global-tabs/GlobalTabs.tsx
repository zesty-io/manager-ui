import {
  memo,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useMemo,
} from "react";
import { useDispatch, useSelector } from "react-redux";
import { useWindowSize } from "react-use";
import { useLocation } from "react-router-dom";
import debounce from "lodash/debounce";

import { Dropdown } from "./components/Dropdown";
import { GlobalDirtyCodeModal } from "./components/GlobalDirtyCodeModal";
import { TopBarTab, UnpinnedTopBarTab } from "./components/Tab";
import Stack from "@mui/material/Stack";

import {
  unpinTab,
  unpinManyTabs,
  loadTabs,
  rebuildTabs,
  tabLocationEquality,
  setDocumentTitle,
  updatePinnedTabs,
} from "../../../shell/store/ui";
import { AppState } from "../../store/types";
import {
  useGetAllBinGroupsQuery,
  useGetBinsQuery,
} from "../../services/mediaManager";

const MIN_TAB_WIDTH = 180;
const MAX_TAB_WIDTH = 180;
const TAB_PADDING = 16;
const TAB_BORDER = 1;
const MORE_MENU_WIDTH = 85;

export default memo(function GlobalTabs() {
  const windowWidth = useWindowSize();
  const location = useLocation();
  const instanceId = useSelector((state: any) => state.instance.ID);
  const ecoId = useSelector((state: any) => state.instance.ecoID);
  const dispatch = useDispatch();
  const pinnedTabs = useSelector((state: AppState) => state.ui.pinnedTabs);
  const [tabs, setTabs] = useState([]);

  const instanceZUID = useSelector((state: AppState) => state.instance.ZUID);
  const loadedTabs = useSelector((state: AppState) => state.ui.loadedTabs);
  const models = useSelector((state: AppState) => state.models);
  const apps = useSelector((state: AppState) => state.apps.installed);

  const content = useSelector((state: AppState) => state.content);
  const files = useSelector((state: AppState) => state.files);
  const users = useSelector((state: AppState) => state.users);
  const [tabBarWidth, setTabBarWidth] = useState(0);

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

  // load tabs from Indexeddb
  useEffect(() => {
    dispatch(loadTabs(instanceZUID));
  }, [instanceZUID]);

  useEffect(() => {
    dispatch(setDocumentTitle(location, queryData));

    console.log("loc data", location);
    // If current location is not in topbartabs array, add it
  }, [location.pathname, location.search]);

  // rebuild tabs if any of the store slices changes
  // slices could include tab.name updates
  useEffect(() => {
    if (loadedTabs) {
      dispatch(rebuildTabs(queryData));
    }
  }, [loadedTabs, models, content, files, queryData, apps, users]);

  useEffect(() => {
    setTabs(pinnedTabs);
  }, [pinnedTabs]);

  // measure the tab bar width and set state
  // to trigger a synchronous re-render before paint
  // recalculate tab bar width if window is resized
  const tabContainerRef = useRef(null);
  useLayoutEffect(() => {
    if (tabContainerRef.current) {
      setTabBarWidth(
        Math.floor(tabContainerRef.current.clientWidth) - MORE_MENU_WIDTH
      );
    }
  }, [windowWidth]);

  /**
   * Determines which tabs will be placed on the topbar and dropdown menu.
   */
  const getTabs = (numTabs: number) => {
    const isCurrLocPinned = Boolean(
      tabs.find((tab) => tabLocationEquality(location, tab))
    );
    const tabCount = isCurrLocPinned ? numTabs : numTabs - 1;
    const topbar = tabs.filter((_, i) => i < tabCount);
    const dropdown = tabs.filter((_, i) => i >= tabCount);

    // If the current active tab gets pushed to the dropdown menu
    // on tab resize, move it as the first tab.
    const currLocInDropdown = dropdown.find((tab) =>
      tabLocationEquality(location, tab)
    );
    const debouncedUpdate = debounce(
      () => dispatch(updatePinnedTabs(currLocInDropdown)),
      250
    );

    if (currLocInDropdown) {
      debouncedUpdate();
    }

    return { topbar, dropdown };
  };

  const tabWidth =
    Math.floor(
      Math.min(
        Math.max(tabBarWidth / tabs.length, MIN_TAB_WIDTH),
        MAX_TAB_WIDTH
      )
    ) -
    TAB_PADDING -
    TAB_BORDER;

  // Determines if the opened url is a pinned tab or not. Used to show/hide the unpinned tab component.
  const isCurrLocPinned = tabs.filter((tab) =>
    tabLocationEquality(tab, location)
  ).length;
  const numTabs = Math.floor(tabBarWidth / tabWidth);
  const { topbar, dropdown } = getTabs(numTabs);

  // TODO: Fix pin/unpin on topbar tabs
  return (
    <>
      <GlobalDirtyCodeModal />
      <Stack
        ref={tabContainerRef}
        component="nav"
        direction="row"
        sx={{
          display: "grid",
          "*": {
            boxSizing: "border-box",
          },
        }}
      >
        <Stack
          component="div"
          overflow="hidden"
          display="grid"
          gridTemplateColumns={`repeat(${numTabs}, ${tabWidth}px) ${MORE_MENU_WIDTH}px`}
          sx={{
            "& .tab-item:nth-of-type(1) > div": {
              borderColor: "transparent",
            },
            "& .tab-item:nth-last-of-type(2):hover + .more-menu-tab > span": {
              borderColor: "transparent",
            },
            "& .tab-item:hover + .tab-item > div": {
              borderColor: "transparent",
            },
            "& .tab-item[data-active=true] + .tab-item > div": {
              borderColor: "transparent",
            },
          }}
        >
          {!isCurrLocPinned && <UnpinnedTopBarTab tabWidth={tabWidth} />}
          {topbar.map((tab) => (
            <TopBarTab
              tab={tab}
              tabWidth={tabWidth}
              variant="fill"
              isDarkMode={tab.app === "Code"}
              isActive={tabLocationEquality(tab, location)}
              onPinClick={() => {}}
            />
          ))}
          <Dropdown
            tabs={dropdown}
            tabWidth={MORE_MENU_WIDTH}
            removeOne={(tab) => {
              dispatch(unpinTab(tab, false, queryData));
            }}
            removeMany={(tabs) => {
              dispatch(unpinManyTabs(tabs));
            }}
          />
        </Stack>
      </Stack>
    </>
  );
});
