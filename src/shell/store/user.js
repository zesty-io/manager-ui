import { request } from "utility/request";

export function user(
  state = {
    id: "",
    name: "",
    email: "",
    role: "",
    products: ["content", "media"],
    permissions: [],
    selected_lang: ""
  },
  action
) {
  switch (action.type) {
    case "FETCH_VERIFY_SUCCESS":
      return { ...state, id: action.ZUID };

    // case "FETCHING_USER":
    // TODO show loading state?

    case "FETCH_USER_SUCCESS":
      return { ...state, ...action.data };

    // case "FETCH_USER_ERROR":
    // TODO handle failure

    case "FETCH_PRODUCTS_SUCCESS":
      return { ...state, products: action.data };

    case "USER_ROLES":
      return { ...state, ...action.payload };

    case "USER_ROLE_ERROR":
      return { ...state, permissionsError: true };

    case "LOADED_LOCAL_USER_LANG":
    case "USER_SELECTED_LANG":
      return { ...state, selected_lang: action.payload.lang };

    default:
      return state;
  }
}

export function getUser(id) {
  return dispatch => {
    dispatch({
      type: "FETCHING_USER"
    });

    setTimeout(() => {
      dispatch({
        type: "FETCH_USER_SUCCESS",
        data: {
          id: "xxxxxx1",
          name: "Stuart Runyan",
          email: "stuart@zesty.io",
          role: "admin"
        }
      });
    }, 3000);
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

export function fetchProducts() {
  return dispatch => {
    // TODO Fetch product access from API

    setTimeout(() => {
      dispatch({
        type: "FETCH_PRODUCTS_SUCCESS",
        data: [
          "code",
          "seo",
          "leads",
          "analytics",
          "forms",
          "audit-trail",
          "social"
        ]
      });
    }, 3000);
  };
}
