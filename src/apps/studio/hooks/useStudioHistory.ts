import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { isEqual } from "lodash";
import { notify } from "shell/store/notifications";
import { flushAllDebouncedInputs } from "shell/hooks/useDebouncedInput";
import {
  setStudioHistoryRecorder,
  StudioHistoryContentType,
  StudioHistoryContentWrite,
} from "shell/store/middleware/studioHistory";
import { ConnectField } from "./studioTypes";
import { LayoutRegionSnapshot } from "./useLayoutReorderState";
import { StudioAiState } from "./useStudioAiEdit";

const MAX_STEPS = 50;

// The open step is re-snapshotted this long after its last write. A tick is
// not enough: a panel edit reaches the canvas through a passive effect, which
// React runs after paint.
const SNAPSHOT_DELAY_MS = 50;

// A restore the bridge has not answered by then is treated as failed.
const RESTORE_TIMEOUT_MS = 3000;

export type StudioHistoryDirection = "undo" | "redo";

type ContentEntry = {
  type: StudioHistoryContentType;
  itemZUID: string;
  key: string;
  before: unknown;
  after: unknown;
};

type Change<T> = { before: T; after: T };

// `before` is captured on the step's first touch of each key and `after` is
// read when the step closes, so a step that coalesces many writes to one
// target holds only its two ends.
type Step = {
  id: number;
  // The target the step coalesces on, or a bulk kind from beginStep.
  key: string;
  bulk: boolean;
  content: Map<string, ContentEntry>;
  layout: Map<string, Change<LayoutRegionSnapshot>>;
  connected: Map<string, Change<ConnectField | undefined>>;
  ai?: Change<StudioAiState>;
  // Whether the bridge holds a snapshot for this id.
  snapshotted: boolean;
};

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
  | { action: "historyReset" }
  | { action: "setPreviewLock"; locked: boolean };

type Args = {
  // The bridge reported the `history` capability.
  enabled: boolean;
  blocked: boolean;
  dispatch: (action: any) => any;
  // `any` because the content and fields slices are untyped (AppState TODO).
  getState: () => any;
  postCommandToBridge: (cmd: StudioHistoryCommand) => void;
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
  isAiRenderPending: () => boolean;
  onBeforeApply?: () => void;
  onApplied?: (contentWrites: AppliedContentWrite[]) => void;
  isModalOpen?: (target: EventTarget | null) => boolean;
};

export type AppliedContentWrite = {
  type: StudioHistoryContentType;
  itemZUID: string;
  key: string;
  value: unknown;
};

