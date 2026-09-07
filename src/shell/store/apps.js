import { createSlice } from "@reduxjs/toolkit";
import i18n from "shell/i18n";
import { notify } from "shell/store/notifications";
import { request } from "utility/request";

const slice = createSlice({
  name: "apps",
  error: false,
  initialState: {
    frames: {},
    installed: [],
    isLoadingApps: false,
  },
  reducers: {
    registerFrame(state, action) {
      // state.frames.push(action.payload);
      state.frames[action.payload.zuid] = action.payload.frame;
    },
    fetchAppsSuccess(state, action) {
      state.installed = action.payload;
      state.isLoadingApps = false;
    },
    fetchAppsError(state) {
      state.error = true;
      state.installed = [];
      state.isLoadingApps = false;
    },
    fetchAppsRequest(state) {
      state.isLoadingApps = true;
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
    dispatch(actions.fetchAppsRequest());
    return request(`${CONFIG.API_ACCOUNTS}/instances/${ZUID}/app-installs`)
      .then((res) => {
        if (res.status === 200) {
          // TODO revisit this (needs batching?)
          const { data } = res;
          Promise.all(
            data.map(({ appZUID }) => {
              return request(`${CONFIG.API_ACCOUNTS}/apps/${appZUID}`);
            })
          )
            .then((responses) => {
              const failureResponses = responses.filter(
                (res) => res.status !== 200
              );
              failureResponses.forEach((res) =>
                dispatch(
                  notify({
                    kind: "warn",
                    message: i18n.t("shell.appLoadingFailure", {
                      message: res.message,
                    }),
                  })
                )
              );

              const successfulResponses = responses.filter(
                (res) => res.status === 200
              );
              const appsInfo = successfulResponses.map((res) => res.data);
              dispatch(actions.fetchAppsSuccess(appsInfo));
              return appsInfo;
            })
            .catch((err) => {
              dispatch(
                notify({
                  kind: "warn",
                  message: i18n.t("shell.appLoadingFailure", { message: err }),
                })
              );
            });
        } else {
          dispatch(actions.fetchAppsError());
          dispatch(
            notify({
              kind: "warn",
              message: i18n.t("shell.appLoadingFailure", {
                message: res.error,
              }),
            })
          );
        }
      })
      .catch((err) => {
        dispatch(actions.fetchAppsError());
        dispatch(
          notify({
            kind: "warn",
            message: i18n.t("shell.appLoadingFailure", { message: err }),
          })
        );
      });
  };
}
