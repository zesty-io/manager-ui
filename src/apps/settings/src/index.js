import React, { useEffect, useState } from "react";
import { connect } from "react-redux";

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

export default connect(state => {
  return {
    settings: state.settings
  };
})(function SettingsApp(props) {
  // installed fonts may be empty array, so use a flag to know when we've fetched them
  const [installedFonts, setInstalledFonts] = useState(false);
  useEffect(() => {
    store.dispatch(fetchSettings());
    store.dispatch(fetchStylesCategories());
    store.dispatch(fetchStylesVariables());
    store.dispatch(fetchFonts());
    store.dispatch(fetchFontsInstalled()).then(() => {
      setInstalledFonts(true);
    });
    store.dispatch(fetchHeadTags());
  }, []);

  return (
    <WithLoader
      condition={
        props.settings.catInstance.length &&
        props.settings.catStyles.length &&
        props.settings.fonts.length &&
        installedFonts &&
        props.settings.instance.length &&
        props.settings.styles.length
      }
      message="Starting Settings"
    >
      <Settings />
    </WithLoader>
  );
});
