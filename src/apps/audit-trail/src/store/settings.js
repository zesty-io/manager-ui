export const APP_SETTINGS = 'APP_SETTINGS'
export function settings(state = {
  siteZuid: '',
  SITES_SERVICE: ''
}, action) {
  if (action.type === APP_SETTINGS) {
    return action.settings
  } else {
    return state
  }
}
