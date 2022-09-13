import { createSlice, current, Dispatch } from "@reduxjs/toolkit";

import { enableMapSet } from "immer";

enableMapSet();

const mediaSlice = createSlice({
  name: "mediaRevamp",
  initialState: {
    filesToUpload: [],
    thing: "test",
  },
  reducers: {
    fileUploadStart(state, action) {
      console.log({ action });
      const { file, ...data } = action.payload;
      //state.filesToUpload.push(action.payload);
      state.filesToUpload = [...state.filesToUpload, data];
    },
  },
});

export const { fileUploadStart } = mediaSlice.actions;

export function uploadFile(file: any) {
  return async (dispatch: Dispatch) => {
    console.log({ file });
    dispatch(fileUploadStart(file));
  };
}

export default mediaSlice.reducer;
