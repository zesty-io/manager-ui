import { createSlice, current } from "@reduxjs/toolkit";
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
    groups: {
      // nav root
      0: { children: [] },
      // hidden nav root
      1: { children: [] },
    },
    files: [],
    search: {
      term: null,
      files: [],
      loading: false,
    },
  },
  reducers: {
    // Bins
    fetchBinsSuccess(state, action) {
      state.groups = {
        // nav root
        0: { children: [] },
        // hidden nav root
        1: { children: [] },
      };
      const closed = getClosedGroups();
      const hidden = getHiddenGroups();

      if (Array.isArray(action.payload)) {
        action.payload.forEach((bin) => {
          bin.closed = closed.includes(bin.id);
          bin.children = [];
          bin.path = `/media/${bin.id}`;
          bin.hidden = hidden.includes(bin.id);
          state.groups[bin.id] = bin;
          if (bin.hidden) {
            state.groups[1].children.push(bin.id);
          } else {
            state.groups[0].children.push(bin.id);
          }
        });
      }
    },
    editBinSuccess(state, action) {
      const bin = state.groups[action.payload.id];
      if (bin) {
        bin.name = action.payload.name;
      }
    },

    // Groups
    fetchGroupsSuccess(state, action) {
      const closed = getClosedGroups();
      const hidden = getHiddenGroups();

      const groups = action.payload.reverse();

      groups.forEach(function initializeGroup(group) {
        group.closed = closed.includes(group.id);
        group.children = [];
        group.path = `/media/${group.id}`;
        group.hidden = hidden.includes(group.id);
        state.groups[group.id] = group;
        if (group.hidden) {
          state.groups[1].children.push(group.id);
        }
      });

      groups.forEach(function addChildrenToParents(group) {
        const parent = state.groups[group.group_id];
        if (parent) {
          parent.children.push(group.id);
        }
      });
    },
    createGroupSuccess(state, action) {
      const group = action.payload;
      group.children = [];
      group.path = `/media/${group.id}`;
      group.closed = false;
      group.hidden = false;
      state.groups[group.id] = group;
      const parent = state.groups[group.group_id];
      parent.children.push(group.id);
      // expand parent group
      parent.closed = false;
      localStorage.setItem(
        "zesty:navMedia:closed",
        JSON.stringify(
          Object.keys(state.groups).filter((id) => state.groups[id].closed)
        )
      );
    },
    editGroupSuccess(state, action) {
      const group = state.groups[action.payload.id];
      if (group) {
        group.name = action.payload.name;
        group.group_id = action.payload.group_id;
      }
    },
    deleteGroupSuccess(state, action) {
      const group = action.payload;
      delete state.groups[group.id];
      const index = state.groups[group.group_id].children.findIndex(
        (val) => val === group.id
      );
      if (index !== -1) {
        state.groups[group.group_id].children.splice(index, 1);
      }
    },
    closeGroup(state, action) {
      const group = state.groups[action.payload];
      if (group) {
        group.closed = !group.closed;

        localStorage.setItem(
          "zesty:navMedia:closed",
          JSON.stringify(
            Object.keys(state.groups).filter((id) => state.groups[id].closed)
          )
        );
      }
    },
    hideGroup(state, action) {
      const group = state.groups[action.payload];
      if (group) {
        group.hidden = !group.hidden;
        if (!group.hidden) {
          const index = state.groups[1].children.findIndex(
            (val) => val === group.id
          );
          if (index !== -1) {
            state.groups[1].children.splice(index, 1);
          }
          // only push bins back onto the visible nav
          if (!group.group_id) {
            state.groups[0].children.push(group.id);
          }
        } else {
          const index = state.groups[0].children.findIndex(
            (val) => val === group.id
          );
          if (index !== -1) {
            state.groups[0].children.splice(index, 1);
          }
          state.groups[1].children.push(group.id);
        }

        localStorage.setItem(
          "zesty:navMedia:hidden",
          JSON.stringify(
            Object.keys(state.groups).filter((id) => state.groups[id].hidden)
          )
        );
      }
    },
    selectGroup(state, action) {
      // update item to selected
      const group = state.groups[action.payload.currentGroupID];
      if (group) {
        group.selected = true;
      }
      if (action.payload.currentGroupID !== action.payload.previousGroupID) {
        // update prevItem to unselected
        const prevItem = state.groups[action.payload.previousGroupID];
        if (prevItem) {
          prevItem.selected = false;
        }
      }
    },
    highlightGroup(state, action) {
      const group = state.groups[action.payload.id];
      if (group) {
        group.highlighted = true;
      }

      const prevItem = state.groups[action.payload.prevID];
      if (prevItem) {
        prevItem.highlighted = false;
      }
    },

    // Files
    fetchFilesStart(state, action) {
      const group = state.groups[action.payload.group];
      if (group) {
        group.loading = true;
      }
    },
    fetchFilesSuccess(state, action) {
      const group = state.groups[action.payload.group];
      if (group) {
        group.loading = false;
      }
      const files = action.payload.files;
      const stateFiles = current(state.files);
      // sort newest files first
      files.forEach((resultFile) => {
        if (stateFiles.findIndex((file) => file.id === resultFile.id) === -1) {
          state.files.push(resultFile);
        }
      });
    },
    deleteFileSuccess(state, action) {
      const fileIndex = state.files.findIndex(
        (file) => file.id === action.payload.id
      );
      if (fileIndex !== -1) {
        state.files.splice(fileIndex, 1);
      }
    },
    fileUploadStart(state, action) {
      const file = omit(action.payload, "file");
      state.files.push(file);
    },
    fileUploadProgress(state, action) {
      const uploadingFile = state.files.find(
        (file) => file.uploadID === action.payload.uploadID
      );
      if (uploadingFile) {
        uploadingFile.progress = action.payload.progress;
      }
    },
    fileUploadSuccess(state, action) {
      const uploadingFile = state.files.find(
        (file) => file.uploadID === action.payload.uploadID
      );
      if (uploadingFile) {
        uploadingFile.loading = false;
        uploadingFile.id = action.payload.id;
        uploadingFile.title = action.payload.title;
        uploadingFile.filename = action.payload.filename;
        uploadingFile.url = action.payload.url;
      }
    },
    fileUploadError(state, action) {
      const fileIndex = state.files.findIndex(
        (file) => file.uploadID === action.payload.uploadID
      );
      if (fileIndex !== -1) {
        state.files.splice(fileIndex, 1);
      }
    },
    editFileSuccess(state, action) {
      const file = state.files.find((file) => file.id === action.payload.id);
      if (file) {
        file.filename = action.payload.filename;
        file.title = action.payload.title;
        file.group_id = action.payload.group_id;
        file.url = action.payload.url;
      }
    },
    searchFilesStart(state, action) {
      state.search.term = action.payload;
      state.search.files = [];
      state.search.loading = true;
    },
    searchFilesError(state) {
      state.search.loading = false;
    },
    searchFilesSuccess(state, action) {
      state.search.loading = false;
      state.search.files = action.payload.files;
    },
    clearSearch(state) {
      state.search.term = "";
      state.search.files = [];
    },
  },
});

