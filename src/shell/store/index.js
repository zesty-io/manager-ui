import { applyMiddleware, combineReducers, createStore } from "redux";
import thunkMiddleware from "redux-thunk";
import { createLogger } from "redux-logger";

import { user } from "./user";
import { site } from "./site";
import ui from "./ui";

const loggerMiddleware = createLogger({
  collapsed: true,
  diff: true
});

function createReducer(asyncReducers) {
  let initialReducers = {
    entities: () => {
      return {
        sets: {},
        items: {},
        templates: {},
        files: {}
      };
    },
    user,
    site,
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
    applyMiddleware(
      thunkMiddleware, // lets us dispatch() functions
      loggerMiddleware // neat middleware that logs actions
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
