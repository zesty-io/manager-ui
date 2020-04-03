import { set, get } from "idb-keyval";

export const localStorage = store => next => action => {
  const result = next(action);

  try {
    const state = store.getState();

    switch (action.type) {
      case "SET_LOCAL":
        set(
          `${state.instance.ZUID}:${action.payload.key}`,
          action.payload.data
        );
        break;

      case "GET_LOCAL":
        // TODO how does this get returned to caller?
        get(`${state.instance.ZUID}:${action.payload.key}`);
        break;

      case "FETCH_ITEM_SUCCESS":
      case "FETCH_ITEMS_SUCCESS":
      case "SEARCH_ITEMS_SUCCESS":
        set(`${state.instance.ZUID}:content`, state.content);
        // // Write Item data to IndexedDB
        // const items = store.getState().content;
        // Object.keys(items).forEach(itemZUID => {
        //   set(
        //     `${zesty.site.zuid}:content:${itemZUID}`,
        //     items[itemZUID]
        //   );
        // });
        //
        // // Merge existing IndexedDB keys with incoming item keys
        // let currentKeys = get(`${zesty.site.zuid}:content`).then(
        //   currentKeys => {
        //     if (!Array.isArray(currentKeys)) {
        //       currentKeys = [];
        //     }
        //     let keys = new Set(currentKeys);
        //     Object.keys(items).forEach(key => keys.add(key));
        //
        //     set(`${zesty.site.zuid}:content`, Array.from(keys));
        //   }
        // );
        break;

      case "FETCH_FIELD_SUCCESS":
      case "FETCH_FIELDS_SUCCESS":
        set(`${state.instance.ZUID}:fields`, state.fields);
        break;

      case "FETCH_MODEL_SUCCESS":
      case "FETCH_MODELS_SUCCESS":
        set(`${state.instance.ZUID}:models`, state.models);
        break;

      case "FETCH_CONTENT_NAV_SUCCESS":
        set(`${state.instance.ZUID}:navContent`, state.navContent.raw);
        break;
    }
  } catch (err) {
    console.error("IndexedDB:set:error", err);
  }

  return result;
};
