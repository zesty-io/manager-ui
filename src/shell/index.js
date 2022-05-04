// interploated by webpack at build time
// must be setup before starting the store
window.CONFIG = __CONFIG__;

import { StrictMode } from "react";
import ReactDOM from "react-dom";
import { Provider } from "react-redux";
import { Router } from "react-router-dom";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { theme } from "@zesty-io/material";

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

MonacoSetup(store);

const App = Sentry.withProfiler(() => (
  <StrictMode>
    <ThemeProvider theme={theme}>
      <Provider store={store}>
        <Sentry.ErrorBoundary fallback={() => <AppError />}>
          <Router history={history}>
            <PrivateRoute>
              <LoadInstance>
                <Shell />
              </LoadInstance>
            </PrivateRoute>
          </Router>
        </Sentry.ErrorBoundary>
      </Provider>
    </ThemeProvider>
  </StrictMode>
));

function render() {
  ReactDOM.render(<App />, document.getElementById("root"));
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
    });
} catch (err) {
  console.error("IndexedDB:get:error", err);
} finally {
  // Render App once all Cache has been loaded or failed
  render();
}
