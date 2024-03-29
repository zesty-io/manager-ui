import { notify } from "shell/store/notifications";
import { request } from "utility/request";

export function redirects(state = {}, action) {
  switch (action.type) {
    case "REDIRECTS_FETCH_SUCCESS":
      return action.redirects;

    case "REDIRECT_REMOVE_SUCCESS":
      return Object.keys(state)
        .filter((path) => state[path].ZUID !== action.zuid)
        .reduce((acc, path) => {
          acc[path] = { ...state[path] };
          return acc;
        }, {});

    case "REDIRECT_CREATE_SUCCESS":
      let merged = Object.assign(
        {},
        {
          [action.redirect.path]: action.redirect,
        },
        state
      );

      return Object.keys(merged).reduce((acc, key) => {
        acc[key] = { ...merged[key] };
        return acc;
      }, {});

    default:
      return state;
  }
}

export function fetchRedirects() {
  return (dispatch) => {
    dispatch({
      type: "REDIRECTS_FETCH",
    });

    return request(`${CONFIG.API_INSTANCE}/web/redirects`)
      .then((json) => {
        dispatch({
          type: "REDIRECTS_FETCH_SUCCESS",
          redirects: json.data.reduce((acc, redirect) => {
            acc[redirect.path] = redirect;
            return acc;
          }, {}),
        });

        return json;
      })
      .catch((err) => {
        console.error("fetchRedirects: ", err);
        dispatch({
          type: "REDIRECTS_FETCH_ERROR",
          err,
        });

        return err;
      });
  };
}

export function createRedirect(redirect) {
  return (dispatch) => {
    dispatch({
      type: "REDIRECT_CREATE",
    });
    return request(`${CONFIG.API_INSTANCE}/web/redirects`, {
      method: "POST",
      json: "true",
      body: redirect,
    })
      .then((json) => {
        if (!json.error) {
          dispatch(
            notify({
              kind: "success",
              message: `Created redirect`,
            })
          );

          dispatch({
            type: "REDIRECT_CREATE_SUCCESS",
            redirect: {
              ...json.data,
              created: true,
            },
          });
        } else {
          // Notify user of all errors
          dispatch(
            notify({
              kind: "error",
              message: `Failed creating redirect from ${redirect.path}. ${json.error}`,
            })
          );
        }
      })
      .catch((err) => {
        dispatch(
          notify({
            kind: "error",
            message: "Failed creating redirect",
          })
        );
      });
  };
}

export function removeRedirect(zuid) {
  return (dispatch) => {
    dispatch({
      type: "REDIRECT_REMOVE",
    });
    request(`${CONFIG.API_INSTANCE}/web/redirects/${zuid}`, {
      method: "DELETE",
    })
      .then((json) => {
        if (!json.error) {
          dispatch({
            type: "REDIRECT_REMOVE_SUCCESS",
            zuid,
          });
        } else {
          dispatch(
            notify({
              kind: "error",
              message: "Failed to remove SEO redirect",
            })
          );
        }
      })
      .catch((err) => {
        dispatch(
          notify({
            kind: "error",
            message: "Failed to remove SEO redirect",
          })
        );
      });
  };
}
