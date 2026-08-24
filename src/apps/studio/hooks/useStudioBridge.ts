import { MutableRefObject, useCallback, useEffect } from "react";
import { notify } from "shell/store/notifications";
import { Sentry } from "utility/sentry";
import {
  InteractionMode,
  usesContentEditing,
  usesLayoutGrammar,
} from "./studioTypes";

// Layout mode genuinely has a Content mode to send the user to. Studio's full
// mode does not — it IS both — so the same rejection needs different words.
const SWITCH_TO_CONTENT_MESSAGE =
  "This block contains dynamic content and cannot be edited inline. Switch to Content mode to make edits.";
const NOT_A_SINGLE_FIELD_MESSAGE =
  "This block can't be edited inline because its content is not a single connected field.";

const bridgeInjectedCss = `
  .studio-hover {
    outline: 1px dashed #00bcd4;
    outline-offset: 2px;
    cursor: pointer;
  }
  .studio-selected {
    outline: 2px solid #ff9800;
    outline-offset: 2px;
  }
  .studio-layout-mode [data-layout-id] {
    cursor: pointer;
  }
  .studio-layout-mode [data-layout-id][draggable="true"] {
    cursor: move;
  }
  .studio-dragging {
    background-color: rgba(255, 152, 0, 0.18);
    outline: 2px solid #ff9800;
    color: transparent !important;
  }
  .studio-dragging * {
    visibility: hidden !important;
  }
  [data-layout-id].studio-drop-before {
    box-shadow:
      inset 0 4px 0 #ff9800,
      0 0 0 1px rgba(255, 152, 0, 0.35);
  }
  [data-layout-id].studio-drop-before-horizontal {
    box-shadow:
      inset 4px 0 0 #ff9800,
      0 0 0 1px rgba(255, 152, 0, 0.35);
  }
  [data-layout-id].studio-drop-after {
    box-shadow:
      inset 0 -4px 0 #ff9800,
      0 0 0 1px rgba(255, 152, 0, 0.35);
  }
  [data-layout-id].studio-drop-after-horizontal {
    box-shadow:
      inset -4px 0 0 #ff9800,
      0 0 0 1px rgba(255, 152, 0, 0.35);
  }
  [data-layout-id].studio-drop-inside {
    background-color: rgba(255, 152, 0, 0.18);
    outline: 2px dashed #ff9800;
    outline-offset: 2px;
  }
  .studio-static-editing {
    outline: 2px solid #ff9800 !important;
    outline-offset: 2px;
    cursor: text !important;
  }
  .studio-static-editing * {
    cursor: text !important;
  }
`;

type Args = {
  dispatch: (action: any) => any;
  interactionMode: InteractionMode;
  /** Whether this user may write view source. Gates the layout-write messages. */
  canEditLayout: boolean;
  /** Bound leaf resolved on the canvas — opens that field's content editor. */
  onDynamicEditRequest: (msg: {
    codeId?: string;
    layoutId?: string;
    studioId?: string;
    fieldZuid: string;
    fieldType?: string;
    itemZuid?: string;
    modelZuid?: string;
  }) => void;
  syncBridgeInteractionMode: (nextMode: InteractionMode) => void;
  postCommandToBridge: (cmd: any) => void;
  handleTemplateSourceMap: (msg: any) => void;
  handleReorderOutput: (msg: any) => void;
  handleLayoutContentUpdate: (msg: any) => void;
  handleLayersTree: (msg: any) => void;
  applyLayoutSelection: (next: {
    codeId?: string;
    layoutId?: string;
    breadcrumb?: { layoutId?: string; label: string }[];
  }) => void;
  clearLayoutSelection: () => void;
  applySelection: (next: {
    studioId?: string;
    fieldZuid: string;
    fieldType?: string;
    itemZuid?: string;
    modelZuid?: string;
  }) => void;
  fieldNameByZuid: Map<string, string>;
  currentHoverStudioIdRef: React.MutableRefObject<string | null>;
  clearSelection: () => void;
  previewReloadContinuationRef: MutableRefObject<null | (() => void)>;
  setIsNavigating: (value: boolean) => void;
  onBridgeFieldInput?: (fieldZuid: string) => void;
  onStaticEditImage?: (msg: {
    codeId: string;
    layoutId: string;
    isLeafImg: boolean;
    imgIndex: number;
    currentSrc: string;
  }) => void;
};

