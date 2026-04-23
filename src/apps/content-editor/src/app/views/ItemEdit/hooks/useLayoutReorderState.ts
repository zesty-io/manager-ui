import { useCallback, useRef, useState } from "react";
import { notify } from "../../../../../../../shell/store/notifications";
import { LayoutBreadcrumbItem } from "./studioTypes";

type LayoutStructureItem = {
  layoutId: string;
  parentLayoutId: string | null;
};

const isLayoutBreadcrumbItem = (
  segment: unknown
): segment is LayoutBreadcrumbItem =>
  Boolean(
    segment &&
      typeof segment === "object" &&
      typeof (segment as LayoutBreadcrumbItem).label === "string"
  );

type LayoutReorderState = {
  codeId: string | null;
  selector: string;
  orderedLayoutIds: string[];
  layoutStructure: LayoutStructureItem[];
  outputHtml: string;
  mappedSource: string;
};

const mapSourceByLayoutStructure = (
  source: string,
  layoutStructure: LayoutStructureItem[]
) => {
  if (!source || !layoutStructure?.length) return source;

  const parser = new DOMParser();
  const doc = parser.parseFromString(
    `<div id="studio-root">${source}</div>`,
    "text/html"
  );
  const root = doc.getElementById("studio-root");
  if (!root) return source;

  const elementByLayoutId = new Map<string, Element>();
  Array.from(root.querySelectorAll("[data-layout-id]")).forEach((node) => {
    const layoutId = node.getAttribute("data-layout-id");
    if (!layoutId || elementByLayoutId.has(layoutId)) return;
    elementByLayoutId.set(layoutId, node);
  });

  const childIdsByParent = new Map<string, string[]>();
  layoutStructure.forEach(({ layoutId, parentLayoutId }) => {
    if (!elementByLayoutId.has(layoutId)) return;
    const parentKey = parentLayoutId || "__root__";
    const siblings = childIdsByParent.get(parentKey) || [];
    siblings.push(layoutId);
    childIdsByParent.set(parentKey, siblings);
  });

  const orderedParentKeys = Array.from(childIdsByParent.keys()).sort((a, b) =>
    a === "__root__" ? -1 : b === "__root__" ? 1 : 0
  );

  orderedParentKeys.forEach((parentKey) => {
    const parentNode =
      parentKey === "__root__" ? root : elementByLayoutId.get(parentKey);
    const childIds = childIdsByParent.get(parentKey) || [];
    if (!parentNode) return;

    childIds.forEach((layoutId) => {
      const childNode = elementByLayoutId.get(layoutId);
      if (!childNode || childNode === parentNode) return;
      if (childNode.contains(parentNode)) return;
      parentNode.appendChild(childNode);
    });
  });

  var whitespaceNodes = [];
  var walker = doc.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  var currentNode = walker.nextNode();
  while (currentNode) {
    if (!currentNode.textContent || currentNode.textContent.trim() !== "") {
      currentNode = walker.nextNode();
      continue;
    }
    whitespaceNodes.push(currentNode);
    currentNode = walker.nextNode();
  }

  whitespaceNodes.forEach(function (node) {
    if (node.parentNode) {
      node.parentNode.removeChild(node);
    }
  });

  return root.innerHTML;
};

// Apply the bridge's edited innerHTML to the cached template source while
// preserving every nested [data-layout-id] subtree from the template. The
// bridge locks nested layouts read-only during editing, so the incoming
// `innerHtml` has the same set of descendant layouts, but their contents are
// the live/resolved HTML — we swap each one back to the template snapshot so
// Parsley expressions and studio-field markers are never baked in.
const patchLeafInnerHtml = (
  source: string,
  layoutId: string,
  innerHtml: string
): string | null => {
  if (!source || !layoutId) return null;

  const parser = new DOMParser();
  const doc = parser.parseFromString(
    `<div id="studio-patch-root">${source}</div>`,
    "text/html"
  );
  const root = doc.getElementById("studio-patch-root");
  if (!root) return null;

  const leaf = root.querySelector(`[data-layout-id="${layoutId}"]`);
  if (!leaf) return null;

  const descendantSnapshots = new Map<string, string>();
  leaf.querySelectorAll("[data-layout-id]").forEach((node) => {
    const id = node.getAttribute("data-layout-id") || "";
    if (id && !descendantSnapshots.has(id)) {
      descendantSnapshots.set(id, node.outerHTML);
    }
  });

  leaf.innerHTML = innerHtml;

  leaf.querySelectorAll("[data-layout-id]").forEach((node) => {
    const id = node.getAttribute("data-layout-id") || "";
    const snapshot = id ? descendantSnapshots.get(id) : null;
    if (!snapshot || !node.parentNode) return;

    const holder = doc.createElement("div");
    holder.innerHTML = snapshot;
    const replacement = holder.firstElementChild;
    if (replacement) {
      node.parentNode.replaceChild(replacement, node);
    }
  });

  // Belt-and-braces: strip any contenteditable/frozen attrs the bridge may
  // have left on nested layouts (the snapshot swap above should already cover
  // this, but if a descendant appears in `innerHtml` without a template match
  // we don't want runtime attributes bleeding into the saved source).
  leaf
    .querySelectorAll("[contenteditable],[data-studio-static-frozen]")
    .forEach((node) => {
      node.removeAttribute("contenteditable");
      node.removeAttribute("data-studio-static-frozen");
    });

  return root.innerHTML;
};

