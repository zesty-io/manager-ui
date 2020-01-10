import Cookies from "js-cookie";

import { request } from "utility/request";

export function auth(
  state = {
    checking: false,
    valid: false,
    token: Cookies.get(CONFIG.COOKIE_NAME)
  },
  action
) {
  switch (action.type) {
    case "FETCH_AUTH_SUCCESS":
    case "FETCH_AUTH_ERROR":
    case "FETCH_VERIFY_SUCCESS":
    case "FETCH_VERIFY_ERROR":
      return {
        checking: false,
        valid: action.auth
      };

    case "LOGOUT":
      Cookies.remove(CONFIG.COOKIE_NAME, {
        path: "/",
        domain: CONFIG.COOKIE_DOMAIN
      });
      return {
        checking: false,
        valid: false
      };

    default:
      return state;
  }
}

export function verify() {
  return (dispatch, getState) => {
    const state = getState();

    return request(`${CONFIG.SERVICE_AUTH}/verify`, {
      headers: {
        authentication: state.token
      }
    })
      .then(json => {
        dispatch({
          type: "FETCH_VERIFY_SUCCESS",
          ZUID: json.meta.userZuid,
          auth: json.code === 200
        });
      })
      .catch(err => {
        console.error("VERIFY ERR", err);
        dispatch({
          type: "FETCH_VERIFY_ERROR",
          auth: false,
          err
        });
      });
  };
}

export function logout() {
  return dispatch => {
    return request(`${CONFIG.SERVICE_AUTH}/logout`).catch(err => {
      console.error(err);
      dispatch({
        type: "FETCH_AUTH_ERROR",
        auth: false,
        err
      });
    });
  };
}
