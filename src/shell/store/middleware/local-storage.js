import { set, get } from "idb-keyval";

export const localStorage = store => next => action => {
  const result = next(action);

  try {
    if (
      action.type === "FETCH_ITEM_SUCCESS" ||
      action.type === "FETCH_ITEMS_SUCCESS" ||
      action.type === "SEARCH_ITEMS_SUCCESS"
    ) {
      set(
        `${zesty.site.zuid}:contentModelItems`,
        store.getState().contentModelItems
      );
      // // Write Item data to IndexedDB
      // const items = store.getState().contentModelItems;
      // Object.keys(items).forEach(itemZUID => {
      //   set(
      //     `${zesty.site.zuid}:contentModelItems:${itemZUID}`,
      //     items[itemZUID]
      //   );
      // });
      //
      // // Merge existing IndexedDB keys with incoming item keys
      // let currentKeys = get(`${zesty.site.zuid}:contentModelItems`).then(
      //   currentKeys => {
      //     if (!Array.isArray(currentKeys)) {
      //       currentKeys = [];
      //     }
      //     let keys = new Set(currentKeys);
      //     Object.keys(items).forEach(key => keys.add(key));
      //
      //     set(`${zesty.site.zuid}:contentModelItems`, Array.from(keys));
      //   }
      // );
    }

    if (action.type === "FETCH_FIELDS_SUCCESS") {
      set(
        `${zesty.site.zuid}:contentModelFields`,
        store.getState().contentModelFields
      );
    }

    if (action.type === "FETCH_MODELS_SUCCESS") {
      set(`${zesty.site.zuid}:contentModels`, store.getState().contentModels);
    }

    if (action.type === "FETCH_CONTENT_NAV_SUCCESS") {
      set(`${zesty.site.zuid}:contentNav`, store.getState().contentNav.raw);
    }
  } catch (err) {
    console.error("IndexedDB:set:error", err);
  }

  return result;
};
