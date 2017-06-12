export const SHOW_SUB_MENU = 'SHOW_SUB_MENU'

export function showSubMenu(location) {
  return {
    type: SHOW_SUB_MENU,
    location
  }
}

export function globalSubMenu(state = '', action) {
  if (action.type === 'SHOW_SUB_MENU') {
    console.log('SHOW_SUB_MENU', action)
    return action.location
  } else {
    return state
  }
}
