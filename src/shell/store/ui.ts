import { createSlice } from "@reduxjs/toolkit";
import { Dispatch } from "redux";
import { Location } from "history";
// TODO why do I have to use relative paths here?
import idb from "../../utility/idb";
import history from "../../utility/history";
import { AppState } from "./types";

import {
  faCode,
  faCog,
  faChartLine,
  faDatabase,
  faEdit,
  faFolder,
  faPlug,
  faBullseye,
  faImage,
  faAddressCard,
  IconDefinition,
} from "@fortawesome/free-solid-svg-icons";
import { isEqual } from "lodash";

const ZUID_REGEX = /[a-zA-Z0-9]{1,5}-[a-zA-Z0-9]{6,10}-[a-zA-Z0-9]{5,35}/;

export type Tab = {
  pathname: string;
  search: string;
  name?: string;
  icon?: IconDefinition;
};
export type CodeEditorPosition = Record<
  string,
  { lineNumber: number; column: number }
>;
export type UIState = {
  loadedTabs: boolean;
  tabs: Tab[];
  pinnedTabs: Tab[];
  openNav: boolean;
  contentNav: boolean;
  contentNavHover: boolean;
  contentActions: boolean;
  contentActionsHover: boolean;
  duoMode: boolean;
  codeEditorPosition: null | CodeEditorPosition;
};
export const ui = createSlice({
  name: "ui",
  initialState: {
    loadedTabs: false,
    tabs: [],
    pinnedTabs: [],
    openNav: true,
    contentNav: true,
    contentNavHover: false,
    contentActions: true,
    contentActionsHover: false,
    duoMode: false,
    codeEditorPosition: null,
  },
  reducers: {
    loadTabsSuccess(
      state: UIState,
      action: { payload: { tabs: Tab[]; pinnedTabs: Tab[] } }
    ) {
      const { tabs, pinnedTabs } = action.payload;
      state.tabs = tabs;
      state.pinnedTabs = pinnedTabs;
      state.loadedTabs = true;
    },
    setTabs(state: UIState, action: { payload: Tab[] }) {
      state.tabs = action.payload;
    },
    setPinnedTabs(state: UIState, action: { payload: Tab[] }) {
      state.pinnedTabs = action.payload;
    },
    loadedUI(
      state: UIState,
      action: {
        payload?: Pick<
          UIState,
          "openNav" | "contentNav" | "contentActions" | "duoMode"
        >;
      }
    ) {
      if (action.payload) {
        state.openNav = action.payload.openNav;
        state.contentNav = action.payload.contentNav;
        state.contentActions = action.payload.contentActions;
        state.duoMode = action.payload.duoMode;
      }
    },
    setGlobalNav(state: UIState, action: { payload: boolean }) {
      state.openNav = action.payload;
    },
    setContentNav(state: UIState, action: { payload: boolean }) {
      state.contentNav = action.payload;
    },
    setContentActions(state: UIState, action: { payload: boolean }) {
      state.contentActions = action.payload;
    },
    setContentActionsHover(state: UIState, action: { payload: boolean }) {
      state.contentActionsHover = action.payload;
    },
    setDuoMode(state: UIState, action: { payload: boolean }) {
      state.duoMode = action.payload;
    },
    setContentNavHover(state: UIState, action: { payload: boolean }) {
      state.contentNavHover = action.payload;
    },
    setCodeEditorPosition(
      state: UIState,
      action: { payload: CodeEditorPosition }
    ) {
      state.codeEditorPosition = action.payload;
    },
  },
});

export const { actions, reducer } = ui;

// Thunk helper functions
export function tabLocationEquality(tab1: TabLocation, tab2: TabLocation) {
  return tab1.pathname === tab2.pathname && tab1.search === tab2.search;
}

type TabLocation = Pick<Location, "pathname" | "search">;
export function parsePath({ pathname: path, search }: TabLocation) {
  let parts = path.split("/").filter((part) => part);
  let zuid = null;
  let prefix = null;
  let contentSection = null;

  if (parts.length > 1) {
    if (
      parts[parts.length - 1] === "head" ||
      parts[parts.length - 1] === "meta"
    ) {
      contentSection = parts.pop();
    }
    if (ZUID_REGEX.test(parts[parts.length - 1])) {
      zuid = parts.pop();
    }
  }

  if (zuid) {
    prefix = zuid.split("-")[0];
  }

  return { path, parts, zuid, prefix, contentSection, search };
}

