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
    request(`${CONFIG.API_INSTANCE}/web/redirects`, {
      method: "POST",
      json: "true",
      body: redirect,
    })
      .then((json) => {
        if (!json.error) {
          dispatch({
            type: "REDIRECT_CREATE_SUCCESS",
            redirect: {
              ...redirect,
              zuid: json.new_redirect_zuid,
              created: true,
            },
          });
        } else {
          // Notify user of all errors
          dispatch({
            type: "REDIRECT_CREATE_ERROR",
            err: json.error,
          });
        }
      })
      .catch((err) => {
        dispatch({
          type: "REDIRECT_CREATE_ERROR",
          err,
        });
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
          dispatch({
            type: "REDIRECT_REMOVE_ERROR",
            err: json.error,
          });
        }
      })
      .catch((err) => {
        dispatch({
          type: "REDIRECT_REMOVE_ERROR",
          err,
        });
      });
  };
}
