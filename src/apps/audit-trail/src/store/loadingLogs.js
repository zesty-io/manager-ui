import {FETCH_LOGS_SUCCESS, FETCH_LOGS_ERROR} from './logs'

export function loadingLogs(state = true, action) {
  switch(action.type) {
    case FETCH_LOGS_SUCCESS:
    case FETCH_LOGS_ERROR:
      return false
      break
    default:
      return state
      break;
  }
}
