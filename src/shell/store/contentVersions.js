import { request } from "utility/request";

export function contentVersions(state = {}, action) {
  const existingVersions = state[action.itemZUID] || [];

  switch (action.type) {
    case "FETCH_ITEM_SUCCESS":
      if (action.data?.meta?.version) {
        return {
          ...state,

          // DeDupe versions
          [action.itemZUID]: [action.data, ...existingVersions].reduce(
            (acc, item) => {
              if (item?.meta?.version) {
                if (!acc.find(el => el.meta.version === item.meta.version)) {
                  acc.push(item);
                }
              }

              return acc;
            },
            []
          )
        };
      } else {
        return state;
      }

    case "FETCH_ITEM_VERSIONS_SUCCESS":
      return { ...state, [action.itemZUID]: action.versions };

    default:
      return state;
  }
}

export function fetchVersions(modelZUID, itemZUID) {
  return dispatch => {
    return request(
      `${CONFIG.API_INSTANCE}/content/models/${modelZUID}/items/${itemZUID}/versions`
    )
      .then(res => {
        dispatch({
          type: "FETCH_ITEM_VERSIONS_SUCCESS",
          itemZUID,
          versions: res.data
        });

        return res;
      })
      .catch(err => {
        console.error(err);
      });
  };
}
