import { request } from "utility/request";
import { set } from "idb-keyval";

export function user(
  state = {
    ZUID: "",
    firstName: "",
    email: "",
    permissions: [],
    selected_lang: ""
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
      return { ...state, ...action.payload.data };

    case "LOADED_LOCAL_USER_LANG":
    case "USER_SELECTED_LANG":
      return { ...state, selected_lang: action.payload.lang };

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
