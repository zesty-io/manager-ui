import { createSlice, current, Dispatch } from "@reduxjs/toolkit";
import { File as FileBase, Bin } from "../services/types";
import { AppState } from "./types";
import { notify } from "../../shell/store/notifications";
import i18n from "../i18n";
import { v4 as uuidv4 } from "uuid";
import { request } from "../../utility/request";
import { mediaManagerApi } from "../services/mediaManager";
import Cookies from "js-cookie";

export type StoreFile = {
  uploadID: string;
  progress: number;
  loading: boolean;
  id?: string;
  title?: string;
  filename?: string;
  url?: string;
  preview?: string;
};

export type UploadFile = {
  file: File;
  filename?: string;
  title?: string;
  uploadID: string;
  url?: string;
  progress?: number;
  loading?: boolean;
  bin_id?: string;
  group_id?: string;
  replacementFile?: boolean;
};

type FileUploadStart = StoreFile & { file: File };
type FileUploadSuccess = StoreFile & FileBase & { id: string };
type FileUploadProgress = { uploadID: string; progress: number };
type FileUploadStageArg = {
  file: File;
  bin_id: string;
  group_id: string;
  replacementFile?: boolean;
};

type StagedUpload = {
  status: "staged";
  uploadID: string;
  url: string;
  filename: string;
} & FileUploadStageArg;
type InProgressUpload = {
  status: "inProgress";
  progress: number;
} & UploadFile;
type FailedUpload = {
  status: "failed";
} & UploadFile;
type SuccessfulUpload = Omit<
  {
    status: "success";
    id: string;
    filenameDirty: boolean;
  } & UploadFile,
  "file"
>;

export type Upload =
  | StagedUpload
  | InProgressUpload
  | FailedUpload
  | SuccessfulUpload;
export type MediaSortOrder = "createdDesc" | "alphaAsc" | "alphaDesc";
export type Filetype =
  | "Image"
  | "Video"
  | "Audio"
  | "PDF"
  | "Document"
  | "Presentation"
  | "Spreadsheet"
  | "Code"
  | "Font"
  | "Folder"
  | "Archive"
  | "PNG"
  | "JPEG"
  | "SVG"
  | "WEBP"
  | "GIF"
  | "MP4"
  | "WEBM"
  | "MOV"
  | "AVI"
  | "WMV"
  | "FLV"
  | "MPEG"
  | "AVIF";

export type DateRange = PresetDateRange | SingleDateRange | CustomDateRange;
export type PresetDateRange = {
  type: "preset";
  value:
    | "today"
    | "yesterday"
    | "last 7 days"
    | "last 30 days"
    | "last 3 months"
    | "last 12 months";
};

export type SingleDateRange = {
  type: "on" | "before" | "after";
  value: string;
};
export type CustomDateRange = {
  type: "range";
  value: [string, string];
};

export type State = {
  uploads: Upload[];
  lockedToGroupId: string;
  showHeaderActions: boolean;
  isSelectDialog: boolean;
  selectedFiles: FileBase[];
  limitSelected: number | null;
  sortOrder: MediaSortOrder;
  filetypeFilter: Filetype | null;
  dateRangeFilter: DateRange | null;
  currentMediaView: string;
  isReplace: boolean;
};
const initialState: State = {
  uploads: [],
  lockedToGroupId: "",
  showHeaderActions: false,
  isSelectDialog: false,
  selectedFiles: [],
  limitSelected: null,
  sortOrder: "createdDesc",
  filetypeFilter: null,
  dateRangeFilter: null,
  currentMediaView: "grid",
  isReplace: false,
};

