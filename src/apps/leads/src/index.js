import React from "react";
import { Provider } from "react-redux";
import { Route } from "react-router-dom";

import { injectReducer } from "shell/store";

import { leads } from "./store/leads";
import { filter } from "./store/filter";

import Leads from "./app/Leads";

// import "@zesty-io/core/vendor.css";

window.LeadsApp = function LeadsApp() {
  injectReducer(ZESTY_REDUX_STORE, "leads", leads);
  injectReducer(ZESTY_REDUX_STORE, "filter", filter);
  return (
    <Provider store={ZESTY_REDUX_STORE}>
      <Route component={Leads} />
    </Provider>
  );
};
