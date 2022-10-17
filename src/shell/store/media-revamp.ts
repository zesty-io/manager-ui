import { createSlice, current, Dispatch } from "@reduxjs/toolkit";
import { File as FileBase, Bin } from "../services/types";
import { AppState } from "./types";
import { notify } from "../../shell/store/notifications";
import { v4 as uuidv4 } from "uuid";
import { request } from "../../utility/request";

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

type FileUploadStart = StoreFile & { file: File };
type FileUploadSuccess = StoreFile & FileBase;
type FileUploadProgress = { uploadID: string; progress: number };
type FileUploadStage = { file: File; bin_id: string; group_id: string };

type StagedUpload = {
  status: "staged";
} & UploadFile;
type InProgressUpload = {
  status: "inProgress";
  progress: number;
} & UploadFile;
type FailedUpload = {
  status: "failed";
} & UploadFile;
type SuccessfulUpload = {
  status: "success";
} & UploadFile;

type Upload = StagedUpload | InProgressUpload | FailedUpload | SuccessfulUpload;
export type State = {
  uploads: Upload[];
  lockedToGroupId: string;
  isSelectDialog: boolean;
  selectedFiles: FileBase[];
  limitSelected: number | null;
};
const initialState: State = {
  uploads: [],
  lockedToGroupId: "",
  isSelectDialog: false,
  selectedFiles: [],
  limitSelected: null,
};

const mediaSlice = createSlice({
  name: "mediaRevamp",
  initialState,
  reducers: {
    fileUploadStage(state, action: { payload: FileUploadStage[] }) {
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

          state.uploads[index] = { ...oldData, status: "inProgress", ...data };
        }
      }
    },
    fileUploadReset(state) {
      state.uploads = [];
    },
    fileUploadProgress(state, action: { payload: FileUploadProgress }) {
      const uploadingFile = state.uploads.find(
        (file) => file.uploadID === action.payload.uploadID
      );
      if (uploadingFile) {
        uploadingFile.progress = action.payload.progress;
      }
    },
    fileUploadSuccess(state, action: { payload: FileUploadSuccess }) {
      const uploadingFile = state.uploads.find(
        (file) => file.uploadID === action.payload.uploadID
      );
      if (uploadingFile) {
        uploadingFile.loading = false;
        // uploadingFile.id = action.payload.id;
        // uploadingFile.title = action.payload.title;
        uploadingFile.filename = action.payload.filename;
        uploadingFile.url = action.payload.url;

        // drop in-memory file object
        // delete uploadingFile.file;
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
  },
});

// export mediaSlice;

export const {
  fileUploadStage,
  fileUploadReset,
  // fileUploadObjectRemove,
  fileUploadStart,
  fileUploadProgress,
  fileUploadSuccess,
  fileUploadError,
  setIsSelectDialog,
  selectFile,
  deselectFile,
  clearSelectedFiles,
  setLimitSelected,
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
export type UploadFile = {
  file: File;
  filename?: string;
  uploadID: string;
  url?: string;
  progress?: number;
  loading?: boolean;
  bin_id?: string;
  group_id?: string;
};
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
      /*
       TODO this needs to be updated in the ticket that handles error states
      */
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
      console.log("DONE");
      console.log(data);

      //   dispatch(fileUploadObjectRemove(file));
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
                dispatch(
                  fileUploadSuccess({
                    ...res.data,
                    uploadID: file.uploadID,
                  })
                );
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
export function dismissFileUploads() {
  return async (dispatch: Dispatch, getState: () => AppState) => {
    const state: State = getState().mediaRevamp;
    const stagedUploads = state.uploads.filter(
      (upload) => upload.status === "staged"
    );
    const failedUploads = state.uploads.filter(
      (upload) => upload.status === "failed"
    );
    const successfulUploads = state.uploads.filter(
      (upload) => upload.status === "success"
    );
    if (stagedUploads.some((file) => file.progress !== 100)) return;
    //const successfulUploads = state.stagedUploads.length;
    //const failedUploads = state.failedUploads.length;
    console.log({ successfulUploads, failedUploads, stagedUploads });
    if (successfulUploads) {
      dispatch(
        notify({
          message: `Successfully uploaded ${successfulUploads.length} files`,
          kind: "success",
        })
      );
    }
    if (failedUploads) {
      dispatch(
        notify({
          message: `Failed to upload ${failedUploads.length} files`,
          kind: "warn",
        })
      );
    }
    dispatch(fileUploadReset());
  };
}

export default mediaSlice.reducer;