const mediaSlice = createSlice({
  name: "mediaRevamp",
  initialState,
  reducers: {
    fileUploadStage(state, action: { payload: FileUploadStageArg[] }) {
      const newUploads = action.payload.map((file) => {
        return {
          status: "staged" as const,
          uploadID: uuidv4(),
          url: URL.createObjectURL(file.file),
          filename: file.file.name,
          replacementFile: file.replacementFile,
          ...file,
        };
      });
      state.uploads = [...state.uploads, ...newUploads];
    },

    // fileUploadObjectRemove(state, action: { payload: any }) {
    //   state.temp = state.temp.filter(file => file.uploadID !== action.payload.uploadID)
    // },

    fileUploadStart(state, action: { payload: FileUploadStart }) {
      const index = state.uploads.findIndex(
        (upload) =>
          upload.status === "staged" &&
          upload.uploadID === action.payload.uploadID
      );
      if (index !== -1) {
        const oldData = state.uploads[index];
        if (oldData.status === "staged") {
          const { file, ...rest } = action.payload;
          // Mutate the draft state directly. Immer will handle the immutable update.
          state.uploads[index] = { ...oldData, ...rest, status: "inProgress" };
        }
      }
    },
    fileUploadDelete(state, action: { payload: SuccessfulUpload }) {
      state.uploads = state.uploads.filter(
        (upload) =>
          upload.status !== "success" || action.payload.id !== upload.id
      );
    },
    fileUploadReset(state) {
      state.uploads = [];
    },
    fileUploadProgress(state, action: { payload: FileUploadProgress }) {
      const uploadingFile = state.uploads.find(
        (file) => file.uploadID === action.payload.uploadID
      );
      if (uploadingFile && uploadingFile.status === "inProgress") {
        uploadingFile.progress = action.payload.progress;
      }
    },
    fileUploadSetFilename(
      state,
      action: {
        payload: { upload: SuccessfulUpload; filename: string; title: string };
      }
    ) {
      const uploadIndex = state.uploads.findIndex(
        (upload) =>
          upload.status === "success" &&
          upload.uploadID === action.payload.upload.uploadID
      );
      if (uploadIndex !== -1) {
        const upload = state.uploads[uploadIndex];
        if (upload.status === "success") {
          upload.filename = action.payload.filename;
          upload.title = action.payload.title;
          upload.filenameDirty = true;
        }
      }
    },
    fileUploadSuccess(state, action: { payload: FileUploadSuccess }) {
      const index = state.uploads.findIndex(
        (file) => file.uploadID === action.payload.uploadID
      );
      if (index !== -1) {
        const uploadingFile = state.uploads[index];
        if (uploadingFile.status === "inProgress") {
          const { file, ...rest } = uploadingFile;
          const newUploadingFile = {
            ...rest,
            loading: false,
            filename: action.payload.filename,
            filenameDirty: false,
            url: action.payload.url,
            status: "success" as const,
            id: action.payload.id,
          };

          state.uploads[index] = newUploadingFile;
        }
      }
    },
    fileUploadError(state, action) {
      const fileIndex = state.uploads.findIndex(
        (file) => file.uploadID === action.payload.uploadID
      );
      if (fileIndex !== -1) {
        const { status, ...restFile } = state.uploads[
          fileIndex
        ] as InProgressUpload;
        state.uploads[fileIndex] = { status: "failed", ...restFile };
      }
    },
    setIsSelectDialog(state, action: { payload: boolean }) {
      state.isSelectDialog = action.payload;
    },
    setShowHeaderActions(state, action: { payload: boolean }) {
      state.showHeaderActions = action.payload;
    },
    setLimitSelected(state, action: { payload: number }) {
      state.limitSelected = action.payload;
    },
    setIsReplace(state, action: { payload: boolean }) {
      state.isReplace = action.payload;
    },
    selectFile(state, action: { payload: FileBase }) {
      if (
        state.limitSelected &&
        state.selectedFiles.length >= state.limitSelected
      )
        return;
      state.selectedFiles.push(action.payload);
    },
    deselectFile(state, action: { payload: FileBase }) {
      const index = state.selectedFiles.findIndex(
        (file) => file.id === action.payload.id
      );
      if (index !== -1) {
        state.selectedFiles.splice(index, 1);
      }
    },
    clearSelectedFiles(state) {
      state.selectedFiles = [];
    },
    setCurrentMediaView(state, action: { payload: string }) {
      state.currentMediaView = action.payload;
    },
  },
});

// export mediaSlice;

export const {
  fileUploadStage,
  fileUploadReset,
  fileUploadDelete,
  fileUploadStart,
  fileUploadProgress,
  fileUploadSetFilename,
  fileUploadSuccess,
  fileUploadError,
  setIsSelectDialog,
  setShowHeaderActions,
  selectFile,
  deselectFile,
  clearSelectedFiles,
  setLimitSelected,
  setCurrentMediaView,
  setIsReplace,
} = mediaSlice.actions;

/*
export function uploadFile2(file: { name: string; type: string }) {
  return async (dispatch: Dispatch) => {
    console.log({ file });
    dispatch(fileUploadStart(file));
  };
}
*/

type FileAugmentation = {
  filename?: string;
  uploadID: string;
  url?: string;
  progress: number;
  loading: boolean;
  bin_id?: string;
  group_id?: string;
};

