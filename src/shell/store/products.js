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
    switch (getState().userRole.systemRoleZUID) {
      // owner: 31-71cfc74-0wn3r
      // admin: 31-71cfc74-4dm13
      // developer: 31-71cfc74-d3v3l0p3r
      // publisher: 31-71cfc74-p0bl1shr
      // contributor: 31-71cfc74-c0ntr1b0t0r
      // seo: 31-71cfc74-s30
      case "31-71cfc74-0wn3r":
      case "31-71cfc74-4dm13":
        data = [
          "launchpad",
          "content",
          "media",
          "schema",
          "code",
          "leads",
          "seo",
          "reports",
          // "release",
          "settings",
        ];
        break;
      case "31-71cfc74-d3v3l0p3r":
        data = [
          "launchpad",
          "content",
          "media",
          "schema",
          "code",
          "leads",
          "seo",
          "reports",
          // "release",
          "settings",
        ];
        break;
      case "31-71cfc74-p0bl1shr":
        data = [
          "launchpad",
          "content",
          "media",
          "leads",
          "reports",
          // "release"
        ];
        break;
      case "31-71cfc74-s30":
        data = ["launchpad", "content", "media", "leads", "seo", "reports"];
        break;
      case "31-71cfc74-c0ntr1b0t0r":
        data = ["launchpad", "content", "media"];
        break;
      case "31-71cfc74-m3d14":
        data = ["media"];
        break;
      default:
        data = [];
    }

    if (getState().user.staff) {
      data = [
        "launchpad",
        "content",
        "media",
        "schema",
        "code",
        "leads",
        "seo",
        "reports",
        // "release",
        "settings",
      ];
    }

    dispatch({
      type: "FETCH_PRODUCTS_SUCCESS",
      payload: {
        data,
      },
    });

    // mimic promise api until we make api request
    return Promise.resolve(data);
  };
}
