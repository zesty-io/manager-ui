import { useCallback, useState } from "react";
import {
  ElementLayoutPatch,
  ElementSlot,
  LayoutBreadcrumbItem,
  InspectorSelection,
  SelectedElement,
  LayoutSelection,
} from "./studioTypes";

type Args = {
  postCommandToBridge: (cmd: any) => void;
  codeFileNameById: Record<string, string>;
  withCodeIdBreadcrumbRoot: (
    codeId: string,
    breadcrumb: LayoutBreadcrumbItem[],
    codeLabel?: string
  ) => LayoutBreadcrumbItem[];
};

export const useStudioSelection = ({
  postCommandToBridge,
  codeFileNameById,
  withCodeIdBreadcrumbRoot,
}: Args) => {
  const [selectedElement, setSelectedElement] =
    useState<SelectedElement | null>(null);
  const [selectedLayout, setSelectedLayout] = useState<LayoutSelection | null>(
    null
  );
  const [panelMode, setPanelMode] = useState<"info" | "edit" | "inspector">(
    "info"
  );
  const [filteredFieldName, setFilteredFieldName] = useState<string | null>(
    null
  );
  const [inspectorSelection, setInspectorSelection] =
    useState<InspectorSelection | null>(null);

  const disableContentEditing = useCallback(
    (studioId?: string, itemZuid?: string) => {
      if (!studioId) return;
      postCommandToBridge({
        action: "disableEditing",
        studioId,
        itemZuid,
      });
    },
    [postCommandToBridge]
  );

  const removeContentSelectedClass = useCallback(
    (studioId?: string, itemZuid?: string) => {
      if (!studioId) return;
      postCommandToBridge({
        action: "removeClass",
        studioId,
        className: "studio-selected",
        itemZuid,
      });
    },
    [postCommandToBridge]
  );

  const addContentSelectedClass = useCallback(
    (studioId?: string, itemZuid?: string) => {
      if (!studioId) return;
      postCommandToBridge({
        action: "addClass",
        studioId,
        className: "studio-selected",
        itemZuid,
      });
    },
    [postCommandToBridge]
  );

  // Remove whatever canvas highlight an inspector selection applied —
  // either a layout outline (by layoutId) or a content outline (by studioId).
  const removeInspectorHighlight = useCallback(
    (sel: InspectorSelection | null) => {
      if (!sel) return;
      if (sel.layoutPatch?.layoutId && sel.layoutPatch.codeId) {
        postCommandToBridge({
          action: "removeClassByLayoutId",
          codeId: sel.layoutPatch.codeId,
          layoutId: sel.layoutPatch.layoutId,
          className: "studio-selected",
        });
        return;
      }
      const dynamicAttr = sel.slots.find((a) => a.studioId);
      if (dynamicAttr?.studioId) {
        postCommandToBridge({
          action: "removeClass",
          studioId: dynamicAttr.studioId,
          className: "studio-selected",
          itemZuid: dynamicAttr.itemZuid,
        });
      }
    },
    [postCommandToBridge]
  );

  const clearSelection = useCallback(() => {
    if (selectedElement?.fieldZuid) {
      disableContentEditing(selectedElement.studioId, selectedElement.itemZuid);
      removeContentSelectedClass(
        selectedElement.studioId,
        selectedElement.itemZuid
      );
    }
    removeInspectorHighlight(inspectorSelection);
    setSelectedElement(null);
    setInspectorSelection(null);
    setFilteredFieldName(null);
    setPanelMode("info");
  }, [
    disableContentEditing,
    removeInspectorHighlight,
    removeContentSelectedClass,
    inspectorSelection,
    selectedElement,
  ]);

  const removeLayoutSelectedClass = useCallback(
    (codeId?: string, layoutId?: string) => {
      if (!codeId || !layoutId) return;
      postCommandToBridge({
        action: "removeClassByLayoutId",
        codeId,
        layoutId,
        className: "studio-selected",
      });
    },
    [postCommandToBridge]
  );

  const addLayoutSelectedClass = useCallback(
    (codeId?: string, layoutId?: string) => {
      if (!codeId || !layoutId) return;
      postCommandToBridge({
        action: "addClassByLayoutId",
        codeId,
        layoutId,
        className: "studio-selected",
      });
    },
    [postCommandToBridge]
  );

  const clearLayoutSelection = useCallback(() => {
    if (selectedLayout?.layoutId && selectedLayout.codeId) {
      removeLayoutSelectedClass(selectedLayout.codeId, selectedLayout.layoutId);
    }

    postCommandToBridge({
      action: "clearSelectedLayout",
    });
    setSelectedLayout(null);
  }, [postCommandToBridge, removeLayoutSelectedClass, selectedLayout]);

  const applyLayoutSelection = useCallback(
    (next: {
      codeId?: string;
      layoutId?: string;
      breadcrumb?: LayoutBreadcrumbItem[];
    }) => {
      const codeId = next.codeId || "";
      const layoutId = next.layoutId || "";
      if (!codeId || !layoutId) return;

      // Selecting a layout element closes any open Inspector panel. The <img>
      // path re-opens it right after via applyInspectorSelection.
      if (inspectorSelection) {
        removeInspectorHighlight(inspectorSelection);
        setInspectorSelection(null);
        setPanelMode((prev) => (prev === "inspector" ? "info" : prev));
      }

      if (
        selectedLayout?.layoutId &&
        (selectedLayout.layoutId !== layoutId ||
          selectedLayout.codeId !== codeId)
      ) {
        removeLayoutSelectedClass(
          selectedLayout.codeId,
          selectedLayout.layoutId
        );
      }

      if (!next.breadcrumb?.length) return;

      const breadcrumb = withCodeIdBreadcrumbRoot(
        codeId,
        next.breadcrumb,
        codeFileNameById[codeId]
      );

      setSelectedLayout({
        codeId,
        layoutId,
        breadcrumb,
      });

      addLayoutSelectedClass(codeId, layoutId);
    },
    [
      addLayoutSelectedClass,
      codeFileNameById,
      removeInspectorHighlight,
      removeLayoutSelectedClass,
      inspectorSelection,
      selectedLayout,
      withCodeIdBreadcrumbRoot,
    ]
  );

  const handleLayoutBreadcrumbSelect = useCallback(
    (layoutId: string) => {
      if (
        !selectedLayout?.codeId ||
        !layoutId ||
        !selectedLayout.breadcrumb.length
      ) {
        return;
      }

      const breadcrumbIndex = selectedLayout.breadcrumb.findIndex(
        (segment) => segment.layoutId === layoutId
      );
      if (breadcrumbIndex === -1) return;

      applyLayoutSelection({
        codeId: selectedLayout.codeId,
        layoutId,
        breadcrumb: selectedLayout.breadcrumb
          .slice(1, breadcrumbIndex + 1)
          .filter((segment) => Boolean(segment.layoutId)),
      });
      postCommandToBridge({
        action: "setSelectedLayoutId",
        codeId: selectedLayout.codeId,
        layoutId,
      });
    },
    [applyLayoutSelection, postCommandToBridge, selectedLayout]
  );

  const clearHighlightOnly = useCallback(() => {
    if (selectedElement?.fieldZuid) {
      disableContentEditing(selectedElement.studioId, selectedElement.itemZuid);
      removeContentSelectedClass(
        selectedElement.studioId,
        selectedElement.itemZuid
      );
    }
    setFilteredFieldName(null);
  }, [disableContentEditing, removeContentSelectedClass, selectedElement]);

  const applySelection = useCallback(
    (
      next: {
        studioId?: string;
        fieldZuid: string;
        fieldType?: string;
        itemZuid?: string;
        modelZuid?: string;
      },
      fieldNameByZuid: Map<string, string>
    ) => {
      const { studioId, fieldZuid, fieldType, itemZuid, modelZuid } = next;

      // Selecting a field that isn't one of the open attribute element's own
      // bindings means we've navigated away from it — close the Attributes
      // panel. Editing one of its dynamic attributes keeps it (for "Back").
      const editingOwnAttribute = inspectorSelection?.slots.some(
        (a) => a.fieldZuid === fieldZuid
      );
      if (!editingOwnAttribute && inspectorSelection) {
        removeInspectorHighlight(inspectorSelection);
        setInspectorSelection(null);
      }

      if (selectedElement?.studioId && selectedElement.studioId !== studioId) {
        disableContentEditing(
          selectedElement.studioId,
          selectedElement.itemZuid
        );
        removeContentSelectedClass(
          selectedElement.studioId,
          selectedElement.itemZuid
        );
      }

      setSelectedElement({
        studioId,
        fieldZuid,
        fieldType,
        itemZuid,
        modelZuid,
      });
      setFilteredFieldName(fieldNameByZuid.get(fieldZuid) || null);
      setPanelMode("edit");
      postCommandToBridge({
        action: "addClass",
        studioId,
        className: "studio-selected",
        itemZuid,
      });
      if (
        studioId &&
        fieldType &&
        [
          "text",
          "textarea",
          "markdown",
          "wysiwyg_basic",
          "wysiwyg_advanced",
          "images",
        ].includes(fieldType)
      ) {
        postCommandToBridge({
          action: "enableEditing",
          studioId,
          itemZuid,
        });
      }
    },
    [
      disableContentEditing,
      postCommandToBridge,
      removeInspectorHighlight,
      removeContentSelectedClass,
      inspectorSelection,
      selectedElement,
    ]
  );

  // Open the Inspector panel for an element (e.g. an <img>). Highlights the
  // element on the canvas — by layout id when addressable, otherwise by the
  // studio id of a dynamic attribute binding.
  const applyInspectorSelection = useCallback(
    (next: InspectorSelection) => {
      removeInspectorHighlight(inspectorSelection);
      // Opening the Inspector clears any content-field selection — including its
      // DOM highlight + contenteditable, not just the state. Nulling the state
      // alone would leave the previously-selected text element still outlined.
      if (selectedElement?.studioId) {
        disableContentEditing(
          selectedElement.studioId,
          selectedElement.itemZuid
        );
        removeContentSelectedClass(
          selectedElement.studioId,
          selectedElement.itemZuid
        );
      }
      setInspectorSelection(next);
      setSelectedElement(null);
      setFilteredFieldName(null);
      setPanelMode("inspector");

      if (next.layoutPatch?.layoutId && next.layoutPatch.codeId) {
        addLayoutSelectedClass(
          next.layoutPatch.codeId,
          next.layoutPatch.layoutId
        );
        return;
      }
      const dynamicAttr = next.slots.find((a) => a.studioId);
      if (dynamicAttr?.studioId) {
        addContentSelectedClass(dynamicAttr.studioId, dynamicAttr.itemZuid);
      }
    },
    [
      addContentSelectedClass,
      addLayoutSelectedClass,
      removeInspectorHighlight,
      inspectorSelection,
      selectedElement,
      disableContentEditing,
      removeContentSelectedClass,
    ]
  );

  // Return from a dynamic-attribute field edit back to the Inspector panel,
  // keeping the element selected but dropping the single-field editor state.
  const returnToInspector = useCallback(() => {
    if (selectedElement?.fieldZuid) {
      disableContentEditing(selectedElement.studioId, selectedElement.itemZuid);
      removeContentSelectedClass(
        selectedElement.studioId,
        selectedElement.itemZuid
      );
    }
    setSelectedElement(null);
    setFilteredFieldName(null);
    setPanelMode("inspector");
    // Re-apply the element highlight the field edit may have cleared.
    if (
      inspectorSelection?.layoutPatch?.layoutId &&
      inspectorSelection.layoutPatch.codeId
    ) {
      addLayoutSelectedClass(
        inspectorSelection.layoutPatch.codeId,
        inspectorSelection.layoutPatch.layoutId
      );
    } else {
      const dynamicAttr = inspectorSelection?.slots.find((a) => a.studioId);
      if (dynamicAttr?.studioId) {
        addContentSelectedClass(dynamicAttr.studioId, dynamicAttr.itemZuid);
      }
    }
  }, [
    addContentSelectedClass,
    addLayoutSelectedClass,
    disableContentEditing,
    removeContentSelectedClass,
    inspectorSelection,
    selectedElement,
  ]);

  // Re-sync the open panel's element from a freshly re-emitted layers tree
  // (same nodeId). This is STRUCTURAL only — it picks up which slots exist (e.g.
  // a tag swap img → video drops `alt`), the tag, and the patch.
  //
  // `preserveValues` (layout mode) keeps the values the panel is holding. There,
  // the tree's copy goes stale the moment you edit — the bridge re-reads the
  // un-patched template (and, for a live DOM edit, a diverged element) — so
  // re-pushing would clobber a pending edit or a just-picked media URL with the
  // original value. Content mode is read-only, so its values are never at risk
  // and MUST refresh: that's how a dynamic slot picks up its field name once
  // `fieldsState` loads.
  const refreshInspectorSlots = useCallback(
    (
      nodeId: string,
      tagName: string,
      slots: ElementSlot[],
      layoutPatch: ElementLayoutPatch | null,
      preserveValues: boolean
    ) => {
      setInspectorSelection((prev) => {
        if (!prev || prev.nodeId !== nodeId) return prev;
        const nextSlots = slots.map((slot) => {
          const prevSlot = prev.slots.find((p) => p.key === slot.key);
          // A slot that's new to this element (e.g. after a tag swap) always
          // takes the tree's value — the panel isn't holding one for it.
          if (!prevSlot) return slot;
          return {
            ...slot,
            value: preserveValues ? prevSlot.value : slot.value,
            // Never let a re-emit lock a slot that's already editable.
            layoutEditable: prevSlot.layoutEditable || slot.layoutEditable,
          };
        });
        if (
          prev.tagName === tagName &&
          JSON.stringify(prev.slots) === JSON.stringify(nextSlots)
        ) {
          return prev;
        }
        return { ...prev, tagName, slots: nextSlots, layoutPatch };
      });
    },
    []
  );

  // Patch a single slot's displayed value on the selected element (e.g. after
  // picking a new image `src` from the media library), so the panel reflects
  // it without waiting for a fresh layers tree.
  const updateInspectorSlotValue = useCallback((key: string, value: string) => {
    setInspectorSelection((prev) =>
      prev
        ? {
            ...prev,
            slots: prev.slots.map((s) => (s.key === key ? { ...s, value } : s)),
          }
        : prev
    );
  }, []);

  return {
    selectedElement,
    selectedLayout,
    inspectorSelection,
    panelMode,
    filteredFieldName,
    setSelectedLayout,
    clearSelection,
    clearLayoutSelection,
    applyLayoutSelection,
    handleLayoutBreadcrumbSelect,
    clearHighlightOnly,
    applySelection,
    applyInspectorSelection,
    returnToInspector,
    updateInspectorSlotValue,
    refreshInspectorSlots,
  };
};