function getClosedGroups() {
  const closed = localStorage.getItem("zesty:navMedia:closed");
  return closed ? JSON.parse(closed) : [];
}
function getHiddenGroups() {
  const hidden = localStorage.getItem("zesty:navMedia:hidden");
  return hidden ? JSON.parse(hidden) : [];
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
  highlightGroup,
  fetchFilesStart,
  fetchFilesSuccess,
  deleteFileSuccess,
  fileUploadStart,
  fileUploadProgress,
  fileUploadSuccess,
  fileUploadError,
  editFileSuccess,
  searchFilesStart,
  searchFilesError,
  searchFilesSuccess,
  clearSearch,
} = mediaSlice.actions;

function fetchBins(instanceID) {
  return (dispatch) => {
    return dispatch({
      type: "FETCH_RESOURCE",
      uri: `${CONFIG.SERVICE_MEDIA_MANAGER}/site/${instanceID}/bins`,
      handler: (res) => {
        if (res.status === 200) {
          return res.data;
        } else {
          dispatch(
            notify({
              message: `${res.status}: ${res.message}`,
              kind: "warn",
            })
          );
        }
      },
      error: (err) => {
        dispatch(
          notify({
            message: "Failed loading instance media bins",
            kind: "error",
          })
        );
        throw err;
      },
    });
  };
}