async function getSignedUrl(filename: string, storageName: string) {
  try {
    return request(
      //@ts-expect-error
      `${CONFIG.SERVICE_MEDIA_STORAGE}/signed-url/${storageName}/${filename}`
    ).then((res) => res.data.url);
  } catch (err) {
    console.error(err);
    notify({
      kind: "warn",
      message: i18n.t("media.notifyFailedSignedUrl"),
    });
  }
}

export function replaceFile(newFile: UploadFile, originalFile: FileBase) {
  return async (dispatch: Dispatch, getState: () => AppState) => {
    // By checking the state inside the thunk, we get the most up-to-date
    // status and prevent any race conditions from the component layer.
    const { uploads } = getState().mediaRevamp;
    const existingUpload = uploads.find(
      (upload) => upload.uploadID === newFile.uploadID
    );

    if (!existingUpload || existingUpload.status !== "staged") {
      return;
    }

    const bodyData = new FormData();
    const req = new XMLHttpRequest();
    const file = {
      progress: 0,
      loading: true,
      ...newFile,
    };

    dispatch(fileUploadStart(file));

    bodyData.append("file", file.file, originalFile.filename);
    bodyData.append("file_id", originalFile.id);

    req.upload.addEventListener("progress", function (e) {
      file.progress = (e.loaded / e.total) * 100;

      dispatch(fileUploadProgress(file));
    });

    function handleError() {
      dispatch(fileUploadError(file));
      dispatch(
        notify({
          message: i18n.t("media.notifyUploadFailed"),
          kind: "error",
        })
      );
    }

    req.addEventListener("abort", handleError);
    req.addEventListener("error", handleError);
    req.addEventListener("load", (_) => {
      if (req.status === 200) {
        dispatch(
          notify({
            message: i18n.t("media.notifyFileReplaced", {
              filename: originalFile.filename,
            }),
            kind: "success",
          })
        );
        const successFile = {
          ...originalFile,
          uploadID: file.uploadID,
          progress: 100,
          loading: false,
          url: URL.createObjectURL(file.file),
        };
        dispatch(fileUploadSuccess(successFile));
      } else {
        dispatch(
          notify({
            message: i18n.t("media.notifyUploadFailed"),
            kind: "error",
          })
        );
        dispatch(fileUploadError(file));
      }
    });

    // Use signed url flow for large files
    if (file.file.size > 32000000) {
      /**
       * GAE has an inherent 32mb limit at their global nginx load balancer
       * We use a signed url for large file uploads directly to the assocaited bucket
       */

      const signedUrl = await getSignedUrl(
        originalFile?.filename,
        originalFile?.storage_name
      );
      req.open("PUT", signedUrl);

      // The sent content-type needs to match what was provided when generating the signed url
      // @see https://medium.com/imersotechblog/upload-files-to-google-cloud-storage-gcs-from-the-browser-159810bb11e3
      req.setRequestHeader("Content-Type", file.file.type);

      req.addEventListener("load", () => {
        if (req.status === 200) {
          return request(
            //@ts-expect-error
            `${CONFIG.SERVICE_MEDIA_MANAGER}/file/${originalFile?.id}/purge?triggerUpdate=true`,
            {
              method: "POST",
              json: true,
            }
          )
            .then((res) => {
              if (res.status === 200) {
                const state: State = getState().mediaRevamp;
                if (state.uploads.length) {
                  dispatch(
                    fileUploadSuccess({
                      ...res.data,
                      uploadID: file.uploadID,
                    })
                  );
                } else {
                  dispatch(
                    notify({
                      message: i18n.t("media.notifyUploadSuccess"),
                      kind: "success",
                    })
                  );
                }
              } else {
                throw res;
              }
            })
            .catch((err) => {
              dispatch(fileUploadError(file));
              dispatch(
                notify({
                  message: i18n.t("media.notifyFailedCreateRecord"),
                  kind: "error",
                })
              );
            });
        } else {
          dispatch(fileUploadError(file));
          dispatch(
            notify({
              message: i18n.t("media.notifyFailedUploadSignedUrl"),
              kind: "error",
            })
          );
        }
      });

      // When sending directly to bucket it needs to be just the file
      // and not the extra meta data for the zesty services
      req.send(file.file);
    } else {
      req.open(
        "PUT",
        //@ts-expect-error
        `${CONFIG.SERVICE_MEDIA_STORAGE}/replace/${originalFile?.storage_driver}/${originalFile?.storage_name}`
      );

      const token = Cookies.get(CONFIG.COOKIE_NAME);
      if (token) {
        req.setRequestHeader("Authorization", `Bearer ${token}`);
      }

      req.send(bodyData);
    }
  };
}

