import React from "react";
import ReactDOM from "react-dom";
import { Provider } from "react-redux";
import { BrowserRouter, Route } from "react-router-dom";

import { request } from "utility/request";
import { fetchProducts } from "shell/store/products";
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

store
  .dispatch(fetchProducts())
  .then(json => {
    // Inject sub apps into DOM
    json.data.forEach(product => {
      const link = document.createElement("link");
      link.type = "text/css";
      link.rel = "stylesheet";
      link.href = `/bundle.${product}-app.css`;
      document.body.appendChild(link);

      const script = document.createElement("script");
      script.type = "text/javascript";
      script.src = `/bundle.${product}-app.js`;
      document.body.appendChild(script);

      // FIXME: special case to support riot.js tags
      if (product === "media") {
        const tags = document.createElement("script");
        tags.type = "text/javascript";
        tags.src = `/tags.js`;
        document.body.appendChild(tags);
      }
    });

    // We don't mount app until after dynamically
    // inserting sub app bundles
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
  })
  .catch(err => {
    console.log(err);
    notify({
      kind: "warn",
      message: "Failed to load manager app products"
    });
  });
