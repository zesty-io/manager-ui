import { memo } from "react";
import { Switch, Route, Redirect } from "react-router-dom";
import { Sentry } from "../../../utility/sentry";
import { Box } from "@mui/material";

import { useDispatch, useSelector } from "react-redux";
import { actions } from "../../store/ui";

import AppError from "../../components/AppError";
import GlobalSidebar from "../../components/global-sidebar";
import GlobalTopbar from "../../components/GlobalTopbar";
import Missing from "../../components/missing";
import SearchPage from "../../views/SearchPage";

import ContentApp from "../../../apps/content-editor/src";
import DamApp from "../../../apps/media/src";
import ReleaseApp from "../../../apps/release/src";
import ReportingApp from "../../../apps/reports/src";
import CodeApp from "../../../apps/code-editor/src";
import LeadsApp from "../../../apps/leads/src";
import SchemaApp from "../../../apps/schema/src";
import SeoApp from "../../../apps/seo/src";
import SettingsApp from "../../../apps/settings/src";
import HomeApp from "../../../apps/home";
import MarketplaceApp from "../../../apps/marketplace/src";
import { AppState } from "../../store/types";

import styles from "./Shell.less";

export default memo(function Shell() {
  const dispatch = useDispatch();
  const openNav = useSelector((state: AppState) => state.ui.openNav);
  const products: string[] = useSelector((state: AppState) => state.products);

  return (
    <Box
      component="section"
      className={styles.Shell}
      height="100vh"
      overflow="hidden"
      display="grid"
      gridTemplateColumns={openNav ? "200px 1fr" : "48px 1fr"}
      sx={{
        backgroundColor: "background.paper",
      }}
    >
      <GlobalSidebar
        onClick={() => {
          dispatch(actions.setGlobalNav(!openNav));
        }}
        openNav={openNav}
      />
      <main className={styles.AppLoader}>
        <GlobalTopbar />
        <Box
          className={styles.SubApp}
          data-cy="SubApp"
          sx={{
            zIndex: 30,
            backgroundColor: "background.paper",
            // Makes sure that tinyMCE is not overlapped when in fullscreen mode
            "&:has(div.tox-fullscreen)": {
              zIndex: (theme) => theme.zIndex.appBar + 1,
            },
          }}
        >
          <Sentry.ErrorBoundary fallback={() => <AppError />}>
            <Switch>
              <Route path="/release" component={ReleaseApp} />

              <Route path="/media/:groupID/file/:fileID" component={DamApp} />
              <Route path="/media/:groupID" component={DamApp} />
              <Route path="/media" component={DamApp} />
              <Route path="/search" component={SearchPage} />
              {products.map((product) => {
                switch (product) {
                  case "launchpad":
                    return (
                      <Route
                        key={product}
                        path="/launchpad"
                        component={HomeApp}
                      />
                    );
                  case "content":
                    return (
                      <Route
                        key={product}
                        path="/content"
                        component={ContentApp}
                      />
                    );
                  case "reports":
                    return (
                      <Route
                        key={product}
                        path="/reports"
                        component={ReportingApp}
                      />
                    );
                  case "code":
                    return (
                      <Route key={product} path="/code" component={CodeApp} />
                    );
                  case "leads":
                    return (
                      <Route key={product} path="/leads" component={LeadsApp} />
                    );
                  case "schema":
                    return (
                      <Route
                        key={product}
                        path="/schema"
                        component={SchemaApp}
                      />
                    );
                  case "redirects":
                    return (
                      <Route
                        key={product}
                        path="/redirects"
                        component={SeoApp}
                      />
                    );
                  case "settings":
                    return (
                      <Route
                        key={product}
                        path="/settings"
                        component={SettingsApp}
                      />
                    );
                  case "apps":
                    return (
                      <Route
                        key={product}
                        path="/apps*"
                        component={MarketplaceApp}
                      />
                    );
                  default:
                    null;
                }
              })}

              <Redirect exact from="/" to="/launchpad" />
              <Route path="*" component={Missing} />
            </Switch>
          </Sentry.ErrorBoundary>
        </Box>
      </main>
    </Box>
  );
});
