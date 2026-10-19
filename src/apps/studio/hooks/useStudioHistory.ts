import { useCallback, useEffect, useRef, useState } from "react";
import { isEqual } from "lodash";
import { flushAllDebouncedInputs } from "shell/hooks/useDebouncedInput";
import {
  setStudioHistoryRecorder,
  StudioHistoryContentType,
  StudioHistoryContentWrite,
} from "shell/store/middleware/studioHistory";
import { ConnectField } from "./studioTypes";
import { LayoutRegionSnapshot } from "./useLayoutReorderState";
import { StudioAiState } from "./useStudioAiEdit";

// Oldest steps are evicted past this many.
const MAX_STEPS = 50;

export type StudioHistoryDirection = "undo" | "redo";

type ContentEntry = {
  type: StudioHistoryContentType;
  itemZUID: string;
  key: string;
  before: unknown;
  after: unknown;
};

type Change<T> = { before: T; after: T };

// One undoable step. `before` is captured on the step's first touch of each
// key and `after` is read when the step closes, so a step that coalesces many
// writes to one target holds only its two ends.
type Step = {
  id: number;
  // The target the step coalesces on, or a bulk kind from beginStep.
  key: string;
  bulk: boolean;
  content: Map<string, ContentEntry>;
  layout: Map<string, Change<LayoutRegionSnapshot>>;
  connected: Map<string, Change<ConnectField | undefined>>;
  ai?: Change<StudioAiState>;
};

// What history sends the bridge.
type StudioHistoryCommand =
  | {
      action: "historySnapshot";
      stepId: number;
      codeIds: string[];
      fields: { fieldZuid: string; itemZuid: string }[];
    }
  | {
      action: "historyRestore";
      stepId: number;
      direction: StudioHistoryDirection;
    }
  | { action: "historyDrop"; stepIds: number[] }
  | { action: "historyReset" };

type Args = {
  // The bridge can snapshot and restore regions (BRIDGE_READY capabilities).
  enabled: boolean;
  // Undo and redo wait while true: an AI request or render in flight, a save,
  // or a canvas reload.
  blocked: boolean;
  dispatch: (action: any) => any;
  // `any` because the content and fields slices are untyped (AppState TODO).
  getState: () => any;
  postCommandToBridge: (cmd: StudioHistoryCommand) => void;
  // Lands every debounced Inspector write, so a closing step holds it.
  flushPendingPatches: () => string[];
  cancelAllPendingPatches: () => void;
  getLayoutRegionSnapshot: (codeId: string) => LayoutRegionSnapshot;
  restoreLayoutRegions: (
    snapshots: Record<string, LayoutRegionSnapshot>
  ) => void;
  getConnectedSlots: () => Record<string, ConnectField>;
  restoreConnectedSlots: (
    patch: Record<string, ConnectField | undefined>
  ) => void;
  getAiState: () => StudioAiState;
  restoreAiState: (state: StudioAiState) => void;
  // Run around every undo/redo, for host state that has to follow the
  // restored canvas (selection, echo guards).
  onBeforeApply?: () => void;
  // The content values the undo/redo just wrote, for editors that only read
  // their value when they mount.
  onApplied?: (contentWrites: AppliedContentWrite[]) => void;
  // Whether a modal over Studio owns the keyboard. Undo/redo stays out of
  // its way: what it would change is behind it.
  isModalOpen?: (target: EventTarget | null) => boolean;
};

export type AppliedContentWrite = {
  type: StudioHistoryContentType;
  itemZUID: string;
  key: string;
  value: unknown;
};

const hasEntries = (step: Step) =>
  step.content.size > 0 ||
  step.layout.size > 0 ||
  step.connected.size > 0 ||
  !!step.ai;

const isUnchanged = <T>({ before, after }: Change<T>) => isEqual(before, after);

// A step whose every entry ended where it started — typed and then deleted —
// is not worth an undo.
const isNoop = (step: Step) =>
  Array.from(step.content.values()).every(isUnchanged) &&
  Array.from(step.layout.values()).every(isUnchanged) &&
  Array.from(step.connected.values()).every(isUnchanged) &&
  (!step.ai || isUnchanged(step.ai));

