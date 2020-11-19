import { createSlice } from "@reduxjs/toolkit";

const mediaSlice = createSlice({
  name: "media",
  initialState: {
    bins: [],
    groups: [],
    files: []
  },
  reducers: {
    fetchBinsSuccess(state, action) {
      state.bins.push(...action.payload);
    },
    fetchGroupsSuccess(state, action) {
      action.payload.forEach(group => {
        if (!state.groups.find(val => val.id === group.id)) {
          state.groups.push(group);
        }
      });
    }
  }
});

export default mediaSlice.reducer;

export const { fetchBinsSuccess, fetchGroupsSuccess } = mediaSlice.actions;

export function fetchMediaBins() {
  return (dispatch, getState) => {
    const instanceID = getState().instance.ID;

    return dispatch({
      type: "FETCH_RESOURCE",
      uri: `${CONFIG.SERVICE_MEDIA_MANAGER}/site/${instanceID}/bins`,
      handler: res => {
        dispatch(fetchBinsSuccess(res.data));
      }
    });
  };
}
export function fetchMediaGroups(binZUID) {
  return dispatch => {
    return dispatch({
      type: "FETCH_RESOURCE",
      uri: `${CONFIG.SERVICE_MEDIA_MANAGER}/bin/${binZUID}/groups`,
      handler: res => {
        dispatch(fetchGroupsSuccess(res.data));
      }
    });
  };
}
