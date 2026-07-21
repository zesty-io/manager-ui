import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ElementLayoutPatch,
  ElementSlot,
  InteractionMode,
  LayersDropPosition,
  LayersTreeNode,
  LayoutSelection,
  InspectorSelection,
  SelectedElement,
} from "./studioTypes";
import { NO_TAG, isTextTag } from "../components/StudioWrapper/studioTags";

export type LayersFlatRow = {
  node: LayersTreeNode;
  depth: number;
  // Tag of the enclosing element row, if any. A text node uses it to tell
  // whether a text element above it already identifies the text (an <h1>), or
  // whether it is loose in a container (<div>hello</div>) and has to stand in
  // for the missing text element itself.
  parentTagName: string | null;
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
  applyInspectorSelection: (next: InspectorSelection) => void;
  refreshInspectorSlots: (
    nodeId: string,
    tagName: string,
    slots: ElementSlot[],
    layoutPatch: ElementLayoutPatch | null,
    preserveValues: boolean
  ) => void;
  codeFileNameById: Record<string, string>;
  fieldsState: Record<string, any>;
  selectedElement: SelectedElement | null;
  selectedLayout: LayoutSelection | null;
  inspectorSelection: InspectorSelection | null;
  dndDisabled: boolean;
};

// Content rows the tree treats as "the element's text": a static text run, or a
// field rendering inline (an attribute binding is a field row too, but it is not
// the element's text).
const isInlineTextNode = (node: LayersTreeNode) =>
  node.kind === "text" || (node.kind === "field" && !node.attr);

// Give every un-wrapped run of text a text element to live under.
//
// The bridge reports the DOM as it is, so `<div>hello</div>` arrives as a text
// row hanging directly off a container, while `<h1>hello</h1>` arrives as a text
// element with the text nested inside it. Those are the same thing to a user —
// text, and the tag around it — so the tree shouldn't render them as two
// different shapes. Here we insert a placeholder text element wherever one is
// missing, giving both cases the identical container/value pair:
//
//   <h1>hello</h1>     h1       →  hello
//   <div>hello</div>   div → No Tag → hello
//
// The placeholder is PRESENTATIONAL. It deliberately carries no layoutPatch,
// which is what makes its Tag selector read-only downstream (canChangeTag keys
// off layoutPatch.isSelf).
//
// Giving it a tag would have to WRAP the text in a new element, and that is a
// different operation from the tag swap this panel does — one we can't perform
// yet. Every address in the patch layer is a data-layout-id, and loose text
// doesn't have one: addressing it means indexing text runs positionally, which
// is only sound when the template and the rendered DOM have the same shape.
// Parsley loops and conditionals break that, and guessing wrong writes the edit
// into the wrong place in the customer's source. So the tag stays read-only
// until positional addressing is built with a correspondence check behind it.
const withTextElementPlaceholders = (
  nodes: LayersTreeNode[],
  parentTagName: string | null
): LayersTreeNode[] =>
  nodes.map((node) => {
    const next: LayersTreeNode = {
      ...node,
      children: withTextElementPlaceholders(node.children, node.tagName),
    };

    // Already inside a text element (or is not text at all) — nothing to do.
    if (!isInlineTextNode(next) || isTextTag(parentTagName)) return next;

    return {
      id: `${next.id}:noTag`,
      kind: "element",
      tagName: NO_TAG,
      codeId: next.codeId,
      // No layout id of its own: this element does not exist in the markup.
      layoutId: null,
      layoutPatch: null,
      // An array (even empty) is what makes a node open the Inspector, so the
      // placeholder behaves like any other element row: click it, see its tag.
      slots: [],
      children: [next],
    };
  });

// A node the Inspector panel can open: a supported element (its `slots` array
// is set — attributes and/or the Tag selector, even when empty for a plain
// heading or the No Tag placeholder), a text node carrying an editable Text
// slot, or — in layout mode only — a dynamic field row, whose slot holds the
// underlying code reference. In content mode a field row still routes to the
// content editor instead.
const isPanelNode = (node: LayersTreeNode, interactionMode: InteractionMode) =>
  Array.isArray(node.slots) &&
  (node.kind === "element" ||
    node.kind === "text" ||
    (node.kind === "field" && interactionMode === "layout"));

