// interploated by webpack at build time
// must be setup before starting the store
window.CONFIG = __CONFIG__;

import React from "react";
import ReactDOM from "react-dom";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import { get } from "idb-keyval";
import riot from "riot";
import Clipboard from "clipboard";
import DnD from "../vendors/common/dnd";

import Sentry from "utility/sentry";

import { request } from "utility/request";
import { notify } from "shell/store/notifications";
import { store, injectReducer } from "shell/store";
import { navContent } from "../apps/content-editor/src/store/navContent";

import AppError from "shell/components/AppError";
import PrivateRoute from "./components/private-route";
import LoadInstance from "./components/load-instance";
import Shell from "./views/Shell";

import { MonacoSetup } from "../apps/code-editor/src/app/components/Editor/components/MemoizedEditor/MonacoSetup";

// needed for Breadcrumbs in Shell
injectReducer(store, "navContent", navContent);

// Some legacy code refers to this global which is an observable
// FIXME: this needs to get refactored out
if (window.zesty == null) {
  window.zesty = riot.observable();
}
window.zestyStore = store;

window.ClipboardJS = Clipboard;
window.DnD = DnD;
window.riot = riot;

// Media riot app depends on these references
// FIXME: this needs to get refactored out
window.request = request;
window.growl = notice => store.dispatch(notify(notice));

// Update urls in config to include the current instance zuid
const instanceZUID = store.getState().instance.ZUID;
window.CONFIG.API_INSTANCE = `${window.CONFIG.API_INSTANCE_PROTOCOL}${instanceZUID}${window.CONFIG.API_INSTANCE}`;

const loadLocalStorageData = true;
// Load Local Storage Data
if (loadLocalStorageData) {
  try {
    Promise.all([
      get(`${instanceZUID}:user:selected_lang`),
      get(`${instanceZUID}:navContent`),
      get(`${instanceZUID}:models`),
      get(`${instanceZUID}:fields`),
      get(`${instanceZUID}:content`)
    ]).then(results => {
      const [lang, nav, models, fields, content] = results;

      store.dispatch({
        type: "LOADED_LOCAL_USER_LANG",
        payload: { lang }
      });

      // FIXME: This is broken because on initial nav fetch we modify
      // the raw response before entering it into local state so when re-loading
      // from local db it's not in the shape the redux store expects.
      // store.dispatch({
      //   type: "LOADED_LOCAL_CONTENT_NAV",
      //   raw: nav
      // });

      store.dispatch({
        type: "LOADED_LOCAL_MODELS",
        payload: models
      });

      store.dispatch({
        type: "LOADED_LOCAL_FIELDS",
        payload: fields
      });

      store.dispatch({
        type: "LOADED_LOCAL_ITEMS",
        data: content
      });

      // if (Array.isArray(itemZUIDs)) {
      //   const items = itemZUIDs.map(itemZUID =>
      //     get(`${zesty.instance.ZUID}:content:${itemZUID}`)
      //   );
      //
      //   Promise.all(items).then(itemsArr => {
      //     const itemsObj = itemsArr.reduce((acc, item) => {
      //       acc[item.meta.ZUID] = item;
      //       return acc;
      //     }, {});
      //
      //     store.dispatch({
      //       type: "LOADED_LOCAL_ITEMS",
      //       data: itemsObj
      //     });
      //   });
      // }
    });
  } catch (err) {
    console.error("IndexedDB:get:error", err);
  }
}

MonacoSetup(store);

const App = () => (
  <Provider store={store}>
    <Sentry.ErrorBoundary fallback={() => <AppError />}>
      <BrowserRouter
        getUserConfirmation={(message, callback) => {
          if (message === "confirm") {
            window.openNavigationModal(callback);
          } else {
            callback(true);
          }
        }}
      >
        <PrivateRoute>
          <LoadInstance>
            <Shell />
          </LoadInstance>
        </PrivateRoute>
      </BrowserRouter>
    </Sentry.ErrorBoundary>
  </Provider>
);

function render() {
  ReactDOM.render(<App />, document.getElementById("root"));
}

render();
