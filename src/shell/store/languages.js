import { request } from "utility/request";

export function languages(state = [], action) {
  switch (action.type) {
    case "LOADED_LOCAL_LANGUAGES":
    case "FETCH_LANGUAGES_SUCCESS":
      return action.payload;
    default:
      return state;
  }
}

export function fetchLangauges(type) {
  return (dispatch) => {
    return request(`${CONFIG.API_INSTANCE}/env/langs?type=${type}`).then(
      (res) => {
        dispatch({
          type: "FETCH_LANGUAGES_SUCCESS",
          payload: res.data,
        });
      }
    );
  };
}
