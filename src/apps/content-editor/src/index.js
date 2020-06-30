import React from "react";
import { Provider } from "react-redux";
import { Route } from "react-router-dom";

import { injectReducer, store } from "shell/store";

import { navContent } from "./store/navContent";
import { modal } from "./store/modal";
import { listFilters } from "./store/listFilters";
import { headTags } from "./store/headTags";

import ContentEditor from "./app";

// Inject reducers into shared app shell store
injectReducer(store, "navContent", navContent);
injectReducer(store, "modal", modal);
injectReducer(store, "listFilters", listFilters);
injectReducer(store, "headTags", headTags);

export default function ContentApp() {
  return (
    <Provider store={store}>
      <Route component={ContentEditor} />
    </Provider>
  );
}
