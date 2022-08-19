import { memo, useEffect, useLayoutEffect, useRef, useState, FC } from "react";
import { createDispatchHook, useDispatch, useSelector } from "react-redux";
import { useLocation, Link as Link } from "react-router-dom";
import cx from "classnames";
import usePrevious from "react-use/lib/usePrevious";
import { debounce } from "lodash";

import { ConfirmDialog } from "@zesty-io/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimesCircle } from "@fortawesome/free-solid-svg-icons";
import PinIcon from "@mui/icons-material/PushPin";
import SearchIcon from "@mui/icons-material/Search";
import OutlinedPinIcon from "@mui/icons-material/PushPinOutlined";

import { Dropdown } from "./components/Dropdown";
import { TopTab } from "./components/Tab";
import { ThemeProvider } from "@mui/material/styles";
import { theme } from "@zesty-io/material";
import MuiLink from "@mui/material/Link";
import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";
// For dropdown
import Button from "@mui/material/Button";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Input from "@mui/material/Input";

import {
  pinTab,
  unpinTab,
  unpinManyTabs,
  loadTabs,
  rebuildTabs,
  parsePath,
  Tab,
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
  const prevPath = usePrevious(location.pathname);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const models = useSelector((state: AppState) => state.models);
  const apps = useSelector((state: AppState) => state.apps.installed);

  const content = useSelector((state: AppState) => state.content);
  const files = useSelector((state: AppState) => state.files);
  const mediaGroups = useSelector((state: AppState) => state.media.groups);
  // TODO is this going to cause rerenders all the time?
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
    const { parts } = parsedPath;
    const app = parts[0];
    const item = t.name || t.pathname;
    const title = `${app} - ${item} - Zesty.io - ${instanceName} - Manager`;
    console.log({ title });
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
  let tabWidth = MIN_TAB_WIDTH; //100;
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
  console.log({ inactiveTabs, pinnedTabs });

  const activeTab =
    pinnedTabs.find((tab) => tabLocationEquality(tab, location)) ||
    createTab(state, parsePath(location));

  if (!activeTab) {
    // this should never happen
    console.error("no active tab", pinnedTabs);
  }

  const numTabs = Math.floor(tabBarWidth / tabWidth) - 3;

  const displayedTabs = inactiveTabs.filter((t, i) => i < numTabs);
  const nonDisplayedTabs = inactiveTabs.filter(
    (t, i) => i >= numTabs && t !== activeTab
  );
  const orderedTabs = activeTab ? [activeTab, ...displayedTabs] : displayedTabs;
  console.log({ activeTab, inactiveTabs, orderedTabs, pinnedTabs });

  return (
    <ThemeProvider theme={theme}>
      <Stack
        ref={tabContainerRef}
        component="nav"
        direction="row"
        sx={{ flex: 1 }}
      >
        <Stack
          component="ol"
          direction="row"
          sx={{
            flex: 1,
          }}
        >
          {orderedTabs.map((tab, i) => {
            const isPinned =
              pinnedTabs.findIndex((t) => tabLocationEquality(t, tab)) >= 0;
            console.log({ tab, pinnedTabs, isPinned });
            return (
              <TopTab
                tab={tab}
                key={tab.pathname + tab.search}
                isPinned={isPinned}
                tabWidth={tabWidth}
                onClick={() => {
                  console.log("click");
                  if (isPinned) dispatch(unpinTab(tab));
                  else dispatch(pinTab(tab));
                }}
              />
            );
          })}
          <Dropdown
            tabs={nonDisplayedTabs}
            tabWidth={tabWidth}
            removeOne={(tab) => {
              console.log("click");
              dispatch(unpinTab(tab));
            }}
            removeMany={(tabs) => {
              console.log("click");
              dispatch(unpinManyTabs(tabs));
            }}
          />
        </Stack>
      </Stack>
    </ThemeProvider>
  );
});

const activeTabStyles = {
  backgroundColor: "white",
};
