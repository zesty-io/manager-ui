export function contentModels(state = {}, action) {
  switch (action.type) {
    case "FETCH_MODELS_SUCCESS":
    case "LOADED_LOCAL_MODELS":
      return { ...state, ...action.payload };
      break;
    case "FETCH_MODEL_SUCCESS":
      return { ...state, [action.payload.ZUID]: action.payload };
      break;
    default:
      return state;
  }
}

// API call actions

export function fetchModels() {
  return (dispatch, getState) => {
    return dispatch({
      type: "FETCH_RESOURCE",
      uri: `${CONFIG.API_INSTANCE}/content/models`,
      handler: res => {
        return dispatch({
          type: "FETCH_MODELS_SUCCESS",
          payload: res.data.reduce((acc, model) => {
            acc[model.ZUID] = model;
            return acc;
          }, {})
        });
      }
    });
  };
}
