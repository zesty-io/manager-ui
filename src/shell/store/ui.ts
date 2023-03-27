import { createSlice } from "@reduxjs/toolkit";
import { Dispatch } from "redux";
import { Location } from "history";
import idb from "../../utility/idb";
import { AppState } from "./types";
import { isValid as zuidIsValid } from "zuid";
import { ContentModel } from "../../shell/services/types";
import {
  SearchRounded,
  RocketLaunchRounded,
  EditRounded,
  ImageRounded,
  BarChartRounded,
  CodeRounded,
  PowerRounded,
  SettingsRounded,
  RecentActorsRounded,
  SvgIconComponent,
  ExtensionRounded,
  ShuffleRounded,
} from "@mui/icons-material";
import { Database } from "@zesty-io/material";
import { isEqual } from "lodash";

export type Tab = {
  pathname: string;
  search: string;
  name?: string;
  app?: string;
  icon?: SvgIconComponent;
};
export type CodeEditorPosition = Record<
  string,
  { lineNumber: number; column: number }
>;

type CodeChangesModalInfo = {
  ZUID: string;
  status: string;
  fileType: string;
};

export type UIState = {
  loadedTabs: boolean;
  pinnedTabs: Tab[];
  openNav: boolean;
  contentNav: boolean;
  contentNavHover: boolean;
  contentActions: boolean;
  contentActionsHover: boolean;
  duoMode: boolean;
  codeEditorPosition: null | CodeEditorPosition;
  codeChangesModal: null | CodeChangesModalInfo;
  isUpdateFaviconModalOpen: boolean;
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
    codeChangesModal: null,
    isUpdateFaviconModalOpen: false,
  },
  reducers: {
    loadTabsSuccess(
      state: UIState,
      action: { payload: { pinnedTabs: Tab[] } }
    ) {
      const { pinnedTabs } = action.payload;
      state.pinnedTabs = pinnedTabs;
      state.loadedTabs = true;
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
    openCodeChangesModal(
      state: UIState,
      action: { payload: { ZUID: string; fileType: string; status: string } }
    ) {
      state.codeChangesModal = action.payload;
    },
    closeCodeChangesModal(state: UIState) {
      state.codeChangesModal = null;
    },
    toggleUpdateFaviconModal(state: UIState, action: { payload: boolean }) {
      state.isUpdateFaviconModalOpen = action.payload;
    },
  },
});

export const { actions, reducer } = ui;

const ICON_CONFIG: { [index: string]: SvgIconComponent } = Object.freeze({
  launchpad: RocketLaunchRounded,
  redirects: ShuffleRounded,
  content: EditRounded,
  media: ImageRounded,
  schema: Database as SvgIconComponent,
  code: CodeRounded,
  leads: RecentActorsRounded,
  settings: SettingsRounded,
  app: PowerRounded,
  reports: BarChartRounded,
  search: SearchRounded,
  apps: ExtensionRounded,
});

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
    if (zuidIsValid(parts[parts.length - 1])) {
      zuid = parts.pop();
    }
  }

  if (zuid) {
    prefix = zuid.split("-")[0];
  }

  return { path, parts, zuid, prefix, contentSection, search };
}

export type ParsedPath = ReturnType<typeof parsePath>;

