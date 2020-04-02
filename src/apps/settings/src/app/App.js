import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import { Switch, Route, Link, Redirect } from "react-router-dom";

import AppError from "./AppError";
import { Instance } from "./views/Instance";
import { Styles } from "./views/Styles";
import { Head } from "./views/Head";
import { Browse, Installed } from "./views/Fonts";

import { WithLoader } from "@zesty-io/core/WithLoader";
import { SettingsNav } from "./components/Nav";

import styles from "./App.less";
export default connect(state => state)(function SettingsApp(props) {
  const [isHide, setHide] = useState(false);
  useEffect(() => {
    setHide(props.location.pathname === "/settings/head" ? true : false);
  }, [props]);

  return (
    <AppError>
      <WithLoader
        condition={Object.keys(props.settings).length}
        message="Starting Settings"
        width="100vw"
        height="100vh"
      >
        <section className={styles.Settings}>
          <nav className={styles.AppNav}>
            <Link to="/settings/instance">Instance Settings</Link>
            {props.settings.styles.length ? (
              <Link to="/settings/styles">Styles</Link>
            ) : null}
            <Link to="/settings/fonts">Fonts</Link>
            <Link to="/settings/head">New Head</Link>
            <a href={`${CONFIG.URL_ACCOUNTS}/settings/account`}>
              Account Settings
            </a>
          </nav>

          <div className={styles.AppWrap}>
            {!isHide && <SettingsNav />}
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

                  <Redirect from="/settings" to="/settings/instance/general" />
                </Switch>
              </main>
            </div>
          </div>
        </section>
      </WithLoader>
    </AppError>
  );
});
