import { hot } from "react-hot-loader/root";
import React from "react";
import { Provider } from "react-redux";
import { Route } from "react-router-dom";

import { injectReducer, store } from "shell/store";

import { modal } from "./store/modal";
import { listFilters } from "./store/listFilters";
import { headTags } from "./store/headTags";

import ContentEditor from "./app";

// Inject reducers into shared app shell store
injectReducer(store, "modal", modal);
injectReducer(store, "listFilters", listFilters);
injectReducer(store, "headTags", headTags);

export default hot(function ContentApp() {
  return (
    <Provider store={store}>
      <Route component={ContentEditor} />
    </Provider>
  );
});
