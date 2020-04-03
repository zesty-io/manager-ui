import React, { useEffect } from "react";
import { Provider } from "react-redux";
import { Route } from "react-router-dom";

import { injectReducer } from "shell/store";
import {
  fetchSettings,
  fetchStylesVariables,
  fetchStylesCategories,
  fetchFonts,
  fetchFontsInstalled,
  settings
} from "store/settings";
import { fetchHeadTags, headTags } from "./store/headTags";

import AppError from "./app/AppError";
import Settings from "./app/App";

window.SettingsApp = function SettingsApp() {
  console.log("SettingsApp", settings);

  injectReducer(ZESTY_REDUX_STORE, "settings", settings);
  injectReducer(ZESTY_REDUX_STORE, "headTags", headTags);

  ZESTY_REDUX_STORE.dispatch(fetchSettings());
  ZESTY_REDUX_STORE.dispatch(fetchStylesCategories());
  ZESTY_REDUX_STORE.dispatch(fetchStylesVariables());
  ZESTY_REDUX_STORE.dispatch(fetchFonts());
  ZESTY_REDUX_STORE.dispatch(fetchFontsInstalled());
  ZESTY_REDUX_STORE.dispatch(fetchHeadTags());

  return (
    <Provider store={ZESTY_REDUX_STORE}>
      <AppError>
        <Route component={Settings} />
      </AppError>
    </Provider>
  );
};
