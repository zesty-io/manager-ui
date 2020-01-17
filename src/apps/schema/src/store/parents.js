import { request } from "utility/request";
import { notify } from "shell/store/notifications";

export function parents(state = [], action) {
  switch (action.type) {
    case "FETCH_PARENTS_SUCCESS":
      return action.payload;
    default:
      return state;
  }
}

export function fetchParents() {
  return dispatch => {
    return request(`${CONFIG.API_INSTANCE}/env/nav`)
      .then(res => {
        res.data.sort((a, b) => {
          if (a.label.toLowerCase() > b.label.toLowerCase()) {
            return 1;
          } else if (a.label.toLowerCase() < b.label.toLowerCase()) {
            return -1;
          } else {
            return 0;
          }
        });

        dispatch({
          type: "FETCH_PARENTS_SUCCESS",
          payload: res.data
        });
      })
      .catch(err => {
        console.error(err);
        notify({
          kind: "warn",
          message: err.message
        });
      });
  };
}
