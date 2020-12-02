import { createSlice } from "@reduxjs/toolkit";
import { faFolder } from "@fortawesome/free-solid-svg-icons";
import { request } from "utility/request";
import { notify } from "shell/store/notifications";
import uniqBy from "lodash/uniqBy";

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
    fetchFilesSuccess(state, action) {
      const files = [];
      action.payload.forEach(file => {
        if (!state.files.find(val => val.id === file.id)) {
          files.push(file);
        }
      });
      state.files = state.files.concat(files);
    },
    createGroupSuccess(state, action) {
      state.groups.push(action.payload);
      state.nav = createNav(state.bins, state.groups);
    },
    editGroupSuccess(state, action) {
      const index = state.groups.findIndex(val => val.id === action.payload.id);
      state.groups[index] = action.payload;
      state.nav = createNav(state.bins, state.groups);
    },
    deleteGroupSuccess(state, action) {
      state.bins = state.bins.filter(el => el.id !== action.payload.id);
      state.groups = state.groups.filter(el => el.id !== action.payload.id);
      state.nav = createNav(state.bins, state.groups);
    },
    editBinSuccess(state, action) {
      const index = state.bins.findIndex(val => val.id === action.payload.id);
      state.bins[index] = action.payload;
      state.nav = createNav(state.bins, state.groups);
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
      path: `/dam/${bin.id}`
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
      path: `/dam/${currentGroup.id}`
    };
  };
}

export default mediaSlice.reducer;

export const {
  fetchBinsSuccess,
  fetchGroupsSuccess,
  fetchFilesSuccess,
  createGroupSuccess,
  editGroupSuccess,
  deleteGroupSuccess,
  editBinSuccess
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
          throw res;
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
        }
        //non-200 is not fatal
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
      const allBins = ecoBins ? uniqBy([...bins, ...ecoBins], "id") : bins;
      return dispatch(fetchBinsSuccess(allBins));
    });
  };
}

function fetchGroups(binZUID) {
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
          throw res;
        }
      }
    });
  };
}

export function fetchAllGroups() {
  return (dispatch, getState) => {
    const bins = getState().media.bins;
    return Promise.all(bins.map(bin => dispatch(fetchGroups(bin.id)))).then(
      groups => {
        return dispatch(fetchGroupsSuccess(groups.flat()));
      }
    );
  };
}

export function fetchBinFiles(binZUID) {
  return dispatch => {
    return dispatch({
      type: "FETCH_RESOURCE",
      uri: `${CONFIG.SERVICE_MEDIA_MANAGER}/bin/${binZUID}/files`,
      handler: res => {
        if (res.status === 200) {
          dispatch(fetchFilesSuccess(res.data));
        } else {
          dispatch(
            notify({ message: "Failed loading bin files", kind: "error" })
          );
          throw res;
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
          dispatch(fetchFilesSuccess(res.data[0].files));
        } else {
          dispatch(
            notify({ message: "Failed loading group files", kind: "error" })
          );
          throw res;
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
    data.append("group_id", group.id);
    data.append("user_id", getState().user.ZUID);

    let req = new XMLHttpRequest();
    req.open(
      "POST",
      `${CONFIG.SERVICE_MEDIA_STORAGE}/upload/${bin.storage_driver}/${bin.storage_name}`
    );

    // upload progress event
    req.upload.addEventListener("progress", function(e) {
      // upload progress as percentage
      let percent_completed = (e.loaded / e.total) * 100;
      console.log(percent_completed);
    });

    req.addEventListener("load", function(e) {
      // HTTP status message (200, 404 etc)
      console.log(req.status);
      if (req.status === 200) {
        console.log(req.response);
        // request.response.data[0]
      }
    });

    req.send(data);
  };
}

export function createGroup(groupName, bin, group) {
  return dispatch => {
    return request(`${CONFIG.SERVICE_MEDIA_MANAGER}/group`, {
      body: {
        bin_id: bin.id,
        group_id: group.id,
        name: groupName
      }
    }).then(res => {
      if (res.status === 201) {
        dispatch(createGroupSuccess(res.data[0]));
        return res;
      } else {
        dispatch(notify({ message: "Failed creating group", kind: "error" }));
        throw res;
      }
    });
  };
}

export function editGroup(groupName, group) {
  return dispatch => {
    return request(`${CONFIG.SERVICE_MEDIA_MANAGER}/group/${group.id}`, {
      method: "PATCH",
      body: { ...group, name: groupName }
    }).then(res => {
      if (res.status === 200) {
        dispatch(editGroupSuccess(res.data[0]));
      } else {
        dispatch(notify({ message: "Failed editing group", kind: "error" }));
        throw res;
      }
    });
  };
}

export function deleteGroup(group) {
  return dispatch => {
    return request(`${CONFIG.SERVICE_MEDIA_MANAGER}/group/${group.id}`, {
      method: "DELETE"
    }).then(res => {
      if (res.status === 200) {
        dispatch(deleteGroupSuccess(group));
        dispatch(
          notify({ message: `Deleted group ${group.name}`, kind: "success" })
        );
      } else {
        dispatch(notify({ message: "Failed deleting group", kind: "error" }));
        throw res;
      }
    });
  };
}

export function editBin(binName, bin) {
  return dispatch => {
    return request(`${CONFIG.SERVICE_MEDIA_MANAGER}/bin/${bin.id}`, {
      method: "PATCH",
      body: { ...bin, name: binName }
    }).then(res => {
      if (res.status === 200) {
        dispatch(editBinSuccess(res.data[0]));
      } else {
        dispatch(notify({ message: "Failed editing bin", kind: "error" }));
        throw res;
      }
    });
  };
}