export type ParsedPath = ReturnType<typeof parsePath>;
function validatePath(parsedPath: ParsedPath) {
  const { parts, zuid, contentSection } = parsedPath;
  console.log(parsedPath);
  // don't show root
  if (parts.length === 0) {
    return false;
  }
  // don't show global tab for top level section
  if (parts.length === 1 && !zuid) {
    return false;
  }
  // don't show global tab for content head/meta sections
  if (contentSection) {
    return false;
  }
  // don't show global tab for settings first level section (except robots, styles)
  if (
    parts.length === 2 &&
    parts[0] === "settings" &&
    parts[1] !== "robots" &&
    parts[1] !== "styles"
  ) {
    return false;
  }

  // don't show tertiary style tabs
  if (parts.length === 3 && parts[0] === "settings" && parts[1] === "styles") {
    return false;
  }

  // Don't show Schema Field Tabs
  if (parts[0] === "schema" && parts[2] === "field") {
    return false;
  }

  // Don't show Media File Tabs
  if (parts[0] === "media" && parts[2] === "file") {
    return false;
  }

  // Don't show Code Editor Diff Tabs
  if (parts[0] === "code" && parts[4] === "diff") {
    return false;
  }
  return true;
}

export function createTab(state: AppState, parsedPath: ParsedPath) {
  const { path, parts, zuid, prefix, search } = parsedPath;
  const tab: Tab = { pathname: path, search };
  console.log(parsedPath);

  const appNameMap = {
    seo: {
      name: "SEO",
      icon: faBullseye,
    },
    content: {
      name: "Content",
      icon: faEdit,
    },
    media: {
      name: "Media",
      icon: faImage,
    },
    schema: {
      name: "Schema",
      icon: faDatabase,
    },
    code: {
      name: "Code",
      icon: faCode,
    },
    leads: {
      name: "Leads",
      icon: faAddressCard,
    },
    settings: {
      name: "Settings",
      icon: faCog,
    },
  };

  if (parts[0] === "app") {
    tab.icon = faPlug;
    const app = state.apps.installed.find((app: any) => app.ZUID === zuid);
    tab.name = app?.label || app?.name || "Custom App";
  } else if (parts[0] === "reports") {
    tab.icon = faChartLine;
    switch (parts[1]) {
      case "activity-log":
        tab.name = "Activity Log";
        break;
      case "metrics":
        tab.name = "Metrics";
        break;
      case "analytics":
        tab.name = "Analytics";
        break;
    }
  } else if (parts[0] in appNameMap) {
    const name = parts[0] as keyof typeof appNameMap;
    tab.name = appNameMap[name].name;
    tab.icon = appNameMap[name].icon;
  }
  // resolve ZUID from store to determine display information
  switch (prefix) {
    case "1":
    case "2":
      const group = state.media.groups[zuid];
      if (group) {
        tab.name = group.name;
      }
      tab.icon = faFolder;
      break;
    case "6":
      tab.icon = faDatabase;

      if (state.models) {
        const model: any = state.models[zuid];

        tab.name = model?.label;
        tab.icon = faDatabase;
      }
      break;
    case "7":
      if (state.content) {
        const item = state.content[zuid];
        if (item && item.web) {
          tab.name =
            item.web.metaLinkText || item.web.metaTitle || item.web.pathPart;
        }
      }
      tab.icon = faEdit;
      break;
    case "10":
    case "11":
      if (state.files) {
        const selectedFile = state.files.find(
          (file: any) => file.ZUID === zuid
        );
        if (selectedFile) {
          tab.name = selectedFile.fileName;
        }
      }
      tab.icon = faCode;
      break;
    case "17":
      break;
  }
  if (parts[0] === "settings") {
    tab.icon = faCog;
    if (parts[2]) {
      if (parts[1] === "instance") {
        tab.name =
          parts[2]
            .replace("-", " ")
            .replace("_", " ")
            .split(" ")
            .map(toCapitalCase)
            .join(" ") + " Settings";
      } else if (parts[1] === "fonts") {
        tab.name = toCapitalCase(parts[2]) + " Fonts";
      } else {
        tab.name = toCapitalCase(parts[1]) + " Settings";
      }
    } else if (parts[1] === "styles") {
      tab.name = toCapitalCase(parts[1]) + " Settings";
    }
  }
  return tab;
}

