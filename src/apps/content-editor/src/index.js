import React, { useEffect } from "react";
import { Provider } from "react-redux";
import { Route } from "react-router-dom";

import { injectReducer } from "shell/store";
import { fetchModels } from "shell/store/models";
import { fetchItemPublishings } from "shell/store/content";

import { navContent, fetchNav } from "store/navContent";
import { modal } from "store/modal";
import { listFilters } from "store/listFilters";
import { headTags, fetchHeadTags } from "store/headTags";

import ContentEditor from "./app";

// Inject reducers into shared app shell store
injectReducer(ZESTY_REDUX_STORE, "navContent", navContent);
injectReducer(ZESTY_REDUX_STORE, "modal", modal);
injectReducer(ZESTY_REDUX_STORE, "listFilters", listFilters);
injectReducer(ZESTY_REDUX_STORE, "headTags", headTags);

// NOTE: We expose the content store globally so ActivePreview can
// resolve the current routes path
window.ContentAppStore = ZESTY_REDUX_STORE;

// Kick off loading data before app mount
// to decrease time to first interaction
ZESTY_REDUX_STORE.dispatch(fetchNav());
ZESTY_REDUX_STORE.dispatch(fetchModels());
ZESTY_REDUX_STORE.dispatch(fetchItemPublishings());
ZESTY_REDUX_STORE.dispatch(fetchHeadTags());

window.ContentApp = function ContentApp() {
  return (
    <Provider store={ZESTY_REDUX_STORE}>
      <Route component={ContentEditor} />
    </Provider>
  );
};
