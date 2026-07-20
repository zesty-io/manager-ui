import { MutableRefObject, useCallback, useEffect } from "react";
import { notify } from "../../../../../../../shell/store/notifications";
import { Sentry } from "../../../../../../../utility/sentry";
import { InteractionMode } from "./studioTypes";

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
          if (interactionMode !== "layout") return;
          applyLayoutSelection({ codeId, layoutId, breadcrumb });
          return;
        }

        case "escape": {
          if (interactionMode === "layout") {
            clearLayoutSelection();
            return;
          }
          clearSelection();
          return;
        }

        case "click": {
          if (interactionMode === "layout") return;
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
          if (interactionMode !== "content" || !fieldZuid || !itemZuid) return;
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
          if (interactionMode === "layout") return;
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
          if (interactionMode === "layout") return;
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

      if (msg.type === "REORDER_OUTPUT") {
        handleReorderOutput(msg);
        return;
      }

      if (msg.type === "LAYOUT_CONTENT_UPDATE") {
        handleLayoutContentUpdate(msg);
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
              "This block contains dynamic content and cannot be edited inline. Switch to Content mode to make edits.",
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
    clearSelection,
    handleBridgeDomEvent,
    handleBridgeError,
    handleBridgeReady,
    handleLayersTree,
    handleLayoutContentUpdate,
    handleReorderOutput,
    handleTemplateSourceMap,
    onStaticEditImage,
  ]);

  return {
    handlePreviewLoad,
  };
};
