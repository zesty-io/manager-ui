import React, { useState, useEffect } from "react";
import { Switch, Route, Redirect } from "react-router-dom";
import { connect } from "react-redux";

import { WithLoader } from "@zesty-io/core/WithLoader";
import { SettingsNav } from "./components/Nav";

import { Instance } from "./views/Instance";
import { Styles } from "./views/Styles";
import { Browse, Installed } from "./views/Fonts";
import { Robots } from "./views/Robots";

import { Head } from "shell/components/Head";

import {
  fetchSettings,
  fetchStylesVariables,
  fetchStylesCategories,
  fetchFonts,
  fetchFontsInstalled
} from "../store/settings";

import styles from "./App.less";
export default connect(state => ({
  instance: state.instance,
  settings: state.settings
}))(function SettingsApp(props) {
  // installed fonts may be empty array, so use a flag to know when we've fetched them
  const [installedFonts, setInstalledFonts] = useState(false);

  useEffect(() => {
    console.log("SettingsApp:useEffect");

    props.dispatch(fetchSettings());
    props.dispatch(fetchStylesCategories());
    props.dispatch(fetchStylesVariables());
    props.dispatch(fetchFonts());
    props.dispatch(fetchFontsInstalled()).finally(() => {
      setInstalledFonts(true);
    });
  }, []);

  return (
    <WithLoader
      condition={
        // Object.keys(props.settings).length
        props.settings.catInstance.length &&
        props.settings.catStyles.length &&
        props.settings.fonts.length &&
        installedFonts &&
        props.settings.instance.length &&
        props.settings.styles.length
      }
      message="Starting Settings"
      width="100vw"
      height="100vh"
    >
      <section className={styles.Settings}>
        <div className={styles.AppWrap}>
          <SettingsNav />
          <div className={styles.OverflowWrap}>
            <main className={styles.Content}>
              <Switch>
                <Route
                  exact
                  path="/settings/styles/:category"
                  component={Styles}
                />
                <Redirect from="/settings/styles" to="/settings/styles/1" />

                <Route path="/settings/fonts/browse" component={Browse} />
                <Route path="/settings/fonts/installed" component={Installed} />
                <Redirect from="/settings/fonts" to="/settings/fonts/browse" />

                <Route
                  path="/settings/head"
                  render={() => <Head resourceZUID={props.instance.ZUID} />}
                />

                <Route
                  path="/settings/instance/:category"
                  component={Instance}
                />
                <Redirect
                  from="/settings/instance"
                  to="/settings/instance/general"
                />
                <Route path="/settings/robots" component={Robots} />

                <Redirect from="/settings" to="/settings/instance/general" />
              </Switch>
            </main>
          </div>
        </div>
      </section>
    </WithLoader>
  );
});
