import { notify } from "shell/store/notifications";

export function contentModelItems(state = {}, action) {
  const item = state[action.itemZUID];

  if (action.itemZUID && !item) {
    console.error(`Missing Item: ${action.itemZUID}`);
  }

  switch (action.type) {
    case "FETCH_ITEMS_SUCCESS":
      if (action.data) {
        let items = { ...state };
        Object.keys(action.data).forEach(itemZUID => {
          // Ensure all items include meta, web & data
          if (
            action.data[itemZUID] &&
            action.data[itemZUID].meta &&
            action.data[itemZUID].web &&
            action.data[itemZUID].data
          ) {
            // Only update items that don't exist locally or that are not dirty
            // otherwise we lose users local changes
            if (!items[itemZUID] || !items[itemZUID].dirty) {
              items[itemZUID] = {
                // Keep derived publishing/scheduling state when updating items
                ...items[itemZUID],
                ...action.data[itemZUID],
                dirty: false
              };
            }
          }
        });

        return items;
      } else {
        return state;
      }

    default:
      return state;
  }
}

// API call actions

export function fetchItems(modelZUID, query = {}) {
  if (!modelZUID) {
    throw new Error("contentModelItems:fetchItems() Missing modelZUID");
  }

  return dispatch => {
    const params = Object.keys(query).reduce((acc, key, i) => {
      acc += `${i === 0 ? "" : "&"}${key}=${query[key]}`;
      return acc;
    }, "");

    return dispatch({
      type: "FETCH_RESOURCE",
      uri: `${CONFIG.API_INSTANCE}/content/models/${modelZUID}/items?${params}`,
      handler: res => {
        if (res.status === 400) {
          console.error("fetchItems():response", res);
          notify({
            kind: "warn",
            message: res.error
          });
        }

        dispatch({
          type: "FETCH_ITEMS_SUCCESS",
          data: res.data
            .filter(item => {
              if (item.meta && item.web && item.data) {
                return true;
              } else {
                console.error("Broken item", item);
                return false;
              }
            }) // We only allow items which include meta, web & data
            .reduce((acc, item) => {
              acc[item.meta.ZUID] = item;
              return acc;
            }, {})
        });

        return res;
      }
    });
  };
}