type CloseOptions = {
  // A bulk step closes only when forced, so a selection change mid-way
  // through a reorder or an AI turn cannot split it.
  force?: boolean;
  // Snapshot the canvas as the step closes. Not when a bridge gesture is
  // what closes it: the bridge changed the DOM before its message arrived,
  // so a snapshot now would hold the gesture, not this step.
  snapshot?: boolean;
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

const sliceOf = (type: StudioHistoryContentType) =>
  type === "SET_ITEM_DATA" ? "data" : type === "SET_ITEM_WEB" ? "web" : "meta";

const isEditableTarget = (target: EventTarget | null) => {
  if (!(target instanceof HTMLElement)) return false;
  if (["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName)) return true;
  if (target.isContentEditable) return true;
  // TinyMCE keeps its own undo stack.
  return !!target.closest(".tox, [contenteditable]");
};

// Undo/redo for everything Studio stages before a save: content values,
// view source and its pending-save state, connected-field labels and an AI
// change. The canvas DOM is restored by the bridge from snapshots of each
// step, so no per-gesture inverse exists anywhere. An undo asks the bridge
// to restore first and applies the host's half only once it has, so the
// canvas and the staged state never disagree.
//
// Every frame reload — save, discard, path or language change, refresh —
// resets the stack, because the bridge's snapshots die with the frame.
export const useStudioHistory = (args: Args) => {
  const { t } = useTranslation();
  const argsRef = useRef(args);
  argsRef.current = args;

  const stepsRef = useRef<Step[]>([]);
  // steps[pointer - 1] is the next undo, steps[pointer] the next redo.
  const pointerRef = useRef(0);
  const openRef = useRef<Step | null>(null);
  const nextIdRef = useRef(1);
  const applyingRef = useRef(false);
  const baseIsSavedRef = useRef(true);
  // Whether each item touched since the reset was dirty before its first
  // write. Undoing back to a saved base clears the dirty flag only on items
  // that were clean there.
  const baseDirtyRef = useRef(new Map<string, boolean>());
  const snapshotTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingRestoreRef = useRef<{
    step: Step;
    direction: StudioHistoryDirection;
    timer: ReturnType<typeof setTimeout>;
  } | null>(null);

  // The stack lives in refs so writes can record synchronously; this only
  // re-renders the buttons.
  const [, setVersion] = useState(0);
  const bump = useCallback(() => setVersion((prev) => prev + 1), []);

  const postSnapshot = useCallback((step: Step) => {
    const { getState, postCommandToBridge } = argsRef.current;
    const fields = getState().fields || {};
    const content = getState().content || {};
    const fieldRefs: { fieldZuid: string; itemZuid: string }[] = [];
    step.content.forEach((entry) => {
      if (entry.type !== "SET_ITEM_DATA") return;
      // The bridge finds a field's canvas regions by ZUID; the action
      // carries its name.
      const modelZUID = content[entry.itemZUID]?.meta?.contentModelZUID;
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
    postCommandToBridge({
      action: "historySnapshot",
      stepId: step.id,
      codeIds: Array.from(step.layout.keys()),
      fields: fieldRefs,
    });
    step.snapshotted = true;
  }, []);

  const clearSnapshotTimer = useCallback(() => {
    if (snapshotTimerRef.current) clearTimeout(snapshotTimerRef.current);
    snapshotTimerRef.current = null;
  }, []);

  // The open step's snapshot is kept current as it goes, so a bridge gesture
  // that closes it never has to take one.
  const scheduleSnapshot = useCallback(() => {
    clearSnapshotTimer();
    snapshotTimerRef.current = setTimeout(() => {
      snapshotTimerRef.current = null;
      const step = openRef.current;
      if (step && hasEntries(step) && !applyingRef.current) postSnapshot(step);
    }, SNAPSHOT_DELAY_MS);
  }, [clearSnapshotTimer, postSnapshot]);

  const openStep = useCallback((key: string, bulk: boolean): Step => {
    const step: Step = {
      id: nextIdRef.current++,
      key,
      bulk,
      content: new Map(),
      layout: new Map(),
      connected: new Map(),
      snapshotted: false,
    };
    if (key === "ai") {
      const ai = argsRef.current.getAiState();
      step.ai = { before: ai, after: ai };
    }
    openRef.current = step;
    return step;
  }, []);

  // The bridge folds a dropped step into its base while that step is
  // applied, so the regions it touched stay restorable to its after-state.
  const evictOldest = useCallback(() => {
    const evicted = stepsRef.current.shift();
    if (!evicted) return;
    pointerRef.current--;
    baseIsSavedRef.current = false;
    argsRef.current.postCommandToBridge({
      action: "historyDrop",
      stepIds: [evicted.id],
    });
  }, []);

  const closeStep = useCallback(
    ({ force = true, snapshot = true }: CloseOptions = {}) => {
      const step = openRef.current;
      if (!step || applyingRef.current) return;
      if (step.bulk && !force) return;
      const {
        flushPendingPatches,
        getState,
        getLayoutRegionSnapshot,
        getConnectedSlots,
        getAiState,
        isAiRenderPending,
        postCommandToBridge,
      } = argsRef.current;
      // An AI turn ends when its render is on the canvas, not before.
      if (step.key === "ai" && isAiRenderPending()) return;

      // Still open while it flushes, so the flushed writes land in it.
      flushPendingPatches();
      clearSnapshotTimer();
      openRef.current = null;

      const content = getState().content || {};
      step.content.forEach((entry) => {
        entry.after =
          content[entry.itemZUID]?.[sliceOf(entry.type)]?.[entry.key];
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
        if (step.snapshotted) {
          postCommandToBridge({ action: "historyDrop", stepIds: [step.id] });
        }
        bump();
        return;
      }

      // A new step after an undo replaces the redo tail.
      if (pointerRef.current < stepsRef.current.length) {
        const truncated = stepsRef.current.splice(pointerRef.current);
        postCommandToBridge({
          action: "historyDrop",
          stepIds: truncated.map(({ id }) => id),
        });
      }
      stepsRef.current.push(step);
      pointerRef.current++;
      if (snapshot) postSnapshot(step);
      if (stepsRef.current.length > MAX_STEPS) evictOldest();
      bump();
    },
    [bump, clearSnapshotTimer, evictOldest, postSnapshot]
  );

  // A write is about to land on `key`: it joins the open step when that step
  // is on the same target or is a bulk step, and starts a new one otherwise.
  // `fromBridge` marks a gesture the canvas has already applied.
  const touch = useCallback(
    (key: string, fromBridge = false) => {
      if (!argsRef.current.enabled || applyingRef.current) return;
      const open = openRef.current;
      if (!open || (!open.bulk && open.key !== key)) {
        closeStep({ snapshot: !fromBridge });
        // An AI turn still rendering stays open and takes the write.
        if (!openRef.current) openStep(key, false);
      }
      scheduleSnapshot();
    },
    [closeStep, openStep, scheduleSnapshot]
  );

  // Brackets one gesture that writes several targets at once — a reorder
  // across regions, a link add or remove, an image pick, an AI turn.
  const beginStep = useCallback(
    (kind: string, fromBridge = false) => {
      if (!argsRef.current.enabled || applyingRef.current) return;
      closeStep({ snapshot: !fromBridge });
      if (openRef.current) return;
      openStep(kind, true);
    },
    [closeStep, openStep]
  );

  const endStep = useCallback(() => closeStep(), [closeStep]);

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
      scheduleSnapshot();
      if (wasEmpty) bump();
    },
    [bump, ensureOpenStep, scheduleSnapshot]
  );

  const recordConnected = useCallback(
    (slotKey: string, before: ConnectField | undefined) => {
      if (!argsRef.current.enabled || applyingRef.current) return;
      const step = ensureOpenStep();
      const wasEmpty = !hasEntries(step);
      if (!step.connected.has(slotKey)) {
        step.connected.set(slotKey, { before, after: before });
      }
      scheduleSnapshot();
      if (wasEmpty) bump();
    },
    [bump, ensureOpenStep, scheduleSnapshot]
  );

  const recordContentWrite = useCallback(
    (write: StudioHistoryContentWrite) => {
      if (!argsRef.current.enabled || applyingRef.current) return;
      if (!baseDirtyRef.current.has(write.itemZUID)) {
        baseDirtyRef.current.set(write.itemZUID, write.wasDirty);
      }
      const key = contentKey(write.itemZUID, write.type, write.key);
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

  const reset = useCallback(
    (enabled: boolean) => {
      clearSnapshotTimer();
      if (pendingRestoreRef.current) {
        clearTimeout(pendingRestoreRef.current.timer);
        pendingRestoreRef.current = null;
      }
      openRef.current = null;
      stepsRef.current = [];
      pointerRef.current = 0;
      baseIsSavedRef.current = true;
      baseDirtyRef.current.clear();
      if (enabled) {
        argsRef.current.postCommandToBridge({ action: "historyReset" });
      }
      bump();
    },
    [bump, clearSnapshotTimer]
  );

  // Nothing of the host's half has been applied, so the staged edits still
  // match what a save writes and they stay. The history goes, because the
  // canvas may be part-way between two steps.
  const failRestore = useCallback(
    (reply?: unknown) => {
      console.warn(
        "Studio: the canvas could not restore a history step",
        reply
      );
      argsRef.current.dispatch(
        notify({ kind: "warn", message: t("content.studioUndoFailed") })
      );
      reset(argsRef.current.enabled);
    },
    [reset, t]
  );

  const applyHostState = useCallback(
    (step: Step, direction: StudioHistoryDirection) => {
      const {
        dispatch,
        restoreLayoutRegions,
        restoreConnectedSlots,
        restoreAiState,
        cancelAllPendingPatches,
        onBeforeApply,
        onApplied,
      } = argsRef.current;
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
        // Unlocking waits until here, after the bridge has taken the painted
        // preview off the canvas; a lock was posted before the restore.
        if (step.ai) restoreAiState(pick(step.ai));

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
    [bump]
  );

  const apply = useCallback(
    (direction: StudioHistoryDirection) => {
      const { enabled, blocked, postCommandToBridge, flushPendingPatches } =
        argsRef.current;
      if (!enabled || blocked || applyingRef.current) return;
      if (pendingRestoreRef.current) return;

      // An edit still open is the first thing undo takes back — including
      // what is still in a panel input's or an Inspector slot's debounce.
      flushAllDebouncedInputs();
      flushPendingPatches();
      closeStep();
      const step =
        direction === "undo"
          ? stepsRef.current[pointerRef.current - 1]
          : stepsRef.current[pointerRef.current];
      if (!step) return;

      // Lock the canvas before a painted preview comes back, so the bridge
      // never accepts a gesture on markup that is not the page's.
      const ai = step.ai
        ? direction === "undo"
          ? step.ai.before
          : step.ai.after
        : null;
      if (ai?.stagedCodeId) {
        postCommandToBridge({ action: "setPreviewLock", locked: true });
      }
      postCommandToBridge({
        action: "historyRestore",
        stepId: step.id,
        direction,
      });
      pendingRestoreRef.current = {
        step,
        direction,
        timer: setTimeout(() => {
          pendingRestoreRef.current = null;
          failRestore({ stepId: step.id, direction, reason: "timeout" });
        }, RESTORE_TIMEOUT_MS),
      };
      bump();
    },
    [bump, closeStep, failRestore]
  );

  const undo = useCallback(() => apply("undo"), [apply]);
  const redo = useCallback(() => apply("redo"), [apply]);

  const handleRestoreReply = useCallback(
    (msg: { stepId?: number; direction?: string; ok?: boolean }) => {
      const pending = pendingRestoreRef.current;
      if (!pending) return;
      if (msg?.stepId !== pending.step.id) return;
      if (msg?.direction !== pending.direction) return;
      clearTimeout(pending.timer);
      pendingRestoreRef.current = null;
      if (msg.ok) applyHostState(pending.step, pending.direction);
      else failRestore(msg);
    },
    [applyHostState, failRestore]
  );

  // A save that does not reload the canvas leaves pointer 0 behind the
  // stored state.
  const markBaseUnsaved = useCallback(() => {
    baseIsSavedRef.current = false;
  }, []);

  useEffect(
    () => () => {
      clearSnapshotTimer();
      if (pendingRestoreRef.current) {
        clearTimeout(pendingRestoreRef.current.timer);
      }
    },
    [clearSnapshotTimer]
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
  const ready = args.enabled && !args.blocked && !pendingRestoreRef.current;

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
    markBaseUnsaved,
  };
};

export const contentKey = (
  itemZUID: string,
  type: StudioHistoryContentType,
  key: string
) => `content:${itemZUID}:${type}:${key}`;
