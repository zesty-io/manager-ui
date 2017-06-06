import {combineReducers} from 'redux'

export const site = combineReducers({
  site_zuid: 'xxxxxxxx',
  settings
})

export const FETCHING_SETTINGS = 'FETCHING_SETTINGS'
export const FETCH_SETTINGS_ERROR = 'FETCH_SETTINGS_ERROR'
export const FETCH_SETTINGS_SUCCESS = 'FETCH_SETTINGS_SUCCESS'

export function fetchSiteSettings() {
  return (dispatch) => {
    dispatch({
      type: FETCHING_SETTINGS
    })

    // TODO Fetch settings from API
    // fetch()

    setTimeout(() => {
      dispatch({
        type: FETCH_SETTINGS_SUCCESS,
        settings: {
          products: ['code', 'seo', 'leads', 'analytics', 'forms', 'audit-trail', 'social']
        }
      })
    }, 3000)

  }
}

export function settings(state = {}, action) {
  switch(action.type) {
    case FETCH_SETTINGS_SUCCESS:
      return action.settings
    default:
      return state
  }
}
