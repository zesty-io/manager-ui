import { createSlice } from "@reduxjs/toolkit";
import { request } from "utility/request";

export const users = createSlice({
  name: "users",
  initialState: [],
  reducers: {
    fetchUsersSuccess(state, action) {
      return action.payload.data;
    }
  }
});

export function fetchUsers() {
  return (dispatch, getStore) => {
    return request(
      `${CONFIG.API_ACCOUNTS}/instances/${getStore().instance.ZUID}/users`
    ).then(res => {
      if (res.status === 200) {
        dispatch({
          type: users.actions.fetchUsersSuccess,
          payload: {
            data: res.data
          }
        });
      } else {
        throw res;
      }
      return res;
    });
  };
}
