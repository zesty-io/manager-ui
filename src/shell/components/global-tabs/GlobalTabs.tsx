import { memo, useEffect, useLayoutEffect, useRef, useState, FC } from "react";
import { createDispatchHook, useDispatch, useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import cx from "classnames";
import usePrevious from "react-use/lib/usePrevious";
import { debounce } from "lodash";

import { AppLink } from "@zesty-io/core/AppLink";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimesCircle } from "@fortawesome/free-solid-svg-icons";
import PinIcon from "@mui/icons-material/PushPin";
import OutlinedPinIcon from "@mui/icons-material/PushPinOutlined";

// For dropdown
import Button from "@mui/material/Button";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Input from "@mui/material/Input";

import {
  pinTab,
  unpinTab,
  closeTab,
  openTab,
  loadTabs,
  rebuildTabs,
  parsePath,
  Tab,
  createTab,
} from "../../../shell/store/ui";
import { AppState } from "../../store/types";

import styles from "./GlobalTabs.less";

const MIN_TAB_WIDTH = 150;
const MAX_TAB_WIDTH = 200;
const TAB_PADDING = 16;
const TAB_BORDER = 1;

export default memo(function GlobalTabs() {
  const location = useLocation();

  const dispatch = useDispatch();
  const tabs = useSelector((state: AppState) => state.ui.tabs);
  const pinnedTabs = useSelector((state: AppState) => state.ui.pinnedTabs);

  const instanceZUID = useSelector((state: AppState) => state.instance.ZUID);
  const loadedTabs = useSelector((state: AppState) => state.ui.loadedTabs);
  const prevPath = usePrevious(location.pathname);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const models = useSelector((state: AppState) => state.models);

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

  // openTab every time path changes
  useEffect(() => {
    if (loadedTabs) {
      dispatch(openTab({ path: location.pathname, prevPath }));
    }
  }, [loadedTabs, location.pathname]);
  useEffect(() => {
    //setSt
    const parsedPath = parsePath(location.pathname);
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
  }, [location.pathname]);

  // rebuild tabs if any of the store slices changes
  // slices could include tab.name updates
  useEffect(() => {
    if (loadedTabs) {
      dispatch(rebuildTabs());
    }
  }, [loadedTabs, models, content, files, mediaGroups]);

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
  let tabWidth = 0;
  if (tabs.length) {
    tabWidth =
      Math.floor(
        Math.min(
          Math.max(tabBarWidth / tabs.length, MIN_TAB_WIDTH),
          MAX_TAB_WIDTH
        )
      ) -
      TAB_PADDING -
      TAB_BORDER;
  }

  //const inactiveTabs = [] //tabs.filter(tab => tab.pathname !== location.pathname)
  const inactiveTabs = pinnedTabs.filter(
    (tab) => tab.pathname !== location.pathname
  );

  const activeTab = tabs.find((tab) => tab.pathname === location.pathname);

  if (!activeTab) {
    // this should never happen
    console.error("no active tab", tabs);
  }

  const numTabs = Math.floor(tabBarWidth / tabWidth) - 3;

  const displayedTabs = inactiveTabs.filter((t, i) => i < numTabs);
  const nonDisplayedTabs = inactiveTabs.filter(
    (t, i) => i >= numTabs && t !== activeTab
  );
  const orderedTabs = activeTab ? [activeTab, ...displayedTabs] : displayedTabs;
  console.log({ activeTab, inactiveTabs, orderedTabs, pinnedTabs });
  const dropdown = nonDisplayedTabs.length ? (
    <Dropdown
      tabs={nonDisplayedTabs}
      isPinned={true}
      tabWidth={tabWidth}
      onClick={(tab) => {
        console.log("click");
        const isPinned =
          pinnedTabs.findIndex((t) => tab.pathname === t.pathname) >= 0;
        if (isPinned) dispatch(unpinTab(tab));
        else dispatch(pinTab(tab));
      }}
    />
  ) : null;

  return (
    <nav ref={tabContainerRef} className={styles.QuickLinks}>
      <ol className={styles.Links}>
        {orderedTabs.map((tab, i) => {
          const isPinned =
            pinnedTabs.findIndex((t) => tab.pathname === t.pathname) >= 0;
          console.log({ tab, pinnedTabs, isPinned });
          return (
            <Tab
              tab={tab}
              key={tab.pathname}
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
        {dropdown}
      </ol>
    </nav>
  );
});

type TabComponent = {
  tab: Tab;
  tabWidth: number;
  isPinned: boolean;
  onClick: () => void;
};
const Tab: FC<TabComponent> = ({ tab, tabWidth, isPinned, onClick }) => {
  const isActiveTab = tab.pathname === location.pathname;
  console.log(tab);
  const tabProps = {};
  /*
  if (isActiveTab) {
    tabProps.ref = activeTabRef;
  }
  */
  const Pin = isPinned ? PinIcon : OutlinedPinIcon;
  return (
    <li
      style={{ width: `${tabWidth}px` }}
      className={cx(styles.Route, isActiveTab ? styles.active : null)}
      {...tabProps}
    >
      <AppLink to={`${tab.pathname}`}>
        {tab.icon && <FontAwesomeIcon icon={tab.icon} />}
        &nbsp;
        {tab.name ? tab.name : `${tab.pathname.slice(1)}`}
      </AppLink>
      <span className={styles.Close} onClick={onClick}>
        <Pin fontSize="small" />
      </span>
    </li>
  );
};

type Dropdown = {
  tabs: Tab[];
  tabWidth: number;
  isPinned: boolean;
  onClick: (tab: Tab) => void;
};

const Dropdown: FC<Dropdown> = ({ tabs, tabWidth, isPinned, onClick }) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const [filter, setFilter] = useState("");
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const filterTerm = filter.trim().toLocaleLowerCase();
  // TODO consider memoizing this
  const filteredTabs = tabs.filter(
    (tab) =>
      tab.pathname.toLocaleLowerCase().includes(filterTerm) ||
      tab.name.toLocaleLowerCase().includes(filterTerm)
  );

  return (
    <div>
      <Button
        id="basic-button"
        aria-controls={open ? "basic-menu" : undefined}
        aria-haspopup="true"
        aria-expanded={open ? "true" : undefined}
        onClick={handleClick}
      >
        See more
      </Button>
      <Menu
        id="basic-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          "aria-labelledby": "basic-button",
        }}
      >
        <MenuItem>
          <Input
            value={filter}
            onChange={(evt) => setFilter(evt.target.value)}
          />
        </MenuItem>
        <MenuItem>
          <Button onClick={() => filteredTabs.forEach((tab) => onClick(tab))}>
            Clear all
          </Button>
        </MenuItem>
        {filteredTabs.map((tab) => (
          <MenuItem>
            <Tab
              tab={tab}
              tabWidth={tabWidth}
              isPinned={isPinned}
              onClick={() => onClick(tab)}
            />
          </MenuItem>
        ))}
      </Menu>
    </div>
  );
};
