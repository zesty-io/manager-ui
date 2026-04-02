import { MutableRefObject, useCallback, useEffect } from "react";
import { notify } from "../../../../../../../shell/store/notifications";
import { Sentry } from "../../../../../../../utility/sentry";
import { normalizePath } from "../../../../../../studio/utils/pathResolver";
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
  .studio-drop-before {
    box-shadow:
      inset 0 4px 0 #ff9800,
      0 0 0 1px rgba(255, 152, 0, 0.35);
  }
  .studio-drop-before-horizontal {
    box-shadow:
      inset 4px 0 0 #ff9800,
      0 0 0 1px rgba(255, 152, 0, 0.35);
  }
  .studio-drop-after {
    box-shadow:
      inset 0 -4px 0 #ff9800,
      0 0 0 1px rgba(255, 152, 0, 0.35);
  }
  .studio-drop-after-horizontal {
    box-shadow:
      inset -4px 0 0 #ff9800,
      0 0 0 1px rgba(255, 152, 0, 0.35);
  }
  .studio-drop-inside {
    background-color: rgba(255, 152, 0, 0.18);
    outline: 2px dashed #ff9800;
    outline-offset: 2px;
  }
`;

type Args = {
  dispatch: (action: any) => any;
  interactionMode: InteractionMode;
  syncBridgeInteractionMode: (nextMode: InteractionMode) => void;
  postCommandToBridge: (cmd: any) => void;
  handleTemplateSourceMap: (msg: any) => void;
  handleReorderOutput: (msg: any) => void;
  applyLayoutSelection: (next: {
    codeId?: string;
    layoutId?: string;
    breadcrumb?: { layoutId?: string; label: string }[];
  }) => void;
  requestProceedWithPendingLayoutSave: (onProceed: () => void) => void;
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
  pendingLayoutHasMappedSource: boolean;
  selectedLayoutCodeId?: string;
  selectedItemDirty?: boolean;
  selectedItemZUID?: string;
  clearSelection: () => void;
  updateStudioUrl: (path: string) => void;
  updateItemByPath: (
    path: string,
    options?: { onApplied?: () => void }
  ) => void;
  previewReloadContinuationRef: MutableRefObject<null | (() => void)>;
  setIsNavigating: (value: boolean) => void;
};

export const useStudioBridge = ({
  dispatch,
  interactionMode,
  syncBridgeInteractionMode,
  postCommandToBridge,
  handleTemplateSourceMap,
  handleReorderOutput,
  applyLayoutSelection,
  requestProceedWithPendingLayoutSave,
  clearLayoutSelection,
  applySelection,
  fieldNameByZuid,
  currentHoverStudioIdRef,
  pendingLayoutHasMappedSource,
  selectedLayoutCodeId,
  selectedItemDirty,
  selectedItemZUID,
  clearSelection,
  updateStudioUrl,
  updateItemByPath,
  previewReloadContinuationRef,
  setIsNavigating,
}: Args) => {
  const handleBridgeReady = useCallback(() => {
    postCommandToBridge({
      action: "injectCss",
      css: bridgeInjectedCss,
    });
    syncBridgeInteractionMode(interactionMode);
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
          if (
            pendingLayoutHasMappedSource &&
            selectedLayoutCodeId &&
            codeId &&
            codeId !== selectedLayoutCodeId
          ) {
            requestProceedWithPendingLayoutSave(() =>
              applyLayoutSelection({ codeId, layoutId, breadcrumb })
            );
            return;
          }
          applyLayoutSelection({ codeId, layoutId, breadcrumb });
          return;
        }

        case "escape": {
          if (interactionMode !== "layout") return;
          clearLayoutSelection();
          return;
        }

        case "click": {
          if (interactionMode === "layout") return;
          if (!fieldZuid) return;

          const isChangingItem =
            Boolean(itemZuid) &&
            Boolean(selectedItemZUID) &&
            itemZuid !== selectedItemZUID;
          if (isChangingItem && selectedItemDirty) {
            const openModal = (window as any).openContentNavigationModal;
            if (typeof openModal === "function") {
              openModal((shouldProceed: boolean) => {
                if (shouldProceed) {
                  applySelection({
                    studioId,
                    fieldZuid,
                    fieldType,
                    itemZuid,
                    modelZuid,
                  });
                }
              });
              return;
            }
          }

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
          if (interactionMode !== "content") return;
          if (!fieldZuid || !itemZuid) return;
          const fieldName = fieldNameByZuid.get(fieldZuid);
          if (!fieldName) return;

          dispatch({
            type: "SET_ITEM_DATA",
            itemZUID: itemZuid,
            key: fieldName,
            value: typeof value === "string" ? value : "",
          });
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
      pendingLayoutHasMappedSource,
      postCommandToBridge,
      requestProceedWithPendingLayoutSave,
      selectedItemDirty,
      selectedItemZUID,
      selectedLayoutCodeId,
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

      if (msg.type === "PATH_CHANGE") {
        const loc = msg.location || {};
        const path = (loc.path as string) || "/";
        const normalizedPath = normalizePath(path || "/");
        updateStudioUrl(normalizedPath);
        updateItemByPath(normalizedPath, { onApplied: clearSelection });
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
    handleReorderOutput,
    handleTemplateSourceMap,
    updateItemByPath,
    updateStudioUrl,
  ]);

  return {
    handlePreviewLoad,
  };
};
