import "react-hot-loader";
import { hot } from "react-hot-loader/root";
import React from "react";
import ReactDOM from "react-dom";
import { Provider } from "react-redux";
import { BrowserRouter, Route } from "react-router-dom";
import { get } from "idb-keyval";
import riot from "riot";
import Clipboard from "clipboard";
import DnD from "../vendors/common/dnd";

import { request } from "utility/request";
import { fetchProducts } from "shell/store/products";
import { notify } from "shell/store/notifications";
import { store, injectReducer } from "shell/store";
import { navContent } from "../apps/content-editor/src/store/navContent";

import PrivateRoute from "./components/private-route";
import LoadInstance from "./components/load-instance";
import Shell from "./views/Shell";

// needed for Breadcrumbs in Shell
injectReducer(store, "navContent", navContent);

// interploated by webpack at build time
// must be setup before starting the store
window.CONFIG = __CONFIG__;

// Some legacy code refers to this global which is an observable
// FIXME: this needs to get refactored out
if (window.zesty == null) {
  window.zesty = riot.observable(store.getState());
  store.subscribe(() => {
    window.zesty = riot.observable(store.getState());
  });
}

window.ClipboardJS = Clipboard;
window.DnD = DnD;
window.riot = riot;

// Media riot app depends on these references
// FIXME: this needs to get refactored out
window.request = request;
window.growl = notify;

// Update urls in config to include the current instance zuid
const state = store.getState();
window.CONFIG.API_INSTANCE = `${window.CONFIG.API_INSTANCE_PROTOCOL}${state.instance.ZUID}${window.CONFIG.API_INSTANCE}`;

// Load Local Storage Data
try {
  Promise.all([
    get(`${zesty.instance.ZUID}:user:selected_lang`),
    get(`${zesty.instance.ZUID}:navContent`),
    get(`${zesty.instance.ZUID}:models`),
    get(`${zesty.instance.ZUID}:fields`),
    get(`${zesty.instance.ZUID}:content`)
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

// Fetch Users Product Access
store.dispatch(fetchProducts());

const App = hot(() => (
  <Provider store={store}>
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
          <Route path="/" component={Shell} />
        </LoadInstance>
      </PrivateRoute>
    </BrowserRouter>
  </Provider>
));

function render() {
  ReactDOM.render(<App />, document.getElementById("root"));
}

render();
