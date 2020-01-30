export const REDIRECT_FILTER = "REDIRECT_FILTER";

export function redirectsFilter(state = "", action) {
  switch (action.type) {
    case REDIRECT_FILTER:
      return action.filter;
    default:
      return state;
  }
}
