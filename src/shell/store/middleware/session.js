import { endSession } from "shell/store/auth";

export const session = store => next => (action = {}) => {
  if (typeof action == "function") {
    // We use action creator to dispatch requests so we can inspect
    // them in redux middleware. This is one so we have to invoke it
    // passing the required redux dispatch function parameters
    const result = action(store.dispatch, store.getState);

    // Ensure a promise was returned
    if (result?.then) {
      result.then(data => {
        if (data?.status === 401) {
          const state = store.getState();
          if (state.auth.valid) {
            // User is not logging in and a request was unauthenticated
            store.dispatch(endSession());
          }
        }

        // Ensure we continue promise resolution value
        return data;
      });
    }

    // Ensure we continue the promise chain
    return result;
  }

  // Ensure we continue redux action handling
  return next(action);
};
