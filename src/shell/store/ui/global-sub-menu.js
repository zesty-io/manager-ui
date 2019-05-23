export const SUB_MENU_LOAD = "SUB_MENU_LOAD";
export const SUB_MENU_TIMEOUT = "SUB_MENU_TIMEOUT";

export function subMenuLoad(location) {
  return {
    type: SUB_MENU_LOAD,
    location
  };
}

export function subMenuTimer(timeout) {
  return {
    type: SUB_MENU_TIMEOUT,
    timeout
  };
}

export function globalSubMenu(
  state = {
    location: "",
    timeout: false
  },
  action
) {
  switch (action.type) {
    case "SUB_MENU_LOAD":
      if (state.timeout) {
        clearTimeout(state.timeout);
      }
      return {
        location: action.location
      };
      break;
    case "SUB_MENU_TIMEOUT":
      if (state.timeout) {
        clearTimeout(state.timeout);
      }
      return {
        location: state.location,
        timeout: action.timeout
      };
      break;
    default:
      return state;
  }
}
