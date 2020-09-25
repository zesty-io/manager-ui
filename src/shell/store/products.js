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
  return (dispatch, getState) => {
    let data;
    switch (getState().userRole.name) {
      case "Owner":
      case "Admin":
        data = [
          "content",
          "media",
          "schema",
          "code",
          "leads",
          "analytics",
          "seo",
          "audit-trail",
          "settings"
        ];
        break;
      case "Developer":
        data = [
          "content",
          "media",
          "schema",
          "code",
          "leads",
          "analytics",
          "seo",
          "settings"
        ];
        break;
      case "SEO":
        data = ["content", "media", "leads", "analytics", "seo"];
        break;
      case "Publisher":
        data = ["content", "media", "leads", "analytics"];
        break;
      case "Contributor":
        data = ["content", "media"];
        break;
      default:
        data = [];
    }

    dispatch({
      type: "FETCH_PRODUCTS_SUCCESS",
      payload: {
        data
      }
    });

    // mimic promise api until we make api request
    return Promise.resolve(data);
  };
}
