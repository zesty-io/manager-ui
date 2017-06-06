import {combineReducers} from 'redux'

import {
  FETCHING_SETTINGS,
  FETCH_SETTINGS_ERROR,
  FETCH_SETTINGS_SUCCESS
} from '../actions/site/settings'

export const site = combineReducers({settings})

export function settings(state = {}, action) {
  switch(action.type) {
    case FETCH_SETTINGS_SUCCESS:
      return action.settings
    default:
      return state
  }
}
