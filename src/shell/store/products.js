import { request } from "utility/request";

export function products(state = ["content", "media"], action) {
  switch (action.type) {
    case "FETCH_PRODUCTS_SUCCESS":
      return action.payload.data;

    default:
      return state;
  }
}

export function fetchProducts() {
  return dispatch => {
    // TODO Fetch product access from API
    // return request().then().catch()

    const json = {
      data: [
        "content",
        "media",
        "schema",
        "code",
        "leads",
        "analytics",
        "seo",
        "audit-trail",
        "settings"
      ]
    };

    dispatch({
      type: "FETCH_PRODUCTS_SUCCESS",
      payload: {
        data: json.data
      }
    });

    // mimic promise api until we make api request
    return Promise.resolve(json);
  };
}
