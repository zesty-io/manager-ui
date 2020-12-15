import { createSlice } from "@reduxjs/toolkit";
import { faFolder } from "@fortawesome/free-solid-svg-icons";
import { request } from "utility/request";
import { notify } from "shell/store/notifications";
import uniqBy from "lodash/uniqBy";
import omit from "lodash/omit";
import pick from "lodash/pick";
import { v4 as uuidv4 } from "uuid";

const mediaSlice = createSlice({
  name: "media",
  initialState: {
    bins: [],
    groups: [],
    files: [],
    nav: [],
    hiddenNav: []
  },
  reducers: {
    // Bins
    fetchBinsSuccess(state, action) {
      state.bins = addNavigationStates(action.payload);
    },
    editBinSuccess(state, action) {
      const index = state.bins.findIndex(val => val.id === action.payload.id);
      if (index !== -1) {
        state.bins[index].name = action.payload.name;
        state.nav = buildMainNav(state.bins, state.groups);
      }
    },

    // Groups
    fetchGroupsSuccess(state, action) {
      state.groups = addNavigationStates(action.payload);
      state.nav = buildMainNav(state.bins, state.groups);
      state.hiddenNav = buildHiddenNav(state.bins, state.groups);
    },
    createGroupSuccess(state, action) {
      state.groups.push(action.payload);
      state.nav = buildMainNav(state.bins, state.groups);
    },
    editGroupSuccess(state, action) {
      const index = state.groups.findIndex(val => val.id === action.payload.id);
      if (index !== -1) {
        state.groups[index].name = action.payload.name;
        state.groups[index].group_id = action.payload.group_id;
        state.nav = buildMainNav(state.bins, state.groups);
        state.hiddenNav = buildHiddenNav(state.bins, state.groups);
      }
    },
    deleteGroupSuccess(state, action) {
      state.bins = state.bins.filter(el => el.id !== action.payload.id);
      state.groups = state.groups.filter(el => el.id !== action.payload.id);
      state.nav = buildMainNav(state.bins, state.groups);
      state.hiddenNav = buildHiddenNav(state.bins, state.groups);
    },
    closeGroup(state, action) {
      const item =
        state.bins.find(val => val.id === action.payload) ||
        state.groups.find(val => val.id === action.payload);
      if (item) {
        item.closed = !item.closed;
        const selectClosed = group => group.closed;
        const selectZUID = group => group.id;
        const closedBins = state.bins.filter(selectClosed).map(selectZUID);
        const closedGroups = state.groups.filter(selectClosed).map(selectZUID);
        localStorage.setItem(
          "zesty:navMedia:closed",
          JSON.stringify(closedBins.concat(closedGroups))
        );
        state.nav = buildMainNav(state.bins, state.groups);
        state.hiddenNav = buildHiddenNav(state.bins, state.groups);
      }
    },
    hideGroup(state, action) {
      const item =
        state.bins.find(val => val.id === action.payload) ||
        state.groups.find(val => val.id === action.payload);
      if (item) {
        item.hidden = !item.hidden;
        const selectHidden = group => group.hidden;
        const selectZUID = group => group.id;
        const hiddenBins = state.bins.filter(selectHidden).map(selectZUID);
        const hiddenGroups = state.groups.filter(selectHidden).map(selectZUID);
        localStorage.setItem(
          "zesty:navMedia:hidden",
          JSON.stringify(hiddenBins.concat(hiddenGroups))
        );
        state.nav = buildMainNav(state.bins, state.groups);
        state.hiddenNav = buildHiddenNav(state.bins, state.groups);
      }
    },

    // Files
    fetchFilesStart(state, action) {
      const group =
        state.bins.find(val => val.id === action.payload.group) ||
        state.groups.find(val => val.id === action.payload.group);
      if (group) {
        group.loading = true;
      }
    },
    fetchFilesSuccess(state, action) {
      const group =
        state.bins.find(val => val.id === action.payload.group) ||
        state.groups.find(val => val.id === action.payload.group);
      if (group) {
        group.loading = false;
      }
      const files = action.payload.files;
      // sort newest files first
      files.forEach(file => {
        if (!state.files.some(val => val.id === file.id)) {
          state.files.unshift(file);
        }
      });
    },
    deleteFileSuccess(state, action) {
      const index = state.files.findIndex(el => el.id === action.payload.id);
      if (index !== -1) {
        state.files.splice(index, 1);
      }
    },
    fileUploadStart(state, action) {
      const file = omit(action.payload, "file");
      state.files.unshift(file);
    },
    fileUploadProgress(state, action) {
      const uploadingFile = state.files.find(
        file => file.uploadID === action.payload.uploadID
      );
      uploadingFile.progress = action.payload.progress;
    },
    fileUploadSuccess(state, action) {
      const uploadingFile = state.files.find(
        file => file.uploadID === action.payload.uploadID
      );
      uploadingFile.loading = false;
      uploadingFile.id = action.payload.id;
      uploadingFile.title = action.payload.title;
      uploadingFile.url = action.payload.url;
    },
    fileUploadError(state, action) {
      const index = state.files.findIndex(
        el => el.uploadID === action.payload.uploadID
      );
      if (index !== -1) {
        state.files.splice(index, 1);
      }
    }
  }
});

function buildMainNav(bins, groups) {
  const visibleBins = bins.filter(bin => !bin.hidden);
  const visibleGroups = groups.filter(group => !group.hidden);
  return buildNav(visibleBins, visibleGroups);
}

