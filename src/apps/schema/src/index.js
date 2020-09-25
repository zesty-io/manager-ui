import { hot } from "react-hot-loader/root";
import React, { useEffect } from "react";
import { Provider } from "react-redux";
import { Route } from "react-router-dom";

import { store, injectReducer } from "shell/store";
import { fetchModels } from "shell/store/models";

import { navSchema } from "./store/navSchema";
import { parents } from "./store/parents";

import { SchemaBuilder } from "./app";

injectReducer(store, "navSchema", navSchema);
injectReducer(store, "parents", parents);

export default hot(function SchemaApp() {
  useEffect(() => {
    store.dispatch(fetchModels());
  }, []);

  return (
    <Provider store={store}>
      <Route component={SchemaBuilder} />
    </Provider>
  );
});