//type FileMonstrosity = {file: File } & FileAugmentation & FileBase
export function uploadFile(fileArg: UploadFile, bin: Bin) {
  return async (dispatch: Dispatch, getState: () => AppState) => {
    // By checking the state inside the thunk, we get the most up-to-date
    // status and prevent any race conditions from the component layer.
    const { uploads } = getState().mediaRevamp;
    const existingUpload = uploads.find(
      (upload) => upload.uploadID === fileArg.uploadID
    );

    if (!existingUpload || existingUpload.status !== "staged") {
      return;
    }

    const userZUID = getState().user.ZUID;
    const data = new FormData();
    const req = new XMLHttpRequest();

    const file = {
      progress: 0,
      loading: true,
      ...fileArg,
    };
    dispatch(fileUploadStart(file));

    /*
    file.filename = file.file.name;
    file.uploadID = uuidv4();
    file.progress = 0;
    file.loading = true;
    file.url = URL.createObjectURL(file.file);
    */

    data.append("file", file.file);
    data.append("bin_id", file.bin_id);
    data.append("group_id", file.group_id);
    data.append("user_id", userZUID);

    req.upload.addEventListener("progress", function (e) {
      file.progress = (e.loaded / e.total) * 100;
      dispatch(fileUploadProgress(file));
    });

    function handleError() {
      dispatch(fileUploadError(file));
      dispatch(
        notify({
          message: i18n.t("media.notifyUploadFailed"),
          kind: "error",
        })
      );
    }

    req.addEventListener("abort", handleError);
    req.addEventListener("error", handleError);

    req.addEventListener("load", (data) => {
      const state: State = getState().mediaRevamp;
      if (!state.uploads.length) {
        dispatch(
          notify({
            message: i18n.t("media.notifyUploadSuccess"),
            kind: "success",
          })
        );
        dispatch(
          mediaManagerApi.util.invalidateTags([
            "BinFiles",
            { type: "GroupData", id: file.group_id },
          ])
        );
      }
    });

    // Use signed url flow for large files
    if (file.file.size > 32000000) {
      /**
       * GAE has an inherent 32mb limit at their global nginx load balancer
       * We use a signed url for large file uploads directly to the assocaited bucket
       */

      const signedUrl = await getSignedUrl(file.file.name, bin.storage_name);
      req.open("PUT", signedUrl);

      // The sent content-type needs to match what was provided when generating the signed url
      // @see https://medium.com/imersotechblog/upload-files-to-google-cloud-storage-gcs-from-the-browser-159810bb11e3
      req.setRequestHeader("Content-Type", file.file.type);

      req.addEventListener("load", () => {
        if (req.status === 200) {
          //@ts-expect-error
          return request(`${CONFIG.SERVICE_MEDIA_MANAGER}/file`, {
            method: "POST",
            json: true,
            body: {
              bin_id: file.bin_id,
              group_id: file.group_id,
              created_by: userZUID,
              filename: file.filename,
              title: file.filename,
              cdnUrl: `${bin.cdn_base_url}/${file.filename}`,
            },
          })
            .then((res) => {
              if (res.status === 201) {
                const state: State = getState().mediaRevamp;
                if (state.uploads.length) {
                  dispatch(
                    fileUploadSuccess({
                      ...res.data,
                      uploadID: file.uploadID,
                    })
                  );
                } else {
                  dispatch(
                    notify({
                      message: i18n.t("media.notifyUploadSuccess"),
                      kind: "success",
                    })
                  );
                  dispatch(
                    mediaManagerApi.util.invalidateTags([
                      "BinFiles",
                      { type: "GroupData", id: file.group_id },
                    ])
                  );
                }
              } else {
                throw res;
              }
            })
            .catch((err) => {
              console.error(err);
              dispatch(fileUploadError(file));
              dispatch(
                notify({
                  message: i18n.t("media.notifyFailedCreateRecord"),
                  kind: "error",
                })
              );
            });
        } else {
          dispatch(fileUploadError(file));
          dispatch(
            notify({
              message: i18n.t("media.notifyFailedUploadSignedUrl"),
              kind: "error",
            })
          );
        }
      });

      // When sending directly to bucket it needs to be just the file
      // and not the extra meta data for the zesty services
      req.send(file.file);
    } else {
      // NOTE: historic method for file uploads. We may want to consider replacing
      // this with the signed url flow, regardless of file size

      req.open(
        "POST",
        //@ts-expect-error
        `${CONFIG.SERVICE_MEDIA_STORAGE}/upload/${bin.storage_driver}/${bin.storage_name}`
      );

      // This is posting to a Zesty service so it must include credentials
      const token = Cookies.get(CONFIG.COOKIE_NAME);
      if (token) {
        req.setRequestHeader("Authorization", `Bearer ${token}`);
      }
      req.addEventListener("load", () => {
        if (req.status === 201) {
          console.log(req);
          const response = JSON.parse(req.response);
          const uploadedFile = response.data[0];
          uploadedFile.uploadID = file.uploadID;
          dispatch(fileUploadSuccess(uploadedFile));
        } else {
          dispatch(
            notify({
              message: i18n.t("media.notifyUploadFailed"),
              kind: "error",
            })
          );
          dispatch(fileUploadError(file));
        }
      });

      req.send(data);
    }
  };
}
export function deleteUpload(upload: SuccessfulUpload) {
  console.log({ upload });
  return async (dispatch: Dispatch) => {
    const res = request(
      //@ts-expect-error
      `${CONFIG.SERVICE_MEDIA_MANAGER}/file/${upload.id}`,
      {
        method: "DELETE",
      }
    );
    dispatch(fileUploadDelete(upload));
    // if (res.status === 200) {
    //   dispatch(fileUploadDelete(upload));
    // } else {
    //   dispatch(notify({ message: "Failed cancel upload", kind: "error" }));
    //   throw res;
    // }
  };
}
export function dismissFileUploads() {
  return async (dispatch: Dispatch, getState: () => AppState) => {
    const state: State = getState().mediaRevamp;
    const inProgressUploads = state.uploads.filter(
      (upload) => upload.status === "inProgress"
    ) as unknown as StagedUpload[];
    const failedUploads = state.uploads.filter(
      (upload) => upload.status === "failed"
    ) as FailedUpload[];
    const successfulUploads = state.uploads.filter(
      (upload) => upload.status === "success"
    ) as SuccessfulUpload[];

    // if (
    //   block &&
    //   state.uploads.some(
    //     (file) => file.status === "staged" || file.status === "inProgress"
    //   )
    // )
    //   return;
    //const successfulUploads = state.stagedUploads.length;
    //const failedUploads = state.failedUploads.length;
    const reqs = successfulUploads
      .filter((upload) => upload.status === "success" && upload.filenameDirty)
      .map((upload) => {
        return request(
          //@ts-expect-error
          `${CONFIG.SERVICE_MEDIA_MANAGER}/file/${upload.id}`,
          {
            method: "PATCH",
            body: {
              id: upload.id,
              group_id: upload.group_id,
              filename: upload.filename,
              ...(upload?.title ? { title: upload.title } : {}),
            },
          }
        );
      });
    const res = await Promise.all(reqs);
    const failedTitleUpdates = res.filter((r) => r.status !== 200).length;
    if (inProgressUploads.length) {
      dispatch(
        notify({
          message: i18n.t("media.notifyFilesInProgress", {
            count: inProgressUploads.length,
          }),
          kind: "success",
        })
      );
    }
    if (successfulUploads.length) {
      if (!successfulUploads[0].replacementFile) {
        dispatch(
          notify({
            message: inProgressUploads.length
              ? i18n.t("media.notifyUploadedMultipleWithProgress", {
                  count: successfulUploads.length,
                  inProgress: inProgressUploads.length,
                })
              : i18n.t("media.notifyUploadedMultiple", {
                  count: successfulUploads.length,
                }),
            kind: "success",
          })
        );
      }
    }
    if (failedUploads.length) {
      dispatch(
        notify({
          message: i18n.t("media.notifyUploadFailedMultiple", {
            count: failedUploads.length,
          }),
          kind: "warn",
        })
      );
    }
    if (failedTitleUpdates) {
      dispatch(
        notify({
          message: i18n.t("media.notifyMetadataFailedMultiple", {
            count: failedTitleUpdates,
          }),
          kind: "warn",
        })
      );
    } else {
      successfulUploads?.forEach((upload) => {
        dispatch(
          mediaManagerApi.util.invalidateTags([{ type: "File", id: upload.id }])
        );
      });
    }
    dispatch(fileUploadReset());
  };
}

export default mediaSlice.reducer;
