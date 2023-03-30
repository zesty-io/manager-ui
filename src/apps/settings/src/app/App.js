import { useEffect } from "react";
import { Switch, Route, Redirect } from "react-router-dom";
import { connect } from "react-redux";
import { Box } from "@mui/material";
import { theme } from "@zesty-io/material";

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
} from "shell/store/settings";

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
      height="100vh"
    >
      <section className={styles.Settings}>
        <div className={styles.AppWrap}>
          <SettingsNav />
          <Box
            className={styles.OverflowWrap}
            sx={{
              borderLeft: "1px solid",
              borderColor: theme.palette.border,
            }}
          >
            <main className={styles.Content}>
              <Switch>
                <Route
                  exact
                  path="/settings/styles/:category"
                  component={Styles}
                />
                <Redirect from="/settings/styles" to="/settings/styles/1" />
                <Route
                  path="/settings/instance/:category"
                  component={Instance}
                />

                <Route path="/settings/fonts/browse" component={Browse} />
                <Route path="/settings/fonts/installed" component={Installed} />
                <Redirect from="/settings/fonts" to="/settings/fonts/browse" />

                <Route path="/settings/robots" component={Robots} />
                <Route
                  path="/settings/head"
                  render={() => (
                    <div className={styles.InstanceHeadTags}>
                      <Head resourceZUID={props.instance.ZUID} />
                    </div>
                  )}
                />

                <Redirect from="/settings" to="/settings/instance/general" />
                <Redirect
                  from="/settings/instance"
                  to="/settings/instance/general"
                />
              </Switch>
            </main>
          </Box>
        </div>
      </section>
    </WithLoader>
  );
});