export const useStudioLayersTree = ({
  interactionMode,
  postCommandToBridge,
  applyBridgeSelection,
  applyLayoutSelection,
  applyInspectorSelection,
  refreshInspectorSlots,
  codeFileNameById,
  fieldsState,
  selectedElement,
  selectedLayout,
  inspectorSelection,
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
    setTree(withTextElementPlaceholders(nextTree, null));
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
    // An open Inspector panel owns the highlight in both modes.
    if (inspectorSelection) return inspectorSelection.nodeId;

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
    inspectorSelection,
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
        // The placeholder is a text element that has no tag yet — the tree calls
        // it what it is. "No Tag" is a statement about its tag, and that belongs
        // in the Tag selector, not in the row's name.
        if (node.tagName === NO_TAG) return "Text";
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
      // modes to open the Inspector panel.
      if (isPanelNode(node, interactionMode)) return true;
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
    const visit = (
      nodes: LayersTreeNode[],
      depth: number,
      parentTagName: string | null
    ) => {
      nodes.forEach((node) => {
        const hasChildren = node.children.length > 0;
        const expanded = !collapsedIds.has(node.id);
        rows.push({
          node,
          depth,
          parentTagName,
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
          visit(node.children, depth + 1, node.tagName);
        }
      });
    };
    visit(tree || [], 0, null);
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

  // Pick which of a slot's two values the panel shows, by mode:
  //   layout  — the RAW template value (what you're actually editing). Never the
  //             resolved output, which would bake over a Parsley binding.
  //   content — the resolved value; a field-bound slot shows the field's NAME
  //             (mirrors the layers-row label) and clicks through to its editor.
  const resolveSlotValues = useCallback(
    (slots: ElementSlot[] | undefined): ElementSlot[] =>
      (slots || []).map((slot) => {
        if (interactionMode === "layout") {
          return slot.sourceValue !== undefined
            ? { ...slot, value: slot.sourceValue }
            : slot;
        }
        if (!slot.isDynamic || !slot.fieldZuid) return slot;
        const field = fieldsState[slot.fieldZuid];
        const fieldName = field?.label || field?.name;
        return fieldName ? { ...slot, value: fieldName } : slot;
      }),
    [fieldsState, interactionMode]
  );

  const handleNodeSelect = useCallback(
    (node: LayersTreeNode) => {
      // Elements (Tag selector + attributes) and editable text nodes (Text
      // input) open the Inspector panel in both modes. In layout mode an
      // element also selects on the canvas so the breadcrumb + outline follow;
      // a text node has no layoutId so it skips that. An empty tagName marks a
      // text node — the panel titles it "Text" and hides the Tag selector.
      if (isPanelNode(node, interactionMode)) {
        if (interactionMode === "layout" && node.layoutId && node.codeId) {
          selectLayoutElement(node);
        }
        applyInspectorSelection({
          nodeId: node.id,
          tagName: node.tagName || "",
          slots: resolveSlotValues(node.slots),
          layoutPatch: node.layoutPatch ?? null,
        });
        return;
      }

      // Non-editable static text in layout mode → enter inline static editing
      // on the nearest enclosing element (mirrors double-clicking on canvas).
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
      applyInspectorSelection,
      applyBridgeSelection,
      interactionMode,
      isNodeSelectable,
      parentById,
      postCommandToBridge,
      resolveSlotValues,
      selectLayoutElement,
      toggleNode,
    ]
  );

  // When the tree re-emits (e.g. after a tag swap changes which slots exist),
  // refresh the open panel's element so it shows the new type's slots.
  useEffect(() => {
    const nodeId = inspectorSelection?.nodeId;
    if (!nodeId) return;
    const node = nodeById.get(nodeId);
    if (!node || !isPanelNode(node, interactionMode)) return;
    refreshInspectorSlots(
      nodeId,
      // Empty tagName marks a text/field row — the panel titles it "Text" and
      // hides the Tag selector.
      node.tagName || "",
      resolveSlotValues(node.slots),
      node.layoutPatch ?? null,
      // Only layout mode holds editable values worth protecting from a re-emit.
      interactionMode === "layout"
    );
  }, [
    interactionMode,
    nodeById,
    refreshInspectorSlots,
    resolveSlotValues,
    inspectorSelection,
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
      // draggable img doesn't pop open the Inspector panel mid-drag.
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
