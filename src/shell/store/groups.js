export function groups(state = [], action) {
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

export function fetchGroups(binZUID) {
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
