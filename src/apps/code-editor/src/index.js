import React from "react";
import { Provider } from "react-redux";
import { Route } from "react-router-dom";

import { store, injectReducer } from "shell/store";
import { files } from "./store/files";
import { status } from "./store/status";
import { auditTrail } from "./store/auditTrail";
import { headers } from "./store/headers";
import { codeNav } from "./store/codeNav";

import { CodeEditor } from "./app/views/CodeEditor";

injectReducer(store, "files", files);
injectReducer(store, "status", status);
injectReducer(store, "auditTrail", auditTrail);
injectReducer(store, "headers", headers);
injectReducer(store, "codeNav", codeNav);

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

export default function CodeApp() {
  return (
    <Provider store={store}>
      <Route component={CodeEditor} />
    </Provider>
  );
}