const isEditableTarget = (target: EventTarget | null) => {
  if (!(target instanceof HTMLElement)) return false;
  if (["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName)) return true;
  if (target.isContentEditable) return true;
  // TinyMCE keeps its own undo stack.
  return !!target.closest(".tox, [contenteditable]");
};

// Undo/redo for everything Studio stages before a save: content values,
// view source and its pending-save state, connected-field labels and an AI
// change. The canvas DOM is restored by the bridge from snapshots it takes
// when each step closes, so no per-gesture inverse exists anywhere.
//
// Every frame reload — save, discard, path or language change, refresh —
// resets the stack, because the bridge's snapshots die with the frame.
export const useStudioHistory = (args: Args) => {
  const argsRef = useRef(args);
  argsRef.current = args;

  const stepsRef = useRef<Step[]>([]);
  // How many of `steps` are applied: steps[pointer - 1] is the next undo,
  // steps[pointer] the next redo.
  const pointerRef = useRef(0);
  const openRef = useRef<Step | null>(null);
  const nextIdRef = useRef(1);
  const applyingRef = useRef(false);
  // Pointer 0 is the last save until a step is evicted past it.
  const baseIsSavedRef = useRef(true);
  // Whether each item touched since the reset was dirty before its first
  // write. Undoing back to a saved base clears the dirty flag only on items
  // that were clean there.
  const baseDirtyRef = useRef(new Map<string, boolean>());

  // The stack lives in refs so writes can record synchronously; this only
  // re-renders the buttons.
  const [, setVersion] = useState(0);
  const bump = useCallback(() => setVersion((prev) => prev + 1), []);

  const openStep = useCallback((key: string, bulk: boolean): Step => {
    const step: Step = {
      id: nextIdRef.current++,
      key,
      bulk,
      content: new Map(),
      layout: new Map(),
      connected: new Map(),
    };
    if (key === "ai") {
      const ai = argsRef.current.getAiState();
      step.ai = { before: ai, after: ai };
    }
    openRef.current = step;
    return step;
  }, []);

  // Drops the oldest step. The bridge folds a dropped step into its base when
  // no remaining step is older, so the regions it touched stay restorable to
  // its after-state; only ever the oldest is dropped this way.
  const evictOldest = useCallback(() => {
    const evicted = stepsRef.current.shift();
    if (!evicted) return;
    pointerRef.current--;
    // Pointer 0 now holds the evicted step's edits, not the last save.
    baseIsSavedRef.current = false;
    argsRef.current.postCommandToBridge({
      action: "historyDrop",
      stepIds: [evicted.id],
    });
  }, []);

  // Closes the open step: lands debounced writes into it, reads every after,
  // drops it if nothing changed, and otherwise pushes it and asks the bridge
  // to snapshot what it touched. A bulk step (a reorder, an AI turn) only
  // closes when forced, so a selection change mid-way cannot split it.
  const closeStep = useCallback(
    (force = true) => {
      const step = openRef.current;
      if (!step || applyingRef.current) return;
      if (step.bulk && !force) return;
      const {
        flushPendingPatches,
        getState,
        getLayoutRegionSnapshot,
        getConnectedSlots,
        getAiState,
        postCommandToBridge,
      } = argsRef.current;

      // Still open while it flushes, so the flushed writes land in it.
      flushPendingPatches();
      openRef.current = null;

      const content = getState().content || {};
      const fields = getState().fields || {};
      const fieldRefs: { fieldZuid: string; itemZuid: string }[] = [];
      step.content.forEach((entry) => {
        const slice =
          entry.type === "SET_ITEM_DATA"
            ? "data"
            : entry.type === "SET_ITEM_WEB"
            ? "web"
            : "meta";
        const item = content[entry.itemZUID];
        entry.after = item?.[slice]?.[entry.key];
        if (entry.type !== "SET_ITEM_DATA") return;
        // The bridge finds a field's canvas regions by ZUID; the action
        // carries its name.
        const modelZUID = item?.meta?.contentModelZUID;
        // `any`: the fields slice is untyped (see AppState's TODO).
        const field = Object.values(fields).find(
          (candidate: any) =>
            candidate?.contentModelZUID === modelZUID &&
            candidate?.name === entry.key
        ) as { ZUID?: string } | undefined;
        if (field?.ZUID) {
          fieldRefs.push({ fieldZuid: field.ZUID, itemZuid: entry.itemZUID });
        }
      });
      step.layout.forEach((entry, codeId) => {
        entry.after = getLayoutRegionSnapshot(codeId);
      });
      const connected = getConnectedSlots();
      step.connected.forEach((entry, slotKey) => {
        entry.after = connected[slotKey];
      });
      if (step.ai) step.ai.after = getAiState();

      if (isNoop(step)) {
        bump();
        return;
      }

      // A new step after an undo replaces the redo tail.
      if (pointerRef.current < stepsRef.current.length) {
        const truncated = stepsRef.current.splice(pointerRef.current);
        const stepIds = truncated.map(({ id }) => id);
        postCommandToBridge({ action: "historyDrop", stepIds });
      }
      stepsRef.current.push(step);
      pointerRef.current++;
      postCommandToBridge({
        action: "historySnapshot",
        stepId: step.id,
        codeIds: Array.from(step.layout.keys()),
        fields: fieldRefs,
      });
      if (stepsRef.current.length > MAX_STEPS) evictOldest();
      bump();
    },
    [bump, evictOldest]
  );

  // A write is about to land on `key`. It joins the open step when that step
  // is on the same target (or is a bulk step), and starts a new one
  // otherwise.
  const touch = useCallback(
    (key: string) => {
      if (!argsRef.current.enabled || applyingRef.current) return;
      const open = openRef.current;
      if (open && (open.bulk || open.key === key)) return;
      closeStep();
      openStep(key, false);
    },
    [closeStep, openStep]
  );

  // Brackets one gesture that writes several targets at once — a reorder
  // across regions, a link add or remove, an image pick, an AI turn — into a
  // single step.
  const beginStep = useCallback(
    (kind: string) => {
      if (!argsRef.current.enabled || applyingRef.current) return;
      closeStep();
      openStep(kind, true);
    },
    [closeStep, openStep]
  );

  const endStep = useCallback(() => closeStep(), [closeStep]);

  // The first write a step makes to an entry knows the before; nothing else
  // does.
  const ensureOpenStep = useCallback(() => {
    if (openRef.current) return openRef.current;
    // A write nothing announced is a step of its own.
    return openStep(`write:${nextIdRef.current}`, false);
  }, [openStep]);

  const recordLayoutWrite = useCallback(
    (codeIds: string[]) => {
      if (!argsRef.current.enabled || applyingRef.current) return;
      const step = ensureOpenStep();
      const wasEmpty = !hasEntries(step);
      codeIds.forEach((codeId) => {
        if (step.layout.has(codeId)) return;
        const before = argsRef.current.getLayoutRegionSnapshot(codeId);
        step.layout.set(codeId, { before, after: before });
      });
      if (wasEmpty) bump();
    },
    [bump, ensureOpenStep]
  );

  const recordConnected = useCallback(
    (slotKey: string, before: ConnectField | undefined) => {
      if (!argsRef.current.enabled || applyingRef.current) return;
      const step = ensureOpenStep();
      const wasEmpty = !hasEntries(step);
      if (!step.connected.has(slotKey)) {
        step.connected.set(slotKey, { before, after: before });
      }
      if (wasEmpty) bump();
    },
    [bump, ensureOpenStep]
  );

  const recordContentWrite = useCallback(
    (write: StudioHistoryContentWrite) => {
      if (!argsRef.current.enabled || applyingRef.current) return;
      if (!baseDirtyRef.current.has(write.itemZUID)) {
        baseDirtyRef.current.set(write.itemZUID, write.wasDirty);
      }
      const key = `content:${write.itemZUID}:${write.type}:${write.key}`;
      touch(key);
      const step = ensureOpenStep();
      const wasEmpty = !hasEntries(step);
      if (!step.content.has(key)) {
        step.content.set(key, {
          type: write.type,
          itemZUID: write.itemZUID,
          key: write.key,
          before: write.before,
          after: write.before,
        });
      }
      if (wasEmpty) bump();
    },
    [bump, ensureOpenStep, touch]
  );

  useEffect(() => {
    setStudioHistoryRecorder(recordContentWrite);
    return () => setStudioHistoryRecorder(null);
  }, [recordContentWrite]);

  const apply = useCallback(
    (direction: StudioHistoryDirection) => {
      const {
        enabled,
        blocked,
        dispatch,
        postCommandToBridge,
        restoreLayoutRegions,
        restoreConnectedSlots,
        restoreAiState,
        cancelAllPendingPatches,
        onBeforeApply,
        onApplied,
      } = argsRef.current;
      if (!enabled || blocked || applyingRef.current) return;

      // An edit still open is the first thing undo takes back — including
      // what is still in a panel input's or an Inspector slot's debounce.
      flushAllDebouncedInputs();
      argsRef.current.flushPendingPatches();
      closeStep();
      const step =
        direction === "undo"
          ? stepsRef.current[pointerRef.current - 1]
          : stepsRef.current[pointerRef.current];
      if (!step) return;
      const pick = <T>(change: Change<T>) =>
        direction === "undo" ? change.before : change.after;

      const contentWrites: AppliedContentWrite[] = Array.from(
        step.content.values()
      ).map((entry) => ({
        type: entry.type,
        itemZUID: entry.itemZUID,
        key: entry.key,
        value: pick(entry),
      }));

      applyingRef.current = true;
      try {
        onBeforeApply?.();
        contentWrites.forEach((write) => dispatch(write));
        if (step.layout.size) {
          const snapshots: Record<string, LayoutRegionSnapshot> = {};
          step.layout.forEach((change, codeId) => {
            snapshots[codeId] = pick(change);
          });
          restoreLayoutRegions(snapshots);
        }
        if (step.connected.size) {
          const patch: Record<string, ConnectField | undefined> = {};
          step.connected.forEach((change, slotKey) => {
            patch[slotKey] = pick(change);
          });
          restoreConnectedSlots(patch);
        }
        // Lock the canvas before a painted preview comes back, and unlock it
        // only after it has gone, so the bridge never accepts a gesture on
        // markup that is not the page's.
        const ai = step.ai ? pick(step.ai) : null;
        if (ai?.stagedCodeId) restoreAiState(ai);
        postCommandToBridge({
          action: "historyRestore",
          stepId: step.id,
          direction,
        });
        if (ai && !ai.stagedCodeId) restoreAiState(ai);

        pointerRef.current += direction === "undo" ? -1 : 1;

        // Back at the last save: nothing is pending any more, so the save bar
        // and the leave prompt go with it.
        if (pointerRef.current === 0 && baseIsSavedRef.current) {
          const items = Array.from(baseDirtyRef.current.entries())
            .filter(([, wasDirty]) => !wasDirty)
            .map(([itemZUID]) => itemZUID);
          if (items.length) dispatch({ type: "UNMARK_ITEMS_DIRTY", items });
          cancelAllPendingPatches();
        }
      } finally {
        applyingRef.current = false;
      }
      onApplied?.(contentWrites);
      bump();
    },
    [bump, closeStep]
  );

  const undo = useCallback(() => apply("undo"), [apply]);
  const redo = useCallback(() => apply("redo"), [apply]);

  // A new frame: its bridge holds no snapshots, so neither does the stack.
  const reset = useCallback(
    (enabled: boolean) => {
      openRef.current = null;
      stepsRef.current = [];
      pointerRef.current = 0;
      baseIsSavedRef.current = true;
      baseDirtyRef.current.clear();
      if (enabled)
        argsRef.current.postCommandToBridge({ action: "historyReset" });
      bump();
    },
    [bump]
  );

  // A restore the canvas could not carry out leaves it disagreeing with the
  // staged state, and every later step would build on that. The staged edits
  // are still what a save writes, so they stay; the history goes, and the
  // canvas catches up on the next save or reload.
  const handleRestoreReply = useCallback(
    (msg: { stepId?: number; direction?: string; ok?: boolean }) => {
      if (msg?.ok !== false) return;
      console.warn("Studio: the canvas could not restore a history step", msg);
      reset(argsRef.current.enabled);
    },
    [reset]
  );

  // Cmd/Ctrl+Z, Shift+Cmd/Ctrl+Z and Ctrl+Y outside a text control. Inside
  // one — an input, a contenteditable, TinyMCE — the control's own undo
  // stays in charge. The canvas is a cross-origin frame, so its keys arrive
  // as HISTORY_KEY instead.
  useEffect(() => {
    if (!args.enabled) return;
    const handleKeyDown = (evt: KeyboardEvent) => {
      if (evt.defaultPrevented || evt.altKey) return;
      if (!evt.metaKey && !evt.ctrlKey) return;
      const key = (evt.key || "").toLowerCase();
      const isUndo = key === "z" && !evt.shiftKey;
      const isRedo =
        (key === "z" && evt.shiftKey) || (key === "y" && evt.ctrlKey);
      if (!isUndo && !isRedo) return;
      if (isEditableTarget(evt.target)) return;
      if (argsRef.current.isModalOpen?.(evt.target)) return;
      evt.preventDefault();
      apply(isUndo ? "undo" : "redo");
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [apply, args.enabled]);

  const open = openRef.current;
  const openHasEntries = !!open && hasEntries(open);
  const ready = args.enabled && !args.blocked;

  return {
    canUndo: ready && (pointerRef.current > 0 || openHasEntries),
    canRedo:
      ready && !openHasEntries && pointerRef.current < stepsRef.current.length,
    undo,
    redo,
    touch,
    beginStep,
    endStep,
    closeStep,
    recordLayoutWrite,
    recordConnected,
    reset,
    handleRestoreReply,
  };
};
