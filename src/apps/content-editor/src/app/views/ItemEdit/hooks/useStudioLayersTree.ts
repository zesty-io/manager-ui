import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ElementLayoutPatch,
  ElementSlot,
  InteractionMode,
  LayersDropPosition,
  LayersTreeNode,
  LayoutSelection,
  SelectedAttributeElement,
  SelectedElement,
} from "./studioTypes";

export type LayersFlatRow = {
  node: LayersTreeNode;
  depth: number;
  label: string;
  hasChildren: boolean;
  expanded: boolean;
  selected: boolean;
  selectable: boolean;
  draggable: boolean;
};

// Tags that can never receive children — mirrors the bridge's void-element
// guard so invalid "inside" drops are rejected before a command is posted.
const VOID_ELEMENT_TAGS = new Set([
  "area",
  "base",
  "br",
  "col",
  "embed",
  "hr",
  "img",
  "input",
  "link",
  "meta",
  "param",
  "source",
  "track",
  "wbr",
]);

const isLayersTreeNode = (node: any): node is LayersTreeNode =>
  !!node &&
  typeof node === "object" &&
  typeof node.id === "string" &&
  typeof node.kind === "string" &&
  Array.isArray(node.children);

type Args = {
  interactionMode: InteractionMode;
  postCommandToBridge: (cmd: any) => void;
  applyBridgeSelection: (next: {
    studioId?: string;
    fieldZuid: string;
    fieldType?: string;
    itemZuid?: string;
    modelZuid?: string;
  }) => void;
  applyLayoutSelection: (next: {
    codeId?: string;
    layoutId?: string;
    breadcrumb?: { layoutId?: string; label: string }[];
  }) => void;
  applyAttributeSelection: (next: SelectedAttributeElement) => void;
  refreshSelectedElementSlots: (
    nodeId: string,
    tagName: string,
    slots: ElementSlot[],
    layoutPatch: ElementLayoutPatch | null
  ) => void;
  codeFileNameById: Record<string, string>;
  fieldsState: Record<string, any>;
  selectedElement: SelectedElement | null;
  selectedLayout: LayoutSelection | null;
  selectedAttributeElement: SelectedAttributeElement | null;
  dndDisabled: boolean;
};

// An element node that exposes editable slots (e.g. an <img> or <h1>) —
// clickable in both modes to open the Attributes panel.
const isAttributeElement = (node: LayersTreeNode) =>
  node.kind === "element" && !!node.slots && node.slots.length > 0;

