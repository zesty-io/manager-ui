import { createSlice } from "@reduxjs/toolkit";
import { notify } from "shell/store/notifications";
import { request } from "utility/request";

const slice = createSlice({
  name: "apps",
  error: false,
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
    fetchAppsError(state) {
      state.error = true;
      state.installed = [];
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
    return request(`${CONFIG.API_ACCOUNTS}/instances/${ZUID}/app-installs`)
      .then((res) => {
        console.log(res);
        if (res.status === 200) {
          // TODO revisit this (needs batching?)
          let { data } = res;
          //data = [{ appZUID: '80-c0f7cbe6ba-6llvfj'}, ...data]
          console.log({ data });

          Promise.all(
            data.map(({ appZUID, ZUID, instanceZUID }) => {
              // This returns just the related ZUIDs, does not provide name/desc/url
              //return request(`${CONFIG.API_ACCOUNTS}/instances/${instanceZUID}/app-installs/${ZUID}`)
              return request(`${CONFIG.API_ACCOUNTS}/apps/${appZUID}`);
            })
          )
            .then((responses) => {
              console.log({ responses });
              const failureResponses = responses.filter(
                (res) => res.status !== 200
              );
              failureResponses.forEach((res) =>
                dispatch(
                  notify({
                    kind: "warn",
                    message: `App loading failure: ${res.message}`,
                  })
                )
              );

              const successfulResponses = responses.filter(
                (res) => res.status === 200
              );
              const appsInfo = successfulResponses.map((res) => res.data);
              dispatch(actions.fetchAppsSuccess(appsInfo));
              console.log(appsInfo);
              return appsInfo;
            })
            .catch((err) => {
              console.log(err);
            });
        } else {
          dispatch(actions.fetchAppsError());
          dispatch(
            notify({
              kind: "warn",
              message: `App loading failure: ${res.error}`,
            })
          );
        }
      })
      .catch((err) => {
        console.log(err);
        dispatch(actions.fetchAppsError());
        dispatch(
          notify({
            kind: "warn",
            message: `App loading failure: ${err}`,
          })
        );
      });
  };
}
