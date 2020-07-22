import React from "react";
import { Provider } from "react-redux";
import { Route } from "react-router-dom";
import { get } from "idb-keyval";

import { injectReducer } from "shell/store";
import { files } from "./store/files";
import { status } from "./store/status";
import { auditTrail } from "./store/auditTrail";
import { headers } from "./store/headers";
import { codeNav } from "./store/codeNav";

import { CodeEditor } from "./app/views/CodeEditor";

injectReducer(ZESTY_REDUX_STORE, "files", files);
injectReducer(ZESTY_REDUX_STORE, "status", status);
injectReducer(ZESTY_REDUX_STORE, "auditTrail", auditTrail);
injectReducer(ZESTY_REDUX_STORE, "headers", headers);
injectReducer(ZESTY_REDUX_STORE, "codeNav", codeNav);

// try {
//   Promise.all([get(`${zesty.instance.ZUID}:openFiles`)]).then(results => {
//     const [files] = results;

//     if (files) {
//       ZESTY_REDUX_STORE.dispatch({
//         type: "LOADED_LOCAL_OPEN_FILES",
//         payload: {
//           files
//         }
//       });
//     }
//   });
// } catch (err) {
//   console.error("IndexedDB:get:error", err);
// }

window.CodeApp = function CodeApp() {
  return (
    <Provider store={ZESTY_REDUX_STORE}>
      <Route component={CodeEditor} />
    </Provider>
  );
};
