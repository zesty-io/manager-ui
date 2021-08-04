import { fetchNav } from "../../../apps/content-editor/src/store/navContent";

export const nav = (store) => (next) => (action) => {
  switch (action.type) {
    // update content nav and store to indexedDB
    case "CREATE_LINK":
    case "CREATE_ITEM":
    case "REMOVE_LINK":
    case "REMOVE_ITEM":
    case "REORDER_NAV":
      store.dispatch(fetchNav());
      break;
  }

  return next(action);
};
