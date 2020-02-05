import { request } from "utility/request";

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
      return { ...state, ZUID: action.payload.ZUID };

    case "FETCH_USER_SUCCESS":
      return { ...state, ...action.payload.data };

    // case "USER_ROLES":
    //   return { ...state, roles: action.payload };

    // case "LOADED_LOCAL_USER_LANG":
    // case "USER_SELECTED_LANG":
    //   return { ...state, selected_lang: action.payload.lang };

    default:
      return state;
  }
}

export function fetchUser(zuid) {
  return dispatch => {
    return request(`${CONFIG.API_ACCOUNTS}/users/${zuid}`)
      .then(res => {
        dispatch({
          type: "FETCH_USER_SUCCESS",
          payload: {
            data: res.data
          }
        });
      })
      .catch(err => {
        console.log(err);
      });
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
        notify({
          message: `Failure fetching recent items: ${res.error}`,
          kind: "error"
        });
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
