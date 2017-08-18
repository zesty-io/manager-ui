import searchProps from 'utility/searchProps'
import {FETCH_LOGS_SUCCESS} from './logs'

export const SEARCH_LOGS = 'SEARCH_LOGS'
export const FILTER_LOGS = 'FILTER_LOGS'

// Reducer
export function inViewLogs(state = {}, action) {
  switch (action.type) {
    case FETCH_LOGS_SUCCESS:
      return action.data
      break;

    case FILTER_LOGS:
      console.log('filtering logs', action);
      // TODO filter based on time
      if (action.filter) {
        // var from = Date()
        // var to = from - action.filter
        // TODO filter logs by from / to
        return state
      } else {
        return state
      }
      break;

    case SEARCH_LOGS:
      if (!action.term) {
        return action.logs

      } else {
        let matches = {}

        for (let zuid in action.logs) {
          let log = action.logs[zuid]
          let matched = searchProps(log, action.term)

          if (matched) {
            matches[zuid] = Object.assign({}, log)
          }
        }

        return matches
      }
      break;

    default:
      return state;
      break;
  }
}

// Actions
export function searchInViewLogs(term) {
  return (dispatch, getState) => {
    const state = getState()
    dispatch({
      type: SEARCH_LOGS,
      logs: state.logs,
      term
    })
  }
}

export function filterInViewLogs(filter) {
  return (dispatch, getState) => {
    const state = getState()
    dispatch({
      type: FILTER_LOGS,
      logs: state.logs,
      filter
    })
  }
}
