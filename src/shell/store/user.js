import { request } from "utility/request";
import { set } from "idb-keyval";
import Sentry from "utility/sentry";

export function user(
  state = {
    ZUID: "",
    firstName: "",
    email: "",
    permissions: [],
    selected_lang: "",
    latest_edits: []
  },
  action
) {
  switch (action.type) {
    case "VERIFY_SUCCESS":
    case "FETCH_LOGIN_SUCCESS":
    case "VERIFY_2FA_SUCCESS":
    case "POLL_2FA_SUCCESS":
      // Only update user if we don't have a user ZUID in the store
      if (!state.ZUID && action.payload.meta.userZuid) {
        return { ...state, ZUID: action.payload.meta.userZuid };
      } else {
        return state;
      }

    case "FETCH_USER_SUCCESS":
      // set user
      Sentry.setUser({
        id: action.payload.data.ZUID,
        email: action.payload.data.email,
        username: `${action.payload.data.firstName} ${action.payload.data.lastName}`
      });

      return { ...state, ...action.payload.data };

    case "LOADED_LOCAL_USER_LANG":
    case "USER_SELECTED_LANG":
      return { ...state, selected_lang: action.payload.lang };

    // Creating latest_edits reducer for dashboard
    case "FETCH_USER_LOGS_SUCCESS":
      return { ...state, latest_edits: action.payload };

    default:
      return state;
  }
}

export function fetchUser(zuid) {
  return async dispatch => {
    try {
      let user = await request(`${CONFIG.API_ACCOUNTS}/users/${zuid}`);

      dispatch({
        type: "FETCH_USER_SUCCESS",
        payload: {
          data: user.data
        }
      });
    } catch (err) {
      console.log(err);
    }
  };
}

export function selectLang(lang) {
  return (dispatch, getState) => {
    const state = getState();

    set(`${state.instance.ZUID}:user:selected_lang`, lang);

    dispatch({
      type: "USER_SELECTED_LANG",
      payload: {
        lang
      }
    });
  };
}

export function fetchRecentItems(userZUID, start) {
  return dispatch => {
    return request(
      `${CONFIG.API_INSTANCE}/search/items?q=${userZUID}&order=created&dir=DESC&start_date=${start}`
    ).then(res => {
      if (res.status === 400) {
        dispatch(
          notify({
            message: `Failure fetching recent items: ${res.error}`,
            kind: "error"
          })
        );
      } else {
        dispatch({
          type: "FETCH_ITEMS_SUCCESS",
          payload: res.data
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

// Actions
export function getUserLogs(userZUID, limit = 5) {
  return dispatch => {
    dispatch({
      type: "FETCHING_USER_LOGS"
    });
    // would be nice to get sorted by createdAt from api
    return request(
      `${CONFIG.API_INSTANCE}/env/audits?userZUID=${userZUID}&limit=${limit}&action=2`
    )
      .then(res => {
        dispatch({
          type: "FETCH_USER_LOGS_SUCCESS",
          payload: res.data
        });
      })
      .catch(err => {
        dispatch({
          type: "FETCH_USER_LOGS_ERROR",
          err
        });
      });
  };
}
