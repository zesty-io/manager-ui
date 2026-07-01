import { useCallback, useState } from "react";
import {
  LayoutBreadcrumbItem,
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
  const [panelMode, setPanelMode] = useState<"info" | "edit">("info");
  const [filteredFieldName, setFilteredFieldName] = useState<string | null>(
    null
  );

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

  const clearSelection = useCallback(() => {
    if (selectedElement?.fieldZuid) {
      disableContentEditing(selectedElement.studioId, selectedElement.itemZuid);
      removeContentSelectedClass(
        selectedElement.studioId,
        selectedElement.itemZuid
      );
    }
    setSelectedElement(null);
    setFilteredFieldName(null);
    setPanelMode("info");
  }, [disableContentEditing, removeContentSelectedClass, selectedElement]);

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
      removeLayoutSelectedClass,
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
      removeContentSelectedClass,
      selectedElement,
    ]
  );

  return {
    selectedElement,
    selectedLayout,
    panelMode,
    filteredFieldName,
    setSelectedLayout,
    clearSelection,
    clearLayoutSelection,
    applyLayoutSelection,
    handleLayoutBreadcrumbSelect,
    clearHighlightOnly,
    applySelection,
  };
};
