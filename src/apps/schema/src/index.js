import React, { useEffect } from "react";
import { Provider } from "react-redux";
import { Route } from "react-router-dom";

import { injectReducer } from "shell/store";
import { fetchModels } from "shell/store/models";

import { schemaNav } from "./store/schemaNav";
import { parents } from "./store/parents";

import { SchemaBuilder } from "./app";

injectReducer(ZESTY_REDUX_STORE, "schemaNav", schemaNav);
injectReducer(ZESTY_REDUX_STORE, "parents", parents);

window.SchemaApp = function SchemaApp() {
  useEffect(() => {
    ZESTY_REDUX_STORE.dispatch(fetchModels());
  }, []);

  return (
    <Provider store={ZESTY_REDUX_STORE}>
      <Route component={SchemaBuilder} />
    </Provider>
  );
};
