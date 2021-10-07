import { createSlice } from "@reduxjs/toolkit";

const slice = createSlice({
  name: "apps",
  initialState: {
    frames: {},
    installed: [
      {
        zuid: "50-XOX-XOXOX",
        name: "Content Designer",
        label: "content-designer",
        public: true,
        approved: true,
        url: `http://parsely.zesty.io:3000/`,
      },
    ],
    registered: [
      // TODO load all public and available private apps
    ],
  },
  reducers: {
    registerFrame(state, action) {
      // state.frames.push(action.payload);

      state.frames[action.payload.zuid] = action.payload.frame;
    },
  },
});

export default slice.reducer;
export const { registerFrame } = slice.actions;

// fetch installed apps from appi
export function fetchApps() {}
