import React from "react";
import ReactDOM from "react-dom";
import { Provider } from "react-redux";
import { BrowserRouter, Route } from "react-router-dom";

import { store } from "shell/store";

import PrivateRoute from "./components/private-route";
import Shell from "./views/Shell";

// Exposed as a global so dynamically loaded apps
// can inject their reducers into the store
window.ZESTY_REDUX_STORE = store;

// Some legacy code refers to this global which is an observable
// NOTE: this needs to get refactored out
window.zesty = riot.observable(store.getState());

// interploated by webpack at build time
window.CONFIG = __CONFIG__;

// Update API config to include the current instance zuid
const state = store.getState();
window.CONFIG.API_INSTANCE = `//${state.instance.zuid}${window.CONFIG.API_INSTANCE}`;

ReactDOM.render(
  <Provider store={store}>
    <BrowserRouter>
      <PrivateRoute>
        <Route path="/" component={Shell} />
      </PrivateRoute>
    </BrowserRouter>
  </Provider>,
  document.getElementById("root")
);
