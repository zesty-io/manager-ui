import { set } from "idb-keyval";
import { notify } from "shell/store/notifications";
import { request } from "utility/request";

export function files(state = [], action) {
  let files;

  switch (action.type) {
    case "LOADED_LOCAL_OPEN_FILES":
    case "FETCH_FILES_SUCCESS":
    case "FETCH_FILE_SUCCESS":
      /**
       * resolve if files loaded from local storage are out of sync with the API response data
       * `action.payload` contains remote files
       * `state` contains local store files
       */

      // Create "live" file map
      let liveFiles = action.payload.files
        .filter(file => file.status === "live")
        .reduce((acc, el) => {
          acc[el.ZUID] = el;
          return acc;
        }, {});

      // Remove "live" files. They should not be edited directly.
      let remoteFiles = action.payload.files.filter(
        file => file.status !== "live"
      );

      // Determine which remote files we do not have in our local store
      let remoteNotInLocal = remoteFiles
        .filter(remote => {
          let localFileExists = state.find(
            local =>
              local.ZUID === remote.ZUID && local.status === remote.status
          );
          if (localFileExists) {
            return false;
          } else {
            return true;
          }
        })
        .map(file => {
          file.synced = true;
          file.isLive = typeof file.isLive !== "undefined" ? file.isLive : true;
          return file;
        });

      // Determine which local files have changes and should not be replaced by their remote version
      let localFiles = state.map(local => {
        let remoteFile = remoteFiles.find(
          remote => remote.ZUID === local.ZUID && remote.status === local.status
        );

        if (remoteFile) {
          if (action.options && action.options.forceSync) {
            remoteFile.open = local.open;
            remoteFile.synced = true;
            return remoteFile;
          } else {
            if (local.dirty) {
              if (local.version !== remoteFile.version) {
                local.synced = false;
              }
              return local;
            } else {
              // Maintain open status of local files
              remoteFile.open = local.open;
              remoteFile.synced = true;
              remoteFile.isLive = local.isLive;
              remoteFile.publishedVersion = local.publishedVersion;

              return remoteFile;
            }
          }
        } else {
          local.isLive = local.isLive;
          return local;
        }
      });

      let combinedFiles = [...localFiles, ...remoteNotInLocal];

      // Check if other branchs are ahead of "live" and mark them as can be published
      combinedFiles.forEach(f => {
        let liveFile = liveFiles[f.ZUID];
        if (liveFile && liveFile.version) {
          f.publishedVersion = liveFile.version;

          if (f.version > liveFile.version) {
            f.isLive = false;
          }
        }
      });

      return combinedFiles;

    // case "UPDATE_FILE_VERSION":
    //   return state.map(file => {
    //     if (file.ZUID === action.payload.fileZUID) {
    //       return {
    //         ...file,
    //         latestVersion: action.payload.latestVersion,
    //         isLive: action.payload.isLive
    //       };
    //     }
    //     return file;
    //   });

    case "PUBLISH_FILE_SUCCESS":
      return state.map(file => {
        if (file.ZUID === action.payload.fileZUID) {
          return {
            ...file,
            isLive: true
          };
        }
        return file;
      });

    case "FETCH_FILE_VERSIONS_SUCCESS":
      return state.map(file => {
        if (file.ZUID === action.payload.fileZUID) {
          return {
            ...file,
            versions: action.payload.versions
          };
        }

        return file;
      });

    case "SAVE_FILE_SUCCESS":
      files = state.map(file => {
        if (file.ZUID === action.payload.file.ZUID) {
          return {
            ...file,
            version: 1 + action.payload.file.version,
            synced: true,
            dirty: false,
            isLive: false
          };
        }
        return file;
      });

      set(
        `${action.payload.instanceZUID}:openFiles`,
        files.filter(file => file.open)
      );

      return files;

    case "DELETE_FILE_SUCCESS":
      files = state.filter(file => {
        if (file.ZUID !== action.payload.fileZUID) {
          return file;
        }
      });

      // Make sure to udpate openFiles local storage
      set(
        `${action.payload.instanceZUID}:openFiles`,
        files.filter(file => file.open)
      );

      return files;

    case "UPDATE_FILE_CODE":
      files = state.map(file => {
        if (
          file.ZUID === action.payload.ZUID &&
          file.status === action.payload.status
        ) {
          return {
            ...file,
            code: action.payload.code,
            dirty: true,
            synced: true
          };
        }

        return file;
      });

      set(
        `${action.payload.instanceZUID}:openFiles`,
        files.filter(file => file.open)
      );

      return files;

    case "FILE_OPEN":
      files = state.map(file => {
        if (
          file.status === action.payload.env &&
          file.ZUID === action.payload.fileZUID
        ) {
          return {
            ...file,
            open: action.payload.open
          };
        } else {
          return file;
        }
      });

      set(
        `${action.payload.instanceZUID}:openFiles`,
        files.filter(file => file.open)
      );

      return files;

    default:
      return state;
  }
}

