"use strict";

import React, { useEffect } from "react";
import { Provider } from "react-redux";
import { Route } from "react-router-dom";

import { injectReducer } from "shell/store";

import { logs } from "store/logs";
import { logsInView } from "store/logsInView";

import AuditApp from "./views/app";

window.AuditTrailApp = function AuditTrailApp() {
  useEffect(() => {
    injectReducer(window.ZESTY_REDUX_STORE, "logs", logs);
    injectReducer(window.ZESTY_REDUX_STORE, "logsInView", logsInView);
  }, []);

  return (
    <Provider store={ZESTY_REDUX_STORE}>
      <Route component={AuditApp} />
    </Provider>
  );
};
