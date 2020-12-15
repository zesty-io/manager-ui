import { applyMiddleware, combineReducers, createStore } from "redux";
import { createLogger } from "redux-logger";
import * as Sentry from "@sentry/react";

import thunkMiddleware from "redux-thunk";
import createSentryMiddleware from "redux-sentry-middleware";
import { fetchResource, resolveFieldOptions } from "./middleware/api";
import { localStorage } from "./middleware/local-storage";

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
import { mediaBins, mediaGroups } from "./media";
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
  Sentry.init({
    release: window.CONFIG?.build?.data?.gitCommit,
    environment: window.CONFIG?.ENV,
    dsn:
      "https://2e83c3767c484794a56832affe2d26d9@o162121.ingest.sentry.io/5441698"
  });

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
    mediaBins,
    mediaGroups,
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
