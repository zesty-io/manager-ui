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
    case "FETCH_DOMAINS_SUCCESS":
      return { ...state, domains: action.payload.data };
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

export function fetchDomains() {
  return dispatch => {
    request(`${CONFIG.API_ACCOUNTS}/instances/${ZUID}/domains`)
      .then(res => {
        dispatch({
          type: "FETCH_DOMAINS_SUCCESS",
          payload: {
            data: res.data.sort((a, b) => {
              const dateA = new Date(a.createdAt);
              const dateB = new Date(b.createdAt);

              const epochA = dateA.valueOf();
              const epochB = dateB.valueOf();

              return epochA - epochB;
            })
          }
        });

        return res;
      })
      .catch(err => {
        dispatch(
          notify({
            message: "Failed to load domains"
          })
        );
      });
  };
}