function toCapitalCase(string: string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

// Thunks
export function loadTabs(instanceZUID: string) {
  return async (dispatch: Dispatch) => {
    const tabs = (await idb.get(`${instanceZUID}:session:routes`)) || [];
    const pinnedTabs = (await idb.get(`${instanceZUID}:pinned`)) || [];
    return dispatch(actions.loadTabsSuccess({ tabs, pinnedTabs }));
  };
}

export function pinTab({ pathname, search }: TabLocation) {
  return async (dispatch: Dispatch, getState: () => AppState) => {
    const state = getState();
    const parsedPath = parsePath({ pathname, search });
    const tab = createTab(state, parsedPath);
    let newTabs = state.ui.pinnedTabs;
    const tabIndex = state.ui.pinnedTabs.findIndex((t) =>
      tabLocationEquality(t, tab)
    );
    console.log({ tabIndex });
    if (tabIndex < 0) {
      // if it doesn't exist, add it
      //state.pinnedTabs = [action.payload, ...state.pinnedTabs];
      newTabs = [tab, ...state.ui.pinnedTabs];
    } else {
      // if it does exist, update it with new information
      // state.pinnedTabs[tabIndex] = action.payload
    }
    dispatch(actions.setPinnedTabs(newTabs));
    await idb.set(`${state.instance.ZUID}:pinned`, newTabs);
  };
}

export function unpinTab({ pathname, search }: TabLocation) {
  return (dispatch: Dispatch, getState: () => AppState) => {
    const state = getState();
    const parsedPath = parsePath({ pathname, search });
    const tab = createTab(state, parsedPath);
    const newTabs = state.ui.pinnedTabs.filter(
      (t) => t.pathname !== tab.pathname
    );
    dispatch(actions.setPinnedTabs(newTabs));
    idb.set(`${state.instance.ZUID}:pinned`, newTabs);
  };
}

export function unpinManyTabs(tabs: TabLocation[]) {
  return (dispatch: Dispatch, getState: () => AppState) => {
    const state = getState();
    const pathnames = new Set(
      tabs.map(({ pathname, search }) => pathname + search)
    );
    const newTabs = state.ui.pinnedTabs.filter(
      (t) => !pathnames.has(t.pathname + t.search)
    );
    dispatch(actions.setPinnedTabs(newTabs));
    idb.set(`${state.instance.ZUID}:pinned`, newTabs);
  };
}

/*
export function openTab({
  path,
  prevPath,
}: {
  path: string;
  prevPath: string;
}) {
  return (dispatch: Dispatch, getState: () => AppState) => {
    const state = getState();
    const parsedPath = parsePath(path);
    if (validatePath(parsedPath)) {
      const tabIndex = state.ui.tabs.findIndex(
        (tab: Tab) => tab.pathname === path
      );
      // add new tab if not existing
      if (tabIndex === -1) {
        const newTab = createTab(state, parsedPath);
        const activeTabIndex = state.ui.tabs.findIndex(
          (t) => t.pathname === prevPath
        );
        // calculate new tabs here instead of reducer
        // so we have them on hand for idb.set
        let newTabs = [...state.ui.tabs];
        newTabs.splice(activeTabIndex + 1, 0, newTab);
        // Maximum of 20 route records
        newTabs = newTabs.slice(0, 20);
        dispatch(actions.setTabs(newTabs));
        idb.set(`${state.instance.ZUID}:session:routes`, newTabs);
      }
    }
  };
}

export function closeTab(path: string) {
  return (dispatch: Dispatch, getState: () => AppState) => {
    const state = getState();
    const removeTabIndex = state.ui.tabs.findIndex(
      (tab: Tab) => tab.pathname === path
    );
    if (removeTabIndex !== -1) {
      // calculate new tabs here instead of reducer
      // so we have them on hand for idb.set
      const newTabs = [...state.ui.tabs];
      newTabs.splice(removeTabIndex, 1);
      // if we are removing activeTab
      // switch to next or previous (if no next) tab
      if (
        history.location.pathname === state.ui.tabs[removeTabIndex].pathname
      ) {
        const nextTab = state.ui.tabs[removeTabIndex + 1];
        const prevTab = state.ui.tabs[removeTabIndex - 1];
        if (nextTab) {
          history.push(nextTab.pathname);
        } else if (prevTab) {
          history.push(prevTab.pathname);
        }
      }

      dispatch(actions.setTabs(newTabs));
      idb.set(`${state.instance.ZUID}:session:routes`, newTabs);
    }
  };
}
*/

export function rebuildTabs() {
  return (dispatch: Dispatch, getState: () => AppState) => {
    const state = getState();
    const newTabs = state.ui.tabs.map((tab: Tab) =>
      createTab(state, parsePath(tab))
    );
    /* 
      This function is called on every slice update so
      we first determine if the tabs have changed before setting
      a new set of tabs to the store
    */
    if (!isEqual(state.ui.tabs, newTabs)) {
      dispatch(actions.setTabs(newTabs));
      idb.set(`${state.instance.ZUID}:session:routes`, newTabs);
    }
  };
}
