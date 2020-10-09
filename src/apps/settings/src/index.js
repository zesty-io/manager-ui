import { hot } from "react-hot-loader/root";
import React, { useEffect } from "react";
import { connect } from "react-redux";
import { Route } from "react-router-dom";

import { WithLoader } from "@zesty-io/core/WithLoader";

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

import Settings from "./app/App";

injectReducer(store, "settings", settings);
injectReducer(store, "headTags", headTags);

export default hot(
  connect(state => {
    return {
      settings: state.settings
    };
  })(function SettingsApp(props) {
    useEffect(() => {
      store.dispatch(fetchSettings());
      store.dispatch(fetchStylesCategories());
      store.dispatch(fetchStylesVariables());
      store.dispatch(fetchFonts());
      store.dispatch(fetchFontsInstalled());
      store.dispatch(fetchHeadTags());
    }, []);

    return (
      <WithLoader
        condition={
          props.settings.catInstance.length &&
          props.settings.catStyles.length &&
          props.settings.fonts.length &&
          props.settings.fontsInstalled.length &&
          props.settings.instance.length &&
          props.settings.styles.length
        }
        message="Starting Settings"
      >
        <Route component={Settings} />
      </WithLoader>
    );
  })
);
