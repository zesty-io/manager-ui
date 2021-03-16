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
            // Trigger re-login modal

            console.log("unauth:", data);

            // Request was unauthenticated so trigger login modal
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

  // if (action?.payload?.code) {
  //   // We are dealing with a request

  //   if (action.payload.code === 401) {
  //     // Request was unauthenticated

  //     const state = store.getState();
  //     console.log("unauth:", state);

  //     if (!state.auth.checking) {
  //       // User is not logging in and a request was unauthenticated
  //       // Trigger re-login modal
  //     }
  //   }
  // }

  // Ensure we continue redux action handling
  return next(action);
};
