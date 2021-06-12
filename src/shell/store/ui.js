import { createSlice } from "@reduxjs/toolkit";
import idb from "utility/idb";
import history from "utility/history";
import instanceZUID from "utility/instanceZUID";

import {
  faCode,
  faCog,
  faDatabase,
  faEdit,
  faFolder
} from "@fortawesome/free-solid-svg-icons";

const ZUID_REGEX = /[a-zA-Z0-9]{1,5}-[a-zA-Z0-9]{6,10}-[a-zA-Z0-9]{5,35}/;

const uiSlice = createSlice({
  name: "ui",
  initialState: {
    loadedTabs: false,
    tabs: [],
    openNav: true
  },
  reducers: {
    loadTabsSuccess(state, action) {
      const tabs = action.payload;
      state.tabs = tabs;
      state.loadedTabs = true;
    },
    setTabs(state, action) {
      state.tabs = action.payload;
    },
    loadedUI(state, action) {
      if (action.payload) {
        state.openNav = action.payload.openNav;
      }
    },
    toggleNav(state) {
      state.openNav = !state.openNav;
    }
  }
});

// Thunk helper functions
function parsePath(path) {
  let parts = path.split("/").filter(part => part);
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

function validatePath(parsedPath) {
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

function createTab(state, parsedPath) {
  const { path, parts, zuid, prefix } = parsedPath;
  const tab = { pathname: path };

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
      if (state.models) {
        const model = state.models[zuid];

        if (model) {
          tab.name = model.label;
        }
      }
      tab.icon = faDatabase;
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
        const selectedFile = state.files.find(file => file.ZUID === zuid);
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

function toCapitalCase(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

export default uiSlice.reducer;

export const {
  loadTabsSuccess,
  setTabs,
  loadedUI,
  toggleNav
} = uiSlice.actions;

// Thunks

export function loadTabs() {
  return dispatch => {
    return idb.get(`${instanceZUID}:session:routes`).then((tabs = []) => {
      return dispatch(loadTabsSuccess(tabs));
    });
  };
}

export function openTab({ path, prevPath }) {
  return (dispatch, getState) => {
    const state = getState();
    const parsedPath = parsePath(path);
    if (validatePath(parsedPath)) {
      const tabIndex = state.ui.tabs.findIndex(tab => tab.pathname === path);
      // add new tab if not existing
      if (tabIndex === -1) {
        const newTab = createTab(state, parsedPath);
        const activeTabIndex = state.ui.tabs.findIndex(
          t => t.pathname === prevPath
        );
        // calculate new tabs here instead of reducer
        // so we have them on hand for idb.set
        let newTabs = [...state.ui.tabs];
        newTabs.splice(activeTabIndex + 1, 0, newTab);
        // Maximum of 20 route records
        newTabs = newTabs.slice(0, 20);
        dispatch(setTabs(newTabs));
        idb.set(`${instanceZUID}:session:routes`, newTabs);
      }
    }
  };
}

export function closeTab(path) {
  return (dispatch, getState) => {
    const state = getState();
    const removeTabIndex = state.ui.tabs.findIndex(
      tab => tab.pathname === path
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

      dispatch(setTabs(newTabs));
      idb.set(`${instanceZUID}:session:routes`, newTabs);
    }
  };
}

export function rebuildTabs() {
  return (dispatch, getState) => {
    const state = getState();
    const newTabs = state.ui.tabs.map(tab =>
      createTab(state, parsePath(tab.pathname))
    );
    dispatch(setTabs(newTabs));
    idb.set(`${instanceZUID}:session:routes`, newTabs);
  };
}
