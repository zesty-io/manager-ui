import React from "react";
import ReactDOM from "react-dom";
import { Provider } from "react-redux";
import { BrowserRouter, Route } from "react-router-dom";
import { get } from "idb-keyval";
import * as riot from "riot";

import { request } from "utility/request";
import { fetchProducts } from "shell/store/products";
import { notify } from "shell/store/notifications";
import { store } from "shell/store";

import PrivateRoute from "./components/private-route";
import LoadInstance from "./components/load-instance";
import Shell from "./views/Shell";

// interploated by webpack at build time
// must be setup before starting the store
window.CONFIG = __CONFIG__;
// window.ZESTY_REDUX_STORE = store;

// Exposed as a global so dynamically loaded apps
// can inject their reducers into the store

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
// .then(json => {
//   // Inject sub apps into DOM
//   json.data.forEach(product => {
//     const link = document.createElement("link");
//     link.type = "text/css";
//     link.rel = "stylesheet";
//     link.href = `/bundle.${product}-app.css`;
//     document.body.appendChild(link);

//     const script = document.createElement("script");
//     script.type = "text/javascript";
//     script.src = `/bundle.${product}-app.js`;
//     document.body.appendChild(script);

//     // FIXME: special case to support riot.js tags
//     if (product === "media") {
//       const tags = document.createElement("script");
//       tags.type = "text/javascript";
//       tags.src = `/tags.js`;
//       document.body.appendChild(tags);
//     }
//   });

// Convert product names to variable references
// const appTokens = json.data.map(product => {
//     if (product.includes("-")) {
//       product = product
//         .split("-")
//         .map(part => part.replace(/^\w/, c => c.toUpperCase()))
//         .join("");
//     } else {
//       product = product.replace(/^\w/, c => c.toUpperCase());
//     }
//     return `${product}App`;
//   });

//   // Check every half second to see if injected
//   // apps have been parsed and are ready
//   const appLoaded = setInterval(() => {
//     const missing = appTokens.find(token => !window[token]);

//     if (!missing) {
//       clearInterval(appLoaded);

//       // Mount app after inserting sub app bundles
//       render()
//     }
//   }, 500);
// })
// .catch(err => {
//   console.log(err);
//   notify({
//     kind: "warn",
//     message: "Failed to load manager app products"
//   });
// });

function render() {
  ReactDOM.render(
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
    </Provider>,
    document.getElementById("root")
  );
}

render();
