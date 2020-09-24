export function mediaBins(state = [], action) {
  switch (action.type) {
    case "FETCH_BINS_SUCCESS":
      return [...state, ...action.payload];
    default:
      return state;
  }
}
export function mediaGroups(state = [], action) {
  switch (action.type) {
    case "FETCH_GROUPS_SUCCESS":
      // Dedupe groups
      return [...state, ...action.payload].reduce((acc, group) => {
        let exists = acc.find(el => el.id === group.id);
        if (!exists) {
          acc.push(group);
        }

        return acc;
      }, []);

    default:
      return state;
  }
}

export function fetchMediaBins() {
  return (dispatch, getState) => {
    const instanceID = getState().instance.ID;

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

export function fetchMediaGroups(binZUID) {
  return dispatch => {
    return dispatch({
      type: "FETCH_RESOURCE",
      uri: `${CONFIG.SERVICE_MEDIA_MANAGER}/bin/${binZUID}/groups`,
      handler: res => {
        dispatch({
          type: "FETCH_GROUPS_SUCCESS",
          payload: res.data
        });
      }
    });
  };
}