export function fileOpen(fileZUID, env, open) {
  return (dispatch, getState) => {
    dispatch({
      type: "FILE_OPEN",
      payload: {
        fileZUID,
        env,
        open,
        instanceZUID: getState().instance.ZUID
      }
    });
  };
}

export function fetchFiles(type) {
  return dispatch => {
    return request(`${CONFIG.API_INSTANCE}/web/${type}`)
      .then(res => {
        if (res.status === 200) {
          dispatch({
            type: "FETCH_FILES_SUCCESS",
            payload: {
              files: res.data
            }
          });
        } else {
          dispatch(
            notify({
              kind: "warn",
              message: `Failed to load instance ${type}. ${res.status} | ${res.error}`
            })
          );
        }

        return res;
      })
      .catch(err => {
        console.error(err);
        dispatch(
          notify({
            kind: "warn",
            message: err.message
          })
        );
      });
  };
}

export function updateFileCode(ZUID, status, code) {
  return (dispatch, getState) => {
    return dispatch({
      type: "UPDATE_FILE_CODE",
      payload: {
        ZUID,
        status,
        code,
        instanceZUID: getState().instance.ZUID
      }
    });
  };
}

export function fetchFile(fileZUID, fileType, options = { forceSync: false }) {
  return dispatch => {
    return request(`${CONFIG.API_INSTANCE}/web/${fileType}/${fileZUID}`).then(
      res => {
        if (res.status === 200) {
          dispatch(
            notify({
              message: `Loaded ${res.data.fileName} version ${res.data.version}`
            })
          );

          dispatch({
            type: "FETCH_FILE_SUCCESS",
            // Make shape match batch fetch responses so
            // we can send it down the same reducer which
            // determines local synced state files. Avoiding code duplication.
            payload: {
              files: [res.data]
            },
            options
          });
        }

        if (res.status === 404) {
          dispatch(
            notify({
              kind: "warn",
              message: `File could not be found. ${fileZUID}`
            })
          );
        }

        if (res.error) {
          dispatch(
            notify({
              kind: "warn",
              message: `Failed to load file. ${res.status} | ${res.error}`
            })
          );
        }

        return res;
      }
    );
  };
}

export function fetchFileVersions(fileZUID, fileType) {
  return dispatch => {
    return request(
      `${CONFIG.API_INSTANCE}/web/${fileType}/${fileZUID}/versions/`
    )
      .then(res => {
        if (res.status === 200) {
          // Larger version decending
          res.data.sort((a, b) => {
            return a.version > b.version ? -1 : 1;
          });

          dispatch({
            type: "FETCH_FILE_VERSIONS_SUCCESS",
            payload: {
              fileZUID,
              versions: res.data
            }
          });
        } else {
          dispatch(
            notify({
              kind: "warn",
              message: `Unable to load file versions. ${res.status}`
            })
          );
        }
        return res;
      })
      .catch(err => {
        console.error(err);
        notify({
          kind: "warn",
          message: "API error loading file versions"
        });
      });
  };
}

export function createFile(name, type, code = "") {
  const pathPart = resolvePathPart(type);
  return dispatch => {
    return request(`${CONFIG.API_INSTANCE}/web/${pathPart}`, {
      json: true,
      body: {
        filename: name,
        code,
        type
      }
    })
      .then(res => {
        // HACK passing through to invoking function so it can redirect to new file
        res.pathPart = pathPart;

        if (res.status === 201) {
          dispatch(
            notify({
              kind: "success",
              message: `Created new file ${name}`
            })
          );

          // File will be fetched when redirected to after creation
          dispatch({
            type: "CREATE_FILE_SUCCESS"
          });
        } else {
          dispatch(
            notify({
              kind: "warn",
              message: `Failed to create file ${name}. ${res.error}`
            })
          );
        }

        return res;
      })
      .catch(err => {
        console.error(err);
        dispatch(
          notify({
            kind: "warn",
            message: `Failed to create file ${name}. ${err}`
          })
        );
      });
  };
}

