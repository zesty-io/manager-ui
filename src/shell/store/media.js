import { createSlice, current } from "@reduxjs/toolkit";
import { faFolder } from "@fortawesome/free-solid-svg-icons";
import { request } from "utility/request";
import { notify } from "shell/store/notifications";
import uniqBy from "lodash/uniqBy";
import omit from "lodash/omit";
import pick from "lodash/pick";
import { v4 as uuidv4 } from "uuid";
import { enableMapSet } from "immer";

enableMapSet();

const mediaSlice = createSlice({
  name: "media",
  initialState: {
    bins: [],
    groups: [],
    files: new Map(),
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
        const currentState = current(state);
        state.nav = buildMainNav(currentState.bins, currentState.groups);
      }
    },

    // Groups
    fetchGroupsSuccess(state, action) {
      state.groups = addNavigationStates(action.payload);
      const currentState = current(state);
      state.nav = buildMainNav(currentState.bins, currentState.groups);
      state.hiddenNav = buildHiddenNav(currentState.bins, currentState.groups);
    },
    createGroupSuccess(state, action) {
      state.groups.push(action.payload);
      const currentState = current(state);
      state.nav = buildMainNav(currentState.bins, currentState.groups);
    },
    editGroupSuccess(state, action) {
      const index = state.groups.findIndex(val => val.id === action.payload.id);
      if (index !== -1) {
        state.groups[index].name = action.payload.name;
        state.groups[index].group_id = action.payload.group_id;
        const currentState = current(state);
        state.nav = buildMainNav(currentState.bins, currentState.groups);
        state.hiddenNav = buildHiddenNav(
          currentState.bins,
          currentState.groups
        );
      }
    },
    deleteGroupSuccess(state, action) {
      state.bins = state.bins.filter(el => el.id !== action.payload.id);
      state.groups = state.groups.filter(el => el.id !== action.payload.id);
      const currentState = current(state);
      state.nav = buildMainNav(currentState.bins, currentState.groups);
      state.hiddenNav = buildHiddenNav(currentState.bins, currentState.groups);
    },
    closeGroup(state, action) {
      const item =
        state.bins.find(val => val.id === action.payload) ||
        state.groups.find(val => val.id === action.payload);
      if (item) {
        // update item in groups/bins
        item.closed = !item.closed;

        // update group in nav
        const navGroup = findGroupInNav(
          state.nav,
          state.bins,
          state.groups,
          item
        );
        if (navGroup) {
          navGroup.closed = !navGroup.closed;
        }

        // update item in localstorage
        const selectClosed = group => group.closed;
        const selectZUID = group => group.id;
        const closedBins = state.bins.filter(selectClosed).map(selectZUID);
        const closedGroups = state.groups.filter(selectClosed).map(selectZUID);
        localStorage.setItem(
          "zesty:navMedia:closed",
          JSON.stringify(closedBins.concat(closedGroups))
        );
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
        const currentState = current(state);
        state.nav = buildMainNav(currentState.bins, currentState.groups);
        state.hiddenNav = buildHiddenNav(
          currentState.bins,
          currentState.groups
        );
      }
    },
    selectGroup(state, action) {
      // update item and prevItem
      const item =
        state.bins.find(val => val.id === action.payload.currentGroupID) ||
        state.groups.find(val => val.id === action.payload.currentGroupID);
      if (item) {
        item.selected = true;
        const navGroup = findGroupInNav(
          state.nav,
          state.bins,
          state.groups,
          item
        );
        if (navGroup) {
          navGroup.selected = true;
        }
      }

      if (action.payload.previousGroupID !== action.payload.currentGroupID) {
        const prevItem =
          state.bins.find(val => val.id === action.payload.previousGroupID) ||
          state.groups.find(val => val.id === action.payload.previousGroupID);
        if (prevItem) {
          item.selected = false;
          const prevNavGroup = findGroupInNav(
            state.nav,
            state.bins,
            state.groups,
            prevItem
          );
          if (prevNavGroup) {
            prevNavGroup.selected = false;
          }
        }
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
        if (!state.files.has(file.id)) {
          state.files.set(file.id, file);
        }
      });
    },
    deleteFileSuccess(state, action) {
      if (state.files.has(action.payload.id)) {
        state.files.delete(action.payload.id);
      }
    },
    fileUploadStart(state, action) {
      const file = omit(action.payload, "file");
      state.files.set(file.uploadID, file);
    },
    fileUploadProgress(state, action) {
      let uploadingFile = state.files.get(action.payload.uploadID);
      if (uploadingFile) {
        uploadingFile.progress = action.payload.progress;
      }
    },
    fileUploadSuccess(state, action) {
      let uploadingFile = state.files.get(action.payload.uploadID);
      if (uploadingFile) {
        // don't update draft since we delete file at the end
        const file = current(uploadingFile);
        file.loading = false;
        file.id = action.payload.id;
        file.title = action.payload.title;
        file.url = action.payload.url;

        // swap uploadID key for new id key
        state.files.set(file.id, file);
        state.files.delete(file.uploadID);
      }
    },
    fileUploadError(state, action) {
      if (state.files.has(action.payload.uploadID)) {
        state.files.delete(action.payload.uploadID);
      }
    },
    editFileSuccess(state, action) {
      const index = state.files.findIndex(val => val.id === action.payload.id);
      if (index !== -1) {
        state.files[index].filename = action.payload.filename;
        state.files[index].group_id = action.payload.group_id;
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
  function mapBinToNav(bin) {
    const filterBinChildren = group => group.group_id === bin.id;
    const mapGroupToNav = buildNavGroup(bin, groups);
    return {
      id: bin.id,
      closed: bin.closed,
      selected: false,
      children: groups.filter(filterBinChildren).map(mapGroupToNav),
      label: bin.name,
      path: `/dam/${bin.id}`,
      type: "bin"
    };
  }
  return bins.map(mapBinToNav);
}

function buildNavGroup(bin, groups) {
  return function buildGroup(currentGroup) {
    const filterGroupChildren = group => currentGroup.id === group.group_id;
    const mapGroupToNav = buildNavGroup(bin, groups);
    return {
      id: currentGroup.id,
      bin_id: bin.id,
      closed: currentGroup.closed,
      selected: false,
      children: groups.filter(filterGroupChildren).map(mapGroupToNav),
      label: currentGroup.name,
      path: `/dam/${currentGroup.id}`,
      type: "group"
    };
  };
}

function findGroupInNav(nav, bins, groups, group) {
  let node = group;
  let id = node.id;
  // nav group id path for crawling down from root to node
  const navPath = [id];

  // build up navPath by crawling up nav tree to root
  while (id) {
    // crawl up one level
    id = node.group_id;
    node = bins.find(val => val.id === id) || groups.find(val => val.id === id);
    if (node) {
      navPath.unshift(node.id);
    }
  }

  id = navPath.shift();
  node = nav.find(val => val.id === id);
  while (id) {
    id = navPath.shift();
    if (id) {
      node = node.children.find(val => val.id === id);
    }
  }

  return node;
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
  selectGroup,
  fetchFilesStart,
  fetchFilesSuccess,
  deleteFileSuccess,
  fileUploadStart,
  fileUploadProgress,
  fileUploadSuccess,
  fileUploadError,
  editFileSuccess
} = mediaSlice.actions;

function fetchBins(instanceID) {
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

function fetchEcoBins(ecoID) {
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

export function fetchAllBins() {
  return (dispatch, getState) => {
    const instanceID = getState().instance.ID;
    const ecoID = getState().instance.ecoID;
    const promises = [dispatch(fetchBins(instanceID))];
    if (ecoID) {
      promises.push(dispatch(fetchEcoBins(ecoID)));
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
      ...pick(group, ["id", "group_id", "name"]),
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

export function editFile(fileID, fileProperties) {
  return (dispatch, getState) => {
    const file = getState().media.files.find(file => file.id === fileID);
    const body = {
      ...pick(file, ["id", "group_id", "filename"]),
      ...fileProperties
    };
    return request(`${CONFIG.SERVICE_MEDIA_MANAGER}/file/${file.id}`, {
      method: "PATCH",
      body
    }).then(res => {
      if (res.status === 200) {
        dispatch(editFileSuccess(res.data[0]));
      } else {
        dispatch(notify({ message: "Failed editing file", kind: "error" }));
        throw res;
      }
    });
  };
}
