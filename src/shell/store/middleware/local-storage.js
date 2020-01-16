import { set, get } from "idb-keyval";

export const localStorage = store => next => action => {
  const result = next(action);

  try {
    const state = store.getState();

    switch (action.type) {
      case "SET_LOCAL":
        set(
          `${state.instance.zuid}:${action.payload.key}`,
          action.payload.data
        );

      case "GET_LOCAL":
        // TODO how does this get returned to caller?
        get(`${state.instance.zuid}:${action.payload.key}`);

      case "FETCH_ITEM_SUCCESS":
      case "FETCH_ITEMS_SUCCESS":
      case "SEARCH_ITEMS_SUCCESS":
        set(
          `${state.instance.zuid}:contentModelItems`,
          state.contentModelItems
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

      case "FETCH_FIELDS_SUCCESS":
        set(
          `${state.instance.zuid}:contentModelFields`,
          state.contentModelFields
        );

      case "FETCH_MODELS_SUCCESS":
        set(`${state.instance.zuid}:contentModels`, state.contentModels);

      case "FETCH_CONTENT_NAV_SUCCESS":
        set(`${state.instance.zuid}:contentNav`, state.contentNav.raw);
    }
  } catch (err) {
    console.error("IndexedDB:set:error", err);
  }

  return result;
};