const stripLayoutIdsFromSource = (source: string): string => {
  if (!source) return "";

  const parser = new DOMParser();
  const doc = parser.parseFromString(
    `<div id="studio-layout-save-root">${source}</div>`,
    "text/html"
  );
  const root = doc.getElementById("studio-layout-save-root");
  if (!root) return source;

  root.querySelectorAll("[data-layout-id]").forEach((node) => {
    node.removeAttribute("data-layout-id");
  });

  return root.innerHTML;
};

type Args = {
  webViews: any[];
  codeFileNameById: Record<string, string>;
  updateWebView: (args: any) => { unwrap: () => Promise<any> };
  publishWebView: (args: any) => { unwrap: () => Promise<any> };
  dispatch: (action: any) => any;
  selectedLayoutCodeId?: string;
  clearLayoutSelection: () => void;
  refreshPreviewFrame: (onReloadComplete?: () => void) => void;
  withCodeIdBreadcrumbRoot: (
    codeId: string,
    breadcrumb: LayoutBreadcrumbItem[],
    codeLabel?: string
  ) => LayoutBreadcrumbItem[];
  onSelectedLayoutBreadcrumbChange: (
    updater: (
      current: {
        codeId: string;
        layoutId: string;
        breadcrumb: LayoutBreadcrumbItem[];
      } | null
    ) => {
      codeId: string;
      layoutId: string;
      breadcrumb: LayoutBreadcrumbItem[];
    } | null
  ) => void;
};

