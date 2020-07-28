import React from "react";
import { Provider } from "react-redux";
import { Route } from "react-router-dom";

import { injectReducer } from "shell/store";
import { redirects } from "store/redirects";
import { redirectsFilter } from "store/redirectsFilter";
import { imports } from "store/imports";
import { paths } from "store/paths";

import HealthApp from "./app";

injectReducer(ZESTY_REDUX_STORE, "redirects", redirects);
injectReducer(ZESTY_REDUX_STORE, "redirectsFilter", redirectsFilter);
injectReducer(ZESTY_REDUX_STORE, "imports", imports);
injectReducer(ZESTY_REDUX_STORE, "paths", paths);

window.SeoApp = function SeoApp() {
  return (
    <Provider store={ZESTY_REDUX_STORE}>
      <Route component={HealthApp} />
    </Provider>
  );
};
