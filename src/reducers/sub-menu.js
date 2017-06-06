import {SHOW_SUB_MENU} from '../actions/sub-menu'
export function subMenu(state = '', action) {
  if (action.type === 'SHOW_SUB_MENU') {
    console.log('SHOW_SUB_MENU', action)
    return action.location
  } else {
    return state
  }
}