export function createTab(
  state: AppState,
  parsedPath: ParsedPath,
  queryData?: any
) {
  const { path, parts, zuid, prefix, search } = parsedPath;
  const tab: Tab = { pathname: path, search };
  const appNameMap = {
    launchpad: "Launchpad",
    redirects: "Redirects",
    content: "Content",
    media: "All Media",
    schema: "Schema",
    code: "Code",
    leads: "Leads",
    settings: "Settings",
    search: "Search",
    apps: "Apps",
  };

  if (parts[0] === "app") {
    // Icon is non-serializable so it cannot be saved to idb
    Object.defineProperty(tab, "icon", {
      value: ICON_CONFIG.app,
      enumerable: false,
    });

    const app = state.apps.installed.find(
      (app: { ZUID: string }) => app.ZUID === zuid
    );
    tab.name = app?.label || app?.name || "Custom App";
  } else if (parts[0] === "reports") {
    // Icon is non-serializable so it cannot be saved to idb
    Object.defineProperty(tab, "icon", {
      value: ICON_CONFIG.reports,
      enumerable: false,
    });

    switch (parts[1]) {
      case "activity-log":
        tab.name = "Activity Log";
        tab.app = "Activity Log";
        /*
          If there is a user associated with an activity log page,
          put that user's name in the tab
        */
        if (parts[2]) {
          tab.name = `${toCapitalCase(parts[2])} - Activity Log`;
          if (parts[2] === "users" && Boolean(zuid)) {
            const user = state.users.find(
              (user: { ZUID: string }) => user.ZUID === zuid
            );
            if (user) {
              const { firstName, lastName } = user;
              tab.name = `${firstName} ${lastName} - Activity Log`;
            }
          }
        }
        // Hacky way to get the user ZUID out of the search string
        const url = new URL(`http://example.com/${search}`);
        const userZUID = url.searchParams.get("actionByUserZUID");
        if (userZUID) {
          const user = state.users.find(
            (user: { ZUID: string }) => user.ZUID === userZUID
          );
          if (user) {
            const { firstName, lastName } = user;
            tab.name = `${firstName} ${lastName} - Activity Log`;
          }
        }
        break;
      case "metrics":
        tab.name = "Metrics";
        tab.app = "Metrics";
        break;
      case "analytics":
        tab.name = "Analytics";
        tab.app = "Analytics";
        break;
    }
  } else if (parts[0] in appNameMap) {
    const name = parts[0] as keyof typeof appNameMap;

    // Icon is non-serializable so it cannot be saved to idb
    Object.defineProperty(tab, "icon", {
      value: ICON_CONFIG[name],
      enumerable: false,
    });

    tab.name = appNameMap[name];
    tab.app = appNameMap[name];

    if (parts[0] === "content" && parts[2] === "new" && zuidIsValid(parts[1])) {
      tab.name = `New ${state?.models?.[parts[1]]?.label} Item`;
    }
    if (parts[0] === "schema" && zuidIsValid(parts[1])) {
      tab.name = queryData?.instance?.models?.find(
        (model: ContentModel) => model.ZUID === parts[1]
      )?.label;
    }
  }
  // resolve ZUID from store to determine display information
  switch (prefix) {
    case "1":
      const bin = queryData?.mediaManager?.bins?.find(
        (bin: any) => bin.id === zuid
      );
      if (bin) {
        tab.name = bin.name;
      }
      break;
    case "2":
      const group = queryData?.mediaManager?.binGroups?.find(
        (group: any) => group.id === zuid
      );
      if (group) {
        tab.name = group.name;
      }
      break;
    case "6":
      if (state.models) {
        const model: any = state.models[zuid];

        tab.name = model?.label;
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
      break;
    case "10":
    case "11":
      if (state.files) {
        const selectedFile = state.files.find(
          (file: any) => file.ZUID === zuid
        );
        if (selectedFile) {
          let name = selectedFile.fileName;
          // Trim leading slash
          if (name.charAt(0) === "/") name = name.slice(1);
          // prepend asterix to unsaved file
          if (selectedFile.dirty) name = `*${name}`;
          tab.name = name;
        }
      }
      break;
    case "17":
      break;
  }
  if (parts[0] === "settings") {
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

  if (parts[1] === "search" && parts[0] in appNameMap) {
    const name = parts[0] as keyof typeof appNameMap;
    tab.name = `${appNameMap[name]} Search Results`;
  }
  return tab;
}

function toCapitalCase(string: string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

// Thunks
export function loadTabs(instanceZUID: string) {
  return async (dispatch: Dispatch) => {
    const pinnedTabs = (await idb.get(`${instanceZUID}:pinned`)) || [];

    /**
     * - Map all the icons here since MUI Icons can't be saved to idb
     * - This also make sure that already pinned tabs previously still using FA will be handled
     */
    if (pinnedTabs.length) {
      pinnedTabs.forEach((tab: Tab) => {
        switch (tab.app) {
          case "Launchpad":
            tab.icon = ICON_CONFIG.launchpad;
            break;

          case "Redirects":
            tab.icon = ICON_CONFIG.redirects;
            break;

          case "Content":
            tab.icon = ICON_CONFIG.content;
            break;

          case "All Media":
            tab.icon = ICON_CONFIG.media;
            break;

          case "Schema":
            tab.icon = ICON_CONFIG.schema;
            break;

          case "Code":
            tab.icon = ICON_CONFIG.code;
            break;

          case "Leads":
            tab.icon = ICON_CONFIG.leads;
            break;

          case "Settings":
            tab.icon = ICON_CONFIG.settings;
            break;

          case "Activity Log":
          case "Metrics":
          case "Analytics":
            tab.icon = ICON_CONFIG.reports;
            break;

          case "Custom App":
            tab.icon = ICON_CONFIG.app;
            break;
        }
      });
    }
    return dispatch(actions.loadTabsSuccess({ pinnedTabs }));
  };
}

export function pinTab({ pathname, search }: TabLocation, queryData: any) {
  return async (dispatch: Dispatch, getState: () => AppState) => {
    const state = getState();
    const parsedPath = parsePath({ pathname, search });
    const tab = createTab(state, parsedPath, queryData);
    let newTabs = state.ui.pinnedTabs;
    const tabIndex = state.ui.pinnedTabs.findIndex((t) =>
      tabLocationEquality(t, tab)
    );
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

export function updatePinnedTabs(tab: Tab) {
  return async (dispatch: Dispatch, getState: () => AppState) => {
    const state = getState();
    const { pinnedTabs } = state.ui;
    const newTabs = pinnedTabs.filter((t) => t !== tab);

    newTabs.unshift(tab);

    dispatch(actions.setPinnedTabs(newTabs));
    await idb.set(`${state.instance.ZUID}:pinned`, newTabs);
  };
}

export function unpinTab(
  { pathname, search }: TabLocation,
  force = false,
  queryData?: any
) {
  return (dispatch: Dispatch, getState: () => AppState) => {
    const state = getState();
    const parsedPath = parsePath({ pathname, search });
    const tab = createTab(state, parsedPath, queryData);
    const { parts } = parsedPath;
    if (parts[0] === "code") {
      const fileType = parts[2];
      const dirtyFiles = state.files.filter(({ dirty }) => dirty);
      const dirtyFile = dirtyFiles.find(({ ZUID }) =>
        tabLocationEquality(tab, {
          pathname: `/code/file/${fileType}/${ZUID}`,
          search: "",
        })
      );
      if (dirtyFile && !force) {
        const { ZUID, status } = dirtyFile;
        dispatch(actions.openCodeChangesModal({ ZUID, fileType, status }));
        return;
      }
    }
    //
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

export function rebuildTabs(queryData: any) {
  return (dispatch: Dispatch, getState: () => AppState) => {
    const state = getState();
    const newTabs = state.ui.pinnedTabs.map((tab: Tab) =>
      createTab(state, parsePath(tab), queryData)
    );
    /* 
      This function is called on every slice update so
      we first determine if the tabs have changed before setting
      a new set of tabs to the store
    */
    if (!isEqual(state.ui.pinnedTabs, newTabs)) {
      dispatch(actions.setPinnedTabs(newTabs));
      idb.set(`${state.instance.ZUID}:pinnedTabs`, newTabs);
    }
  };
}

export function setDocumentTitle(location: TabLocation, queryData: any) {
  return (dispatch: Dispatch, getState: () => AppState) => {
    const state = getState();
    const instanceName = state.instance.name;

    const { pathname, search } = location;
    const parsedPath = parsePath({ pathname, search });
    const tab = createTab(state, parsedPath, queryData);
    const { app } = tab;
    let item = tab.name || tab.pathname;
    let keyword = "";

    if (search && search.includes("?term=")) {
      keyword = search.replace("?term=", "");
    }

    // Don't repeat the sub-app name
    if (app === item) {
      item = "";
    }

    let title = [app, item, "Zesty.io", instanceName, "Manager"]

      .filter((elem) => elem)
      .join(" - ");

    if (parsedPath.path === "/schema") {
      title = [app, "All Models", "Zesty.io", instanceName, "Manager"]
        .filter((elem) => elem)
        .join(" - ");
    }

    if (keyword) {
      title = [
        app,
        `Search for "${keyword}"`,
        "Zesty.io",
        instanceName,
        "Manager",
      ]
        .filter((elem) => elem)
        .join(" - ");
    }

    document.title = title;
  };
}