function fetchEcoBins(ecoID) {
  return (dispatch) => {
    return dispatch({
      type: "FETCH_RESOURCE",
      uri: `${CONFIG.SERVICE_MEDIA_MANAGER}/eco/${ecoID}/bins`,
      handler: (res) => {
        if (res.status === 200) {
          return res.data;
        } else {
          dispatch(
            notify({
              message: `${res.status}: ${res.message}`,
              kind: "warn",
            })
          );
        }
      },
      error: (err) => {
        dispatch(
          notify({
            message: "Failed loading ecosystem media bins",
            kind: "error",
          })
        );
        throw err;
      },
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
  return (dispatch) => {
    return request(`${CONFIG.SERVICE_MEDIA_MANAGER}/bin/${bin.id}`, {
      method: "PATCH",
      body: { ...bin, name: binName },
    }).then((res) => {
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
  return (dispatch) => {
    return dispatch({
      type: "FETCH_RESOURCE",
      uri: `${CONFIG.SERVICE_MEDIA_MANAGER}/bin/${binZUID}/groups`,
      handler: (res) => {
        if (res.status === 200) {
          return res.data;
        } else {
          dispatch(
            notify({ message: "Failed loading bin groups", kind: "error" })
          );
          throw res;
        }
      },
    });
  };
}

export function fetchAllGroups() {
  return (dispatch, getState) => {
    const groups = getState().media.groups;
    const binIDs = groups[0].children.concat(groups[1].children);
    return Promise.all(binIDs.map((id) => dispatch(fetchGroups(id)))).then(
      (groups) => {
        return dispatch(fetchGroupsSuccess(groups.flat()));
      }
    );
  };
}

export function createGroup(groupName, bin, group) {
  return (dispatch) => {
    return request(`${CONFIG.SERVICE_MEDIA_MANAGER}/group`, {
      body: {
        bin_id: bin.id,
        group_id: group.id,
        name: groupName,
      },
    }).then((res) => {
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
    const group = getState().media.groups[groupID];
    if (group) {
      const body = {
        ...pick(group, ["id", "group_id", "name"]),
        ...newGroupProperties,
      };
      return request(`${CONFIG.SERVICE_MEDIA_MANAGER}/group/${group.id}`, {
        method: "PATCH",
        body,
      }).then((res) => {
        if (res.status === 200) {
          dispatch(editGroupSuccess(res.data[0]));
        } else {
          dispatch(notify({ message: "Failed editing group", kind: "error" }));
          throw res;
        }
      });
    }
  };
}

export function deleteGroup(group) {
  return (dispatch) => {
    return request(`${CONFIG.SERVICE_MEDIA_MANAGER}/group/${group.id}`, {
      method: "DELETE",
    }).then((res) => {
      if (res.status === 200) {
        dispatch(deleteGroupSuccess(group));
        dispatch(
          notify({ message: `Deleted group ${group.name}`, kind: "default" })
        );
      } else {
        dispatch(notify({ message: "Failed deleting group", kind: "error" }));
        throw res;
      }
    });
  };
}

export function fetchBinFiles(binZUID) {
  return (dispatch) => {
    dispatch(fetchFilesStart({ group: binZUID }));
    return dispatch({
      type: "FETCH_RESOURCE",
      uri: `${CONFIG.SERVICE_MEDIA_MANAGER}/bin/${binZUID}/files`,
      handler: (res) => {
        if (res.status === 200) {
          dispatch(fetchFilesSuccess({ group: binZUID, files: res.data }));
        } else {
          dispatch(
            notify({ message: "Failed loading bin files", kind: "error" })
          );
          throw res;
        }
      },
    });
  };
}

export function fetchGroupFiles(groupZUID) {
  return (dispatch) => {
    dispatch(fetchFilesStart({ group: groupZUID }));
    return dispatch({
      type: "FETCH_RESOURCE",
      uri: `${CONFIG.SERVICE_MEDIA_MANAGER}/group/${groupZUID}`,
      handler: (res) => {
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
      },
    });
  };
}

export function uploadFile(file, bin) {
  return (dispatch, getState) => {
    function handleError() {
      dispatch(fileUploadError(file));
      dispatch(
        notify({
          message:
            "Failed uploading file. Individual file size must be 32MB or smaller",
          kind: "error",
        })
      );
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

    req.upload.addEventListener("progress", function (e) {
      file.progress = (e.loaded / e.total) * 100;
      dispatch(fileUploadProgress(file));
    });

    req.addEventListener("load", function (e) {
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
  return (dispatch) => {
    return request(`${CONFIG.SERVICE_MEDIA_MANAGER}/file/${file.id}`, {
      method: "DELETE",
    }).then((res) => {
      if (res.status === 200) {
        dispatch(deleteFileSuccess(file));
        dispatch(
          notify({ message: `Deleted file ${file.filename}`, kind: "default" })
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
    const file = getState().media.files.find((file) => file.id === fileID);
    const body = {
      ...pick(file, ["id", "group_id", "filename"]),
      ...fileProperties,
    };
    return request(`${CONFIG.SERVICE_MEDIA_MANAGER}/file/${file.id}`, {
      method: "PATCH",
      body,
    }).then((res) => {
      if (res.status === 200) {
        dispatch(editFileSuccess(res.data[0]));
        // show notification if user is editing file fields
        if (fileProperties.title || fileProperties.filename) {
          dispatch(
            notify({
              message: `Edited file ${fileProperties.filename}`,
              kind: "success",
            })
          );
        }
      } else {
        dispatch(notify({ message: "Failed editing file", kind: "error" }));
        throw res;
      }
    });
  };
}

export function searchFiles(term) {
  return (dispatch, getState) => {
    const groups = getState().media.groups;
    const visibleBins = groups[0].children.filter((id) => id.startsWith("1-"));
    const hiddenBins = groups[1].children.filter((id) => id.startsWith("1-"));
    if (term.startsWith("https://") || term.startsWith("http://")) {
      const termSplit = term.split("/");
      term = termSplit[termSplit.length - 1];
    }
    const queryParams = new URLSearchParams();
    queryParams.append("bins", visibleBins.concat(hiddenBins).join());
    queryParams.append("term", term);

    dispatch(searchFilesStart(term));
    return dispatch({
      type: "FETCH_RESOURCE",
      uri: `${
        CONFIG.SERVICE_MEDIA_MANAGER
      }/search/files?${queryParams.toString()}`,
      handler: (res) => {
        if (res.status === 200) {
          dispatch(searchFilesSuccess({ term, files: res.data }));
        } else {
          dispatch(notify({ message: "Failed file search", kind: "error" }));
          dispatch(searchFilesError());
          throw res;
        }
      },
    });
  };
}
