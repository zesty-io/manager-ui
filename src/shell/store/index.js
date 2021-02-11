import { applyMiddleware, combineReducers, createStore } from "redux";
import { createLogger } from "redux-logger";

import thunkMiddleware from "redux-thunk";
import createSentryMiddleware from "redux-sentry-middleware";
import { fetchResource, resolveFieldOptions } from "./middleware/api";
import { localStorage } from "./middleware/local-storage";

import Sentry from "utility/sentry";

import { auth } from "./auth";
import { products } from "./products";
import { user } from "./user";
import { userRole } from "./userRole";
import { instance } from "./instance";
import { instances } from "./instances";
import { languages } from "./languages";
import { models } from "./models";
import { fields } from "./fields";
import { content } from "./content";
import { contentVersions } from "./contentVersions";
import media from "./media";
import { logs } from "./logs";
import { notifications } from "./notifications";
import { platform } from "./platform";
import { headTags } from "./headTags";
import ui from "./ui";

// Middleware is applied in order of array
const middlewares = [
  localStorage,
  fetchResource,
  resolveFieldOptions,
  thunkMiddleware
];

/**
 * Do not log actions in production
 * Improves performance and keeps bug tracking clean
 */
if (window.CONFIG?.ENV !== "production") {
  middlewares.push(
    createLogger({
      collapsed: true,
      duration: true,
      diff: false
    })
  );
}

/**
 * Setup bug tracking
 */
if (["stage", "production"].includes(window.CONFIG?.ENV)) {
  middlewares.push(
    createSentryMiddleware(Sentry, {
      getUserContext: state => state.user
    })
  );
}

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
    instances,
    languages,
    models,
    fields,
    content,
    contentVersions,
    media,
    logs,
    notifications,
    platform,
    headTags,
    ui
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
    applyMiddleware(...middlewares)
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
