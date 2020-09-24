import { request } from "utility/request";

const ZUID = window.location.host.split(".")[0];

export function instances(state = [], action) {
  switch (action.type) {
    case "FETCHING_INSTANCES_SUCCESS":
      return action.payload.data;
    default:
      return state;
  }
}

export function fetchInstances() {
  return dispatch => {
    dispatch({
      type: "FETCHING_INSTANCES"
    });

    return request(`${CONFIG.API_ACCOUNTS}/instances`).then(res => {
      if (res.status === 403) {
        throw res;
      }
      dispatch({
        type: "FETCHING_INSTANCES_SUCCESS",
        payload: {
          data: res.data
        }
      });

      return res;
    });
  };
}
