import React from "react";
import ReactDOM from "react-dom";
import { Provider } from "react-redux";
import { BrowserRouter, Route } from "react-router-dom";

import { request } from "utility/request";
import { notify } from "shell/store/notifications";
import { store } from "shell/store";

import PrivateRoute from "./components/private-route";
import LoadInstance from "./components/load-instance";
import Shell from "./views/Shell";

// Exposed as a global so dynamically loaded apps
// can inject their reducers into the store
window.ZESTY_REDUX_STORE = store;

// Some legacy code refers to this global which is an observable
// FIXME: this needs to get refactored out
window.zesty = riot.observable(store.getState());
store.subscribe(() => {
  window.zesty = riot.observable(store.getState());
});

// Media riot app depends on these references
// FIXME: this needs to get refactored out
window.request = request;
window.growl = notify;

// interploated by webpack at build time
window.CONFIG = __CONFIG__;

// Update urls in config to include the current instance zuid
const state = store.getState();
window.CONFIG.API_INSTANCE = `//${state.instance.zuid}${window.CONFIG.API_INSTANCE}`;
window.CONFIG.URL_PREVIEW = `//${state.instance.zuid}${window.CONFIG.URL_PREVIEW}`;

ReactDOM.render(
  <Provider store={store}>
    <BrowserRouter>
      <PrivateRoute>
        <LoadInstance>
          <Route path="/" component={Shell} />
        </LoadInstance>
      </PrivateRoute>
    </BrowserRouter>
  </Provider>,
  document.getElementById("root")
);
