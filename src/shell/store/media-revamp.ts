import { createSlice, current, Dispatch } from "@reduxjs/toolkit";

const mediaSlice = createSlice({
  name: "mediaRevamp",
  initialState: {
    filesToUpload: [],
    thing: "test",
  },
  reducers: {
    fileUploadStart(state, action) {
      const { name, type } = action.payload;
      state.filesToUpload = [...state.filesToUpload, { name, type }];
    },
  },
});

export const { fileUploadStart } = mediaSlice.actions;

export function uploadFile(file: { name: string; type: string }) {
  return async (dispatch: Dispatch) => {
    console.log({ file });
    dispatch(fileUploadStart(file));
  };
}

export default mediaSlice.reducer;
