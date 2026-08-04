import { request } from "utility/request";

export function languages(state = [], action) {
  switch (action.type) {
    case "LOADED_LOCAL_LANGUAGES":
    case "FETCH_LANGUAGES_SUCCESS":
      if (!Array.isArray(action.payload)) {
        console.warn(
          "languages reducer: invalid payload (expected array, got",
          typeof action.payload,
          "), keeping previous state:",
          action.payload
        );
        return state;
      }
      return action.payload;
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
