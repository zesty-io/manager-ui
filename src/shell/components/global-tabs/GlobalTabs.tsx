import {
  memo,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  FC,
  useMemo,
} from "react";
import { useDispatch, useSelector } from "react-redux";
import { useWindowSize } from "react-use";
import { useLocation } from "react-router-dom";
import { debounce } from "lodash";

import { Dropdown } from "./components/Dropdown";
import { GlobalDirtyCodeModal } from "./components/GlobalDirtyCodeModal";
import {
  ActiveTab,
  InactiveTabGroup,
  TopBarTab,
  UnpinnedTopBarTab,
} from "./components/Tab";
import Stack from "@mui/material/Stack";

import {
  unpinTab,
  unpinManyTabs,
  loadTabs,
  rebuildTabs,
  tabLocationEquality,
  setDocumentTitle,
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

  // useEffect(() => {

  // }, [tabs])

  // useEffect(() => {
  //   // setTabs(pinnedTabs);
  //   if (pinnedTabs.length) {
  //     console.log(pinnedTabs);

  //     const tabs = pinnedTabs.map((tab, i) => (
  //       {
  //         ...tab,
  //         type: i >= numTabs ? 'dropdown' : 'pinned'
  //       }
  //     ));

  //     const currLoc = tabs.filter(tab => tab.pathname === location.pathname && tab.search === location.search);

  //     if (!currLoc.length) {
  //       console.log('THIS PAGE IS NOT PINNED')
  //       tabs.push({
  //         pathname: location.pathname,
  //         search: location.search,
  //         type: 'unpinned'
  //       })
  //     }

  //     setTabs(tabs);
  //     // Check current location
  //       // if pinned set as type pinned
  //       // if not, set as type unpinned
  //   }

  // }, [pinnedTabs])

  // rebuild tabs if any of the store slices changes
  // slices could include tab.name updates
  useEffect(() => {
    if (loadedTabs) {
      dispatch(rebuildTabs(queryData));
    }
  }, [loadedTabs, models, content, files, queryData, apps, users]);

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

  const getTabs = (numTabs: number) => {
    const isCurrLocPinned = pinnedTabs.filter(
      (tab) =>
        tab.pathname === location.pathname && tab.search === location.search
    ).length;
    const tabCount = isCurrLocPinned ? numTabs : numTabs - 1;
    const topbar = pinnedTabs.filter((_, i) => i < tabCount);
    const dropdown = pinnedTabs.filter((_, i) => i >= tabCount);

    return { topbar, dropdown };
  };

  const tabWidth =
    Math.floor(
      Math.min(
        Math.max(tabBarWidth / pinnedTabs.length, MIN_TAB_WIDTH),
        MAX_TAB_WIDTH
      )
    ) -
    TAB_PADDING -
    TAB_BORDER;

  //const inactiveTabs = [] //tabs.filter(tab => tab.pathname !== location.pathname)
  const inactiveTabs = pinnedTabs.filter(
    (tab) => !tabLocationEquality(tab, location)
  );

  const isCurrLocPinned = pinnedTabs.filter(
    (tab) =>
      tab.pathname === location.pathname && tab.search === location.search
  ).length;
  // const numTabs = isCurrLocPinned ? Math.floor(tabBarWidth / tabWidth) : Math.floor(tabBarWidth / tabWidth) - 1;
  const numTabs = Math.floor(tabBarWidth / tabWidth);

  // Adjust by 1 to accommodate the active tab
  const topBarTabs = inactiveTabs.filter((_, i) => i < numTabs - 1);
  const dropDownTabs = inactiveTabs.filter((_, i) => i >= numTabs - 1);

  const { topbar, dropdown } = getTabs(numTabs);
  // console.table({
  //   'curr loc pinned': isCurrLocPinned,
  //   // 'pinnedTabs': pinnedTabs.length,
  //   'topbarTabs': newTopBarTabs.length,
  //   'dropdownTabs': newDropdownTabs.length
  // });
  // console.log(isCurrLocPinned, numTabs);

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
          {/* <ActiveTab tabWidth={tabWidth} />
          <InactiveTabGroup tabs={topBarTabs} tabWidth={tabWidth} /> */}
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
