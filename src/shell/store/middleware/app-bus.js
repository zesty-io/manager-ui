export const appBus =
  (store) =>
  (next) =>
  (action = {}) => {
    const state = store.getState();

    if (state.apps.frames.length) {
      state.apps.frames.forEach((frame) => {
        console.log("frame", frame);

        frame?.contentWindow?.postMessage({
          source: "zesty",
          action,
        });
      });
    }

    // Ensure we continue redux action handling
    return next(action);
  };
