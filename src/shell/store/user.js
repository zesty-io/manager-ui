import { request } from "utility/request";

export const FETCHING_USER = "FETCHING_USER";
export const FETCH_USER_SUCCESS = "FETCH_USER_SUCCESS";
export const FETCH_USER_ERROR = "FETCH_USER_ERROR";

export function user(
  state = {
    products: ["content", "media"]
  },
  action
) {
  switch (action.type) {
    case FETCHING_USER:
    // TODO show loading state?

    case FETCH_USER_SUCCESS:
      return { ...action.user };

    case FETCH_USER_ERROR:
    // TODO handle failure
    //
    default:
      return state;
  }
}

export function getUser(id) {
  console.log("action:getUser", id);
  return dispatch => {
    dispatch({
      type: FETCHING_USER
    });

    setTimeout(() => {
      dispatch({
        type: FETCH_USER_SUCCESS,
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

    // fetch(`http://localhost:9001/user/${id}`)
    //   .then(res => res.json())
    //   .then(user => {
    //     console.log('user', user)
    //     dispatch({
    //       type: FETCH_USER_SUCCESS,
    //       id,
    //       user
    //     })
    //   })
    //   .catch(err => {
    //     console.error(err)
    //     dispatch({
    //       type: FETCH_USER_ERROR,
    //       id,
    //       err
    //     })
    //   })
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
      `${CONFIG.service.instance_api}/search/items?q=${userZUID}&order=created&dir=DESC&start_date=${start}`
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
