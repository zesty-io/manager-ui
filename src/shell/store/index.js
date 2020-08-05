import { applyMiddleware, combineReducers, createStore } from "redux";
import thunkMiddleware from "redux-thunk";
import { createLogger } from "redux-logger";

import { fetchResource, resolveFieldOptions } from "./middleware/api";
import { localStorage } from "./middleware/local-storage";

import { auth } from "./auth";
import { products } from "./products";
import { user } from "./user";
import { userRole } from "./userRole";
import { instance } from "./instance";
import { languages } from "./languages";
import { models } from "./models";
import { fields } from "./fields";
import { content } from "./content";
import { contentVersions } from "./contentVersions";
import { bins } from "./bins";
import { groups } from "./groups";
import { media } from "./media";
import { logs } from "./logs";
import { notifications } from "./notifications";

const actionLogger = createLogger({
  collapsed: true,
  diff: false
});

function createReducer(asyncReducers) {
  let initialReducers = {
    noop: () => {
      return {};
    },
    auth,
    user,
    userRole,
    products,
    instance,
    languages,
    models,
    fields,
    content,
    contentVersions,
    bins,
    groups,
    media,
    logs,
    notifications
  };

  return combineReducers({
    ...initialReducers,
    ...asyncReducers
  });
}

function configureStore(initialState = {}) {
  const store = createStore(
    createReducer(),
    initialState,
    applyMiddleware(
      localStorage,
      fetchResource,
      resolveFieldOptions,
      thunkMiddleware, // lets us dispatch() functions
      actionLogger
    )
  );

  // Keep a reference of injected reducers
  // @see https://stackoverflow.com/a/33044701
  store.asyncReducers = {};
  return store;
}

export function injectReducer(store, name, reducer) {
  store.asyncReducers[name] = reducer;
  store.replaceReducer(createReducer(store.asyncReducers));
}

export const store = configureStore();
