import { useEffect } from "react";
import { Switch, Route, Redirect, useLocation } from "react-router-dom";
import { connect } from "react-redux";
import { Box } from "@mui/material";
import { legacyTheme } from "@zesty-io/material";
import { alpha, createTheme, ThemeProvider } from "@mui/material/styles";

import { WithLoader } from "@zesty-io/core/WithLoader";
import { SettingsNav } from "./components/Nav";

import { Instance } from "./views/Instance";
import { Styles } from "./views/Styles";
import { Browse, Installed } from "./views/Fonts";
import { Robots } from "./views/Robots";
import { Bynder } from "./views/Bynder";

import { Head } from "shell/components/Head";

import {
  fetchSettings,
  fetchStylesVariables,
  fetchStylesCategories,
  fetchFonts,
  fetchFontsInstalled,
} from "shell/store/settings";
import { ResizableContainer } from "../../../../shell/components/ResizeableContainer";

// Makes sure that other apps using legacy theme does not get affected with the palette
const customTheme = createTheme(legacyTheme, {
  palette: {
    secondary: {
      main: "#FF5D0A",
      dark: "#EC4A0A",
      light: "#FD853A",
      contrastText: "#ffffff",
    },
    primary: {
      main: "#FF5D0A",
      dark: "#EC4A0A",
      light: "#FD853A",
      contrastText: "#ffffff",
    },
    success: {
      main: "#12B76A",
      dark: "#027A48",
      light: "#D1FADF",
      contrastText: "#ffffff",
    },
    warning: {
      main: "#F79009",
      dark: "B54708",
      light: "#FEF0C7",
      contrastText: "#ffffff",
    },
    error: {
      main: "#F04438",
      dark: "#B42318",
      light: "#FECDCA",
      contrastText: "#ffffff",
    },
    info: {
      main: "#0BA5EC",
      dark: "#026AA2",
      light: "#7CD4FD",
    },
    text: {
      primary: "#101828",
      secondary: "#475467",
      disabled: alpha("#101828", 0.56),
    },
    grey: {
      50: "#F9FAFB",
      100: "#F2F4F7",
      200: "#E4E7EC",
      300: "#D0D5DD",
      400: "#98A2B3",
      500: "#667085",
      600: "#475467",
      700: "#344054",
      800: "#1D2939",
      900: "#101828",
    },
    border: "#F2F4F7",
    action: {
      active: "rgba(16, 24, 40, 0.40)",
      hover: "rgba(16, 24, 40, 0.04)",
      selected: "rgba(16, 24, 40, 0.08)",
      disabled: "rgba(16, 24, 40, 0.26)",
      disabledBackground: "rgba(16, 24, 40, 0.12)",
      focus: "rgba(16, 24, 40, 0.12)",
    },
  },
});

import styles from "./App.less";
export default connect((state) => ({
  instance: state.instance,
  settings: state.settings,
}))(function SettingsApp(props) {
  const location = useLocation();

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
      <ThemeProvider theme={customTheme}>
        <section className={styles.Settings}>
          <div className={styles.AppWrap}>
            <ResizableContainer
              id="settingsNav"
              defaultWidth={220}
              minWidth={220}
              maxWidth={360}
            >
              <SettingsNav />
            </ResizableContainer>
            <Box
              className={styles.OverflowWrap}
              sx={{
                borderLeft: "1px solid",
                borderColor: "border",
              }}
            >
              <Box
                component="main"
                className={
                  location.pathname === "/settings/instance/bynder"
                    ? ""
                    : styles.Content
                }
                sx={{
                  height: "100%",
                }}
              >
                <Switch>
                  <Route
                    exact
                    path="/settings/styles/:category"
                    component={Styles}
                  />
                  <Redirect from="/settings/styles" to="/settings/styles/1" />
                  <Route
                    path="/settings/instance/bynder"
                    exact
                    component={Bynder}
                  />
                  <Route
                    path="/settings/instance/:category"
                    component={Instance}
                  />

                  <Route path="/settings/fonts/browse" component={Browse} />
                  <Route
                    path="/settings/fonts/installed"
                    component={Installed}
                  />
                  <Redirect
                    from="/settings/fonts"
                    to="/settings/fonts/browse"
                  />

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
              </Box>
            </Box>
          </div>
        </section>
      </ThemeProvider>
    </WithLoader>
  );
});
