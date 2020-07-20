export function contentModelFields(state = {}, action) {
  switch (action.type) {
    case "FETCH_FIELDS_SUCCESS":
    case "LOADED_LOCAL_FIELDS":
      return { ...state, ...action.payload };
    default:
      return state;
  }
}

export function fetchFields(modelZUID) {
  return dispatch => {
    return dispatch({
      type: "FETCH_RESOURCE",
      uri: `${CONFIG.API_INSTANCE}/content/models/${modelZUID}/fields`,
      handler: res => {
        if (res.data && Array.isArray(res.data)) {
          const fields = res.data.reduce((acc, field, i) => {
            acc[field.ZUID] = field;
            acc[field.ZUID].settings = acc[field.ZUID].settings || {};
            return acc;
          }, {});

          dispatch({
            type: "FETCH_FIELDS_SUCCESS",
            payload: fields
          });
        }

        return res;
      }
    });
  };
}
