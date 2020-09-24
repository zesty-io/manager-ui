import { hot } from "react-hot-loader/root";
import React from "react";
import { Provider } from "react-redux";
import { Route } from "react-router-dom";

import { injectReducer, store } from "shell/store";

import { logsInView } from "./store/logsInView";

import AuditApp from "./views/app";

injectReducer(store, "logsInView", logsInView);

export default hot(function AuditTrailApp() {
  return (
    <Provider store={store}>
      <Route component={AuditApp} />
    </Provider>
  );
});
