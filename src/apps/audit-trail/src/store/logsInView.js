import { deepFreeze } from "utility/deepFreeze";

// Reducer
export function logsInView(state = {}, action) {
  switch (action.type) {
    case "FETCH_LOGS_SUCCESS":
      return action.data;
  }
}

// Actions
export function getLogs() {
  return dispatch => {
    dispatch({
      type: "FETCHING_LOGS"
    });

    return request(`${CONFIG.API_INSTANCE}/env/audits`)
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
