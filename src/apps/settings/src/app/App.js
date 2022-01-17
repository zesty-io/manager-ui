import { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
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
  fetchFontsInstalled,
} from "../store/settings";

import styles from "./App.less";
export default connect((state) => ({
  instance: state.instance,
  settings: state.settings,
}))(function SettingsApp(props) {
  useEffect(() => {
    props.dispatch(fetchSettings());
    props.dispatch(fetchStylesCategories());
    props.dispatch(fetchStylesVariables());
    props.dispatch(fetchFonts());
    props.dispatch(fetchFontsInstalled());
  }, []);

  return (
    <WithLoader
      condition={
        props.settings.catInstance.length &&
        props.settings.catStyles.length &&
        props.settings.catFonts.length
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
              {/* <Redirect from="/settings/styles" to="/settings/styles/1" /> */}
              {/* <Redirect from="/settings/fonts" to="/settings/fonts/browse" /> */}
              {/* <Redirect from="/settings" to="/settings/instance/general" /> */}

              <Route
                path="/settings/styles"
                element={<Navigate replace to="/settings/styles/1" />}
              />
              <Route
                path="/settings/fonts"
                element={<Navigate replace to="/settings/fonts/browse" />}
              />
              <Route
                path="/settings"
                element={<Navigate replace to="/settings/instance/general" />}
              />

              <Routes>
                <Route
                  exact
                  path="/settings/styles/:category"
                  component={Styles}
                />
                <Route
                  path="/settings/instance/:category"
                  component={Instance}
                />
                <Route path="/settings/fonts/browse" component={Browse} />
                <Route path="/settings/fonts/installed" component={Installed} />
                <Route path="/settings/robots" component={Robots} />
                <Route
                  path="/settings/head"
                  render={() => (
                    <div className={styles.InstanceHeadTags}>
                      <Head resourceZUID={props.instance.ZUID} />
                    </div>
                  )}
                />
                <Redirect
                  from="/settings/instance"
                  to="/settings/instance/general"
                />
              </Routes>
            </main>
          </div>
        </div>
      </section>
    </WithLoader>
  );
});
