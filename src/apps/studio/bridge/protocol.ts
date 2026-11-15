// The host <-> bridge postMessage protocol, as types.
//
// The wire strings here mirror studio-bridge's `bridge.js`: the
// `handleIncomingMessage` dispatch for commands, and its `post(...)` calls for
// messages. That file lives in another repo, so a change on either side needs
// the matching change on the other.
//
// Nothing consumes `HostCommand` or `BridgeMessage` yet: `postCommandToBridge`
// and `useStudioBridge` keep their own types until the transport is typed
// (#4466, phase 5). Only the envelope source constants are live.

import type {
  InteractionMode,
  LayersDropPosition,
  LayersTreeNode,
} from "../hooks/studioTypes";
import type { StudioHistoryDirection } from "../hooks/useStudioHistory";
import type { CodeRegionReplaced } from "../hooks/useStudioAiEdit";

export const HOST_SOURCE = "zesty-studio-host" as const;
export const BRIDGE_SOURCE = "studio-bridge" as const;

// Classes the bridge toggles on canvas elements for the host.
export const CANVAS_CLASS = {
  selected: "studio-selected",
  hover: "studio-hover",
} as const;

export type StudioSelectionClass =
  (typeof CANVAS_CLASS)[keyof typeof CANVAS_CLASS];

// The bridge is binary: Studio's "full" mode goes over the wire as "layout".
export type WireInteractionMode = Exclude<InteractionMode, "full">;

// The host also sends `itemZuid` with these; the bridge never reads it.
type StudioTarget = { studioId: string; itemZuid?: string };
type LayoutTarget = { codeId: string; layoutId: string };

export type FieldRef = { fieldZuid: string; itemZuid: string };

// Host -> bridge: `message.payload` of a COMMAND envelope.
export type HostCommand =
  | { action: "injectCss"; css: string }
  | { action: "requestLayersTree" }
  | { action: "setInteractionMode"; mode: WireInteractionMode }
  | { action: "enableReorderByUid"; selector: string }
  | { action: "disableReorderByUid" }
  | ({ action: "addClass"; className: StudioSelectionClass } & StudioTarget)
  | ({ action: "removeClass"; className: StudioSelectionClass } & StudioTarget)
  | ({ action: "enableEditing" } & StudioTarget)
  | ({ action: "disableEditing" } & StudioTarget)
  | ({
      action: "addClassByLayoutId";
      className: typeof CANVAS_CLASS.selected;
    } & LayoutTarget)
  | ({
      action: "removeClassByLayoutId";
      className: typeof CANVAS_CLASS.selected;
    } & LayoutTarget)
  | ({ action: "setSelectedLayoutId" } & LayoutTarget)
  | { action: "clearSelectedLayout" }
  | ({ action: "enterStaticEditingByLayoutId" } & LayoutTarget)
  | ({
      action: "moveLayoutElement";
      targetLayoutId: string;
      targetCodeId: string;
      position: LayersDropPosition;
    } & LayoutTarget)
  | ({ action: "setTextByField"; value: string } & FieldRef)
  | ({ action: "setHtmlByField"; html: string } & FieldRef)
  | ({ action: "setAttrByField"; attr: string; value: string } & FieldRef)
  | {
      action: "updateImageSrc";
      layoutId: string;
      isLeafImg: boolean;
      imgIndex: number;
      newSrc: string;
    }
  | {
      action: "updateElementAttr";
      layoutId: string;
      isSelf: boolean;
      tagName: string;
      elementIndex: number;
      attr: string;
      value: string;
      booleanAttr?: boolean;
    }
  | {
      action: "updateElementText";
      codeId: string;
      layoutId: string;
      value: string;
      previewValue?: string;
      previewAsHtml?: boolean;
      textIndex?: number;
    }
  | { action: "updateElementTag"; layoutId: string; newTag: string }
  | {
      action: "wrapElementInLink";
      layoutId: string;
      href?: string;
      target?: string;
    }
  | { action: "unwrapElementLink"; layoutId: string }
  | { action: "syncTemplateSource"; codeId: string; source: string }
  | {
      action: "replaceCodeRegion";
      codeId: string;
      html: string;
      requestId: number;
    }
  | { action: "setPreviewLock"; locked: boolean }
  | {
      action: "historySnapshot";
      stepId: number;
      codeIds: string[];
      fields: FieldRef[];
    }
  | {
      action: "historyRestore";
      stepId: number;
      direction: StudioHistoryDirection;
    }
  | { action: "historyDrop"; stepIds: number[]; discard?: boolean }
  | { action: "historyReset" };