export const useStudioBridge = ({
  dispatch,
  interactionMode,
  canEditLayout,
  onDynamicEditRequest,
  syncBridgeInteractionMode,
  postCommandToBridge,
  handleTemplateSourceMap,
  handleReorderOutput,
  handleLayoutContentUpdate,
  handleLayersTree,
  applyLayoutSelection,
  clearLayoutSelection,
  applySelection,
  fieldNameByZuid,
  currentHoverStudioIdRef,
  clearSelection,
  previewReloadContinuationRef,
  setIsNavigating,
  onBridgeFieldInput,
  onStaticEditImage,
}: Args) => {
  const handleBridgeReady = useCallback(() => {
    postCommandToBridge({
      action: "injectCss",
      css: bridgeInjectedCss,
    });
    syncBridgeInteractionMode(interactionMode);
    postCommandToBridge({ action: "requestLayersTree" });
  }, [interactionMode, postCommandToBridge, syncBridgeInteractionMode]);

  const handleBridgeError = useCallback(
    (msg: any) => {
      const bridgeError = msg.error || {};
      const error = new Error(bridgeError.message || "Bridge error");
      if (bridgeError.stack) {
        (error as any).stack = bridgeError.stack;
      }

      dispatch(
        notify({
          kind: "error",
          message: `Preview error: ${bridgeError.message || "Bridge error"}`,
        })
      );

      Sentry.withScope((scope) => {
        scope.setLevel("error");
        scope.setTag("bridge.kind", msg.kind || "error");
        scope.setContext("bridge.error", {
          filename: bridgeError.filename || null,
          lineno: bridgeError.lineno || null,
          colno: bridgeError.colno || null,
          stack: bridgeError.stack || null,
        });
        scope.setExtra("bridge.message", bridgeError.message || "");
        Sentry.captureException(error);
      });
    },
    [dispatch]
  );

  const handleBridgeDomEvent = useCallback(
    (msg: any) => {
      const { eventType, element, value, breadcrumb } = msg;
      if (!element) return;

      const dataset: Record<string, string> =
        (element.dataset as Record<string, string>) || {};
      const studioId = dataset.studioId;
      const fieldZuid: string | undefined = dataset.fieldZuid;
      const fieldType = dataset.fieldType;
      const itemZuid = dataset.itemZuid;
      const modelZuid = dataset.modelZuid;
      const layoutId = dataset.layoutId;
      const codeId = dataset.codeId;

      switch (eventType) {
        case "mousedown":
        case "dblclick": {
          if (!usesLayoutGrammar(interactionMode)) return;
          applyLayoutSelection({ codeId, layoutId, breadcrumb });
          return;
        }

        case "escape": {
          if (usesLayoutGrammar(interactionMode)) {
            clearLayoutSelection();
            return;
          }
          clearSelection();
          return;
        }

        case "click": {
          if (usesLayoutGrammar(interactionMode)) return;
          if (!fieldZuid) return;

          applySelection({
            studioId,
            fieldZuid,
            fieldType,
            itemZuid,
            modelZuid,
          });
          return;
        }

        case "input": {
          if (!usesContentEditing(interactionMode) || !fieldZuid || !itemZuid)
            return;
          const fieldName = fieldNameByZuid.get(fieldZuid);
          if (!fieldName) return;

          dispatch({
            type: "SET_ITEM_DATA",
            itemZUID: itemZuid,
            key: fieldName,
            value: typeof value === "string" ? value : "",
          });
          onBridgeFieldInput?.(fieldZuid);
          return;
        }

        case "mouseover": {
          if (usesLayoutGrammar(interactionMode)) return;
          if (!studioId) return;
          currentHoverStudioIdRef.current = studioId;
          postCommandToBridge({
            action: "addClass",
            studioId,
            className: "studio-hover",
            itemZuid,
          });
          return;
        }

        case "mouseout": {
          if (usesLayoutGrammar(interactionMode)) return;
          if (!studioId) return;
          if (currentHoverStudioIdRef.current === studioId) {
            currentHoverStudioIdRef.current = null;
          }
          postCommandToBridge({
            action: "removeClass",
            studioId,
            className: "studio-hover",
            itemZuid,
          });
        }
      }
    },
    [
      applyLayoutSelection,
      applySelection,
      clearLayoutSelection,
      currentHoverStudioIdRef,
      dispatch,
      fieldNameByZuid,
      interactionMode,
      postCommandToBridge,
      onBridgeFieldInput,
    ]
  );

  const handlePreviewLoad = useCallback(() => {
    setIsNavigating(false);
    const continuation = previewReloadContinuationRef.current;
    previewReloadContinuationRef.current = null;
    continuation?.();
  }, [previewReloadContinuationRef, setIsNavigating]);

  useEffect(() => {
    function handleMessage(evt: MessageEvent<any>) {
      const data = evt.data;
      if (!data || data.source !== "studio-bridge") {
        return;
      }

      const msg = data.message;
      if (!msg) return;

      if (msg.type === "TEMPLATE_SOURCE_MAP") {
        handleTemplateSourceMap(msg);
        return;
      }

      if (msg.type === "BRIDGE_READY") {
        handleBridgeReady();
        return;
      }

      if (msg.type === "BRIDGE_ERROR") {
        handleBridgeError(msg);
        return;
      }

      if (msg.type === "DOM_EVENT") {
        handleBridgeDomEvent(msg);
        return;
      }

      // Both of these stage a write to view source. They arrive as window
      // messages from the preview, so the mode toggle is not a gate on them:
      // anything that can postMessage can send them. Refuse without code
      // capability rather than relying on the UI never offering the mode.
      if (msg.type === "REORDER_OUTPUT") {
        if (!canEditLayout) return;
        handleReorderOutput(msg);
        return;
      }

      if (msg.type === "LAYOUT_CONTENT_UPDATE") {
        if (!canEditLayout) return;
        handleLayoutContentUpdate(msg);
        return;
      }

      // Studio mode only: the bridge resolved a positive field binding at the
      // leaf, so open that field's content editor. The same selection path a
      // layers-row click takes — no new selection machinery.
      if (msg.type === "DYNAMIC_EDIT_REQUEST") {
        // The bridge is binary and posts this from both the canvas and the
        // layers panel without knowing the mode. Layout mode can reach a bound
        // leaf but cannot edit it, so tell the user rather than dropping the
        // gesture on the floor.
        if (interactionMode !== "full") {
          dispatch(
            notify({ kind: "warn", message: SWITCH_TO_CONTENT_MESSAGE })
          );
          return;
        }
        if (!msg.fieldZuid) return;

        onDynamicEditRequest({
          codeId: msg.codeId,
          layoutId: msg.layoutId,
          studioId: msg.studioId,
          fieldZuid: msg.fieldZuid,
          fieldType: msg.fieldType,
          itemZuid: msg.itemZuid,
          modelZuid: msg.modelZuid,
        });
        return;
      }

      if (msg.type === "LAYERS_TREE") {
        handleLayersTree(msg);
        return;
      }

      if (msg.type === "STATIC_EDIT_REJECTED") {
        dispatch(
          notify({
            kind: "warn",
            message:
              interactionMode === "full"
                ? NOT_A_SINGLE_FIELD_MESSAGE
                : SWITCH_TO_CONTENT_MESSAGE,
          })
        );
        return;
      }

      if (msg.type === "STATIC_EDIT_IMAGE") {
        onStaticEditImage?.(msg);
        return;
      }
    }

    window.addEventListener("message", handleMessage);
    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, [
    applySelection,
    canEditLayout,
    onDynamicEditRequest,
    clearSelection,
    handleBridgeDomEvent,
    handleBridgeError,
    handleBridgeReady,
    handleLayersTree,
    handleLayoutContentUpdate,
    handleReorderOutput,
    handleTemplateSourceMap,
    interactionMode,
    onStaticEditImage,
  ]);

  return {
    handlePreviewLoad,
  };
};