export const useStudioLayersTree = ({
  interactionMode,
  postCommandToBridge,
  applyBridgeSelection,
  applyLayoutSelection,
  applyAttributeSelection,
  refreshSelectedElementSlots,
  codeFileNameById,
  fieldsState,
  selectedElement,
  selectedLayout,
  selectedAttributeElement,
  dndDisabled,
}: Args) => {
  const [tree, setTree] = useState<LayersTreeNode[] | null>(null);
  // Everything is expanded by default; we only track what the user explicitly
  // collapses, so nodes that appear on later re-emits start open too.
  const [collapsedIds, setCollapsedIds] = useState<Set<string>>(new Set());

  const handleLayersTree = useCallback((msg: any) => {
    const nextTree: LayersTreeNode[] = Array.isArray(msg?.tree)
      ? msg.tree.filter(isLayersTreeNode)
      : [];
    setTree(nextTree);
  }, []);

  const resetTree = useCallback(() => {
    setTree(null);
    setCollapsedIds(new Set());
  }, []);

  const { nodeById, parentById } = useMemo(() => {
    const byId = new Map<string, LayersTreeNode>();
    const parents = new Map<string, LayersTreeNode | null>();
    const index = (nodes: LayersTreeNode[], parent: LayersTreeNode | null) => {
      nodes.forEach((node) => {
        byId.set(node.id, node);
        parents.set(node.id, parent);
        index(node.children, node);
      });
    };
    index(tree || [], null);
    return { nodeById: byId, parentById: parents };
  }, [tree]);

  const selectedNodeId = useMemo(() => {
    // An open Attributes panel owns the highlight in both modes.
    if (selectedAttributeElement) return selectedAttributeElement.nodeId;

    if (interactionMode === "layout") {
      if (!selectedLayout?.layoutId) return null;
      for (const node of nodeById.values()) {
        if (
          node.kind === "element" &&
          node.layoutId === selectedLayout.layoutId &&
          node.codeId === selectedLayout.codeId
        ) {
          return node.id;
        }
      }
      return null;
    }

    if (!selectedElement?.fieldZuid) return null;
    let fallbackId: string | null = null;
    for (const node of nodeById.values()) {
      if (node.kind !== "field") continue;
      // Match studioId AND fieldZuid: one element can bind several attributes
      // (e.g. img src + alt) under a single studioId, so studioId alone is
      // ambiguous — the fieldZuid disambiguates which binding is selected.
      if (
        selectedElement.studioId &&
        node.studioId === selectedElement.studioId &&
        node.fieldZuid === selectedElement.fieldZuid
      ) {
        return node.id;
      }
      if (
        !fallbackId &&
        node.fieldZuid === selectedElement.fieldZuid &&
        (!selectedElement.itemZuid ||
          node.itemZuid === selectedElement.itemZuid)
      ) {
        fallbackId = node.id;
      }
    }
    return fallbackId;
  }, [
    interactionMode,
    nodeById,
    selectedAttributeElement,
    selectedElement,
    selectedLayout,
  ]);

  const toggleNode = useCallback((nodeId: string) => {
    setCollapsedIds((prev) => {
      const next = new Set(prev);
      if (next.has(nodeId)) {
        next.delete(nodeId);
      } else {
        next.add(nodeId);
      }
      return next;
    });
  }, []);

  const getRowLabel = useCallback(
    (node: LayersTreeNode): string => {
      if (node.kind === "codeFile") {
        return node.codeId
          ? codeFileNameById[node.codeId] || node.codeId
          : "Page";
      }
      if (node.kind === "element") {
        return node.tagName || "element";
      }
      if (node.kind === "field") {
        // Dynamic content is labeled by its field name, not its value.
        const field = node.fieldZuid ? fieldsState[node.fieldZuid] : null;
        return field?.label || field?.name || node.fieldType || "Field";
      }
      // Static text shows its actual content.
      return node.label || "";
    },
    [codeFileNameById, fieldsState]
  );

  const isNodeSelectable = useCallback(
    (node: LayersTreeNode) => {
      // Elements with editable attributes (e.g. <img>) are clickable in both
      // modes to open the Attributes panel.
      if (isAttributeElement(node)) return true;
      if (interactionMode === "layout") {
        // Elements select on the canvas; static text rows are clickable to
        // enter inline static editing on their enclosing element.
        if (node.kind === "element") return !!node.layoutId && !!node.codeId;
        return node.kind === "text";
      }
      return node.kind === "field" && !!node.fieldZuid;
    },
    [interactionMode]
  );

  const flatRows = useMemo<LayersFlatRow[]>(() => {
    const rows: LayersFlatRow[] = [];
    const visit = (nodes: LayersTreeNode[], depth: number) => {
      nodes.forEach((node) => {
        const hasChildren = node.children.length > 0;
        const expanded = !collapsedIds.has(node.id);
        rows.push({
          node,
          depth,
          label: getRowLabel(node),
          hasChildren,
          expanded,
          selected: node.id === selectedNodeId,
          selectable: isNodeSelectable(node),
          draggable:
            !dndDisabled &&
            interactionMode === "layout" &&
            node.kind === "element" &&
            !!node.layoutId &&
            !!node.codeId,
        });
        if (hasChildren && expanded) {
          visit(node.children, depth + 1);
        }
      });
    };
    visit(tree || [], 0);
    return rows;
  }, [
    dndDisabled,
    collapsedIds,
    getRowLabel,
    interactionMode,
    isNodeSelectable,
    selectedNodeId,
    tree,
  ]);

  // Select a layout element on the canvas, building the breadcrumb from tree
  // ancestors so it matches a canvas click (header breadcrumb + bridge state).
  const selectLayoutElement = useCallback(
    (node: LayersTreeNode) => {
      const breadcrumb: { layoutId?: string; label: string }[] = [
        { layoutId: node.layoutId!, label: node.tagName || "element" },
      ];
      let parent = parentById.get(node.id) || null;
      while (parent) {
        if (parent.kind === "element" && parent.layoutId) {
          breadcrumb.unshift({
            layoutId: parent.layoutId,
            label: parent.tagName || "element",
          });
        }
        parent = parentById.get(parent.id) || null;
      }

      applyLayoutSelection({
        codeId: node.codeId!,
        layoutId: node.layoutId!,
        breadcrumb,
      });
      postCommandToBridge({
        action: "setSelectedLayoutId",
        codeId: node.codeId!,
        layoutId: node.layoutId!,
      });
    },
    [applyLayoutSelection, parentById, postCommandToBridge]
  );

  // A dynamic slot is bound to a content field — surface the field's name
  // rather than its resolved value (mirrors the layers-row label).
  const resolveSlotLabels = useCallback(
    (slots: ElementSlot[] | undefined): ElementSlot[] =>
      (slots || []).map((slot) => {
        if (!slot.isDynamic || !slot.fieldZuid) return slot;
        const field = fieldsState[slot.fieldZuid];
        const fieldName = field?.label || field?.name;
        return fieldName ? { ...slot, value: fieldName } : slot;
      }),
    [fieldsState]
  );

  const handleNodeSelect = useCallback(
    (node: LayersTreeNode) => {
      // Elements with editable attributes (e.g. <img>) open the Attributes
      // panel in both modes. In layout mode also select the element on the
      // canvas so the breadcrumb + outline follow.
      if (isAttributeElement(node)) {
        if (interactionMode === "layout" && node.layoutId && node.codeId) {
          selectLayoutElement(node);
        }
        applyAttributeSelection({
          nodeId: node.id,
          tagName: node.tagName || "element",
          slots: resolveSlotLabels(node.slots),
          layoutPatch: node.layoutPatch ?? null,
        });
        return;
      }

      // Static content in layout mode → enter inline static editing on the
      // nearest enclosing element (mirrors double-clicking it on the canvas).
      if (interactionMode === "layout" && node.kind === "text") {
        let host = parentById.get(node.id) || null;
        while (
          host &&
          !(host.kind === "element" && host.layoutId && host.codeId)
        ) {
          host = parentById.get(host.id) || null;
        }
        if (!host) return;
        selectLayoutElement(host);
        postCommandToBridge({
          action: "enterStaticEditingByLayoutId",
          codeId: host.codeId!,
          layoutId: host.layoutId!,
        });
        return;
      }

      if (!isNodeSelectable(node)) {
        if (node.children.length) toggleNode(node.id);
        return;
      }

      if (interactionMode === "layout") {
        selectLayoutElement(node);
        return;
      }

      applyBridgeSelection({
        studioId: node.studioId,
        fieldZuid: node.fieldZuid!,
        fieldType: node.fieldType,
        itemZuid: node.itemZuid,
        modelZuid: node.modelZuid,
      });
    },
    [
      applyAttributeSelection,
      applyBridgeSelection,
      interactionMode,
      isNodeSelectable,
      parentById,
      postCommandToBridge,
      resolveSlotLabels,
      selectLayoutElement,
      toggleNode,
    ]
  );

  // When the tree re-emits (e.g. after a tag swap changes which slots exist),
  // refresh the open panel's element so it shows the new type's slots.
  useEffect(() => {
    const nodeId = selectedAttributeElement?.nodeId;
    if (!nodeId) return;
    const node = nodeById.get(nodeId);
    if (!node || !isAttributeElement(node)) return;
    refreshSelectedElementSlots(
      nodeId,
      node.tagName || "element",
      resolveSlotLabels(node.slots),
      node.layoutPatch ?? null
    );
  }, [
    nodeById,
    refreshSelectedElementSlots,
    resolveSlotLabels,
    selectedAttributeElement,
  ]);

  const canDrop = useCallback(
    (
      sourceId: string,
      targetId: string,
      position: LayersDropPosition
    ): boolean => {
      if (dndDisabled || interactionMode !== "layout") return false;
      const source = nodeById.get(sourceId);
      const target = nodeById.get(targetId);
      if (!source || !target || source === target) return false;
      if (source.kind !== "element" || target.kind !== "element") return false;
      if (!source.layoutId || !source.codeId || !target.layoutId) return false;
      // Reordering relative to a target keeps it in its parent; dropping
      // before/after a region root would move the element outside its code
      // region, so require a codeId on the target either way.
      if (!target.codeId) return false;

      // A node can't be dropped into its own subtree.
      let parent = parentById.get(targetId) || null;
      while (parent) {
        if (parent.id === sourceId) return false;
        parent = parentById.get(parent.id) || null;
      }

      if (
        position === "inside" &&
        target.tagName &&
        VOID_ELEMENT_TAGS.has(target.tagName)
      ) {
        return false;
      }

      return true;
    },
    [dndDisabled, interactionMode, nodeById, parentById]
  );

  const handleNodeDrop = useCallback(
    (sourceId: string, targetId: string, position: LayersDropPosition) => {
      if (!canDrop(sourceId, targetId, position)) return;
      const source = nodeById.get(sourceId)!;
      const target = nodeById.get(targetId)!;

      // Select the dragged element first — canvas drags require selection,
      // and the reorder pipeline re-roots the current selection's breadcrumb.
      // Select it as a layout element directly (not via handleNodeSelect) so a
      // draggable img doesn't pop open the Attributes panel mid-drag.
      selectLayoutElement(source);

      postCommandToBridge({
        action: "moveLayoutElement",
        layoutId: source.layoutId,
        codeId: source.codeId,
        targetLayoutId: target.layoutId,
        targetCodeId: target.codeId,
        position,
      });
    },
    [canDrop, nodeById, postCommandToBridge, selectLayoutElement]
  );

  return {
    hasTree: tree !== null,
    flatRows,
    selectedNodeId,
    handleLayersTree,
    resetTree,
    toggleNode,
    handleNodeSelect,
    canDrop,
    handleNodeDrop,
  };
};
