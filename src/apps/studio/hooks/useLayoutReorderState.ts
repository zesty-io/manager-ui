import { useCallback, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { notify } from "shell/store/notifications";
import { LayoutBreadcrumbItem, LinkWrapperState } from "./studioTypes";

type LayoutStructureItem = {
  layoutId: string;
  parentLayoutId: string | null;
};

// Tags the Inspector panel can swap an element to — mirrors the bridge's
// SUPPORTED_ELEMENTS. Guards createElement against an arbitrary tag name.
const SWAPPABLE_TAGS = new Set([
  "img",
  "video",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "p",
  "span",
  "div",
  "section",
  "article",
  "aside",
  "header",
  "footer",
  "main",
  "nav",
]);

const isLayoutBreadcrumbItem = (
  segment: unknown
): segment is LayoutBreadcrumbItem =>
  Boolean(
    segment &&
      typeof segment === "object" &&
      typeof (segment as LayoutBreadcrumbItem).label === "string"
  );

type LayoutRegionState = {
  selector: string;
  orderedLayoutIds: string[];
  layoutStructure: LayoutStructureItem[];
  outputHtml: string;
  mappedSource: string;
};

type LayoutReorderState = {
  regions: Record<string, LayoutRegionState>;
  primaryCodeId: string;
};

// Apply a new layoutStructure to a cached template source. Used both for
// single-region reorders and for the per-region post-processing of a cross-
// region drag, where blocks may have moved between sibling/nested templates.
//
//  - donorSourceById: layoutId → outerHTML pulled from OTHER regions' cached
//    templates. When a layoutId is referenced by the destination region's new
//    structure but is missing from its cached template (because it was just
//    dragged in from the donor region), the donor markup is injected here so
//    the re-parent pass can place it correctly. With globally-unique
//    layoutIds, donor lookups are unambiguous.
//
//  - Removal pass: any [data-layout-id] node whose id is NOT in the
//    incoming layoutStructure is removed. This is how the SOURCE region of a
//    cross-region drag loses the moved block. For single-region reorders the
//    structure always covers every block, so the pass is a no-op.
// Indentation between elements is a whitespace-only text node. Re-parenting
// moves elements but not these, so they have to be carried deliberately.
const isWhitespaceText = (node: Node | null | undefined): boolean =>
  !!node && node.nodeType === 3 && (node.textContent || "").trim() === "";

// The whitespace immediately before `node`, as a node that can travel with it.
// A pure-whitespace sibling moves as-is; a mixed text node (Parsley plus
// indentation) is split so only its trailing whitespace run comes along.
const takeLeadingWhitespace = (node: Node): Node | null => {
  const prev = node.previousSibling;
  if (!prev || prev.nodeType !== 3) return null;
  if (isWhitespaceText(prev)) return prev;

  const text = prev.textContent || "";
  const trailing = text.length - text.trimEnd().length;
  if (!trailing) return null;
  // splitText leaves the head in place and returns the tail as a new node.
  return (prev as Text).splitText(text.length - trailing);
};

const mapSourceByLayoutStructure = (
  source: string,
  layoutStructure: LayoutStructureItem[],
  donorSourceById?: Map<string, string>
): string => {
  if (!source) return source;

  const parser = new DOMParser();
  const doc = parser.parseFromString(
    `<div id="studio-root">${source}</div>`,
    "text/html"
  );
  const root = doc.getElementById("studio-root");
  if (!root) return source;

  const expectedLayoutIds = new Set<string>();
  layoutStructure.forEach(({ layoutId }) => {
    if (layoutId) expectedLayoutIds.add(layoutId);
  });

  // Pass 1: inject donor nodes for layoutIds that are expected but missing.
  if (donorSourceById && donorSourceById.size > 0) {
    const existingLayoutIds = new Set<string>();
    root.querySelectorAll("[data-layout-id]").forEach((node) => {
      const id = node.getAttribute("data-layout-id") || "";
      if (id) existingLayoutIds.add(id);
    });

    expectedLayoutIds.forEach((layoutId) => {
      if (existingLayoutIds.has(layoutId)) return;
      const donor = donorSourceById.get(layoutId);
      if (!donor) return;
      const holder = doc.createElement("div");
      holder.innerHTML = donor;
      const node = holder.firstElementChild;
      if (node) root.appendChild(node);
    });
  }

  // Pass 2: remove elements absent from the new structure.
  Array.from(root.querySelectorAll("[data-layout-id]")).forEach((node) => {
    const id = node.getAttribute("data-layout-id") || "";
    if (!id || expectedLayoutIds.has(id)) return;
    node.remove();
  });

  // Pass 3: re-parent elements according to layoutStructure.
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

  // Anchor each parent's layout block at the position of its FIRST existing
  // layout-id child, then insertBefore each entry in desired order. Using
  // appendChild here would move every layout-id element to the end of the
  // parent, pushing surrounding non-layout content (a `<h1>`, a Parsley
  // `{{include ...}}` text node, etc.) out of its original place.
  orderedParentKeys.forEach((parentKey) => {
    const parentNode =
      parentKey === "__root__" ? root : elementByLayoutId.get(parentKey);
    const childIds = childIdsByParent.get(parentKey) || [];
    if (!parentNode || !childIds.length) return;

    const existingHere = childIds
      .map((id) => elementByLayoutId.get(id))
      .filter(
        (node): node is Element => !!node && node.parentNode === parentNode
      );

    // The node we want to insert AFTER. If the parent already has any
    // expected layout-id children, anchor at the previousSibling of the
    // first one (so the block stays in place). Otherwise insert at the
    // start of the parent.
    let afterNode: Node | null =
      existingHere.length > 0 ? existingHere[0].previousSibling : null;

    // The anchor must not be indentation that is about to travel with the
    // first child, or the block lands one node too late.
    if (isWhitespaceText(afterNode)) {
      afterNode = (afterNode as Node).previousSibling;
    }

    childIds.forEach((layoutId) => {
      const childNode = elementByLayoutId.get(layoutId);
      if (!childNode || childNode === parentNode) return;
      if (childNode.contains(parentNode)) return;

      // Move the element's own leading indentation with it. Without this the
      // element is re-inserted bare and its whitespace is stranded where it
      // used to be, so every reordered region collapses onto one line — and
      // that is true even for children that did not move, because this pass
      // re-inserts all of them.
      //
      // The indentation is not always a node of its own: a Parsley block
      // leaves text like "\n\t{{end-if}}\n\t" as ONE text node, so the
      // trailing run has to be split off rather than looked up.
      const leadingWhitespace = takeLeadingWhitespace(childNode);

      if (childNode.parentNode) childNode.parentNode.removeChild(childNode);
      if (leadingWhitespace?.parentNode) {
        leadingWhitespace.parentNode.removeChild(leadingWhitespace);
      }

      const reference =
        afterNode && afterNode.parentNode === parentNode
          ? afterNode.nextSibling
          : parentNode.firstChild;
      if (leadingWhitespace)
        parentNode.insertBefore(leadingWhitespace, reference);
      parentNode.insertBefore(childNode, reference);
      afterNode = childNode;
    });
  });

  return root.innerHTML;
};

// Build a global donor map (layoutId → outerHTML) from every cached template,
// so that whichever region needs an injected node can find it.
const buildDonorSourceById = (
  cachedSnapshots: Record<string, string>
): Map<string, string> => {
  const donorSourceById = new Map<string, string>();
  Object.values(cachedSnapshots).forEach((source) => {
    if (!source) return;
    const parser = new DOMParser();
    const doc = parser.parseFromString(
      `<div id="studio-donor-root">${source}</div>`,
      "text/html"
    );
    const root = doc.getElementById("studio-donor-root");
    if (!root) return;
    root.querySelectorAll("[data-layout-id]").forEach((node) => {
      const id = node.getAttribute("data-layout-id") || "";
      if (id && !donorSourceById.has(id)) {
        donorSourceById.set(id, node.outerHTML);
      }
    });
  });
  return donorSourceById;
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

type LayoutLeafLookup = {
  doc: Document;
  root: HTMLElement;
  leaf: HTMLElement;
};

// Parse a cached template region and resolve one [data-layout-id] element
// inside it. The link operations all address the wrapping <a> RELATIVE to that
// element — the wrapper has no id of its own — so they share the lookup and
// re-serialize `root.innerHTML` once they've mutated it.
const resolveLayoutLeaf = (
  source: string,
  layoutId: string
): LayoutLeafLookup | null => {
  if (!source || !layoutId) return null;

  const parser = new DOMParser();
  const doc = parser.parseFromString(
    `<div id="studio-el-root">${source}</div>`,
    "text/html"
  );
  const root = doc.getElementById("studio-el-root");
  if (!root) return null;

  const leaf = root.querySelector(
    `[data-layout-id="${CSS.escape(layoutId)}"]`
  ) as HTMLElement | null;
  if (!leaf) return null;

  return { doc, root, leaf };
};

// Parents that cannot legally hold an <a>, so an element inside one cannot be
// wrapped. This is not pedantry about validity: `<tbody><a><tr>…</tr></a></tbody>`
// serializes fine, and DOMParser and the live DOM both accept it, so the canvas
// shows a working link — but the next SERVER render foster-parents the <a> out
// of the table and the content comes back unlinked. Preview and production
// diverge silently, and no save-time check can catch it because the string is
// well-formed. Refusing up front is the only place this can be caught.
const CANNOT_HOLD_LINK = new Set([
  "UL",
  "OL",
  "MENU",
  "TABLE",
  "THEAD",
  "TBODY",
  "TFOOT",
  "TR",
  "COLGROUP",
  "SELECT",
  "OPTGROUP",
  "DL",
  "PICTURE",
  "HEAD",
]);

// Whether an <a> may be inserted around this element.
//
// Both the panel's Add Link affordance and the write itself go through here, so
// the write fails closed on its own rather than trusting the UI to have hidden
// the button.
//
// Scope note: this only sees the region resolveLayoutLeaf parsed, which is
// wrapped in a synthetic `<div id="studio-el-root">`. A root-level element
// therefore always reports a DIV parent and cannot see the context the code
// file is included into — a region `{{include}}`d inside a <ul> looks wrappable
// from here. Catching that needs the including template, which the host does
// not hold per region.
const canWrapInLink = (leaf: HTMLElement): boolean => {
  // `closest` covers the element itself, so this refuses an <a> inside an <a>
  // and an <a> around an <a> alike.
  if (leaf.closest("a")) return false;

  // …and a link BELOW it is just as fatal, by the same content-model rule read
  // in the other direction. Wrapping `<p>Read <a href="/x">this</a> now</p>`
  // serializes fine, but re-parsing runs the adoption agency algorithm: the
  // outer <a> is closed, the <p> escapes it, and a spurious `<a>Read </a>` is
  // minted around the leading text. That mutates author content, and it is the
  // ordinary shape of a <nav>, a <p> or a <section>, not an exotic one.
  if (leaf.querySelector("a")) return false;

  const parent = leaf.parentElement;
  return !parent || !CANNOT_HOLD_LINK.has(parent.tagName);
};

// Attributes whose empty value means "absent", not "empty string". A link's
// `target` is the only one today: choosing "No" must leave no attribute behind
// rather than write `target=""` into saved view code.
const REMOVED_WHEN_EMPTY = new Set(["target"]);

const writeAttribute = (el: HTMLElement, attr: string, value: string) => {
  if (!value && REMOVED_WHEN_EMPTY.has(attr)) el.removeAttribute(attr);
  else el.setAttribute(attr, value);
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
  clearLayoutSelection: () => void;
  // Drops every debounced template write without running it. Used by discard,
  // where a timer firing afterwards would re-dirty the region just thrown away.
  cancelAllPendingPatches: () => void;
  // Runs every debounced template write immediately and returns the codeIds it
  // actually staged. Called before a save reads the template cache, since a write still
  // in its timer would otherwise miss the PUT and then land on an already-saved
  // region. The codeIds are needed because staging is a state update that has
  // not applied yet when the save loop reads pendingLayoutSave.
  flushPendingPatches: () => string[];
  refreshPreviewFrame: (onReloadComplete?: () => void) => void;
  // Mirrors a patched region down to the bridge. The bridge's own template
  // source is frozen at page render, so it has to be told about edits we
  // haven't saved yet — see writeTemplateSources.
  syncTemplateSourceToBridge: (codeId: string, source: string) => void;
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
  clearLayoutSelection,
  cancelAllPendingPatches,
  flushPendingPatches,
  refreshPreviewFrame,
  syncTemplateSourceToBridge,
  withCodeIdBreadcrumbRoot,
  onSelectedLayoutBreadcrumbChange,
}: Args) => {
  const { t, i18n } = useTranslation();
  const templateSourceByCodeIdRef = useRef<Record<string, string>>({});
  // Bumped on every change to the template cache. The cache itself is a ref, so
  // writing it re-renders nothing — which is right for the write paths, but not
  // for the Inspector's Link section: that is DERIVED from the template, so its
  // reader has to change identity when the template does or the panel goes on
  // showing the pre-edit wrapper.
  const [templateSourceVersion, setTemplateSourceVersion] = useState(0);

  // The one way to write the template cache after boot. The bridge keeps its
  // own copy, read straight off the page's <template> blocks and never updated
  // — so any edit we hold and don't push down leaves the two disagreeing, and
  // the bridge reads the pre-edit source back at us: the Inspector reopens on a
  // stale value, and inline editing rejects the block as "dynamic content"
  // because live DOM no longer matches the template. Funnelling every write
  // through here keeps them in step by construction.
  const writeTemplateSources = useCallback(
    (patch: Record<string, string>) => {
      templateSourceByCodeIdRef.current = {
        ...templateSourceByCodeIdRef.current,
        ...patch,
      };
      Object.keys(patch).forEach((codeId) => {
        syncTemplateSourceToBridge(codeId, patch[codeId]);
      });
      setTemplateSourceVersion((prev) => prev + 1);
    },
    [syncTemplateSourceToBridge]
  );
  const [pendingLayoutSave, setPendingLayoutSave] =
    useState<LayoutReorderState | null>(null);
  const [isSavingLayout, setIsSavingLayout] = useState(false);

  const pendingLayoutCodeIds = useMemo(
    () => Object.keys(pendingLayoutSave?.regions || {}),
    [pendingLayoutSave]
  );

  const clearPendingLayoutState = useCallback(() => {
    setPendingLayoutSave(null);
  }, []);

  const handleDiscardPendingLayoutSave = useCallback(
    (onComplete?: () => void) => {
      // Before clearing state, not after: a debounced write still in flight
      // would otherwise land 300ms from now, re-dirty the region the user just
      // discarded, and race the fresh TEMPLATE_SOURCE_MAP the preview reload
      // is about to merge.
      cancelAllPendingPatches();
      clearPendingLayoutState();
      clearLayoutSelection();
      refreshPreviewFrame(onComplete);
    },
    [
      cancelAllPendingPatches,
      clearLayoutSelection,
      clearPendingLayoutState,
      refreshPreviewFrame,
    ]
  );

  // Saves each pending region sequentially. Returns the list of saved results.
  // On the first failure: throws (caller surfaces the error). Already-saved
  // regions are removed from pendingLayoutSave so the user can retry the rest.
  // `alsoSaveCodeIds` covers regions a pre-save flush just dirtied. Their
  // staging is a state update that has not applied yet, so they are absent from
  // this closure's pendingLayoutSave — without them a URL typed a moment ago
  // would be written to the cache, skipped by the PUT, and left dirty.
  const savePendingLayoutSources = useCallback(
    async (alsoSaveCodeIds: string[] = []) => {
      const codeIds = Array.from(
        new Set([
          ...Object.keys(pendingLayoutSave?.regions || {}),
          ...alsoSaveCodeIds,
        ])
      );
      if (!codeIds.length) return [];

      const savedResults: Array<{
        codeId: string;
        webView: any;
        updatedWebView: any;
      }> = [];

      for (const codeId of codeIds) {
        const latestSource = templateSourceByCodeIdRef.current[codeId];
        if (typeof latestSource !== "string") {
          throw new Error(
            `Unable to resolve cached template for code file ${codeId}.`
          );
        }

        const webView = webViews.find((view) => view.ZUID === codeId);
        if (!webView) {
          throw new Error(
            `Unable to resolve code file ${codeId} for layout save.`
          );
        }

        const sanitizedSource = stripLayoutIdsFromSource(latestSource);

        try {
          const updatedWebView = await updateWebView({
            ZUID: codeId,
            body: {
              ...webView,
              code: sanitizedSource,
            },
          }).unwrap();

          savedResults.push({ codeId, webView, updatedWebView });

          // Remove the now-saved region from pending state so a retry doesn't
          // re-save it. Functional, so a region the flush staged moments ago is
          // removed from the state that write produced, not from a stale copy.
          setPendingLayoutSave((prev) => {
            if (!prev) return prev;
            const { [codeId]: _saved, ...rest } = prev.regions;
            if (!Object.keys(rest).length) return null;
            return {
              regions: rest,
              primaryCodeId:
                prev.primaryCodeId === codeId
                  ? Object.keys(rest)[0]
                  : prev.primaryCodeId,
            };
          });
        } catch (err) {
          (err as any).failedCodeId = codeId;
          throw err;
        }
      }

      return savedResults;
    },
    [pendingLayoutSave, updateWebView, webViews]
  );

  const formatSavedFileNames = useCallback(
    (results: Array<{ codeId: string; webView: any }>) => {
      const names = results.map(
        ({ codeId, webView }) =>
          codeFileNameById[codeId] || webView?.fileName || codeId
      );
      if (names.length === 0) return "";
      return new Intl.ListFormat(i18n.language, { type: "conjunction" }).format(
        names
      );
    },
    [codeFileNameById, i18n.language]
  );

  const handleSavePendingLayout = useCallback(
    async (onComplete?: () => void) => {
      // Land every debounced write before reading the cache. savePendingLayout-
      // Sources reads templateSourceByCodeIdRef, which the flush updates
      // synchronously, so a URL typed a moment ago is in the PUT rather than
      // arriving after it. Its regions are passed on explicitly because the
      // staging they trigger is a state update this closure cannot see yet.
      const flushedCodeIds = flushPendingPatches();

      if (!pendingLayoutCodeIds.length && !flushedCodeIds.length) {
        return { failed: false };
      }

      setIsSavingLayout(true);

      try {
        const results = await savePendingLayoutSources(flushedCodeIds);
        if (!results.length) return { failed: false };

        refreshPreviewFrame(onComplete);
        dispatch(
          notify({
            kind: "success",
            message: t("content.studioLayoutSaved", {
              files: formatSavedFileNames(results),
            }),
          })
        );
        return { failed: false };
      } catch (error: any) {
        const failedCodeId = error?.failedCodeId;
        const failedName = failedCodeId
          ? codeFileNameById[failedCodeId] || failedCodeId
          : null;
        dispatch(
          notify({
            kind: "warn",
            message:
              error?.data?.error ||
              error?.error ||
              error?.message ||
              (failedName
                ? t("content.studioLayoutSaveFailedNamed", { name: failedName })
                : t("content.studioLayoutSaveFailed")),
          })
        );
        return { failed: true };
      } finally {
        setIsSavingLayout(false);
      }
    },
    [
      codeFileNameById,
      dispatch,
      flushPendingPatches,
      formatSavedFileNames,
      pendingLayoutCodeIds,
      refreshPreviewFrame,
      savePendingLayoutSources,
      t,
    ]
  );

  const handleSaveAndPublishPendingLayout = useCallback(async () => {
    const flushedCodeIds = flushPendingPatches();

    if (!pendingLayoutCodeIds.length && !flushedCodeIds.length) {
      return { failed: false };
    }

    setIsSavingLayout(true);

    try {
      const results = await savePendingLayoutSources(flushedCodeIds);
      if (!results.length) return { failed: false };

      for (const { codeId, webView } of results) {
        try {
          await publishWebView({
            ZUID: codeId,
            version: webView.version + 1,
          }).unwrap();
        } catch (err) {
          (err as any).failedCodeId = codeId;
          throw err;
        }
      }

      refreshPreviewFrame();
      dispatch(
        notify({
          kind: "success",
          message: t("content.studioLayoutSavedPublished", {
            files: formatSavedFileNames(results),
          }),
        })
      );
      return { failed: false };
    } catch (error: any) {
      const failedCodeId = error?.failedCodeId;
      const failedName = failedCodeId
        ? codeFileNameById[failedCodeId] || failedCodeId
        : null;
      dispatch(
        notify({
          kind: "warn",
          message:
            error?.data?.error ||
            error?.error ||
            error?.message ||
            (failedName
              ? t("content.studioLayoutPublishFailedNamed", {
                  name: failedName,
                })
              : t("content.studioLayoutPublishFailed")),
        })
      );
      // Same contract as handleSavePendingLayout: this never rethrows, so the
      // merged save can only learn about a failure from the return value.
      return { failed: true };
    } finally {
      setIsSavingLayout(false);
    }
  }, [
    codeFileNameById,
    dispatch,
    flushPendingPatches,
    formatSavedFileNames,
    pendingLayoutCodeIds,
    publishWebView,
    refreshPreviewFrame,
    savePendingLayoutSources,
    t,
  ]);

  const handleTemplateSourceMap = useCallback((msg: any) => {
    const incoming =
      (msg.templateSourceByCodeId as Record<string, string>) || {};
    templateSourceByCodeIdRef.current = {
      ...templateSourceByCodeIdRef.current,
      ...incoming,
    };
    setTemplateSourceVersion((prev) => prev + 1);
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
            message: t("content.studioInlineEditFailed"),
          })
        );
        return;
      }

      writeTemplateSources({ [codeId]: next });

      setPendingLayoutSave((prev) => {
        const prevRegion = prev?.regions?.[codeId];
        const hasPendingReorder = Boolean(
          prevRegion?.layoutStructure && prevRegion.layoutStructure.length
        );
        const layoutStructure: LayoutStructureItem[] = hasPendingReorder
          ? prevRegion!.layoutStructure
          : [];
        const orderedLayoutIds = hasPendingReorder
          ? prevRegion!.orderedLayoutIds
          : [];
        const selector = prevRegion?.selector || "[data-layout-id]";
        // Only re-run the reorder mapping when there is a pending reorder to
        // apply on top of the edit. A pure static edit leaves the structure
        // untouched, so the patched source IS the mapped source.
        const mappedSource = hasPendingReorder
          ? mapSourceByLayoutStructure(next, layoutStructure)
          : next;

        const nextRegion: LayoutRegionState = {
          selector,
          orderedLayoutIds,
          layoutStructure,
          outputHtml: prevRegion?.outputHtml || "",
          mappedSource,
        };

        return {
          regions: {
            ...(prev?.regions || {}),
            [codeId]: nextRegion,
          },
          primaryCodeId: prev?.primaryCodeId || codeId,
        };
      });
    },
    [dispatch, t, writeTemplateSources]
  );

  const handleReorderOutput = useCallback(
    (msg: any) => {
      const incomingRegions = Array.isArray(msg.regions)
        ? msg.regions.filter(
            (region: any) =>
              region && typeof region === "object" && region.codeId
          )
        : [];
      if (!incomingRegions.length) return;

      // Snapshot every cached template BEFORE mutation so donor lookups are
      // stable regardless of processing order.
      const cachedSnapshots = { ...templateSourceByCodeIdRef.current };
      const donorSourceById = buildDonorSourceById(cachedSnapshots);

      const mappedRegions: Record<string, LayoutRegionState> = {};
      const nextCachedSources: Record<string, string> = {};

      incomingRegions.forEach((region: any) => {
        const codeId = typeof region.codeId === "string" ? region.codeId : "";
        if (!codeId) return;

        const cached = cachedSnapshots[codeId] || "";
        if (!cached) return;

        const orderedLayoutIds = Array.isArray(region.orderedLayoutIds)
          ? region.orderedLayoutIds.filter(
              (layoutId: unknown): layoutId is string =>
                typeof layoutId === "string"
            )
          : [];
        const layoutStructure: LayoutStructureItem[] = Array.isArray(
          region.layoutStructure
        )
          ? region.layoutStructure.filter(
              (entry: unknown): entry is LayoutStructureItem =>
                Boolean(
                  entry &&
                    typeof entry === "object" &&
                    typeof (entry as LayoutStructureItem).layoutId ===
                      "string" &&
                    (typeof (entry as LayoutStructureItem).parentLayoutId ===
                      "string" ||
                      (entry as LayoutStructureItem).parentLayoutId === null)
                )
            )
          : [];

        const mappedSource = mapSourceByLayoutStructure(
          cached,
          layoutStructure,
          donorSourceById
        );

        nextCachedSources[codeId] = mappedSource;
        mappedRegions[codeId] = {
          selector:
            typeof region.selector === "string"
              ? region.selector
              : "[data-layout-id]",
          orderedLayoutIds,
          layoutStructure,
          outputHtml:
            typeof region.outputHtml === "string" ? region.outputHtml : "",
          mappedSource,
        };
      });

      if (!Object.keys(mappedRegions).length) return;

      writeTemplateSources(nextCachedSources);

      const primaryCodeId =
        typeof msg.primaryCodeId === "string" && msg.primaryCodeId
          ? msg.primaryCodeId
          : Object.keys(mappedRegions)[0] || "";

      // The dragged block is always the selected one (only .studio-selected
      // blocks are draggable). Re-root its breadcrumb to the destination
      // region so the header reflects the new home, even on cross-region drag.
      if (primaryCodeId) {
        const reorderedBreadcrumb = Array.isArray(msg.selectedLayoutBreadcrumb)
          ? msg.selectedLayoutBreadcrumb.filter(isLayoutBreadcrumbItem)
          : [];

        onSelectedLayoutBreadcrumbChange((current) => {
          if (!current || !reorderedBreadcrumb.length) return current;
          return {
            codeId: primaryCodeId,
            layoutId: current.layoutId,
            breadcrumb: withCodeIdBreadcrumbRoot(
              primaryCodeId,
              reorderedBreadcrumb,
              codeFileNameById[primaryCodeId]
            ),
          };
        });
      }

      setPendingLayoutSave((prev) => ({
        regions: {
          ...(prev?.regions || {}),
          ...mappedRegions,
        },
        primaryCodeId: primaryCodeId || prev?.primaryCodeId || "",
      }));
    },
    [
      codeFileNameById,
      onSelectedLayoutBreadcrumbChange,
      withCodeIdBreadcrumbRoot,
      writeTemplateSources,
    ]
  );

  // Write a region's patched source into the cache and stage it for save,
  // preserving any pending reorder on that region. Shared by the attribute and
  // text slot updaters.
  const stageLayoutSourceUpdate = useCallback(
    (codeId: string, next: string) => {
      writeTemplateSources({ [codeId]: next });

      setPendingLayoutSave((prev) => {
        const prevRegion = prev?.regions?.[codeId];
        const hasPendingReorder = Boolean(
          prevRegion?.layoutStructure && prevRegion.layoutStructure.length
        );
        const layoutStructure = hasPendingReorder
          ? prevRegion!.layoutStructure
          : [];
        const orderedLayoutIds = hasPendingReorder
          ? prevRegion!.orderedLayoutIds
          : [];
        const selector = prevRegion?.selector || "[data-layout-id]";
        const mappedSource = hasPendingReorder
          ? mapSourceByLayoutStructure(next, layoutStructure)
          : next;

        const nextRegion: LayoutRegionState = {
          selector,
          orderedLayoutIds,
          layoutStructure,
          outputHtml: prevRegion?.outputHtml || "",
          mappedSource,
        };

        return {
          regions: {
            ...(prev?.regions || {}),
            [codeId]: nextRegion,
          },
          primaryCodeId: prev?.primaryCodeId || codeId,
        };
      });
    },
    [writeTemplateSources]
  );

  const handleLayoutElementAttrUpdate = useCallback(
    (
      codeId: string,
      layoutId: string,
      isSelf: boolean,
      tagName: string,
      elementIndex: number,
      attr: string,
      value: string,
      booleanAttr?: boolean
    ): boolean => {
      // Unlike `src`, an empty `alt` is a legitimate value, so only guard the
      // addressing inputs here (not `value`).
      if (!codeId || !layoutId || !attr) return false;

      const cached = templateSourceByCodeIdRef.current[codeId];
      if (!cached) return false;

      const parser = new DOMParser();
      const doc = parser.parseFromString(
        `<div id="studio-el-root">${cached}</div>`,
        "text/html"
      );
      const root = doc.getElementById("studio-el-root");
      if (!root) return false;

      const leaf = root.querySelector(
        `[data-layout-id="${CSS.escape(layoutId)}"]`
      );
      if (!leaf) return false;

      const target = isSelf
        ? (leaf as HTMLElement)
        : (Array.from(leaf.querySelectorAll(tagName))[
            elementIndex
          ] as HTMLElement);
      if (!target) return false;

      if (booleanAttr) {
        // Presence toggle: "true" adds the bare attribute, "false" removes it.
        if (value === "true") target.setAttribute(attr, "");
        else target.removeAttribute(attr);
      } else {
        writeAttribute(target, attr, value);
      }

      stageLayoutSourceUpdate(codeId, root.innerHTML);
      return true;
    },
    [stageLayoutSourceUpdate]
  );

  // Patch a pure-text leaf's inner text into the cached source. Addressed by
  // its own data-layout-id (text slots are only layout-editable for such
  // leaves), so setting textContent is safe and escapes automatically.
  const handleLayoutTextUpdate = useCallback(
    (codeId: string, layoutId: string, value: string): boolean => {
      if (!codeId || !layoutId) return false;

      const cached = templateSourceByCodeIdRef.current[codeId];
      if (!cached) return false;

      const parser = new DOMParser();
      const doc = parser.parseFromString(
        `<div id="studio-el-root">${cached}</div>`,
        "text/html"
      );
      const root = doc.getElementById("studio-el-root");
      if (!root) return false;

      const leaf = root.querySelector(
        `[data-layout-id="${CSS.escape(layoutId)}"]`
      ) as HTMLElement | null;
      if (!leaf) return false;

      leaf.textContent = value;

      stageLayoutSourceUpdate(codeId, root.innerHTML);
      return true;
    },
    [stageLayoutSourceUpdate]
  );

  // Change an element's tag in the cached source (e.g. h1 → h2, img → video).
  // Addressed by its own data-layout-id; the replacement carries over every
  // attribute (including data-layout-id / data-studio-id bindings) and its
  // children so nothing else about the element changes.
  const handleLayoutTagUpdate = useCallback(
    (codeId: string, layoutId: string, newTag: string) => {
      // Only createElement a tag the panel exposes — never an arbitrary tag.
      if (!codeId || !layoutId || !SWAPPABLE_TAGS.has(newTag)) return;

      const cached = templateSourceByCodeIdRef.current[codeId];
      if (!cached) return;

      const parser = new DOMParser();
      const doc = parser.parseFromString(
        `<div id="studio-el-root">${cached}</div>`,
        "text/html"
      );
      const root = doc.getElementById("studio-el-root");
      if (!root) return;

      const leaf = root.querySelector(
        `[data-layout-id="${CSS.escape(layoutId)}"]`
      ) as HTMLElement | null;
      if (!leaf || !leaf.parentNode) return;

      const swapped = doc.createElement(newTag);
      Array.from(leaf.attributes).forEach((attribute) => {
        swapped.setAttribute(attribute.name, attribute.value);
      });
      swapped.innerHTML = leaf.innerHTML;
      leaf.parentNode.replaceChild(swapped, leaf);

      stageLayoutSourceUpdate(codeId, root.innerHTML);
    },
    [stageLayoutSourceUpdate]
  );

  // ---------------------------------------------------------------------------
  // Link wrapper
  //
  // Wrapping is the first Studio operation that CREATES an element, and the
  // element it creates has no backend-minted identity. Rather than mint one —
  // layout ids come from the render pipeline and are stripped again by
  // stripLayoutIdsFromSource before save, so a client-side id would be a
  // fabricated identity that vanishes on the next render — every operation here
  // addresses the wrapper as the PARENT of the already-addressed
  // [data-layout-id] element. That needs no new identity and stays correct
  // across re-renders.
  // ---------------------------------------------------------------------------

  // What the Inspector's Link section shows for an element: the <a> around it,
  // and whether one may be added. Read off the cached template rather than
  // reported by the bridge — reading a parent tag is something the host can do
  // for itself, and every byte of bridge is hand-deployed.
  const readLinkWrapper = useCallback(
    (codeId: string, layoutId: string): LinkWrapperState | null => {
      const cached = templateSourceByCodeIdRef.current[codeId];
      if (!cached) return null;

      const found = resolveLayoutLeaf(cached, layoutId);
      if (!found) return null;

      const { leaf } = found;
      // The element IS a link: its own href slot already edits it, so it
      // neither reports a wrapper nor offers to add one.
      if (leaf.tagName === "A") return { wrapper: null, canWrap: false };

      const wrapper = leaf.parentElement;
      if (wrapper && wrapper.tagName === "A") {
        return {
          wrapper: {
            href: wrapper.getAttribute("href") || "",
            target: wrapper.getAttribute("target") || "",
          },
          canWrap: false,
        };
      }

      // A link further up the tree still rules out wrapping — nested <a> is
      // invalid HTML — but it is not this element's to edit.
      return { wrapper: null, canWrap: canWrapInLink(leaf) };
    },
    // The template cache is a ref, so this version counter is what gives the
    // reader a new identity when the source changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [templateSourceVersion]
  );

  // Both wrap and unwrap report whether they actually staged anything, so the
  // caller can post to the bridge only on success. The bridge applies these
  // commands with its own, laxer guards — and it is hand-deployed, so it cannot
  // be assumed to match this file. Posting first and validating afterwards
  // would let a refusal here still mutate the canvas.
  const handleLayoutWrapInLink = useCallback(
    (codeId: string, layoutId: string): boolean => {
      if (!codeId || !layoutId) return false;

      const cached = templateSourceByCodeIdRef.current[codeId];
      if (!cached) return false;

      const found = resolveLayoutLeaf(cached, layoutId);
      if (!found) return false;

      const { doc, root, leaf } = found;
      if (!leaf.parentNode) return false;
      // Re-checked here rather than assumed from the hidden button: the panel
      // and this write are separate paths, and only one of them owns the file
      // that gets saved.
      if (!canWrapInLink(leaf)) return false;

      // Deliberately attribute-less: an <a> with no href isn't a link yet, which
      // is exactly the state the panel shows before a URL is typed.
      const wrapper = doc.createElement("a");
      leaf.parentNode.insertBefore(wrapper, leaf);
      wrapper.appendChild(leaf);

      stageLayoutSourceUpdate(codeId, root.innerHTML);
      return true;
    },
    [stageLayoutSourceUpdate]
  );

  const handleLayoutUnwrapLink = useCallback(
    (codeId: string, layoutId: string): boolean => {
      if (!codeId || !layoutId) return false;

      const cached = templateSourceByCodeIdRef.current[codeId];
      if (!cached) return false;

      const found = resolveLayoutLeaf(cached, layoutId);
      if (!found) return false;

      const { root, leaf } = found;
      const wrapper = leaf.parentElement;
      if (!wrapper || wrapper.tagName !== "A" || !wrapper.parentNode) {
        return false;
      }

      // Move every child out in order. The wrapper may hold siblings of the
      // addressed element — an author-written <a> around an image AND its
      // caption — and dropping them would delete page content.
      while (wrapper.firstChild) {
        wrapper.parentNode.insertBefore(wrapper.firstChild, wrapper);
      }
      wrapper.parentNode.removeChild(wrapper);

      stageLayoutSourceUpdate(codeId, root.innerHTML);
      return true;
    },
    [stageLayoutSourceUpdate]
  );

  const handleLayoutLinkAttrUpdate = useCallback(
    (
      codeId: string,
      layoutId: string,
      attr: string,
      value: string
    ): boolean => {
      if (!codeId || !layoutId || !attr) return false;

      const cached = templateSourceByCodeIdRef.current[codeId];
      if (!cached) return false;

      const found = resolveLayoutLeaf(cached, layoutId);
      if (!found) return false;

      const { root, leaf } = found;
      const wrapper = leaf.parentElement;
      if (!wrapper || wrapper.tagName !== "A") return false;

      writeAttribute(wrapper, attr, value);

      stageLayoutSourceUpdate(codeId, root.innerHTML);
      return true;
    },
    [stageLayoutSourceUpdate]
  );

  // Thin wrapper preserving the existing media-picker call site, which edits an
  // <img> `src` addressed by the img-specific isLeafImg/imgIndex pair.
  const handleLayoutImageSrcUpdate = useCallback(
    (
      codeId: string,
      layoutId: string,
      isLeafImg: boolean,
      imgIndex: number,
      newSrc: string
    ): boolean => {
      if (!newSrc) return false;
      return handleLayoutElementAttrUpdate(
        codeId,
        layoutId,
        isLeafImg,
        "img",
        imgIndex,
        "src",
        newSrc
      );
    },
    [handleLayoutElementAttrUpdate]
  );

  return {
    pendingLayoutSave,
    pendingLayoutCodeIds,
    isSavingLayout,
    handleDiscardPendingLayoutSave,
    handleSavePendingLayout,
    handleSaveAndPublishPendingLayout,
    handleTemplateSourceMap,
    handleReorderOutput,
    handleLayoutContentUpdate,
    handleLayoutImageSrcUpdate,
    handleLayoutElementAttrUpdate,
    handleLayoutTextUpdate,
    handleLayoutTagUpdate,
    readLinkWrapper,
    handleLayoutWrapInLink,
    handleLayoutUnwrapLink,
    handleLayoutLinkAttrUpdate,
  };
};