function buildHiddenNav(bins, groups) {
  const selectHidden = bin => bin.hidden;
  const hiddenBins = bins.filter(selectHidden);
  const hiddenGroups = groups.filter(selectHidden);
  return hiddenBins.concat(hiddenGroups).map(group => {
    return {
      id: group.id,
      icon: faFolder,
      label: group.name,
      path: `/dam/${group.id}`
    };
  });
}

function buildNav(bins, groups) {
  return bins.map(bin => {
    return {
      id: bin.id,
      closed: bin.closed,
      children: groups
        .filter(group => group.group_id === bin.id)
        .map(buildNavGroup(bin, groups)),
      icon: faFolder,
      label: bin.name,
      path: `/dam/${bin.id}`,
      type: "bin"
    };
  });
}

function buildNavGroup(bin, groups) {
  return currentGroup => {
    return {
      id: currentGroup.id,
      bin_id: bin.id,
      closed: currentGroup.closed,
      children: groups
        .filter(group => currentGroup.id === group.group_id)
        .map(buildNavGroup(bin, groups)),
      icon: faFolder,
      label: currentGroup.name,
      path: `/dam/${currentGroup.id}`,
      type: "group"
    };
  };
}

function addNavigationStates(groups) {
  const closed = localStorage.getItem("zesty:navMedia:closed");
  const closedZUIDs = closed ? JSON.parse(closed) : [];
  const hidden = localStorage.getItem("zesty:navMedia:hidden");
  const hiddenZUIDs = hidden ? JSON.parse(hidden) : [];
  groups.forEach(group => {
    group.closed = closedZUIDs.includes(group.id);
    group.hidden = hiddenZUIDs.includes(group.id);
  });
  return groups;
}

export default mediaSlice.reducer;

export const {
  fetchBinsSuccess,
  editBinSuccess,
  fetchGroupsSuccess,
  createGroupSuccess,
  editGroupSuccess,
  deleteGroupSuccess,
  closeGroup,
  hideGroup,
  fetchFilesStart,
  fetchFilesSuccess,
  deleteFileSuccess,
  fileUploadStart,
  fileUploadProgress,
  fileUploadSuccess,
  fileUploadError
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

export function editGroup(groupID, newGroupProperties) {
  return (dispatch, getState) => {
    const group = getState().media.groups.find(group => group.id === groupID);
    const body = {
      ...pick(group, ["id", "group_id", "bin_id", "name"]),
      ...newGroupProperties
    };
    return request(`${CONFIG.SERVICE_MEDIA_MANAGER}/group/${group.id}`, {
      method: "PATCH",
      body
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

export function fetchBinFiles(binZUID) {
  return dispatch => {
    dispatch(fetchFilesStart({ group: binZUID }));
    return dispatch({
      type: "FETCH_RESOURCE",
      uri: `${CONFIG.SERVICE_MEDIA_MANAGER}/bin/${binZUID}/files`,
      handler: res => {
        if (res.status === 200) {
          dispatch(fetchFilesSuccess({ group: binZUID, files: res.data }));
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
    dispatch(fetchFilesStart({ group: groupZUID }));
    return dispatch({
      type: "FETCH_RESOURCE",
      uri: `${CONFIG.SERVICE_MEDIA_MANAGER}/group/${groupZUID}`,
      handler: res => {
        if (res.status === 200) {
          dispatch(
            fetchFilesSuccess({ group: groupZUID, files: res.data[0].files })
          );
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

export function uploadFile(file, bin) {
  return (dispatch, getState) => {
    function handleError() {
      dispatch(fileUploadError(file));
      dispatch(notify({ message: "Failed uploading file", kind: "error" }));
    }

    file.filename = file.file.name;
    file.uploadID = uuidv4();
    file.progress = 0;
    file.loading = true;
    file.url = URL.createObjectURL(file.file);

    const data = new FormData();
    data.append("file", file.file);
    data.append("bin_id", file.bin_id);
    data.append("group_id", file.group_id);
    data.append("user_id", getState().user.ZUID);

    const req = new XMLHttpRequest();
    req.withCredentials = true;
    req.open(
      "POST",
      `${CONFIG.SERVICE_MEDIA_STORAGE}/upload/${bin.storage_driver}/${bin.storage_name}`
    );

    req.upload.addEventListener("progress", function(e) {
      file.progress = (e.loaded / e.total) * 100;
      dispatch(fileUploadProgress(file));
    });

    req.addEventListener("load", function(e) {
      if (req.status === 201) {
        const response = JSON.parse(req.response);
        const uploadedFile = response.data[0];
        uploadedFile.uploadID = file.uploadID;
        dispatch(fileUploadSuccess(uploadedFile));
      } else {
        handleError();
      }
    });
    req.addEventListener("abort", handleError);
    req.addEventListener("error", handleError);

    dispatch(fileUploadStart(file));
    req.send(data);
  };
}

export function deleteFile(file) {
  return dispatch => {
    return request(`${CONFIG.SERVICE_MEDIA_MANAGER}/file/${file.id}`, {
      method: "DELETE"
    }).then(res => {
      if (res.status === 200) {
        dispatch(deleteFileSuccess(file));
        dispatch(
          notify({ message: `Deleted file ${file.filename}`, kind: "success" })
        );
      } else {
        dispatch(notify({ message: "Failed deleting file", kind: "error" }));
        throw res;
      }
    });
  };
}
