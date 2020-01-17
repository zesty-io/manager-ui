import React from "react";
import { Provider } from "react-redux";
import { Route } from "react-router-dom";

import { injectReducer } from "shell/store";

import { mediaBins, mediaGroups } from "./store/media";
import { schemaModels, fetchModels } from "./store/schemaModels";
import { schemaFields } from "./store/schemaFields";
import { schemaNav } from "./store/schemaNav";
import { parents } from "./store/parents";

import { SchemaBuilder } from "./app";

window.SchemaApp = function SchemaApp() {
  injectReducer(ZESTY_REDUX_STORE, "mediaBins", mediaBins);
  injectReducer(ZESTY_REDUX_STORE, "mediaGroups", mediaGroups);
  injectReducer(ZESTY_REDUX_STORE, "schemaModels", schemaModels);
  injectReducer(ZESTY_REDUX_STORE, "schemaFields", schemaFields);
  injectReducer(ZESTY_REDUX_STORE, "schemaNav", schemaNav);
  injectReducer(ZESTY_REDUX_STORE, "parents", parents);

  ZESTY_REDUX_STORE.dispatch(fetchModels());

  return (
    <Provider store={ZESTY_REDUX_STORE}>
      <Route component={SchemaBuilder} />
    </Provider>
  );
};
