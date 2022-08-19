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
} from "../../../shell/store/ui";
import { AppState } from "../../store/types";

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
  // TODO WTF?
  let tabWidth = 0; //100;
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

  const activeTab =
    tabs.find((tab) => tab.pathname === location.pathname) ||
    createTab(state, parsePath(location.pathname));

  if (!activeTab) {
    // this should never happen
    console.error("no active tab", tabs);
  }

  //TODO FIX WUT?
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
              pinnedTabs.findIndex((t) => tab.pathname === t.pathname) >= 0;
            console.log({ tab, pinnedTabs, isPinned });
            return (
              <TopTab
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
          <Dropdown
            tabs={nonDisplayedTabs}
            isPinned={true}
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

type TopTab = {
  tab: Tab;
  tabWidth: number;
  isPinned: boolean;
  onClick: () => void;
};
const TopTab: FC<TopTab> = ({ tab, tabWidth, isPinned, onClick }) => {
  const isActiveTab = tab.pathname === location.pathname;
  console.log(tab);
  const tabProps = {};
  /*
  if (isActiveTab) {
    tabProps.ref = activeTabRef;
  }
  */
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
        backgroundColor: isActiveTab ? "white" : "grey.800",

        width: `${tabWidth}px`,
        // taken from old less
        alignItems: "center",
        display: "flex",
        flexShrink: 0,
      }}
      {...tabProps}
    >
      <TabInternals tab={tab} isPinned={isPinned} onClick={onClick} />
    </Box>
  );
};

type TabInternals = {
  tab: Tab;
  isPinned: boolean;
  onClick: () => void;
};
const TabInternals: FC<TabInternals> = ({ tab, isPinned, onClick }) => {
  const Pin = isPinned ? PinIcon : OutlinedPinIcon;
  return (
    <>
      <MuiLink
        component={Link}
        to={`${tab.pathname}`}
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
    </>
  );
};

type Dropdown = {
  tabs: Tab[];
  tabWidth: number;
  isPinned: boolean;
  removeOne: (tab: Tab) => void;
  removeMany: (tabs: Tab[]) => void;
};

const Dropdown: FC<Dropdown> = ({ tabs, isPinned, removeOne, removeMany }) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const [filter, setFilter] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  if (tabs.length === 0) {
    if (open) {
      handleClose();
      setFilter("");
    }
    return null;
  }
  const filterTerm = filter.trim().toLocaleLowerCase();
  // TODO consider memoizing this
  const filteredTabs = tabs.filter(
    (tab) =>
      tab.pathname.toLocaleLowerCase().includes(filterTerm) ||
      (tab.name && tab.name.toLocaleLowerCase().includes(filterTerm))
  );

  return (
    <>
      <div>
        <Button
          id="basic-button"
          aria-controls={open ? "basic-menu" : undefined}
          aria-haspopup="true"
          aria-expanded={open ? "true" : undefined}
          onClick={handleClick}
        >
          More
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
              placeholder="Search Tabs"
              startAdornment={<SearchIcon />}
              value={filter}
              onChange={(evt) => setFilter(evt.target.value)}
            />
          </MenuItem>
          <MenuItem>
            <Stack direction="row" justifyContent="space-between">
              PINNED TABS
              {Boolean(filterTerm) || (
                <Button onClick={() => setConfirmOpen(true)}>UNPIN ALL</Button>
              )}
            </Stack>
          </MenuItem>
          {filteredTabs.map((tab) => (
            <MenuItem>
              <TabInternals
                tab={tab}
                key={tab.pathname}
                isPinned={isPinned}
                onClick={() => removeOne(tab)}
              />
            </MenuItem>
          ))}
        </Menu>
      </div>
      <ConfirmDialog
        open={confirmOpen}
        callback={(confirmed) => {
          console.log({ confirmed });
          if (confirmed) {
            setFilter("");
            handleClose();
            removeMany(tabs);
          }
          setConfirmOpen(false);
        }}
        title="Unpin All Tabs in See More Menu?"
        content="This  cannot be undone"
      />
    </>
  );
};
