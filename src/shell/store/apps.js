import { createSlice } from "@reduxjs/toolkit";
import { request } from "utility/request";

const slice = createSlice({
  name: "apps",
  initialState: {
    frames: {},
    installed: [
      /*
      {
        zuid: "80-d8abaff6ef-wxs830",
        name: "test-name",
        label: "test app",
        public: true,
        approved: true,
        url: `https://zesty-io.github.io/app-content-composer/`,
      },
      */
    ],
    registered: [
      // TODO load all public and available private apps
    ],
  },
  reducers: {
    registerFrame(state, action) {
      // state.frames.push(action.payload);

      state.frames[action.payload.zuid] = action.payload.frame;
    },
    fetchAppsSuccess(state, action) {
      state.installed = action.payload;
    },
  },
});

export default slice.reducer;
export const { registerFrame } = slice.actions;
const { actions, reducers } = slice;

// fetch installed apps from appi
export function fetchInstalledApps() {
  return (dispatch, getState) => {
    const state = getState();
    const { instance } = state;
    const { ZUID } = instance;
    return request(
      `${CONFIG.API_ACCOUNTS}/instances/${ZUID}/app-installs`
    ).then((res) => {
      console.log(res);
      if (res.status === 200) {
        // TODO revisit this (needs batching?)
        const { data } = res;
        Promise.all(
          data.map(({ appZUID }) => {
            // Why doesn't this work?
            //return request(`${CONFIG.API_ACCOUNTS}/instances/${ZUID}/app-installs/${appZUID}`)
            return request(`${CONFIG.API_ACCOUNTS}/apps/${appZUID}`);
          })
        )
          .then((data) => data.map((res) => res.data))
          .then((data) => {
            //console.log(data)
            dispatch(actions.fetchAppsSuccess(data));
            return data;
          });
      } else {
        return [];
        // TODO
      }
    });
  };
}
