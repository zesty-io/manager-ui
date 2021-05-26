import { applyMiddleware, combineReducers, createStore } from "redux";
import thunkMiddleware from "redux-thunk";
import createSentryMiddleware from "redux-sentry-middleware";
import { composeWithDevTools } from "redux-devtools-extension";
import { fetchResource, resolveFieldOptions } from "./middleware/api";
import { localStorage } from "./middleware/local-storage";
import { session } from "./middleware/session";
import { Sentry } from "utility/sentry";
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
import { users } from "./users";
import ui from "./ui";
import publishPlan from "./publishPlan";

// Middleware is applied in order of array
const middlewares = [
  localStorage,
  session,
  fetchResource,
  resolveFieldOptions,
  thunkMiddleware
];

/**
 * Setup bug tracking
 */
middlewares.push(
  createSentryMiddleware(Sentry, {
    getUserContext: state => {
      return {
        email: state.user.email,
        ZUID: state.user.ZUID,
        createdAt: state.user.createdAt,
        firstName: state.user.firstName,
        lastName: state.user.lastName,
        lastLogin: state.user.lastLogin,
        selected_lang: state.user.selected_lang,
        updatedAt: state.user.updatedAt
      };
    },
    stateTransformer: state => {
      // Specify allow list of transferable data to sentry
      return {
        userRole: state.userRole,
        products: state.products,
        platform: state.platform,
        notifications: state.notifications,
        instance: state.instance
      };
    }
  })
);

function createReducer(asyncReducers) {
  let initialReducers = {
    noop: () => {
      return {};
    },
    auth,
    user,
    users: users.reducer,
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
    ui,
    publishPlan
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
