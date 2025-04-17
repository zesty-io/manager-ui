import { useEffect } from "react";
import { Switch, Route, Redirect, useLocation } from "react-router-dom";
import { connect } from "react-redux";
import { Box, Grid } from "@mui/material";

import { WithLoader } from "@zesty-io/core/WithLoader";
import { SettingsNav } from "./components/Nav";

import { Instance } from "./views/Instance";
import { Styles } from "./views/Styles";
import { Robots } from "./views/Robots";
import { Bynder } from "./views/Bynder";

import {
  fetchSettings,
  fetchStylesVariables,
  fetchStylesCategories,
  fetchFonts,
  fetchFontsInstalled,
} from "../../../../shell/store/settings";
import { ResizableContainer } from "../../../../shell/components/ResizeableContainer";
import Installed from "./views/Fonts/Installed";
import Browse from "./views/Fonts/Browse";
import { HeadTags } from "./views/Robots/HeadTags";
// Makes sure that other apps using legacy theme does not get affected with the palette

export default connect((state) => {
  return {
    instance: state.instance,
    settings: state.settings,
  };
})(function SettingsApp(props) {
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
      height="calc(100vh - 40px)"
    >
      <Grid
        container
        spacing={0}
        columns={2}
        sx={{
          height: "calc(100vh - 40px)",
          bgcolor: "grey.50",
          color: "grey.300",
          position: "relative",
          outline: "2px solid cyan",
          outlineOffset: "-2px",
        }}
      >
        <Grid
          item
          xs={"auto"}
          sx={{
            position: "relative",
            height: "100%",
            borderRight: "1px solid",
            borderRightColor: "grey.400",
            bgcolor: "grey.900",
            "& > div": {
              height: "100%",
            },
          }}
        >
          <ResizableContainer
            id="settingsNav"
            defaultWidth={220}
            minWidth={220}
            maxWidth={360}
          >
            <SettingsNav />
          </ResizableContainer>
        </Grid>
        <Grid
          item
          xs
          sx={{
            position: "relative",
            height: "100%",
            width: "100%",
            overflow: "hidden",
            bgcolor: "grey.50",
          }}
        >
          <Box
            position="relative"
            component="main"
            sx={{
              height: "100%",
              width: "100%",
              overflow: "hidden",
              boxSizing: "border-box",
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
              <Route path="/settings/instance/:category" component={Instance} />

              <Route path="/settings/fonts/browse" component={Browse} />
              <Route path="/settings/fonts/installed" component={Installed} />
              <Redirect from="/settings/fonts" to="/settings/fonts/browse" />

              <Route path="/settings/robots" component={Robots} />
              <Route
                path="/settings/head"
                render={() => <HeadTags resourceZUID={props?.instance?.ZUID} />}
              />

              <Redirect from="/settings" to="/settings/instance/general" />
              <Redirect
                from="/settings/instance"
                to="/settings/instance/general"
              />
            </Switch>
          </Box>
        </Grid>
      </Grid>
    </WithLoader>
  );
});
