import { Middleware } from "redux";

// The three content writes Studio can stage, and the slice of the item each
// one writes into.
const SLICE_BY_TYPE = {
  SET_ITEM_DATA: "data",
  SET_ITEM_WEB: "web",
  SET_ITEM_META: "meta",
} as const;

export type StudioHistoryContentType = keyof typeof SLICE_BY_TYPE;

export type StudioHistoryContentWrite = {
  type: StudioHistoryContentType;
  itemZUID: string;
  key: string;
  // The value the write replaced, read from the store before the reducer ran.
  before: unknown;
  // Whether the item was already dirty before this write.
  wasDirty: boolean;
};

type Recorder = (write: StudioHistoryContentWrite) => void;

let recorder: Recorder | null = null;

// Studio's undo history installs a recorder while it is mounted and clears it
// on unmount. With none installed this middleware is a pass-through, so the
// content editor and everything else are unaffected.
export const setStudioHistoryRecorder = (next: Recorder | null) => {
  recorder = next;
};

// Content writes reach the store from three places in Studio — the canvas
// `input` echo, the side panel's Editor and the AI's field handle — and all
// three dispatch one of these actions. Recording here sees every origin
// without touching any of them.
export const studioHistory: Middleware = (store) => (next) => (action) => {
  const slice =
    recorder &&
    (SLICE_BY_TYPE as Record<string, "data" | "web" | "meta">)[action?.type];
  if (!slice) return next(action);

  // The reducer ignores a write to an item it does not hold, so there is
  // nothing to record either.
  const item = store.getState().content?.[action.itemZUID];
  const result = next(action);
  if (item) {
    recorder?.({
      type: action.type,
      itemZUID: action.itemZUID,
      key: action.key,
      before: item[slice]?.[action.key],
      wasDirty: !!item.dirty,
    });
  }
  return result;
};
