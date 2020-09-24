import React from "react";
import { Switch, Route, Redirect } from "react-router-dom";
import { connect } from "react-redux";

import { Instance } from "./views/Instance";
import { Styles } from "./views/Styles";
import { Head } from "./views/Head";
import { Browse, Installed } from "./views/Fonts";
import { Robots } from "./views/Robots";

import { WithLoader } from "@zesty-io/core/WithLoader";
import { SettingsNav } from "./components/Nav";

import styles from "./App.less";

export default connect(state => ({ settings: state.settings }))(
  function SettingsApp(props) {
    return (
      <WithLoader
        condition={Object.keys(props.settings).length}
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
                  <Route
                    path="/settings/fonts/installed"
                    component={Installed}
                  />
                  <Redirect
                    from="/settings/fonts"
                    to="/settings/fonts/browse"
                  />

                  <Route path="/settings/head" component={Head} />

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
  }
);
