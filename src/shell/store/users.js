import { createSlice } from "@reduxjs/toolkit";
import { request } from "utility/request";

export const users = createSlice({
  name: "users",
  initialState: [],
  reducers: {
    fetchUsersSuccess(state, action) {
      state = action.payload.data;
    }
  }
});

export function fetchUsers() {
  return dispatch => {
    return request(`${CONFIG.API_ACCOUNTS}/instances`).then(res => {
      if (res.ok) {
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