export function saveFile(ZUID, status) {
  return (dispatch, getState) => {
    const file = resolveFile(dispatch, getState().files, ZUID, status);
    const pathPart = resolvePathPart(file.type);

    // delete file.version;
    // delete file.versions;

    return request(`${CONFIG.API_INSTANCE}/web/${pathPart}/${ZUID}`, {
      method: "PUT",
      json: true,
      body: file
    })
      .then(res => {
        if (res.status === 200) {
          dispatch(
            notify({
              kind: "success",
              message: `Saved ${file.fileName}`
            })
          );

          dispatch({
            type: "SAVE_FILE_SUCCESS",
            payload: { file, instanceZUID: getState().instance.ZUID }
          });

          // re-render ActivePreview on code file save
          zesty.trigger("PREVIEW_REFRESH");

          // Re-fetch file to ensure we have latest version number
          return dispatch(fetchFile(file.ZUID, pathPart));
        } else {
          dispatch(
            notify({
              kind: "warn",
              message: `Failed to save file. ${res.status} | ${res.error}`
            })
          );
        }

        return res.data;
      })
      .catch(err => {
        console.error(err);
        dispatch(
          notify({
            kind: "warn",
            message: err.message
          })
        );
      });
  };
}

// export function saveLatestVersion(fileZUID, latestVersion) {
//   return (dispatch, getState) => {
//     const publishVersion = getState().files.find(
//       file => file.ZUID === fileZUID
//     );
//     if (latestVersion.version !== publishVersion.version) {
//       dispatch({
//         type: "UPDATE_FILE_VERSION",
//         payload: {
//           fileZUID,
//           latestVersion: latestVersion.version,
//           isLive: false
//         }
//       });
//     }
//   };
// }

export function publishFile(fileZUID, fileStatus) {
  return (dispatch, getState) => {
    const file = resolveFile(dispatch, getState().files, fileZUID, fileStatus);
    const pathPart = resolvePathPart(file.type);
    const latestVersion = file.latestVersion || file.version;

    return request(
      `${CONFIG.API_INSTANCE}/web/${pathPart}/${fileZUID}/versions/${latestVersion}?purge_cache=true`,
      {
        method: "POST"
      }
    )
      .then(res => {
        if (res.status === 200) {
          dispatch(
            notify({
              kind: "success",
              message: `Published ${file.fileName} version ${latestVersion}`
            })
          );

          dispatch({
            type: "PUBLISH_FILE_SUCCESS",
            payload: {
              fileZUID
            }
          });
        } else {
          dispatch(
            notify({
              kind: "warn",
              message: `Failed to publish file. ${res.status} | ${res.error}`
            })
          );
        }

        return res;
      })
      .catch(err => {
        console.error(err);
        dispatch(
          notify({
            kind: "warn",
            message: err.message
          })
        );
      });
  };
}

export function deleteFile(fileZUID, fileStatus) {
  return (dispatch, getState) => {
    const file = resolveFile(dispatch, getState().files, fileZUID, fileStatus);
    const pathPart = resolvePathPart(file.type);

    return request(`${CONFIG.API_INSTANCE}/web/${pathPart}/${fileZUID}`, {
      method: "DELETE",
      json: true
    })
      .then(res => {
        if (res.status === 200) {
          dispatch({
            type: "DELETE_FILE_SUCCESS",
            payload: {
              fileZUID,
              instanceZUID: getState().instance.ZUID
            }
          });
        } else {
          dispatch(
            notify({
              kind: "warn",
              message: `Failed to delete file ${file.fileName}. ${res.error}`
            })
          );
        }

        return res;
      })
      .catch(err => {
        console.log(err);
        dispatch(
          notify({
            kind: "warn",
            message: `API error occured trying to delete file. ${file.fileName}`
          })
        );
      });
  };
}

// util

export function resolveMonacoLang(fileName) {
  let language = "";
  switch (fileName.split(".").pop()) {
    case "xml":
    case "rss":
      language = "xml";
      break;
    case "md":
    case "markdown":
      language = "markdown";
      break;
    case "ts":
      language = "typescript";
      break;
    case "html":
      // Because we allow parsley in custom html files
      // language = "handlebars";
      language = "parsley";
      break;
    case "json":
      language = "json";
      break;
    case "js":
      language = "javascript";
      break;
    case "css":
      language = "css";
      break;
    case "less":
      language = "less";
      break;
    case "scss":
    case "sass":
      language = "scss";
      break;

    default:
      // language = "handlebars";
      language = "parsley";
      break;
  }

  return language;
}

export function resolvePathPart(type) {
  switch (type) {
    case "templateset":
    case "dataset":
    case "pageset":
    case "snippet":
    case "ajax-json":
    case "ajax-html":
    case "404":
      return "views";

    case "text/js":
    case "text/javascript":
      return "scripts";

    case "text/css":
    case "text/less":
    case "text/scss":
    case "text/sass":
      return "stylesheets";

    default:
      return type;
  }
}

function resolveFile(dispatch, files, fileZUID, fileStatus) {
  let file = files.find(
    file => file.ZUID === fileZUID && file.status === fileStatus
  );

  if (!file) {
    dispatch(
      notify({
        kind: "warn",
        message: "We were not able to find the file you are trying to save."
      })
    );
  }

  return { ...file };
}
