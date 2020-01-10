export function modal(state = { isOpen: false }, action) {
  switch (action.type) {
    case "MODAL_OPEN":
      return { isOpen: true };
    case "MODAL_CLOSE":
      return { isOpen: false };
    default:
      return state;
  }
}
