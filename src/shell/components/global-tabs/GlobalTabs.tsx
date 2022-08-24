import { memo, useEffect, useLayoutEffect, useRef, useState, FC } from "react";
import { createDispatchHook, useDispatch, useSelector } from "react-redux";
import { useLocation, Link as Link } from "react-router-dom";
import { debounce } from "lodash";

import { Dropdown } from "./components/Dropdown";
import { ActiveTab, InactiveTabGroup } from "./components/Tab";
import { ThemeProvider } from "@mui/material/styles";
import { theme } from "@zesty-io/material";
import Stack from "@mui/material/Stack";

import {
  unpinTab,
  unpinManyTabs,
  loadTabs,
  rebuildTabs,
  parsePath,
  createTab,
  tabLocationEquality,
} from "../../../shell/store/ui";
import { AppState } from "../../store/types";

const MIN_TAB_WIDTH = 150;
const MAX_TAB_WIDTH = 200;
const TAB_PADDING = 16;
const TAB_BORDER = 1;

export default memo(function GlobalTabs() {
  const location = useLocation();

  const dispatch = useDispatch();
  const pinnedTabs = useSelector((state: AppState) => state.ui.pinnedTabs);

  const instanceZUID = useSelector((state: AppState) => state.instance.ZUID);
  const loadedTabs = useSelector((state: AppState) => state.ui.loadedTabs);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const models = useSelector((state: AppState) => state.models);
  const apps = useSelector((state: AppState) => state.apps.installed);

  const content = useSelector((state: AppState) => state.content);
  const files = useSelector((state: AppState) => state.files);
  const mediaGroups = useSelector((state: AppState) => state.media.groups);
  const state = useSelector((state: AppState) => state);
  const [tabBarWidth, setTabBarWidth] = useState(0);

  // For the window title
  const instanceName = useSelector((state: AppState) => state.instance.name);

  // update state if window is resized (debounced)
  useEffect(() => {
    const debouncedResize = debounce(function handleResize() {
      setWindowWidth(window.innerWidth);
    }, 300);

    window.addEventListener("resize", debouncedResize);
    return () => window.removeEventListener("resize", debouncedResize);
  }, []);

  // load tabs from Indexeddb
  useEffect(() => {
    dispatch(loadTabs(instanceZUID));
  }, [instanceZUID]);

  useEffect(() => {
    //setSt
    const { pathname, search } = location;
    const parsedPath = parsePath({ pathname, search });
    const t = createTab(state, parsedPath);
    const { app } = t;
    const item = t.name || t.pathname;
    const title = `${app} - ${item} - Zesty.io - ${instanceName} - Manager`;
    // set the title
    document.title = title;
    const oldTitle = document.title;
    return () => {
      document.title = oldTitle;
    };
  }, [location.pathname, location.search]);

  // rebuild tabs if any of the store slices changes
  // slices could include tab.name updates
  useEffect(() => {
    if (loadedTabs) {
      dispatch(rebuildTabs());
    }
  }, [loadedTabs, models, content, files, mediaGroups, apps]);

  /*
  const activeTabRef = useRef();
  useEffect(() => {
    if (activeTabRef.current) {
      activeTabRef.current.scrollIntoView();
    }
  }, [tabs]);
  */

  // measure the tab bar width and set state
  // to trigger a synchronous re-render before paint
  // recalculate tab bar width if window is resized
  const tabContainerRef = useRef(null);
  useLayoutEffect(() => {
    if (tabContainerRef.current) {
      setTabBarWidth(
        Math.floor(tabContainerRef.current.getBoundingClientRect().width)
      );
    }
  }, [windowWidth]);

  // we want to synchronize tabs.length with tab width
  // if we used useEffect here, we would get new tabs.length
  // with old tab width
  // cheap enough to run every render
  let tabWidth = MIN_TAB_WIDTH; //150;
  if (pinnedTabs.length) {
    tabWidth =
      Math.floor(
        Math.min(
          Math.max(tabBarWidth / pinnedTabs.length, MIN_TAB_WIDTH),
          MAX_TAB_WIDTH
        )
      ) -
      TAB_PADDING -
      TAB_BORDER;
  }

  //const inactiveTabs = [] //tabs.filter(tab => tab.pathname !== location.pathname)
  const inactiveTabs = pinnedTabs.filter(
    (tab) => !tabLocationEquality(tab, location)
  );

  const numTabs = Math.floor(tabBarWidth / tabWidth);

  const topBarTabs = inactiveTabs.filter((t, i) => i < numTabs);
  const dropDownTabs = inactiveTabs.filter((t, i) => i >= numTabs);

  return (
    <ThemeProvider theme={theme}>
      <Stack
        ref={tabContainerRef}
        component="nav"
        direction="row"
        sx={{
          height: "46px",
          padding: "8px 0 0 0",
          display: "grid",
          gridTemplateColumns: "1fr 80px",
        }}
      >
        <Stack
          component="ol"
          direction="row"
          sx={{
            display: "flex",
            overflow: "hidden",
          }}
        >
          <ActiveTab tabWidth={tabWidth} />
          <InactiveTabGroup tabs={topBarTabs} tabWidth={tabWidth} />
        </Stack>
        <Dropdown
          tabs={dropDownTabs}
          tabWidth={tabWidth}
          removeOne={(tab) => {
            dispatch(unpinTab(tab));
          }}
          removeMany={(tabs) => {
            dispatch(unpinManyTabs(tabs));
          }}
        />
      </Stack>
    </ThemeProvider>
  );
});
