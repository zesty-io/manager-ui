import { hot } from "react-hot-loader/root";
import React from "react";
import { Provider } from "react-redux";
import { Route } from "react-router-dom";

import { store, injectReducer } from "shell/store";
import { leads } from "./store/leads";
import { filter } from "./store/filter";

import AppError from "./app/AppError";
import Leads from "./app/views/Leads";

injectReducer(store, "leads", leads);
injectReducer(store, "filter", filter);

export default hot(function LeadsApp() {
  return (
    <AppError>
      <Provider store={store}>
        <Route component={Leads} />
      </Provider>
    </AppError>
  );
});
