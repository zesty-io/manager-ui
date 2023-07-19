import { createSlice } from "@reduxjs/toolkit";
import { request } from "utility/request";
import { notify } from "./notifications";

export const users = createSlice({
  name: "users",
  initialState: [],
  reducers: {
    fetchUsersSuccess(state, action) {
      return action.payload.data;
    },
  },
});

export function fetchUsers() {
  return (dispatch, getStore) => {
    return request(
      `${CONFIG.API_ACCOUNTS}/instances/${getStore().instance.ZUID}/users`
    )
      .then((res) => {
        if (res.status === 200) {
          dispatch({
            type: users.actions.fetchUsersSuccess,
            payload: {
              data: res.data,
            },
          });
        } else {
          throw new Error(
            `${res.status}:Encountered an issue fetching users: ${res.error}`
          );
        }

        return res;
      })
      .catch((error) => {
        dispatch(
          notify({
            message: error.message,
            kind: "error",
          })
        );
      });
  };
}
