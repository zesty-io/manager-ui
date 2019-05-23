import { combineReducers } from "redux";

export const site = combineReducers({
  site_zuid: "8-45a294a-96t789", //grow.acorns.com
  settings
});

export const FETCHING_SETTINGS = "FETCHING_SETTINGS";
export const FETCH_SETTINGS_ERROR = "FETCH_SETTINGS_ERROR";
export const FETCH_SETTINGS_SUCCESS = "FETCH_SETTINGS_SUCCESS";

export function fetchSiteSettings() {
  return dispatch => {
    dispatch({
      type: FETCHING_SETTINGS
    });

    // TODO Fetch settings from API
    // fetch()

    setTimeout(() => {
      dispatch({
        type: FETCH_SETTINGS_SUCCESS,
        settings: {
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

export function settings(
  state = {
    products: ["content", "media"]
  },
  action
) {
  switch (action.type) {
    case FETCH_SETTINGS_SUCCESS:
      return action.settings;
    default:
      return state;
  }
}
