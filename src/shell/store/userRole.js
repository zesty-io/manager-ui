export function userRole(state = {}, action) {
  switch (action.type) {
    case "FETCH_USER_ROLE_SUCCESS":
      return action.payload.data;

    default:
      return state;
  }
}

export function fetchUserRoles() {
  return (dispatch, getState) => {
    return request(`${CONFIG.API_ACCOUNTS}/roles`)
      .then(roles => {
        const state = getState();
        const role = roles.data.find(
          role => role.entityZUID === state.instance.ZUID
        );

        dispatch({
          type: "FETCH_USER_ROLE_SUCCESS",
          payload: {
            data: role
          }
        });

        return role;
      })
      .catch(err => {
        console.log(err);
        notify({
          kind: "warn",
          message: "Failed to load your user role for this instance."
        });
      });
  };
}