export const useLayoutReorderState = ({
  webViews,
  codeFileNameById,
  updateWebView,
  publishWebView,
  dispatch,
  selectedLayoutCodeId,
  clearLayoutSelection,
  refreshPreviewFrame,
  withCodeIdBreadcrumbRoot,
  onSelectedLayoutBreadcrumbChange,
}: Args) => {
  const templateSourceByCodeIdRef = useRef<Record<string, string>>({});
  const [pendingLayoutSave, setPendingLayoutSave] =
    useState<LayoutReorderState | null>(null);
  const [isSavingLayout, setIsSavingLayout] = useState(false);

  const clearPendingLayoutState = useCallback(() => {
    setPendingLayoutSave(null);
  }, []);

  const handleDiscardPendingLayoutSave = useCallback(
    (onComplete?: () => void) => {
      clearPendingLayoutState();
      clearLayoutSelection();
      refreshPreviewFrame(onComplete);
    },
    [clearLayoutSelection, clearPendingLayoutState, refreshPreviewFrame]
  );

  const savePendingLayoutSource = useCallback(async () => {
    if (!pendingLayoutSave?.codeId || !pendingLayoutSave.mappedSource) return;

    const webView = webViews.find(
      (view) => view.ZUID === pendingLayoutSave.codeId
    );
    if (!webView) {
      throw new Error("Unable to resolve code file for layout save.");
    }

    const sanitizedSource = stripLayoutIdsFromSource(
      pendingLayoutSave.mappedSource
    );
    const updatedWebView = await updateWebView({
      ZUID: pendingLayoutSave.codeId,
      body: {
        ...webView,
        code: sanitizedSource,
      },
    }).unwrap();

    return {
      codeId: pendingLayoutSave.codeId,
      webView,
      updatedWebView,
    };
  }, [pendingLayoutSave, updateWebView, webViews]);

  const handleSavePendingLayout = useCallback(
    async (onComplete?: () => void) => {
      if (!pendingLayoutSave?.codeId || !pendingLayoutSave.mappedSource) return;

      setIsSavingLayout(true);

      try {
        const result = await savePendingLayoutSource();
        if (!result) return;

        clearPendingLayoutState();
        refreshPreviewFrame(onComplete);
        dispatch(
          notify({
            kind: "success",
            message: `Saved ${
              codeFileNameById[result.codeId] || result.webView.fileName
            }`,
          })
        );
      } catch (error: any) {
        dispatch(
          notify({
            kind: "warn",
            message:
              error?.data?.error ||
              error?.error ||
              error?.message ||
              "Failed to save layout.",
          })
        );
      } finally {
        setIsSavingLayout(false);
      }
    },
    [
      clearPendingLayoutState,
      codeFileNameById,
      dispatch,
      pendingLayoutSave,
      refreshPreviewFrame,
      savePendingLayoutSource,
    ]
  );

  const handleSaveAndPublishPendingLayout = useCallback(async () => {
    if (!pendingLayoutSave?.codeId || !pendingLayoutSave.mappedSource) return;

    setIsSavingLayout(true);

    try {
      const result = await savePendingLayoutSource();
      if (!result) return;

      await publishWebView({
        ZUID: result.codeId,
        version: result.webView.version + 1,
      }).unwrap();

      clearPendingLayoutState();
      refreshPreviewFrame();
      dispatch(
        notify({
          kind: "success",
          message: `Saved and published ${
            codeFileNameById[result.codeId] || result.webView.fileName
          }`,
        })
      );
    } catch (error: any) {
      dispatch(
        notify({
          kind: "warn",
          message:
            error?.data?.error ||
            error?.error ||
            error?.message ||
            "Failed to save and publish layout.",
        })
      );
    } finally {
      setIsSavingLayout(false);
    }
  }, [
    clearPendingLayoutState,
    codeFileNameById,
    dispatch,
    pendingLayoutSave,
    publishWebView,
    refreshPreviewFrame,
    savePendingLayoutSource,
  ]);

  const handleTemplateSourceMap = useCallback((msg: any) => {
    const incoming =
      (msg.templateSourceByCodeId as Record<string, string>) || {};
    templateSourceByCodeIdRef.current = {
      ...templateSourceByCodeIdRef.current,
      ...incoming,
    };
  }, []);

  const handleLayoutContentUpdate = useCallback(
    (msg: any) => {
      const codeId = typeof msg?.codeId === "string" ? msg.codeId : "";
      const layoutId = typeof msg?.layoutId === "string" ? msg.layoutId : "";
      const innerHtml = typeof msg?.innerHtml === "string" ? msg.innerHtml : "";

      if (!codeId || !layoutId) return;

      const cached = templateSourceByCodeIdRef.current[codeId];
      if (!cached) return;

      const next = patchLeafInnerHtml(cached, layoutId, innerHtml);
      if (!next) {
        dispatch(
          notify({
            kind: "warn",
            message: "Could not apply inline edit for this block.",
          })
        );
        return;
      }

      templateSourceByCodeIdRef.current = {
        ...templateSourceByCodeIdRef.current,
        [codeId]: next,
      };

      setPendingLayoutSave((prev) => {
        const hasPendingReorder = Boolean(
          prev?.layoutStructure && prev.layoutStructure.length
        );
        const layoutStructure: LayoutStructureItem[] = hasPendingReorder
          ? prev!.layoutStructure
          : [];
        const orderedLayoutIds = hasPendingReorder
          ? prev!.orderedLayoutIds
          : [];
        const selector = prev?.selector || "[data-layout-id]";
        // Only re-run the reorder mapping when there is a pending reorder to
        // apply on top of the edit. A pure static edit leaves the structure
        // untouched, so the patched source IS the mapped source — running
        // mapSourceByLayoutStructure with a bogus single-entry structure would
        // move the edited block to the root of the template.
        const mappedSource = hasPendingReorder
          ? mapSourceByLayoutStructure(next, layoutStructure)
          : next;

        return {
          codeId,
          selector,
          orderedLayoutIds,
          layoutStructure,
          outputHtml: prev?.outputHtml || "",
          mappedSource,
        };
      });
    },
    [dispatch]
  );

  const handleReorderOutput = useCallback(
    (msg: any) => {
      const codeId = typeof msg.codeId === "string" ? msg.codeId : null;
      const orderedLayoutIds = Array.isArray(msg.orderedLayoutIds)
        ? msg.orderedLayoutIds.filter(
            (layoutId: unknown): layoutId is string =>
              typeof layoutId === "string"
          )
        : [];
      const layoutStructure = Array.isArray(msg.layoutStructure)
        ? msg.layoutStructure.filter(
            (entry: unknown): entry is LayoutStructureItem =>
              Boolean(
                entry &&
                  typeof entry === "object" &&
                  typeof (entry as LayoutStructureItem).layoutId === "string" &&
                  (typeof (entry as LayoutStructureItem).parentLayoutId ===
                    "string" ||
                    (entry as LayoutStructureItem).parentLayoutId === null)
              )
          )
        : [];
      const sourceTemplate = codeId
        ? templateSourceByCodeIdRef.current[codeId] || ""
        : "";
      const mappedSource = sourceTemplate
        ? mapSourceByLayoutStructure(sourceTemplate, layoutStructure)
        : "";

      if (codeId && mappedSource) {
        templateSourceByCodeIdRef.current = {
          ...templateSourceByCodeIdRef.current,
          [codeId]: mappedSource,
        };
      }

      if (codeId && selectedLayoutCodeId === codeId) {
        const reorderedBreadcrumb = Array.isArray(msg.selectedLayoutBreadcrumb)
          ? msg.selectedLayoutBreadcrumb.filter(isLayoutBreadcrumbItem)
          : [];

        onSelectedLayoutBreadcrumbChange((current) => {
          if (!current || current.codeId !== codeId) return current;
          if (!reorderedBreadcrumb.length) return current;

          return {
            ...current,
            breadcrumb: withCodeIdBreadcrumbRoot(
              codeId,
              reorderedBreadcrumb,
              codeFileNameById[codeId]
            ),
          };
        });
      }

      setPendingLayoutSave(
        mappedSource
          ? {
              codeId,
              selector:
                typeof msg.selector === "string"
                  ? msg.selector
                  : "[data-layout-id]",
              orderedLayoutIds,
              layoutStructure,
              outputHtml:
                typeof msg.outputHtml === "string" ? msg.outputHtml : "",
              mappedSource,
            }
          : null
      );
    },
    [
      codeFileNameById,
      onSelectedLayoutBreadcrumbChange,
      selectedLayoutCodeId,
      withCodeIdBreadcrumbRoot,
    ]
  );

  const handleLayoutImageSrcUpdate = useCallback(
    (
      codeId: string,
      layoutId: string,
      isLeafImg: boolean,
      imgIndex: number,
      newSrc: string
    ) => {
      if (!codeId || !layoutId || !newSrc) return;

      const cached = templateSourceByCodeIdRef.current[codeId];
      if (!cached) return;

      const parser = new DOMParser();
      const doc = parser.parseFromString(
        `<div id="studio-img-root">${cached}</div>`,
        "text/html"
      );
      const root = doc.getElementById("studio-img-root");
      if (!root) return;

      const leaf = root.querySelector(`[data-layout-id="${layoutId}"]`);
      if (!leaf) return;

      const imgTarget = isLeafImg
        ? (leaf as HTMLElement)
        : (Array.from(leaf.querySelectorAll("img"))[imgIndex] as HTMLElement);
      if (!imgTarget) return;

      imgTarget.setAttribute("src", newSrc);

      const next = root.innerHTML;

      templateSourceByCodeIdRef.current = {
        ...templateSourceByCodeIdRef.current,
        [codeId]: next,
      };

      setPendingLayoutSave((prev) => {
        const hasPendingReorder = Boolean(
          prev?.layoutStructure && prev.layoutStructure.length
        );
        const layoutStructure = hasPendingReorder ? prev!.layoutStructure : [];
        const orderedLayoutIds = hasPendingReorder
          ? prev!.orderedLayoutIds
          : [];
        const selector = prev?.selector || "[data-layout-id]";
        const mappedSource = hasPendingReorder
          ? mapSourceByLayoutStructure(next, layoutStructure)
          : next;

        return {
          codeId,
          selector,
          orderedLayoutIds,
          layoutStructure,
          outputHtml: prev?.outputHtml || "",
          mappedSource,
        };
      });
    },
    []
  );

  return {
    pendingLayoutSave,
    isSavingLayout,
    handleDiscardPendingLayoutSave,
    handleSavePendingLayout,
    handleSaveAndPublishPendingLayout,
    handleTemplateSourceMap,
    handleReorderOutput,
    handleLayoutContentUpdate,
    handleLayoutImageSrcUpdate,
  };
};
