import { hot } from "react-hot-loader/root";
import React from "react";
import { Provider } from "react-redux";
import { Route } from "react-router-dom";

import { store, injectReducer } from "shell/store";
import { redirects } from "./store/redirects";
import { redirectsFilter } from "./store/redirectsFilter";
import { imports } from "./store/imports";

import HealthApp from "./app";

injectReducer(store, "redirects", redirects);
injectReducer(store, "redirectsFilter", redirectsFilter);
injectReducer(store, "imports", imports);

export default hot(function SeoApp() {
  return (
    <Provider store={store}>
      <Route component={HealthApp} />
    </Provider>
  );
});
