export const ACCOUNTS_MENU_TOGGLE = 'ACCOUNTS_MENU_TOGGLE'

export function toggleAccountsMenu(status) {
  return {
    type: ACCOUNTS_MENU_TOGGLE,
    status
  }
}

export function accountsMenuVisible(state = false, action) {
  if (action.type === ACCOUNTS_MENU_TOGGLE) {
    return action.status
  } else {
    return state
  }
}
