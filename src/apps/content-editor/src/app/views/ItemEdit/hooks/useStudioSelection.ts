import { useCallback, useState } from "react";
import {
  ElementLayoutPatch,
  ElementSlot,
  LayoutBreadcrumbItem,
  SelectedAttributeElement,
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
  const [panelMode, setPanelMode] = useState<"info" | "edit" | "attributes">(
    "info"
  );
  const [filteredFieldName, setFilteredFieldName] = useState<string | null>(
    null
  );
  const [selectedAttributeElement, setSelectedAttributeElement] =
    useState<SelectedAttributeElement | null>(null);

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

  // Remove whatever canvas highlight an attribute-element selection applied —
  // either a layout outline (by layoutId) or a content outline (by studioId).
  const removeAttributeElementHighlight = useCallback(
    (sel: SelectedAttributeElement | null) => {
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
    removeAttributeElementHighlight(selectedAttributeElement);
    setSelectedElement(null);
    setSelectedAttributeElement(null);
    setFilteredFieldName(null);
    setPanelMode("info");
  }, [
    disableContentEditing,
    removeAttributeElementHighlight,
    removeContentSelectedClass,
    selectedAttributeElement,
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

      // Selecting a layout element closes any open Attributes panel. The <img>
      // path re-opens it right after via applyAttributeSelection.
      if (selectedAttributeElement) {
        removeAttributeElementHighlight(selectedAttributeElement);
        setSelectedAttributeElement(null);
        setPanelMode((prev) => (prev === "attributes" ? "info" : prev));
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
      removeAttributeElementHighlight,
      removeLayoutSelectedClass,
      selectedAttributeElement,
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
      const editingOwnAttribute = selectedAttributeElement?.slots.some(
        (a) => a.fieldZuid === fieldZuid
      );
      if (!editingOwnAttribute && selectedAttributeElement) {
        removeAttributeElementHighlight(selectedAttributeElement);
        setSelectedAttributeElement(null);
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
      removeAttributeElementHighlight,
      removeContentSelectedClass,
      selectedAttributeElement,
      selectedElement,
    ]
  );

  // Open the Attributes panel for an element (e.g. an <img>). Highlights the
  // element on the canvas — by layout id when addressable, otherwise by the
  // studio id of a dynamic attribute binding.
  const applyAttributeSelection = useCallback(
    (next: SelectedAttributeElement) => {
      removeAttributeElementHighlight(selectedAttributeElement);
      setSelectedAttributeElement(next);
      setSelectedElement(null);
      setFilteredFieldName(null);
      setPanelMode("attributes");

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
      removeAttributeElementHighlight,
      selectedAttributeElement,
    ]
  );

  // Return from a dynamic-attribute field edit back to the Attributes panel,
  // keeping the element selected but dropping the single-field editor state.
  const returnToAttributes = useCallback(() => {
    if (selectedElement?.fieldZuid) {
      disableContentEditing(selectedElement.studioId, selectedElement.itemZuid);
      removeContentSelectedClass(
        selectedElement.studioId,
        selectedElement.itemZuid
      );
    }
    setSelectedElement(null);
    setFilteredFieldName(null);
    setPanelMode("attributes");
    // Re-apply the element highlight the field edit may have cleared.
    if (
      selectedAttributeElement?.layoutPatch?.layoutId &&
      selectedAttributeElement.layoutPatch.codeId
    ) {
      addLayoutSelectedClass(
        selectedAttributeElement.layoutPatch.codeId,
        selectedAttributeElement.layoutPatch.layoutId
      );
    } else {
      const dynamicAttr = selectedAttributeElement?.slots.find(
        (a) => a.studioId
      );
      if (dynamicAttr?.studioId) {
        addContentSelectedClass(dynamicAttr.studioId, dynamicAttr.itemZuid);
      }
    }
  }, [
    addContentSelectedClass,
    addLayoutSelectedClass,
    disableContentEditing,
    removeContentSelectedClass,
    selectedAttributeElement,
    selectedElement,
  ]);

  // Re-sync the open panel's element from a freshly re-emitted layers tree
  // (same nodeId) — e.g. after a tag swap changes which slots exist (img → video
  // drops `alt`). No-ops when nothing changed to avoid needless re-renders. The
  // panel owns its input values locally, so this never clobbers in-progress
  // typing; it only refreshes the slot set / tag / patch.
  const refreshSelectedElementSlots = useCallback(
    (
      nodeId: string,
      tagName: string,
      slots: ElementSlot[],
      layoutPatch: ElementLayoutPatch | null
    ) => {
      setSelectedAttributeElement((prev) => {
        if (!prev || prev.nodeId !== nodeId) return prev;
        if (
          prev.tagName === tagName &&
          JSON.stringify(prev.slots) === JSON.stringify(slots)
        ) {
          return prev;
        }
        return { ...prev, tagName, slots, layoutPatch };
      });
    },
    []
  );

  // Patch a single slot's displayed value on the selected element (e.g. after
  // picking a new image `src` from the media library), so the panel reflects
  // it without waiting for a fresh layers tree.
  const updateSelectedSlotValue = useCallback((key: string, value: string) => {
    setSelectedAttributeElement((prev) =>
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
    selectedAttributeElement,
    panelMode,
    filteredFieldName,
    setSelectedLayout,
    clearSelection,
    clearLayoutSelection,
    applyLayoutSelection,
    handleLayoutBreadcrumbSelect,
    clearHighlightOnly,
    applySelection,
    applyAttributeSelection,
    returnToAttributes,
    updateSelectedSlotValue,
    refreshSelectedElementSlots,
  };
};
