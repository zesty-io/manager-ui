import deepFreeze from 'utility/deepFreeze'
import request from 'utility/request'

export const FETCHING_LOGS = 'FETCHING_LOGS'
export const FETCH_LOGS_SUCCESS = 'FETCH_LOGS_SUCCESS'
export const FETCH_LOGS_ERROR = 'FETCH_LOGS_ERROR'

// Reducer
export function logs(state = {}, action) {
  switch(action.type) {
    case FETCH_LOGS_SUCCESS:
      return action.data
      break;
    default:
      return state
      break;
  }
}

// Actions
export function getLogs(siteId) {
  return (dispatch, getState) => {
    dispatch({
      type: FETCHING_LOGS
    })

    const state = getState()
    const siteZuid = state.settings.siteZuid

    request(`${state.settings.SITES_SERVICE}/${siteZuid}/audit-trail-logs`)
    .then(json => {

      // Normalize logs by zuid
      let data = {}
      json.data.forEach(log => {
        data[log.zuid] = log
      })

      // Logs are immutable so we freeze them
      data = deepFreeze(data)

      dispatch({
        type: FETCH_LOGS_SUCCESS,
        data: data
      })

    })
    .catch(err => {
      dispatch({
        type: FETCH_LOGS_ERROR,
        err
      })
    })
  }
}
