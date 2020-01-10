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
