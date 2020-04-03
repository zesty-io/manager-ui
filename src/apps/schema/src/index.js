import React from "react";
import { Provider } from "react-redux";
import { Route } from "react-router-dom";

import { injectReducer } from "shell/store";
import { fetchModels } from "shell/store/models";

import { schemaNav } from "./store/schemaNav";
import { parents } from "./store/parents";

import { SchemaBuilder } from "./app";

window.SchemaApp = function SchemaApp() {
  injectReducer(ZESTY_REDUX_STORE, "schemaNav", schemaNav);
  injectReducer(ZESTY_REDUX_STORE, "parents", parents);

  ZESTY_REDUX_STORE.dispatch(fetchModels());

  return (
    <Provider store={ZESTY_REDUX_STORE}>
      <Route component={SchemaBuilder} />
    </Provider>
  );
};
