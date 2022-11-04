import { createSlice, current, Dispatch } from "@reduxjs/toolkit";
import { File as FileBase, Bin } from "../services/types";
import { AppState } from "./types";
import { notify } from "../../shell/store/notifications";
import { v4 as uuidv4 } from "uuid";
import { request } from "../../utility/request";
import { mediaManagerApi } from "../services/mediaManager";

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
};

type FileUploadStart = StoreFile & { file: File };
type FileUploadSuccess = StoreFile & FileBase & { id: string };
type FileUploadProgress = { uploadID: string; progress: number };
type FileUploadStageArg = { file: File; bin_id: string; group_id: string };

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
  | "Images"
  | "Videos"
  | "Audio"
  | "PDFs"
  | "Documents"
  | "Presentations"
  | "Spreadsheets"
  | "Code"
  | "Fonts"
  | "Archives";
export type State = {
  uploads: Upload[];
  lockedToGroupId: string;
  showHeaderActions: boolean;
  isSelectDialog: boolean;
  selectedFiles: FileBase[];
  limitSelected: number | null;
  sortOrder: MediaSortOrder;
  filetypeFilter: Filetype | null;
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
          const { file, ...data } = action.payload;
          const uploads = [...state.uploads];

          uploads[index] = { ...oldData, ...data, status: "inProgress" };
          return { ...state, uploads };
        }
      }
      return state;
    },
    fileUploadDelete(state, action: { payload: SuccessfulUpload }) {
      const uploads = state.uploads.filter(
        (upload) =>
          upload.status !== "success" || action.payload.id !== upload.id
      );
      return { ...state, uploads };
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
          const uploads = [...state.uploads];
          uploads[index] = newUploadingFile;
          return { ...state, uploads };

          //uploadingFile.loading = false;
          // uploadingFile.id = action.payload.id;
          // uploadingFile.title = action.payload.title;
          //uploadingFile.filename = action.payload.filename;
          //uploadingFile.url = action.payload.url;
          //uploadingFile.status = 'success'

          // drop in-memory file object
          // delete uploadingFile.file;
        }
      }
      return state;
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
    setSortOrder(state, action: { payload: MediaSortOrder }) {
      state.sortOrder = action.payload;
    },
    setFiletypeFilter(state, action: { payload: Filetype }) {
      state.filetypeFilter = action.payload;
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
  setSortOrder,
  setFiletypeFilter,
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

async function getSignedUrl(file: any, bin: Bin) {
  try {
    return request(
      //@ts-expect-error
      `${CONFIG.SERVICE_MEDIA_STORAGE}/signed-url/${bin.storage_name}/${file.file.name}`
    ).then((res) => res.data.url);
  } catch (err) {
    console.error(err);
    notify({
      kind: "warn",
      message: "Failed getting signed url for large file upload",
    });
  }
}

//type FileMonstrosity = {file: File } & FileAugmentation & FileBase
export function uploadFile(fileArg: UploadFile, bin: Bin) {
  return async (dispatch: Dispatch, getState: () => AppState) => {
    const userZUID = getState().user.ZUID;
    const data = new FormData();
    const req = new XMLHttpRequest();

    const file = {
      progress: 0,
      loading: true,
      ...fileArg,
    };
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
          message: "Failed uploading file",
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
            message: `Successfully uploaded file`,
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

    if (file.file.size > 32000000) {
      /**
       * GAE has an inherent 32mb limit at their global nginx load balancer
       * We use a signed url for large file uploads directly to the assocaited bucket
       */

      const signedUrl = await getSignedUrl(file, bin);
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
                      message: `Successfully uploaded file`,
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
                  message:
                    "Failed creating file record after signed url upload",
                  kind: "error",
                })
              );
            });
        } else {
          dispatch(fileUploadError(file));
          dispatch(
            notify({
              message: "Failed uploading file to signed url",
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

      // This is posting to a Zesty service so it must include credentials
      req.withCredentials = true;
      req.open(
        "POST",
        //@ts-expect-error
        `${CONFIG.SERVICE_MEDIA_STORAGE}/upload/${bin.storage_driver}/${bin.storage_name}`
      );
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
              message: "Failed uploading file",
              kind: "error",
            })
          );
          dispatch(fileUploadError(file));
        }
      });

      req.send(data);
    }

    dispatch(fileUploadStart(file));
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
    ) as StagedUpload[];
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
          message: `${inProgressUploads.length} files still in progress`,
          kind: "success",
        })
      );
    }
    if (successfulUploads.length) {
      dispatch(
        notify({
          message: `Successfully uploaded ${successfulUploads.length} files${
            inProgressUploads.length
              ? `...${inProgressUploads.length} files still in progress`
              : ""
          }`,
          kind: "success",
        })
      );
    }
    if (failedUploads.length) {
      dispatch(
        notify({
          message: `Failed to upload ${failedUploads.length} files`,
          kind: "warn",
        })
      );
    }
    if (failedTitleUpdates) {
      dispatch(
        notify({
          message: `Failed to update metadata of ${failedTitleUpdates} files`,
          kind: "warn",
        })
      );
    }
    dispatch(fileUploadReset());
  };
}

export default mediaSlice.reducer;
