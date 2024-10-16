import { applyMiddleware, combineReducers, createStore } from "redux";
import thunkMiddleware from "redux-thunk";
import createSentryMiddleware from "redux-sentry-middleware";
import { composeWithDevTools } from "redux-devtools-extension";

import { Sentry } from "utility/sentry";

import { fetchResource, resolveFieldOptions } from "./middleware/api";
import { localStorage } from "./middleware/local-storage";
import { session } from "./middleware/session";
import { appBus } from "./middleware/app-bus";
import { nav } from "./middleware/nav";

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
import { logs } from "./logs";
import { notifications } from "./notifications";
import { platform } from "./platform";
import { headTags } from "./headTags";
import media from "./media";
import mediaRevamp from "./media-revamp";
import { ui } from "./ui";
import { users } from "./users";
import { releases } from "./releases";
import { releaseMembers } from "./releaseMembers";
import apps from "./apps";
import { instanceApi } from "../services/instance";
import { accountsApi } from "../services/accounts";
import { mediaManagerApi } from "../services/mediaManager";
import { metricsApi } from "../services/metrics";
import { cloudFunctionsApi } from "../services/cloudFunctions";
import { marketingApi } from "../services/marketing";
import { analyticsApi } from "../services/analytics";

// Middleware is applied in order of array
const middlewares = [
  localStorage,
  session,
  appBus,
  nav,
  fetchResource,
  resolveFieldOptions,
  thunkMiddleware,
  instanceApi.middleware,
  accountsApi.middleware,
  cloudFunctionsApi.middleware,
  mediaManagerApi.middleware,
  metricsApi.middleware,
  cloudFunctionsApi.middleware,
  marketingApi.middleware,
  analyticsApi.middleware,
];

/**
 * Setup bug tracking
 */
middlewares.push(
  createSentryMiddleware(Sentry, {
    getUserContext: (state) => {
      return {
        email: state.user.email,
        ZUID: state.user.ZUID,
        createdAt: state.user.createdAt,
        firstName: state.user.firstName,
        lastName: state.user.lastName,
        lastLogin: state.user.lastLogin,
        selected_lang: state.user.selected_lang,
        updatedAt: state.user.updatedAt,
      };
    },
    stateTransformer: (state) => {
      // Specify allow list of transferable data to sentry
      return {
        userRole: state.userRole,
        products: state.products,
        platform: state.platform,
        notifications: state.notifications,
        instance: state.instance,
      };
    },
  })
);

function createReducer(asyncReducers) {
  let initialReducers = {
    noop: () => {
      return {};
    },
    apps,
    auth,
    user,
    users: users.reducer,
    releases: releases.reducer,
    releaseMembers: releaseMembers.reducer,
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
    mediaRevamp,
    logs,
    notifications,
    platform,
    headTags,
    ui: ui.reducer,
    [instanceApi.reducerPath]: instanceApi.reducer,
    [accountsApi.reducerPath]: accountsApi.reducer,
    [cloudFunctionsApi.reducerPath]: cloudFunctionsApi.reducer,
    [mediaManagerApi.reducerPath]: mediaManagerApi.reducer,
    [metricsApi.reducerPath]: metricsApi.reducer,
    [cloudFunctionsApi.reducerPath]: cloudFunctionsApi.reducer,
    [marketingApi.reducerPath]: marketingApi.reducer,
    [analyticsApi.reducerPath]: analyticsApi.reducer,
  };

  return combineReducers({
    ...initialReducers,
    ...asyncReducers,
  });
}

function configureStore(initialState = {}) {
  const store = createStore(
    createReducer(),
    initialState,
    composeWithDevTools(applyMiddleware(...middlewares))
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
