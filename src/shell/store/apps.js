import { createSlice } from "@reduxjs/toolkit";

const slice = createSlice({
  name: "apps",
  initialState: {
    frames: [],
    installed: [
      {
        zuid: "content-designer",
        name: "Content Designer",
        url: `http://${window.location.hostname}:3000`,
      },
    ],
  },
  reducers: {
    registerFrame(state, action) {
      state.frames.push(action.payload);
    },
  },
});

export default slice.reducer;
export const { registerFrame } = slice.actions;

// fetch installed apps from appi
export function fetchApps() {}
