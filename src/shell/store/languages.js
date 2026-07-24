import { request } from "utility/request";

export function languages(state = [], action) {
  switch (action.type) {
    case "LOADED_LOCAL_LANGUAGES":
    case "FETCH_LANGUAGES_SUCCESS":
      return Array.isArray(action.payload) ? action.payload : state;
    default:
      return state;
  }
}

export function fetchLangauges(type) {
  return (dispatch) => {
    const url = !!type
      ? `${CONFIG.API_INSTANCE}/env/langs?type=${type}`
      : `${CONFIG.API_INSTANCE}/env/langs`;

    return request(url)
      .then((res) => {
        dispatch({
          type: "FETCH_LANGUAGES_SUCCESS",
          payload: res.data,
        });
      })
      .catch((err) => {
        console.error("fetchLangauges failed:", err);
      });
  };
}
