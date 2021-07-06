import { request } from "utility/request";

export function languages(state = [], action) {
  switch (action.type) {
    case "FETCH_LANGUAGES_SUCCESS":
      return action.data;
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
          data: res.data,
        });
      }
    );
  };
}
