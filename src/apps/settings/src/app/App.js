import { useEffect, useMemo } from "react";
import { Switch, Route, Redirect, useLocation } from "react-router-dom";
import { connect } from "react-redux";
import { Box, Grid, Portal } from "@mui/material";

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
import Workflows from "./views/User/Workflows";
import Installed from "./views/Fonts/Installed";
import Browser from "./views/Fonts/Browser";

import { HeadTags } from "./views/Robots/HeadTags";
import { useGetHeadTagsQuery } from "../../../../shell/services/instance";
import { parseWebFonts } from "./views/Fonts/utils";
// import FontBrowser from "./views/Fonts/FontBrowser";
// import FontInstalled from "./views/Fonts/FontInstalled";
// Makes sure that other apps using legacy theme does not get affected with the palette

export default connect((state) => {
  return {
    instance: state.instance,
    settings: state.settings,
  };
})(function SettingsApp(props) {
  const location = useLocation();

  const { data } = useGetHeadTagsQuery();

  const installedFonts = useMemo(() => {
    if (!data?.length) return [];
    const fontData = parseWebFonts(data);
    return fontData; // fontData?.map((item) => item?.href);
  }, [data]);

  useEffect(() => {
    props.dispatch(fetchSettings());
    props.dispatch(fetchStylesCategories());
    props.dispatch(fetchStylesVariables());
    props.dispatch(fetchFonts());
    props.dispatch(fetchFontsInstalled());
  }, []);

  return (
    <>
      <Portal container={document.head}>
        {installedFonts
          ?.map((item) => item?.href)
          ?.map((url) => (
            <link rel="stylesheet" href={url} />
          ))}
      </Portal>
      <Grid
        container
        spacing={0}
        columns={2}
        sx={{
          height: "calc(100vh - 40px)",
          bgcolor: "grey.50",
          color: "grey.300",
          position: "relative",

          width: "100%",
        }}
      >
        <Grid
          size={"auto"}
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
          size="grow"
          sx={{
            position: "relative",
            height: "100%",
            // width: "100%",
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

              <Route path="/settings/fonts/browse" component={Browser} />
              {/* <Route path="/settings/fonts/installed" component={Installed} /> */}
              <Route
                path="/settings/fonts/installed"
                render={() => <Installed webFonts={installedFonts} />}
              />
              <Redirect from="/settings/fonts" to="/settings/fonts/browse" />

              <Route path="/settings/robots" component={Robots} />
              <Route
                path="/settings/head"
                render={() => <HeadTags resourceZUID={props?.instance?.ZUID} />}
              />
              <Route path="/settings/user/workflows" component={Workflows} />

              <Redirect from="/settings" to="/settings/instance/general" />
              <Redirect
                from="/settings/instance"
                to="/settings/instance/general"
              />
            </Switch>
          </Box>
        </Grid>
      </Grid>
    </>
  );
});
