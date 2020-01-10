export function user(
  state = {
    id: "",
    name: "",
    email: "",
    role: "",
    products: ["content", "media"]
  },
  action
) {
  switch (action.type) {
    case "FETCH_VERIFY_SUCCESS":
      return { ...state, id: action.ZUID };

    case "FETCHING_USER":
    // TODO show loading state?

    case "FETCH_USER_SUCCESS":
      return { ...action.user };

    case "FETCH_USER_ERROR":
    // TODO handle failure

    default:
      return state;
  }
}

export function getUser(id) {
  console.log("action:getUser", id);
  return dispatch => {
    dispatch({
      type: "FETCHING_USER"
    });

    setTimeout(() => {
      dispatch({
        type: "FETCH_USER_SUCCESS",
        user: {
          id: "xxxxxx1",
          name: "Stuart Runyan",
          email: "stuart@zesty.io",
          role: "admin",
          products: [
            "code",
            "seo",
            "leads",
            "analytics",
            "forms",
            "audit-trail",
            "social"
          ]
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
