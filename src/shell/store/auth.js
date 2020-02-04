import Cookies from "js-cookie";
import { request } from "utility/request";
import { notify } from "shell/store/notifications";

export function auth(
  state = {
    checking: true,
    valid: false
  },
  action
) {
  switch (action.type) {
    case "FETCH_AUTH_SUCCESS":
    case "FETCH_AUTH_ERROR":

    case "VERIFY_SUCCESS":
    case "VERIFY_ERROR":
    case "VERIFY_2FA_SUCCESS":
    case "VERIFY_2FA_ERROR":
    case "POLL_2FA_SUCCESS":
    case "POLL_2FA_ERROR":

    case "FETCH_LOGIN_SUCCESS":
    case "FETCH_LOGIN_ERROR":
      return { ...state, checking: false, valid: action.payload.auth };

    case "LOGOUT":
      Cookies.remove(CONFIG.COOKIE_NAME, {
        path: "/",
        domain: CONFIG.COOKIE_DOMAIN
      });
      return { ...state, checking: false, valid: false };

    default:
      return state;
  }
}

export function verify() {
  return dispatch => {
    return request(`${CONFIG.SERVICE_AUTH}/verify`)
      .then(json => {
        dispatch({
          type: "VERIFY_SUCCESS",
          payload: {
            ZUID: json.meta.userZuid,
            auth: json.code === 200
          }
        });

        return json;
      })
      .catch(err => {
        // console.error("VERIFY ERR", err);
        dispatch({
          type: "VERIFY_ERROR",
          payload: { auth: false },
          err
        });
      });
  };
}

export function verifyTwoFactor(token) {
  return dispatch => {
    return request(`${CONFIG.SERVICE_AUTH}/verify-2fa`, {
      body: {
        token
      }
    })
      .then(json => {
        dispatch({
          type: "VERIFY_2FA_SUCCESS",
          payload: {
            ZUID: json.meta.userZuid,
            auth: json.code === 200
          }
        });

        return json;
      })
      .catch(err => {
        // console.error("VERIFY 2FA ERR", err);
        dispatch({
          type: "VERIFY_2FA_ERROR",
          payload: { auth: false },
          err
        });
      });
  };
}

export function pollTwoFactor() {
  return dispatch => {
    const poll = (count = 0) => {
      count++;

      return new Promise((resolve, reject) => {
        setTimeout(() => {
          request(`${CONFIG.SERVICE_AUTH}/verify-2fa`)
            .then(json => {
              if (json.code === 202) {
                // Builds recursive promise chain until polling fails or is accepted
                resolve(poll(count));
              } else if (json.code === 200) {
                resolve(json);
              } else if (json.code === 401) {
                reject(
                  new Error(
                    "Your login request was denied. Redirecting to login."
                  )
                );
              } else if (json.code === 410) {
                reject(
                  new Error(
                    "Your login request has expired. Redirecting to login."
                  )
                );
              } else {
                reject(
                  new Error(
                    "It seems we had an issue validating this login request. Redirecting to login."
                  )
                );
              }
            })
            .catch(err => {
              console.log("recursive request catch", err);
              reject(
                new Error(
                  'Login failed. Please <a href="mailto:support@zesty.io">contact support</a>.'
                )
              );
            });
        }, Math.min(count * 0.5, 15) * 1000);
      });
    };

    return poll()
      .then(json => {
        dispatch({
          type: "POLL_2FA_SUCCESS",
          payload: {
            ZUID: json.meta.userZuid,
            auth: json.code === 200
          }
        });
      })
      .catch(err => {
        notify({
          kind: "warn",
          message: err.message
        });

        // Kick user out
        dispatch(logout());
      });
  };
}

export function login(email, password) {
  return dispatch => {
    return request(`${CONFIG.SERVICE_AUTH}/login`, {
      body: {
        email,
        password
      }
    })
      .then(json => {
        dispatch({
          type: "FETCH_LOGIN_SUCCESS",
          payload: {
            ZUID: json.meta.userZuid,
            auth: json.code === 200
          }
        });

        return json;
      })
      .catch(err => {
        console.error("LOGIN ERR", err);
        dispatch({
          type: "FETCH_LOGIN_ERROR",
          payload: { auth: false },
          err
        });
      });
  };
}

export function logout() {
  return dispatch => {
    return request(`${CONFIG.SERVICE_AUTH}/logout`)
      .then(() => {
        window.location = `${CONFIG.URL_ACCOUNTS}/login`;
      })
      .catch(err => {
        console.error(err);
        dispatch({
          type: "FETCH_AUTH_ERROR",
          payload: { auth: false },
          err
        });
      });
  };
}
