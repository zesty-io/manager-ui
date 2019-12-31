import { request } from "utility/request";

// currently the user is coming from the window
// in the future we will be accessing this another way.
export const user = (initialState = {}) => {
  return (state = initialState, action) => {
    switch (action.type) {
      case "USER_ROLES":
        return { ...state, ...action.data };
      case "USER_ROLE_ERROR":
        return { ...state, permissionsError: true };
      default:
        return state;
    }
  };
};

export function fetchRecentItems(userZUID, start) {
  return dispatch => {
    return request(
      `${CONFIG.service.instance_api}/search/items?q=${userZUID}&order=created&dir=DESC&start_date=${start}`
    ).then(res => {
      if (res.status === 400) {
        notify({
          message: `Failure fetching recent items: ${res.error}`,
          kind: "error"
        });
      } else {
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
      }

      return res;
    });
  };
}
