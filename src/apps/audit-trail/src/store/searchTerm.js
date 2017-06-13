export function searchTerm(state = '', action) {
  if (action.type === SEARCH_LOGS) {
    return action.term
  } else {
    return state
  }
}