export type BridgeLocation = {
  path: string;
  search: string;
  hash: string;
  href: string;
};

export type CommandEnvelope = {
  source: typeof HOST_SOURCE;
  message: { type: "COMMAND"; payload: HostCommand };
};

// Sent to Studio's own parent window when Studio is embedded, not to the
// bridge.
export type PathChangeEnvelope = {
  source: typeof HOST_SOURCE;
  message: { type: "PATH_CHANGE"; location: BridgeLocation };
};

// `buildDataset` in the bridge: every key is present, "" when unknown.
type FieldDataset = {
  studioId: string;
  fieldZuid: string;
  itemZuid: string;
  modelZuid: string;
  fieldType: string;
  attr: string;
};

type BreadcrumbSegment = { layoutId: string; label: string };

// Field and layout events share the mouseover, mouseout and escape event
// types, so `eventType` alone does not discriminate them: the dataset keys do.
export type DomEventMessage = {
  type: "DOM_EVENT";
  clientX?: number;
  clientY?: number;
} & (
  | {
      eventType: "click" | "mouseover" | "mouseout" | "escape";
      element: { dataset: FieldDataset };
    }
  | {
      eventType: "input";
      element: { dataset: FieldDataset };
      value: string;
    }
  | {
      eventType: "mousedown" | "dblclick" | "mouseover" | "mouseout";
      element: { dataset: { layoutId: string; codeId: string } };
      breadcrumb: BreadcrumbSegment[];
    }
  | {
      eventType: "escape";
      element: { dataset: Record<string, never> };
      breadcrumb: BreadcrumbSegment[];
    }
);

// One region of a REORDER_OUTPUT.
export type RegionPayload = {
  codeId: string | null;
  selector: string;
  orderedLayoutIds: string[];
  layoutStructure: { layoutId: string; parentLayoutId: string | null }[];
  outputHtml: string;
};

// Bridge -> host: `message` of an envelope whose source is BRIDGE_SOURCE.
export type BridgeMessage =
  | { type: "BRIDGE_READY"; path: string; capabilities: string[] }
  | {
      type: "BRIDGE_ERROR";
      kind: "context_parse" | "error";
      error: {
        message: string;
        filename: string | null;
        lineno: number | null;
        colno: number | null;
        stack: string | null;
      };
    }
  | {
      type: "TEMPLATE_SOURCE_MAP";
      templateSourceByCodeId: Record<string, string>;
    }
  | { type: "LAYERS_TREE"; tree: LayersTreeNode[] }
  | DomEventMessage
  | {
      type: "REORDER_OUTPUT";
      regions: RegionPayload[];
      primaryCodeId: string | null;
      selectedLayoutId: string | null;
      selectedLayoutBreadcrumb: BreadcrumbSegment[];
      selector: string;
    }
  | {
      type: "LAYOUT_CONTENT_UPDATE";
      // Echoes the host's codeId when the edit came from updateElementText.
      codeId: string;
      layoutId: string;
      innerHtml: string;
    }
  | {
      type: "DYNAMIC_EDIT_REQUEST";
      codeId: string;
      layoutId: string;
      // Inferred: copied from the studio marker binding, not normalised.
      studioId: string;
      fieldZuid: string;
      fieldType: string;
      itemZuid: string;
      modelZuid: string;
    }
  | { type: "STATIC_EDIT_REJECTED"; layoutId: string }
  | {
      type: "STATIC_EDIT_IMAGE";
      codeId: string;
      layoutId: string;
      isLeafImg: boolean;
      imgIndex: number;
      currentSrc: string;
    }
  | ({ type: "CODE_REGION_REPLACED" } & CodeRegionReplaced & {
        error?: string;
      })
  | { type: "HISTORY_KEY"; action: StudioHistoryDirection }
  | {
      type: "HISTORY_RESTORED";
      stepId: number;
      direction: StudioHistoryDirection;
      codeIds: string[];
      ok: boolean;
      // Left open: the bridge adds failure reasons over time.
      reason?: string;
      error?: string;
    }
  // No host handler yet.
  | {
      type: "HISTORY_SNAPSHOT";
      stepId: number;
      codeIds: string[];
      ok: boolean;
      reason?: string;
    }
  // No host handler yet.
  | {
      type: "PATH_CHANGE";
      reason:
        | "init"
        | "popstate"
        | "hashchange"
        | "pushState"
        | "replaceState"
        | "anchor"
        | "form"
        | null;
      location: BridgeLocation;
    };
