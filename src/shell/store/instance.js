import { request } from "utility/request";
import { notify } from "shell/store/notifications";

const ZUID = window.location.host.split(".")[0];

export function instance(
  state = {
    hash: "",
    ZUID: ZUID,
    settings: {
      seo: {}
    }
  },
  action
) {
  switch (action.type) {
    case "FETCHING_INSTANCE_SUCCESS":
      return { ...state, ...action.payload.data };
    default:
      return state;
  }
}

export function fetchInstance() {
  return dispatch => {
    dispatch({
      type: "FETCHING_INSTANCE"
    });

    request(`${CONFIG.API_ACCOUNTS}/instances/${ZUID}`)
      .then(res => {
        dispatch({
          type: "FETCHING_INSTANCE_SUCCESS",
          payload: {
            data: res.data
          }
        });

        return res;
      })
      .catch(err => {
        dispatch(
          notify({
            message: "Failed to load instance"
          })
        );
      });
  };
}
