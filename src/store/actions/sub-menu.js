export const SHOW_SUB_MENU = 'SHOW_SUB_MENU'
export function showSubMenu(location) {
  return {
    type: SHOW_SUB_MENU,
    location
  }
}
