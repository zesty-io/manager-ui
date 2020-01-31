import { searchProps } from "utility/searchProps";

// Reducer
export function logsInView(state = {}, action) {
  switch (action.type) {
    case "FETCH_LOGS_SUCCESS":
      return action.data;

    case "FILTER_LOGS":
      console.log("filtering logs", action);
      // TODO filter based on time
      if (action.filter) {
        // var from = Date()
        // var to = from - action.filter
        // TODO filter logs by from / to
        return state;
      } else {
        return state;
      }

    case "SEARCH_LOGS":
      if (!action.term) {
        return action.logs;
      } else {
        let matches = {};

        for (let zuid in action.logs) {
          let log = action.logs[zuid];
          let matched = searchProps(log, action.term);

          if (matched) {
            matches[zuid] = Object.assign({}, log);
          }
        }

        return matches;
      }

    default:
      return state;
  }
}

// Actions
export function searchInViewLogs(term) {
  return (dispatch, getState) => {
    const state = getState();
    dispatch({
      type: "SEARCH_LOGS",
      logs: state.logs,
      term
    });
  };
}

export function filterInViewLogs(filter) {
  return (dispatch, getState) => {
    const state = getState();
    dispatch({
      type: "FILTER_LOGS",
      logs: state.logs,
      filter
    });
  };
}
