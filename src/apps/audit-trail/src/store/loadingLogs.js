export function loadingLogs(state = true, action) {
  switch (action.type) {
    case "FETCH_LOGS_SUCCESS":
    case "FETCH_LOGS_ERROR":
      return false;
    default:
      return state;
  }
}
