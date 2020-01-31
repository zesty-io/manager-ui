export function bins(state = [], action) {
  switch (action.type) {
    case "FETCH_BINS_SUCCESS":
      return [...state, ...action.payload];
    default:
      return state;
  }
}

export function fetchBins() {
  return (dispatch, getState) => {
    const instanceID = getState().instance.id;

    return dispatch({
      type: "FETCH_RESOURCE",
      uri: `${CONFIG.SERVICE_MEDIA_MANAGER}/site/${instanceID}/bins`,
      handler: res => {
        dispatch({
          type: "FETCH_BINS_SUCCESS",
          payload: res.data
        });
      }
    });
  };
}
