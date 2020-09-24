export function platform(state = {}, action) {
  switch (action.type) {
    case "DETECT_PLATFORM":
      return {
        ...state,
        isMac: action.payload.isMac
      };

    default:
      return state;
  }
}

export function detectPlatform() {
  return dispatch => {
    return dispatch({
      type: "DETECT_PLATFORM",
      payload: {
        isMac: navigator.platform.toUpperCase().indexOf("MAC") >= 0
      }
    });
  };
}
