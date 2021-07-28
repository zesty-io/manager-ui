import { createSlice } from "@reduxjs/toolkit";

const slice = createSlice({
  name: "apps",
  initialState: {
    frames: [],
  },
  reducers: {
    registerFrame(state, action) {
      state.frames.push(action.payload);
    },
  },
});

export default slice.reducer;
export const { registerFrame } = slice.actions;
