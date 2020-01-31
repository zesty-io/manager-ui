"use strict";

import React, { useEffect } from "react";
import { Provider } from "react-redux";
import { Route } from "react-router-dom";

import { injectReducer } from "shell/store";

import { getLogs } from "store/logs";
// import { logs } from "store/logs";
import { loadingLogs } from "store/loadingLogs";
import { inViewLogs } from "store/inViewLogs";

import AuditApp from "./views/app";

window.AuditTrailApp = function AuditTrailApp() {
  useEffect(() => {
    // injectReducer(window.ZESTY_REDUX_STORE, "logs", logs);
    injectReducer(window.ZESTY_REDUX_STORE, "loadingLogs", loadingLogs);
    injectReducer(window.ZESTY_REDUX_STORE, "inViewLogs", inViewLogs);

    ZESTY_REDUX_STORE.dispatch(getLogs());
  }, []);

  return (
    <Provider store={ZESTY_REDUX_STORE}>
      <Route component={AuditApp} />
    </Provider>
  );
};
