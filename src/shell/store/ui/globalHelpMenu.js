export function toggleHelpMenu(status) {
  return {
    type: "HELP_MENU_TOGGLE",
    status
  };
}

export function helpMenuVisible(state = false, action) {
  if (action.type === "HELP_MENU_TOGGLE") {
    return action.status;
  } else {
    return state;
  }
}
