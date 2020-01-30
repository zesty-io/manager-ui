import { deepFreeze } from "utility/deepFreeze";
import { request } from "utility/request";

// Reducer
export function logs(state = {}, action) {
  switch (action.type) {
    case "FETCH_LOGS_SUCCESS":
      return action.data;
    default:
      return state;
  }
}

// Actions
export function getLogs(siteId) {
  return dispatch => {
    dispatch({
      type: "FETCHING_LOGS"
    });

    request(`${CONFIG.API_INSTANCE}/env/audits`)
      .then(json => {
        // Normalize logs by zuid
        let data = {};
        json.data.forEach(log => {
          data[log.ZUID] = log;
        });

        // Logs are immutable so we freeze them
        data = deepFreeze(data);

        dispatch({
          type: "FETCH_LOGS_SUCCESS",
          data: data
        });
      })
      .catch(err => {
        dispatch({
          type: "FETCH_LOGS_ERROR",
          err
        });
      });
  };
}
