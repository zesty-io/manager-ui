import React, { useEffect } from "react";
import { Provider } from "react-redux";
import { Route } from "react-router-dom";

import { store, injectReducer } from "shell/store";
import {
  fetchSettings,
  fetchStylesVariables,
  fetchStylesCategories,
  fetchFonts,
  fetchFontsInstalled,
  settings
} from "./store/settings";
import { fetchHeadTags, headTags } from "./store/headTags";

import AppError from "./app/AppError";
import Settings from "./app/App";

injectReducer(store, "settings", settings);
injectReducer(store, "headTags", headTags);

export default function SettingsApp() {
  useEffect(() => {
    store.dispatch(fetchSettings());
    store.dispatch(fetchStylesCategories());
    store.dispatch(fetchStylesVariables());
    store.dispatch(fetchFonts());
    store.dispatch(fetchFontsInstalled());
    store.dispatch(fetchHeadTags());
  });

  return (
    <Provider store={store}>
      <AppError>
        <Route component={Settings} />
      </AppError>
    </Provider>
  );
}
