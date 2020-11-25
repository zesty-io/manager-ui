import { createSlice } from "@reduxjs/toolkit";
import { notify } from "shell/store/notifications";

import { faFolder } from "@fortawesome/free-solid-svg-icons";

const mediaSlice = createSlice({
  name: "media",
  initialState: {
    bins: [],
    groups: [],
    files: [],
    nav: []
  },
  reducers: {
    fetchBinsSuccess(state, action) {
      state.bins = action.payload;
    },
    fetchGroupsSuccess(state, action) {
      state.groups = action.payload;
      state.nav = createNav(state.bins, state.groups);
    },
    fetchBinFilesSuccess(state, action) {
      action.payload.forEach(file => {
        if (!state.files.find(val => val.id === file.id)) {
          state.files.push(file);
        }
      });
    },
    fetchGroupFilesSuccess(state, action) {
      action.payload.forEach(file => {
        if (!state.files.find(val => val.id === file.id)) {
          state.files.push(file);
        }
      });
    }
  }
});

function createNav(bins, groups) {
  return bins.map(bin => {
    return {
      children: groups
        .filter(group => group.group_id === bin.id)
        .map(createNavGroup(groups)),
      icon: faFolder,
      label: bin.name,
      path: `/dam/bin/${bin.id}`
    };
  });
}

function createNavGroup(groups) {
  return currentGroup => {
    return {
      children: groups
        .filter(group => currentGroup.id === group.group_id)
        .map(createNavGroup(groups)),
      icon: faFolder,
      label: currentGroup.name,
      path: `/dam/group/${currentGroup.id}`
    };
  };
}

export default mediaSlice.reducer;

export const {
  fetchBinsSuccess,
  fetchGroupsSuccess,
  fetchBinFilesSuccess,
  fetchGroupFilesSuccess
} = mediaSlice.actions;

function fetchMediaBins(instanceID) {
  return dispatch => {
    return dispatch({
      type: "FETCH_RESOURCE",
      uri: `${CONFIG.SERVICE_MEDIA_MANAGER}/site/${instanceID}/bins`,
      handler: res => {
        if (res.status === 200) {
          return res.data;
        } else {
          dispatch(
            notify({ message: "Failed loading media bins", kind: "error" })
          );
        }
      }
    });
  };
}

function fetchMediaEcoBins(ecoID) {
  return dispatch => {
    return dispatch({
      type: "FETCH_RESOURCE",
      uri: `${CONFIG.SERVICE_MEDIA_MANAGER}/eco/${ecoID}/bins`,
      handler: res => {
        if (res.status === 200) {
          return res.data;
        } else {
          dispatch(
            notify({
              message: "Failed loading media ecosystem bins",
              kind: "error"
            })
          );
        }
      }
    });
  };
}

export function fetchAllMediaBins() {
  return (dispatch, getState) => {
    const instanceID = getState().instance.ID;
    const ecoID = getState().instance.ecoID;
    const promises = [dispatch(fetchMediaBins(instanceID))];
    if (ecoID) {
      promises.push(dispatch(fetchMediaEcoBins(ecoID)));
    }
    return Promise.all(promises).then(([bins, ecoBins]) => {
      const allBins = ecoBins ? [...bins, ...ecoBins] : bins;
      return dispatch(fetchBinsSuccess(allBins));
    });
  };
}

function fetchMediaGroups(binZUID) {
  return dispatch => {
    return dispatch({
      type: "FETCH_RESOURCE",
      uri: `${CONFIG.SERVICE_MEDIA_MANAGER}/bin/${binZUID}/groups`,
      handler: res => {
        if (res.status === 200) {
          return res.data;
        } else {
          dispatch(
            notify({ message: "Failed loading bin groups", kind: "error" })
          );
        }
      }
    });
  };
}

export function fetchAllGroups() {
  return (dispatch, getState) => {
    const bins = getState().media.bins;
    return Promise.all(
      bins.map(bin => dispatch(fetchMediaGroups(bin.id)))
    ).then(groups => {
      return dispatch(fetchGroupsSuccess(groups.flat()));
    });
  };
}

export function fetchBinFiles(binZUID) {
  return dispatch => {
    return dispatch({
      type: "FETCH_RESOURCE",
      uri: `${CONFIG.SERVICE_MEDIA_MANAGER}/bin/${binZUID}/files`,
      handler: res => {
        if (res.status === 200) {
          dispatch(fetchBinFilesSuccess(res.data));
        } else {
          dispatch(
            notify({ message: "Failed loading bin files", kind: "error" })
          );
        }
      }
    });
  };
}

export function fetchGroupFiles(groupZUID) {
  return dispatch => {
    return dispatch({
      type: "FETCH_RESOURCE",
      uri: `${CONFIG.SERVICE_MEDIA_MANAGER}/group/${groupZUID}`,
      handler: res => {
        if (res.status === 200) {
          dispatch(fetchGroupFilesSuccess(res.data[0].files));
        } else {
          dispatch(
            notify({ message: "Failed loading group files", kind: "error" })
          );
        }
      }
    });
  };
}

export function uploadFile(file, bin, group) {
  return (dispatch, getState) => {
    let data = new FormData();
    data.append("file", file);
    data.append("bin_id", bin.id);
    if (group) {
      data.append("group_id", group.id);
    }
    data.append("user_id", getState().user.ZUID);

    let request = new XMLHttpRequest();
    request.open(
      "POST",
      `${CONFIG.SERVICE_MEDIA_STORAGE}/upload/${bin.storage_driver}/${bin.storage_name}`
    );

    // upload progress event
    request.upload.addEventListener("progress", function(e) {
      // upload progress as percentage
      let percent_completed = (e.loaded / e.total) * 100;
      console.log(percent_completed);
    });

    request.addEventListener("load", function(e) {
      // HTTP status message (200, 404 etc)
      console.log(request.status);
      if (request.status === 200) {
        console.log(request.response);
        // request.response.data[0]
      }
    });

    request.send(data);
  };
}
