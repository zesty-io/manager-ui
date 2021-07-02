import { request } from "utility/request";
import { notify } from "shell/store/notifications";

export function instances(state = [], action) {
  switch (action.type) {
    case "FETCHING_INSTANCES_SUCCESS":
      return action.payload.data;
    default:
      return state;
  }
}

export function fetchInstances() {
  return (dispatch) => {
    dispatch({
      type: "FETCHING_INSTANCES",
    });

    return request(`${CONFIG.API_ACCOUNTS}/instances`).then((res) => {
      if (res.status === 200) {
        dispatch({
          type: "FETCHING_INSTANCES_SUCCESS",
          payload: {
            data: res.data,
          },
        });
      }

      if (res.status === 400) {
        dispatch(
          notify({
            kind: "warn",
            messages: "There was an issue loading your instances list",
          })
        );
      }

      if (res.status === 403) {
        dispatch(
          notify({
            kind: "warn",
            messages: "You are forbidden from loading an instances list",
          })
        );
      }

      return res;
    });
  };
}
