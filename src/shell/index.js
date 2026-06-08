import "./i18n";
import { StrictMode, Suspense } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { Router } from "react-router-dom";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { theme } from "@zesty-io/material";
import CssBaseline from "@mui/material/CssBaseline";

import "chart.js/auto";

import { LicenseInfo } from "@mui/x-license";
LicenseInfo.setLicenseKey(
  "4a9d79ec086e87806b702c7bc5c6e644Tz0xMTIyNDIsRT0xNzc3NTkzNTk5MDAwLFM9cHJvLExNPXBlcnBldHVhbCxQVj1RMy0yMDI0LEtWPTI="
);

import idb from "utility/idb";
import observable from "@riotjs/observable";

import history from "utility/history";
import { Sentry } from "utility/sentry";
import { store, injectReducer } from "shell/store";
import { navContent } from "../apps/content-editor/src/store/navContent";

import AppError from "shell/components/AppError";

import PrivateRoute from "./components/private-route";
import LoadInstance from "./components/load-instance";
import Shell from "./views/Shell";

import { MonacoSetup } from "../apps/code-editor/src/app/components/Editor/components/MemoizedEditor/MonacoSetup";
import { actions } from "shell/store/ui";
import { CommentProvider } from "./contexts/CommentProvider";
import { CreateContentItemDialogProvider } from "./contexts/CreateContentItemDialogProvider";
import getRuntimeEnv from "../utility/getRuntimeEnv";

// interploated by webpack at build time
// must be setup before starting the store
window.CONFIG = {
  ...__CONFIG__,
  ...getRuntimeEnv({ env: __CONFIG__.ENV, hostname: window.location.hostname }),
};

import * as amplitude from "@amplitude/analytics-browser";
import { isContentOne } from "../utility/isContentOne";

// needed for Breadcrumbs in Shell
injectReducer(store, "navContent", navContent);

// Some legacy code refers to this global which is an observable
// FIXME: this needs to get refactored out
if (window.zesty == null) {
  window.zesty = observable();
}
window.zestyStore = store;

// Update urls in config to include the current instance zuid
const instanceZUID = store.getState().instance.ZUID;
window.CONFIG.API_INSTANCE = `${window.CONFIG.API_INSTANCE_PROTOCOL}${instanceZUID}${window.CONFIG.API_INSTANCE}`;

const appTheme = createTheme(theme, {
  palette: {
    ...(isContentOne() && {
      primary: {
        main: "#3F51B5",
        dark: "#303F9F",
        light: "#7986CB",
      },
    }),
    success: {
      contrastText: "#fff",
    },
    warning: {
      contrastText: "#fff",
    },
    info: {
      contrastText: "#fff",
    },

    action: {
      active: "rgba(127, 127, 126, 0.7)",
      selected: "rgba(127,127, 126, 0.125)",
      disabled: "rgba(127,127, 126, 0.47)",
      disabledBackground: "rgba(127,127, 126, 0.28)",
      hover: "rgba(127, 127, 126, 0.07)",
    },
    background: {
      editor: "#0F0F0F",
    },
  },

  components: {
    MuiToggleButton: {
      styleOverrides: (theme) => ({
        sizeSmall: {
          ...theme.typography.body2,
        },
      }),
    },
    MuiCssBaseline: {
      styleOverrides: (theme) => ({
        body: {
          boxSizing: "border-box",
          "&::-webkit-scrollbar, & *::-webkit-scrollbar": {
            width: "8px",
            height: "8px",
          },
          "&::-webkit-scrollbar-track-piece, & *::-webkit-scrollbar-track-piece":
            {
              backgroundColor: theme.palette.grey[100],
              borderRadius: "4px",
            },
          "&::-webkit-scrollbar-thumb, & *::-webkit-scrollbar-thumb": {
            backgroundColor: theme.palette.grey[300],
            borderRadius: "4px",
          },
        },
      }),
    },
  },
});

MonacoSetup(store);

amplitude.init(window.CONFIG.AMPLITUDE_API_KEY, { autocapture: true });

const preLoginIdentify = new amplitude.Identify();
preLoginIdentify.set("env", window.CONFIG.ENV);
amplitude.identify(preLoginIdentify);

// TODO: Add a context here that will store all draft comments
const App = Sentry.withProfiler(() => (
  <StrictMode>
    {/* null fallback intentionally blocks render until i18n is ready, preventing raw key flash */}
    <Suspense fallback={null}>
      <Sentry.ErrorBoundary
        fallback={() => <AppError />}
        beforeCapture={(scope) => {
          scope.setLevel("fatal");
          scope.setTag("error_boundary", true);
        }}
      >
        <ThemeProvider theme={appTheme}>
          <CssBaseline>
            <Provider store={store}>
              <Router history={history}>
                <CommentProvider>
                  <CreateContentItemDialogProvider>
                    <PrivateRoute>
                      <LoadInstance>
                        <Shell />
                      </LoadInstance>
                    </PrivateRoute>
                  </CreateContentItemDialogProvider>
                </CommentProvider>
              </Router>
            </Provider>
          </CssBaseline>
        </ThemeProvider>
      </Sentry.ErrorBoundary>
    </Suspense>
  </StrictMode>
));

function render() {
  const container = document.getElementById("root");
  const root = createRoot(container);

  root.render(<App />);
}

// Load IndexedDB cache
try {
  idb
    .getMany([
      `${instanceZUID}:languages`,
      `${instanceZUID}:user:selected_lang`,
      `${instanceZUID}:navContent`,
      `${instanceZUID}:models`,
      `${instanceZUID}:fields`,
      `${instanceZUID}:content`,
      `${instanceZUID}:ui`,
    ])
    .then(([languages, selectedLang, nav, models, fields, content, ui]) => {
      store.dispatch({
        type: "LOADED_LOCAL_LANGUAGES",
        payload: languages || [],
      });

      store.dispatch({
        type: "LOADED_LOCAL_USER_LANG",
        payload: {
          // default to english
          lang: selectedLang || "en-US",
        },
      });

      // FIXME: This is broken because on initial nav fetch we modify
      // the raw response before entering it into local state so when re-loading
      // from local db it's not in the shape the redux store expects.
      // store.dispatch({
      //   type: "LOADED_LOCAL_CONTENT_NAV",
      //   raw: nav
      // });

      store.dispatch({
        type: "LOADED_LOCAL_MODELS",
        payload: models,
      });

      store.dispatch({
        type: "LOADED_LOCAL_FIELDS",
        payload: fields,
      });

      store.dispatch({
        type: "LOADED_LOCAL_ITEMS",
        data: content,
      });

      store.dispatch(actions.loadedUI(ui));

      // Render App after all store dispatches are complete
      render();
    })
    .catch((err) => {
      throw err;
    });
} catch (err) {
  console.error("IndexedDB:get:error", err);
  // Render App if there was an error with IndexedDB access
  render();
}
