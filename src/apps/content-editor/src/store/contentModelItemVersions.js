import { request } from "utility/request";

export function contentModelItemVersions(state = {}, action) {
  const existingVersions = state[action.itemZUID] || [];

  switch (action.type) {
    case "FETCH_ITEM_SUCCESS":
      return {
        ...state,
        [action.itemZUID]: [action.data, ...existingVersions]
      };
      break;

    case "FETCH_ITEM_VERSIONS_SUCCESS":
      return { ...state, [action.itemZUID]: action.versions };
      break;
    default:
      return state;
  }
}

export function fetchVersions(modelZUID, itemZUID) {
  return dispatch => {
    return request(
      `${CONFIG.service.instance_api}/content/models/${modelZUID}/items/${itemZUID}/versions`
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
