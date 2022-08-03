import { createSlice } from "@reduxjs/toolkit";
import { Dispatch } from "redux";
// TODO why do I have to use relative paths here?
import idb from "../../utility/idb";
import history from "../../utility/history";

import {
  faCode,
  faCog,
  faDatabase,
  faEdit,
  faFolder,
  faFile,
  faListAlt,
  faExternalLinkSquareAlt,
  faLink,
  faHome,
  IconDefinition,
} from "@fortawesome/free-solid-svg-icons";
import { isEqual } from "lodash";

const typeToIconMap = {
  templateset: faFile,
  pageset: faListAlt,
  dataset: faDatabase,
  external: faExternalLinkSquareAlt,
  internal: faLink,
  item: faFile,
  homepage: faHome,
  socialfeed: faDatabase,
};

const ZUID_REGEX = /[a-zA-Z0-9]{1,5}-[a-zA-Z0-9]{6,10}-[a-zA-Z0-9]{5,35}/;

export type Tab = {
  pathname: string;
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
    loadTabsSuccess(state: UIState, action: { payload: Tab[] }) {
      const tabs = action.payload;
      state.tabs = tabs;
      state.loadedTabs = true;
    },
    setTabs(state: UIState, action: { payload: Tab[] }) {
      state.tabs = action.payload;
    },
    pinTabASDF(state: UIState, action: { payload: Tab }) {
      const tabIndex = state.pinnedTabs.findIndex(
        (tab) => tab.pathname === action.payload.pathname
      );
      console.log({ tabIndex });
      if (tabIndex < 0) {
        // if it doesn't exist, add it
        state.pinnedTabs = [action.payload, ...state.pinnedTabs];
      } else {
        // if it does exist, update it with new information
        // state.pinnedTabs[tabIndex] = action.payload
      }
    },
    unpinTabASDF(state: UIState, action: { payload: Tab }) {
      const newTabs = state.tabs.filter(
        (tab) => tab.pathname === action.payload.pathname
      );
      state.tabs = newTabs;
    },
    loadedUI(
      state: UIState,
      action: {
        payload: Pick<
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
function parsePath(path: string) {
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

  return { path, parts, zuid, prefix, contentSection };
}

type ParsedPath = ReturnType<typeof parsePath>;
function validatePath(parsedPath: ParsedPath) {
  const { parts, zuid, contentSection } = parsedPath;
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

/*
  TODO
  The UI state is well typed but the rest of the application state is entirely
  untyped (i.e. any). Ideally AppState would be completely specified, but that
  would require typing the entire redux store of the app just for this one
  function. For now, the ui member is typed but every other member is any

  Eventually, after the rest of the redux store is typed, we will replace this
  with an imported AppState that has the proper types
*/
type AppState = { ui: UIState } & { [key: string]: any };
function createTab(state: AppState, parsedPath: ParsedPath) {
  const { path, parts, zuid, prefix } = parsedPath;
  const tab: Tab = { pathname: path };

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
        tab.icon =
          typeToIconMap?.[model?.type as keyof typeof typeToIconMap] ||
          faDatabase;
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
  return (dispatch: Dispatch) => {
    return idb.get(`${instanceZUID}:session:routes`).then((tabs = []) => {
      return dispatch(actions.loadTabsSuccess(tabs));
    });
  };
}

export function pinTab({ pathname }: { pathname: string }) {
  return async (dispatch: Dispatch, getState: () => AppState) => {
    const state = getState();
    const parsedPath = parsePath(pathname);
    const tab = createTab(state, parsedPath);
    await dispatch(actions.pinTabASDF(tab));
    await idb.set(`${state.instance.ZUID}:pinned`, state.ui.pinnedTabs);
  };
}

export function unpinTab({ pathname }: { pathname: string }) {
  return (dispatch: Dispatch, getState: () => AppState) => {
    const state = getState();
    const parsedPath = parsePath(pathname);
    const tab = createTab(state, parsedPath);
    dispatch(actions.unpinTabASDF(tab));
    idb.set(`${state.instance.ZUID}:pinned`, state.ui.pinnedTabs);
  };
}

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

export function rebuildTabs() {
  return (dispatch: Dispatch, getState: () => AppState) => {
    const state = getState();
    const newTabs = state.ui.tabs.map((tab: Tab) =>
      createTab(state, parsePath(tab.pathname))
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
