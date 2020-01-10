export function listFilters(state = {}, action) {
  switch (action.type) {
    case "PERSIST_LIST_FILTERS":
      return { ...state, [action.modelZUID]: action.filters };

    default:
      return state;
  }
}
