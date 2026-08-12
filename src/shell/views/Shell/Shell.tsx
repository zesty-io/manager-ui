import { memo, useEffect } from "react";
import {
  Switch,
  Route,
  Redirect,
  useHistory,
  useLocation,
} from "react-router-dom";
import { Sentry } from "../../../utility/sentry";
import { Box } from "@mui/material";

import { useDispatch, useSelector } from "react-redux";
import { actions } from "../../store/ui";

import AppError from "../../components/AppError";
import GlobalSidebar from "../../components/global-sidebar";
import GlobalTopbar from "../../components/GlobalTopbar";
import Missing from "../../components/missing";
import SearchPage from "../../views/SearchPage";
import { InAppAnnouncement } from "../../components/InAppAnnouncement";

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
import StudioApp from "../../../apps/studio";
import MarketplaceApp from "../../../apps/marketplace/src";
import { BlocksApp } from "../../../apps/blocks";
import { AppState } from "../../store/types";
import { LoadingQuote } from "../../components/LoadingQuote";
import { Products } from "../../services/types";

import styles from "./Shell.less";
import { LoadingShell } from "./LoadingShell";
import { registerNavigate } from "../../../engine/navigator";
import { AIDrawer } from "./AIDrawer";
import { useLocalStorage } from "react-use";
import * as amplitude from "@amplitude/analytics-browser";
import { sessionReplayPlugin } from "@amplitude/plugin-session-replay-browser";
import instanceZUID from "../../../utility/instanceZUID";
import { isZestyEmail } from "../../../utility/isZestyEmail";

let sessionReplayAdded = false;
function maybeEnableSessionReplay(email?: string) {
  if (
    !sessionReplayAdded &&
    window.CONFIG?.ENV === "production" &&
    !!email &&
    !isZestyEmail(email)
  ) {
    amplitude.add(sessionReplayPlugin({ sampleRate: 1 }));
    sessionReplayAdded = true;
  }
}

export default memo(function Shell() {
  const dispatch = useDispatch();
  const openNav = useSelector((state: AppState) => state.ui.openNav);
  const {
    products,
    isLoadingProducts,
  }: { products: Products[]; isLoadingProducts: boolean } = useSelector(
    (state: AppState) => state.products
  );
  const instance = useSelector((state: AppState) => state.instance);
  const user = useSelector((state: AppState) => state.user);
  const languages = useSelector((state: AppState) => state.languages);
  const files = useSelector((state: AppState) => state.files);
  const isAppLoaded =
    !isLoadingProducts &&
    !!instance?.ID &&
    !!instance?.domains &&
    !!user?.ID &&
    !!languages?.length &&
    !!files?.length &&
    !!files?.length;

  const history = useHistory();
  const { pathname } = useLocation();
  const [showAiDrawer, setShowAiDrawer] = useLocalStorage(
    "showAiDrawer",
    false
  );

  useEffect(() => {
    registerNavigate((to, { replace = false } = {}) => {
      replace ? history.replace(to) : history.push(to);
    });
  }, [history]);

  amplitude.setUserId(user.email);
  maybeEnableSessionReplay(user.email);

  const identifyEvent = new amplitude.Identify();
  identifyEvent.set("instanceZUID", instance.ZUID);
  identifyEvent.set("userZUID", user.ZUID);
  identifyEvent.set("userID", user.ID);
  identifyEvent.set("userEmail", user.email);
  identifyEvent.set("userFirstName", user.firstName);
  identifyEvent.set("userLastName", user.lastName);

  amplitude.identify(identifyEvent);

  return (
    <Box
      component="section"
      className={styles.Shell}
      height="100vh"
      overflow="clip"
      display="grid"
      gridTemplateColumns={openNav ? "200px 1fr" : "48px 1fr"}
      sx={{
        flex: 1,
        backgroundColor: "background.paper",
      }}
    >
      <InAppAnnouncement />
      <GlobalSidebar
        onClick={() => {
          dispatch(actions.setGlobalNav(!openNav));
        }}
        openNav={openNav}
      />
      <main className={styles.AppLoader}>
        <GlobalTopbar
          onShowAiDrawerToggle={() => {
            setShowAiDrawer(!showAiDrawer);
          }}
        />
        <Box
          className={styles.SubApp}
          data-cy="SubApp"
          sx={{
            zIndex: 30,
            backgroundColor: "background.paper",
            // Makes sure that tinyMCE does not get overlapped when in fullscreen mode
            "&:has(div.tox-fullscreen)": {
              zIndex: (theme) => theme.zIndex.appBar + 1,
            },
          }}
        >
          <Sentry.ErrorBoundary
            fallback={() => <AppError />}
            beforeCapture={(scope) => {
              scope.setLevel("fatal");
              scope.setTag("error_boundary", true);
            }}
          >
            {isAppLoaded ? (
              <Box
                display="flex"
                sx={{
                  height: "100%",
                }}
              >
                <Box flex={1}>
                  <Switch>
                    <Route path="/release" component={ReleaseApp} />
                    <Route path="/studio" component={StudioApp} />

                    <Route
                      path="/media/:groupID/file/:fileID"
                      component={DamApp}
                    />
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
                        case "blocks":
                          return (
                            <Route
                              key={product}
                              path="/blocks"
                              component={BlocksApp}
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
                            <Route
                              key={product}
                              path="/code"
                              component={CodeApp}
                            />
                          );
                        case "leads":
                          return (
                            <Route
                              key={product}
                              path="/leads"
                              component={LeadsApp}
                            />
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
                </Box>
                {showAiDrawer && (
                  <AIDrawer
                    open={showAiDrawer}
                    onClose={() => setShowAiDrawer(false)}
                    key={pathname}
                  />
                )}
              </Box>
            ) : (
              <LoadingShell />
            )}
          </Sentry.ErrorBoundary>
        </Box>
      </main>
    </Box>
  );
});
