import { useCallback, useMemo, useState } from "react";
import {
  InteractionMode,
  LayersDropPosition,
  LayersTreeNode,
  LayoutSelection,
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
  codeFileNameById: Record<string, string>;
  fieldsState: Record<string, any>;
  selectedElement: SelectedElement | null;
  selectedLayout: LayoutSelection | null;
  dndDisabled: boolean;
};

export const useStudioLayersTree = ({
  interactionMode,
  postCommandToBridge,
  applyBridgeSelection,
  applyLayoutSelection,
  codeFileNameById,
  fieldsState,
  selectedElement,
  selectedLayout,
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
  }, [interactionMode, nodeById, selectedElement, selectedLayout]);

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

  const handleNodeSelect = useCallback(
    (node: LayersTreeNode) => {
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
      applyBridgeSelection,
      interactionMode,
      isNodeSelectable,
      parentById,
      postCommandToBridge,
      selectLayoutElement,
      toggleNode,
    ]
  );

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
      handleNodeSelect(source);

      postCommandToBridge({
        action: "moveLayoutElement",
        layoutId: source.layoutId,
        codeId: source.codeId,
        targetLayoutId: target.layoutId,
        targetCodeId: target.codeId,
        position,
      });
    },
    [canDrop, handleNodeSelect, nodeById, postCommandToBridge]
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
