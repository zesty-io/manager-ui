(function () {
  if (window.ZestyStudioBridge?.__initialized) return;

  var parentOrigin = "*";
  var markerIdPattern = /data-studio-id\s*=\s*"([^"]+)"/i;
  var markerBoundaryPattern = /data-studio-boundary\s*=\s*"(start|end)"/i;
  var codeIdPattern = /data-code-id\s*=\s*"([^"]+)"/i;
  var codeBoundaryPattern = /data-code-boundary\s*=\s*"(start|end)"/i;
  var editableFieldTypes = {
    text: true,
    textarea: true,
    markdown: true,
    wysiwyg_basic: true,
    wysiwyg_advanced: true,
  };

  var interactionMode = "content";
  var currentHoverStudioId = null;
  var currentHoverLayoutId = null;
  var lastLayoutSelectionPath = null;
  var lastLayoutSelectionDepth = -1;
  var reorderState = {
    enabled: false,
    selector: "[data-layout-id]",
    dragEl: null,
    dragPath: null,
    dragPreviewEl: null,
    dropTargetEl: null,
    dropPosition: null,
    dropAxis: null,
    didDrop: false,
    sourceCodeId: null,
    observer: null,
  };

  var staticEditState = {
    layoutEl: null,
    layoutId: null,
    codeId: null,
  };
  var staticEditEligibilityCache = new Map();
  // A preview write paints RESOLVED content into the live DOM for display only.
  // The layers-tree observer can't tell that from a real content change, so it
  // would rebuild the tree from a DOM holding marker-less injected nodes and
  // report them as ordinary static elements — a fresh binding looking like
  // inlined static content.
  //
  // Suppress the re-emit for a beat instead of simulating a render. Wrapping the
  // preview in synthetic studio markers WOULD make the tree read it as dynamic,
  // but those markers then flow into every marker-driven subsystem — including
  // the inline-edit echo, which snapshots innerHTML and would bake them into
  // saved template code. The tree here stays as it was and corrects itself on
  // the next server render.
  // What the bridge painted, per leaf, and the TEMPLATE value behind it:
  //   layoutId -> { textIndex, sourceValue }
  //
  // A preview replaces a leaf's rendered content with resolved output. That makes
  // the live DOM diverge from the template, and `isLeafStaticallyEditable` then
  // fails closed — correctly in general (run indices stop being trustworthy), but
  // wrongly here, because the divergence is one WE caused and we know exactly
  // what template value backs it. Without this the slot disappears entirely
  // after an HTML preview: navigate away, come back, and a live binding reads as
  // unconnected.
  //
  // Deliberately NOT synthetic studio markers. Those would make the tree call it
  // dynamic, but they live in the DOM and so leak into every marker consumer —
  // including the inline-edit echo, which snapshots innerHTML and would bake
  // them into saved template code. This is bridge-owned state instead: nothing
  // enters the DOM, and it dies with the page on reload.
  var previewByLayoutId = {};

  // `mode` is how to put it back: "run" replaces the painted nodes with a single
  // text node, "leaf" rewrites the whole leaf. `nodes` are the nodes currently
  // standing in for the run, so a restore is exact rather than a guess.
  function recordPreview(
    layoutId,
    textIndex,
    sourceValue,
    mode,
    nodes,
    leafEl
  ) {
    if (!layoutId) return;
    previewByLayoutId[layoutId] = {
      textIndex: typeof textIndex === "number" ? textIndex : null,
      sourceValue: sourceValue || "",
      mode: mode,
      nodes: nodes || [],
      leafEl: leafEl || null,
    };
  }

  // Painting is a DOM mutation, so it has to be reversible: after it, the leaf no
  // longer matches the template and any index-addressed write lands inside the
  // painted content — then the innerHTML echo stages that resolved output into
  // the template. Restoring the recorded run first is what keeps a plain edit
  // (and a disconnect-then-type) from baking rendered output into saved code.
  function restorePaintedLeaf(layoutId) {
    var rec = previewByLayoutId[layoutId];
    if (!rec) return;
    delete previewByLayoutId[layoutId];

    if (rec.mode === "leaf") {
      if (rec.leafEl) rec.leafEl.textContent = rec.sourceValue;
      return;
    }

    var live = rec.nodes.filter(function (n) {
      return n && n.parentNode;
    });
    if (!live.length) return;

    // One text node back in the run's place, so the leaf's run order and count
    // line up with the template again.
    live[0].parentNode.replaceChild(
      document.createTextNode(rec.sourceValue),
      live[0]
    );
    live.slice(1).forEach(function (n) {
      if (n.parentNode) n.parentNode.removeChild(n);
    });
  }

  function getPreview(layoutId) {
    return (layoutId && previewByLayoutId[layoutId]) || null;
  }

  // Layout edits the user hasn't saved yet live in the HOST, not in this page's
  // template[data-code-id] blocks — those are frozen at render time. The host
  // mirrors each patched region down via the `syncTemplateSource` command so
  // template reads here (slot source values, inline-edit eligibility) see what
  // the user actually typed instead of the page as it first loaded.
  var patchedTemplateSourceByCodeId = {};

  var studioContextById = {};
  // All attribute bindings (entities with an `attr`) per studio id. One element
  // can bind several attributes (e.g. an <img> src and alt) under a single
  // data-studio-id, so this keeps the full list rather than just the first.
  var studioAttrBindingsById = {};

  var bridgeScriptUrl =
    (document.currentScript && document.currentScript.src) || null;

  // Interaction mode state
  function syncInteractionModeClass() {
    var root = document.documentElement || document.body;
    if (!root) return;
    root.classList.toggle("studio-layout-mode", interactionMode === "layout");
  }

  // Messaging + error reporting
  function post(message) {
    if (!window.parent || window.parent === window) return;
    window.parent.postMessage(
      { source: "studio-bridge", message: message },
      parentOrigin
    );
  }

  function reportBridgeError(kind, info) {
    try {
      post({
        type: "BRIDGE_ERROR",
        kind: kind,
        error: {
          message: info.message || "",
          filename: info.filename || null,
          lineno: info.lineno || null,
          colno: info.colno || null,
          stack: info.stack || null,
        },
      });
    } catch (e) {}
  }

  // Runtime data loading
  function loadStudioContextById() {
    var contextScript = document.getElementById("studio-entities");

    if (!contextScript) {
      return {};
    }

    var raw = contextScript.textContent || "";
    if (!raw.trim()) {
      return {};
    }

    try {
      var parsed = JSON.parse(raw);
      var entities = parsed?.entities;
      if (!entities || typeof entities !== "object") {
        return {};
      }

      var nextContextById = {};
      var nextAttrBindings = {};

      Object.keys(entities).forEach(function (studioId) {
        var entityList = Array.isArray(entities[studioId])
          ? entities[studioId]
          : [];
        var objectEntities = entityList.filter(function (entity) {
          return entity && typeof entity === "object" && !Array.isArray(entity);
        });
        var firstEntity = objectEntities[0];

        if (!firstEntity) {
          return;
        }

        nextContextById[studioId] = {
          fieldZuid: firstEntity.fieldZUID || firstEntity.fieldZuid || "",
          itemZuid: firstEntity.itemZUID || firstEntity.itemZuid || "",
          modelZuid: firstEntity.modelZUID || firstEntity.modelZuid || "",
          fieldType:
            firstEntity.dataType ||
            firstEntity.fieldType ||
            firstEntity.datatype ||
            "",
          // Present when the field binds an element attribute (e.g. an <img>
          // src) instead of inline text content.
          attr: firstEntity.attr || "",
        };

        // An element can bind multiple attributes under one studio id; capture
        // every attribute binding, not just the first.
        var bindings = objectEntities
          .filter(function (entity) {
            return entity.attr;
          })
          .map(function (entity) {
            return {
              attr: entity.attr,
              fieldZuid: entity.fieldZUID || entity.fieldZuid || "",
              itemZuid: entity.itemZUID || entity.itemZuid || "",
              modelZuid: entity.modelZUID || entity.modelZuid || "",
              fieldType:
                entity.dataType || entity.fieldType || entity.datatype || "",
            };
          });
        if (bindings.length) {
          nextAttrBindings[studioId] = bindings;
        }
      });

      studioAttrBindingsById = nextAttrBindings;
      return nextContextById;
    } catch (error) {
      reportBridgeError("context_parse", {
        message: error?.message || "Unable to parse #studio-entities JSON",
      });
      return {};
    }
  }

  studioContextById = loadStudioContextById();

  window.addEventListener(
    "error",
    function (event) {
      var ErrorEventCtor = window.ErrorEvent;
      if (
        typeof ErrorEventCtor === "function" &&
        !(event instanceof ErrorEventCtor)
      ) {
        return;
      }

      if (!event.filename) return;
      if (bridgeScriptUrl && event.filename !== bridgeScriptUrl) return;

      reportBridgeError("error", {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        stack: event.error && event.error.stack,
      });
    },
    true
  );

  // Marker parsing + dataset helpers
  function toElement(node) {
    if (!node) return null;
    if (node.nodeType === Node.ELEMENT_NODE) return node;
    return node.parentElement || null;
  }

  function parseCommentMarker(commentNode, idPattern, boundaryPattern, idKey) {
    if (!commentNode || commentNode.nodeType !== Node.COMMENT_NODE) {
      return null;
    }

    var content = commentNode.nodeValue || "";
    var idMatch = content.match(idPattern);
    var boundaryMatch = content.match(boundaryPattern);
    var markerId = idMatch?.[1];
    var boundary = boundaryMatch?.[1];

    if (!markerId || !boundary) return null;

    var marker = {
      boundary: boundary,
    };
    marker[idKey] = markerId;
    return marker;
  }

  function parseMarker(commentNode) {
    return parseCommentMarker(
      commentNode,
      markerIdPattern,
      markerBoundaryPattern,
      "studioId"
    );
  }

  function parseCodeMarker(commentNode) {
    return parseCommentMarker(
      commentNode,
      codeIdPattern,
      codeBoundaryPattern,
      "codeId"
    );
  }

  function buildDataset(studioId) {
    var context = studioContextById[studioId] || {};

    return {
      studioId: studioId || "",
      fieldZuid: context.fieldZuid || "",
      itemZuid: context.itemZuid || "",
      modelZuid: context.modelZuid || "",
      fieldType: context.fieldType || "",
      attr: context.attr || "",
    };
  }

  function buildLayoutDataset(layoutTarget) {
    if (!layoutTarget) return null;

    var codeRegion = resolveCodeRegionForNode(layoutTarget);

    return {
      layoutId: layoutTarget.getAttribute("data-layout-id") || "",
      codeId: codeRegion?.codeId || "",
    };
  }

  function getLayoutBreadcrumb(layoutTarget) {
    if (!layoutTarget) return [];

    var path = getLayoutSelectionPath(layoutTarget);

    return path.map(function (node) {
      return {
        layoutId: node.getAttribute("data-layout-id") || "",
        label: node.tagName.toLowerCase(),
      };
    });
  }

  // Code region + template helpers
  function getTemplateSourceByCodeId() {
    var templateSourceByCodeId = {};

    document
      .querySelectorAll("template[data-code-id]")
      .forEach(function (node) {
        var codeId = node.getAttribute("data-code-id");
        if (!codeId) return;
        templateSourceByCodeId[codeId] = node.innerHTML || "";
      });

    // Pending host edits win over the as-rendered source. Without this, a leaf
    // the user just edited still reads back its original text, so the panel
    // shows a stale value and isLeafStaticallyEditable sees live-vs-template
    // drift and mistakes the edit for dynamic content.
    Object.keys(patchedTemplateSourceByCodeId).forEach(function (codeId) {
      templateSourceByCodeId[codeId] = patchedTemplateSourceByCodeId[codeId];
    });

    return templateSourceByCodeId;
  }

  function getOrderedBlocks(selector) {
    return Array.prototype.slice.call(document.querySelectorAll(selector));
  }

  function getNodesBetween(startNode, endNode) {
    if (!startNode || !endNode || startNode.parentNode !== endNode.parentNode) {
      return [];
    }

    var nodes = [];
    var current = startNode.nextSibling;
    while (current && current !== endNode) {
      nodes.push(current);
      current = current.nextSibling;
    }

    return nodes;
  }

  function getOrderedBlocksWithinNodes(selector, nodes, codeId) {
    var matches = [];

    nodes.forEach(function (node) {
      if (node.nodeType !== Node.ELEMENT_NODE) return;
      if (
        node.matches &&
        node.matches(selector) &&
        (!codeId || resolveCodeRegionForNode(node)?.codeId === codeId)
      ) {
        matches.push(node);
      }
      matches.push.apply(
        matches,
        Array.prototype.slice
          .call(node.querySelectorAll(selector))
          .filter(function (el) {
            return !codeId || resolveCodeRegionForNode(el)?.codeId === codeId;
          })
      );
    });

    return matches;
  }

  function getParentLayoutId(node, selector, codeId) {
    var current = node?.parentElement || null;

    while (current) {
      if (current.matches && current.matches(selector)) {
        var currentCodeId = resolveCodeRegionForNode(current)?.codeId || "";
        if (!codeId || currentCodeId === codeId) {
          return current.getAttribute("data-layout-id") || null;
        }
      }

      current = current.parentElement;
    }

    return null;
  }

  function getLayoutStructure(selector, nodes, codeId) {
    return getOrderedBlocksWithinNodes(selector, nodes, codeId)
      .map(function (el) {
        var layoutId = el.getAttribute("data-layout-id");
        if (!layoutId) return null;

        return {
          layoutId: layoutId,
          parentLayoutId: getParentLayoutId(el, selector, codeId),
        };
      })
      .filter(Boolean);
  }

  function resolveCodeRegionForCodeId(codeId) {
    if (!codeId) return null;
    var root = document.body || document.documentElement;
    if (!root) return null;

    var walker = document.createTreeWalker(root, NodeFilter.SHOW_COMMENT);
    var startComment = null;
    var node = walker.nextNode();

    while (node) {
      var marker = parseCodeMarker(node);
      if (marker && marker.codeId === codeId) {
        if (marker.boundary === "start" && !startComment) {
          startComment = node;
        } else if (marker.boundary === "end" && startComment) {
          return {
            codeId: codeId,
            startComment: startComment,
            endComment: node,
          };
        }
      }
      node = walker.nextNode();
    }

    return null;
  }

  function resolveCodeRegionForNode(node) {
    var currentNode = node;
    var currentParent = currentNode?.parentNode || null;

    while (currentNode && currentParent) {
      var siblings = Array.prototype.slice.call(currentParent.childNodes);
      var nodeIndex = siblings.indexOf(currentNode);

      if (nodeIndex !== -1) {
        for (var i = nodeIndex - 1; i >= 0; i -= 1) {
          var startMarker = parseCodeMarker(siblings[i]);
          if (startMarker?.boundary === "start") {
            var startComment = siblings[i];
            var codeId = startMarker.codeId;

            for (var j = nodeIndex + 1; j < siblings.length; j += 1) {
              var endMarker = parseCodeMarker(siblings[j]);
              if (
                endMarker?.boundary === "end" &&
                endMarker.codeId === codeId
              ) {
                return {
                  codeId: codeId,
                  startComment: startComment,
                  endComment: siblings[j],
                };
              }
            }

            // Keep scanning backward until we find the nearest enclosing region.
            // A closer start marker may belong to a nested region that already ended
            // before this node, which does not enclose the current target.
            continue;
          }
        }
      }

      currentNode = currentParent;
      currentParent = currentParent.parentNode;
    }

    return null;
  }

  // Static editing of layout blocks
  //
  // "Eligibility" here means: the block's template source, with every nested
  // [data-layout-id] subtree replaced by a positional sentinel, matches the
  // live DOM subtree with the same substitution. If that holds, the text
  // around the nested blocks is free of Parsley / studio-field resolution
  // and is safe to overwrite. Nested [data-layout-id] descendants are kept
  // read-only while editing and restored from the template on save so their
  // Parsley / field bindings are never clobbered.
  function stripDescendantLayouts(source) {
    if (typeof source !== "string") return "";
    var container = document.createElement("div");
    container.innerHTML = source;
    var descendants = container.querySelectorAll("[data-layout-id]");
    Array.prototype.forEach.call(descendants, function (node) {
      var layoutId = node.getAttribute("data-layout-id") || "";
      var sentinel = document.createComment("studio-layout-hole:" + layoutId);
      if (node.parentNode) {
        node.parentNode.replaceChild(sentinel, node);
      }
    });
    return container.innerHTML.replace(/\s+/g, " ").trim();
  }

  // Every text node a leaf OWNS: its own content, never a nested layout's (those
  // belong to their own leaf and carry their own Parsley, which must not be
  // touched from here).
  //
  // This ordering is what an addressable text run indexes into, and the SAME
  // function is used when emitting a slot and when writing one back — so the two
  // can never disagree about which run is "the first". Whitespace-only nodes are
  // skipped so formatting in the source can't shift an index.
  function getOwnTextNodes(leafEl) {
    if (!leafEl) return [];
    var doc = leafEl.ownerDocument || document;
    var walker = doc.createTreeWalker(leafEl, NodeFilter.SHOW_TEXT);
    var out = [];
    var node = walker.nextNode();
    while (node) {
      if ((node.nodeValue || "").trim()) {
        var owner = node.parentNode;
        var nested = false;
        while (owner && owner !== leafEl) {
          if (
            owner.nodeType === Node.ELEMENT_NODE &&
            owner.hasAttribute("data-layout-id")
          ) {
            nested = true;
            break;
          }
          owner = owner.parentNode;
        }
        if (!nested) out.push(node);
      }
      node = walker.nextNode();
    }
    return out;
  }

  function getTemplateLeafElement(codeId, layoutId) {
    if (!codeId || !layoutId) return null;

    var templateSource = getTemplateSourceByCodeId()[codeId];
    if (typeof templateSource !== "string" || !templateSource) return null;

    var parser = new DOMParser();
    var doc = parser.parseFromString(
      '<div id="studio-template-root">' + templateSource + "</div>",
      "text/html"
    );
    var root = doc.getElementById("studio-template-root");
    if (!root) return null;

    return root.querySelector('[data-layout-id="' + layoutId + '"]') || null;
  }

  function isLeafStaticallyEditable(leafEl) {
    if (!leafEl || leafEl.nodeType !== Node.ELEMENT_NODE) return false;

    var layoutId = leafEl.getAttribute("data-layout-id");
    if (!layoutId) return false;

    var codeId = resolveCodeRegionForNode(leafEl)?.codeId || "";
    if (!codeId) return false;

    var cacheKey = codeId + "::" + layoutId;
    if (staticEditEligibilityCache.has(cacheKey)) {
      return staticEditEligibilityCache.get(cacheKey);
    }

    var templateLeaf = getTemplateLeafElement(codeId, layoutId);
    if (!templateLeaf) {
      staticEditEligibilityCache.set(cacheKey, false);
      return false;
    }

    var normalizedTemplate = stripDescendantLayouts(templateLeaf.innerHTML);
    var normalizedLive = stripDescendantLayouts(leafEl.innerHTML);
    var verdict = !!normalizedTemplate && normalizedTemplate === normalizedLive;

    staticEditEligibilityCache.set(cacheKey, verdict);
    return verdict;
  }

  function resolveClickedImg(leafEl, target) {
    if (!leafEl || !target) return null;
    if (leafEl.tagName === "IMG") return leafEl;
    var el =
      typeof target.closest === "function" ? target.closest("img") : null;
    if (el && leafEl.contains(el)) return el;
    return null;
  }

  function getImgIndex(leafEl, imgEl) {
    var imgs = Array.prototype.slice.call(leafEl.querySelectorAll("img"));
    return imgs.indexOf(imgEl);
  }

  function enterStaticEditing(leafEl) {
    if (!leafEl || staticEditState.layoutEl === leafEl) return;

    var layoutId = leafEl.getAttribute("data-layout-id") || "";
    var codeId = resolveCodeRegionForNode(leafEl)?.codeId || "";
    if (!layoutId || !codeId) return;

    leafEl.setAttribute("contenteditable", "true");
    leafEl.setAttribute("spellcheck", "false");
    leafEl.classList.add("studio-static-editing");
    leafEl.removeAttribute("draggable");
    syncDraggableLayoutElements(null);

    // Lock nested layout descendants so only the text around them is editable.
    // Their original template subtrees are re-inserted on save, so whatever
    // the browser shows inside them here is throwaway.
    var nested = leafEl.querySelectorAll("[data-layout-id]");
    Array.prototype.forEach.call(nested, function (node) {
      node.setAttribute("contenteditable", "false");
      node.setAttribute("data-studio-static-frozen", "true");
    });

    staticEditState.layoutEl = leafEl;
    staticEditState.layoutId = layoutId;
    staticEditState.codeId = codeId;

    if (typeof leafEl.focus === "function") {
      try {
        leafEl.focus({ preventScroll: true });
      } catch (e) {
        leafEl.focus();
      }
    }
  }

  function exitStaticEditing() {
    var leafEl = staticEditState.layoutEl;
    staticEditState.layoutEl = null;
    staticEditState.layoutId = null;
    staticEditState.codeId = null;
    staticEditEligibilityCache.clear();

    if (!leafEl) return;

    leafEl.removeAttribute("contenteditable");
    leafEl.removeAttribute("spellcheck");
    leafEl.classList.remove("studio-static-editing");
    var frozen = leafEl.querySelectorAll("[data-studio-static-frozen]");
    Array.prototype.forEach.call(frozen, function (node) {
      node.removeAttribute("contenteditable");
      node.removeAttribute("data-studio-static-frozen");
    });
    syncDraggableLayoutElements(getSelectedLayoutElement());
    // The layers observer is suppressed during static editing — re-emit now.
    scheduleLayersTreePost();
  }

  // Layout reorder state + targeting
  function buildRegionPayload(selector, codeRegion) {
    if (!codeRegion) return null;
    var regionNodes = getNodesBetween(
      codeRegion.startComment,
      codeRegion.endComment
    );
    var ordered = getOrderedBlocksWithinNodes(
      selector,
      regionNodes,
      codeRegion.codeId
    );
    var layoutStructure = getLayoutStructure(
      selector,
      regionNodes,
      codeRegion.codeId
    );
    return {
      codeId: codeRegion.codeId,
      selector: selector,
      orderedLayoutIds: ordered
        .map(function (el) {
          return el.getAttribute("data-layout-id");
        })
        .filter(Boolean),
      layoutStructure: layoutStructure,
      outputHtml: ordered
        .map(function (el) {
          return el.outerHTML;
        })
        .join("\n"),
    };
  }

  function postReorderOutput(selector, anchorNode) {
    var activeNode = anchorNode || reorderState.dragEl;
    var destCodeRegion = resolveCodeRegionForNode(activeNode);
    var destCodeId = destCodeRegion?.codeId || null;
    var sourceCodeId = reorderState.sourceCodeId;
    var sourceCodeRegion =
      sourceCodeId && sourceCodeId !== destCodeId
        ? resolveCodeRegionForCodeId(sourceCodeId)
        : null;

    var regions = [];
    if (destCodeRegion) {
      var destPayload = buildRegionPayload(selector, destCodeRegion);
      if (destPayload) regions.push(destPayload);
    }
    if (sourceCodeRegion) {
      var sourcePayload = buildRegionPayload(selector, sourceCodeRegion);
      if (sourcePayload) regions.push(sourcePayload);
    }

    if (!regions.length) {
      // Page without code regions — fall back to a single anonymous payload so
      // pre-existing single-template flows keep working.
      var ordered = getOrderedBlocks(selector);
      regions = [
        {
          codeId: null,
          selector: selector,
          orderedLayoutIds: ordered
            .map(function (el) {
              return el.getAttribute("data-layout-id");
            })
            .filter(Boolean),
          layoutStructure: ordered
            .map(function (el) {
              var layoutId = el.getAttribute("data-layout-id");
              if (!layoutId) return null;
              return {
                layoutId: layoutId,
                parentLayoutId: getParentLayoutId(el, selector, null),
              };
            })
            .filter(Boolean),
          outputHtml: ordered
            .map(function (el) {
              return el.outerHTML;
            })
            .join("\n"),
        },
      ];
    }

    post({
      type: "REORDER_OUTPUT",
      regions: regions,
      primaryCodeId: destCodeId,
      selectedLayoutId: activeNode?.getAttribute("data-layout-id") || null,
      selectedLayoutBreadcrumb: getLayoutBreadcrumb(activeNode),
      selector: selector,
    });
  }

  function getReorderTarget(target) {
    if (!target) return null;

    var current =
      target.nodeType === Node.ELEMENT_NODE ? target : target.parentElement;

    while (current && current !== document.documentElement) {
      if (
        current.matches &&
        current.matches(reorderState.selector) &&
        current !== reorderState.dragEl
      ) {
        return current;
      }

      current = current.parentElement;
    }

    return null;
  }

  function cleanupDragPreview() {
    if (!reorderState.dragPreviewEl) return;
    reorderState.dragPreviewEl.remove();
    reorderState.dragPreviewEl = null;
  }

  function clearDragIntent() {
    if (reorderState.dropTargetEl && reorderState.dropPosition) {
      reorderState.dropTargetEl.classList.remove(
        "studio-drop-" + reorderState.dropPosition
      );
      if (reorderState.dropAxis) {
        reorderState.dropTargetEl.classList.remove(
          "studio-drop-" +
            reorderState.dropPosition +
            "-" +
            reorderState.dropAxis
        );
      }
    }
    reorderState.dropTargetEl = null;
    reorderState.dropPosition = null;
    reorderState.dropAxis = null;
  }

  function createDragPreview(el) {
    if (!el) return null;

    cleanupDragPreview();

    var preview = el.cloneNode(true);
    preview.removeAttribute("draggable");
    preview.classList.remove("studio-dragging");
    preview.style.position = "fixed";
    preview.style.top = "-9999px";
    preview.style.left = "-9999px";
    preview.style.pointerEvents = "none";
    preview.style.margin = "0";
    preview.style.boxSizing = "border-box";
    preview.style.width = el.getBoundingClientRect().width + "px";
    preview.style.maxWidth = "none";
    preview.style.zIndex = "2147483647";
    document.body.appendChild(preview);

    reorderState.dragPreviewEl = preview;
    return preview;
  }

  function setDragIntent(target, position, axis) {
    if (
      reorderState.dropTargetEl === target &&
      reorderState.dropPosition === position &&
      reorderState.dropAxis === axis
    ) {
      return;
    }

    clearDragIntent();

    if (!target || !position) return;

    target.classList.add("studio-drop-" + position);
    if (axis) {
      target.classList.add("studio-drop-" + position + "-" + axis);
    }
    reorderState.dropTargetEl = target;
    reorderState.dropPosition = position;
    reorderState.dropAxis = axis || null;
  }

  function finalizeDraggedLayoutPlacement(shouldPostOutput) {
    if (!reorderState.dragEl) return;

    var dragEl = reorderState.dragEl;
    var target = reorderState.dropTargetEl;
    var position = reorderState.dropPosition;

    if (target && position) {
      if (position === "before" && target.parentNode) {
        target.parentNode.insertBefore(dragEl, target);
      } else if (position === "after" && target.parentNode) {
        target.parentNode.insertBefore(dragEl, target.nextSibling);
      } else if (
        position === "inside" &&
        target !== dragEl &&
        !dragEl.contains(target)
      ) {
        target.appendChild(dragEl);
      }
    }

    clearDragIntent();

    if (shouldPostOutput) {
      postReorderOutput(reorderState.selector, dragEl);
    }

    dragEl.classList.remove("studio-dragging");
    var selectionData = getLayoutSelectionData(dragEl);
    if (selectionData?.path?.length) {
      lastLayoutSelectionPath = selectionData.pathKey;
      lastLayoutSelectionDepth = selectionData.path.length - 1;
    }
    reorderState.dragEl = null;
    reorderState.dragPath = null;
    cleanupDragPreview();
    reorderState.sourceCodeId = null;
    reorderState.didDrop = false;
    syncDraggableLayoutElements(dragEl);
    // The layers observer is suppressed while a drag is active — re-emit now
    // that the DOM has settled.
    scheduleLayersTreePost();
  }

  function getLayoutElements(layoutId, codeId) {
    if (!layoutId) return [];

    var elements = Array.prototype.slice.call(
      document.querySelectorAll('[data-layout-id="' + layoutId + '"]')
    );

    if (!codeId) {
      return elements;
    }

    return elements.filter(function (node) {
      return resolveCodeRegionForNode(node)?.codeId === codeId;
    });
  }

  function getLayoutElement(layoutId, codeId) {
    return getLayoutElements(layoutId, codeId)[0] || null;
  }

  function getSelectedLayoutElement() {
    return (
      document.querySelector(
        reorderState.selector + '.studio-selected[draggable="true"]'
      ) || document.querySelector(reorderState.selector + ".studio-selected")
    );
  }

  function syncDraggableLayoutElements(activeLayoutElement) {
    getOrderedBlocks(reorderState.selector).forEach(function (node) {
      if (activeLayoutElement && node === activeLayoutElement) {
        node.setAttribute("draggable", "true");
        return;
      }

      node.removeAttribute("draggable");
    });
  }

  function getDraggableLayoutTarget(target) {
    if (!target) return null;

    var selectedTarget =
      target.closest &&
      target.closest(reorderState.selector + ".studio-selected");
    if (selectedTarget) {
      return selectedTarget;
    }

    var selectedLayoutElement = getSelectedLayoutElement();
    if (selectedLayoutElement && selectedLayoutElement.contains(target)) {
      return selectedLayoutElement;
    }

    if (target.closest) {
      return target.closest(reorderState.selector);
    }

    return null;
  }

  function getBranchPlacementTarget(target) {
    var deepestTarget = toElement(target)?.closest?.(reorderState.selector);
    var selectionData = getLayoutSelectionData(deepestTarget);
    var path = selectionData?.path || [];

    if (!path.length) {
      return deepestTarget || null;
    }

    if (!reorderState.dragPath?.length) {
      return path[0] || deepestTarget || null;
    }

    var commonPrefixLength = 0;
    while (
      commonPrefixLength < reorderState.dragPath.length &&
      commonPrefixLength < path.length &&
      reorderState.dragPath[commonPrefixLength] ===
        (path[commonPrefixLength]?.getAttribute("data-layout-id") || "")
    ) {
      commonPrefixLength += 1;
    }

    return (
      path[commonPrefixLength] || path[path.length - 1] || deepestTarget || null
    );
  }

  function getDragAxis(target) {
    var parent = target?.parentElement;
    if (!parent) return "vertical";

    var computed = window.getComputedStyle(parent);
    var display = computed.display;

    if (display === "flex" || display === "inline-flex") {
      var flexDirection = computed.flexDirection || "row";
      return flexDirection.indexOf("row") === 0 ? "horizontal" : "vertical";
    }

    if (display === "grid" || display === "inline-grid") {
      var targetRect = target.getBoundingClientRect();
      if (targetRect.width > 0 && targetRect.height > 0) {
        var targetCenterX = targetRect.left + targetRect.width / 2;
        var targetCenterY = targetRect.top + targetRect.height / 2;

        var findNeighbor = function (start, useNext) {
          var node = start;
          while (node) {
            var sibling = useNext
              ? node.nextElementSibling
              : node.previousElementSibling;
            if (!sibling) return null;
            if (sibling.matches && sibling.matches(reorderState.selector)) {
              var rect = sibling.getBoundingClientRect();
              if (rect.width > 0 && rect.height > 0) {
                return rect;
              }
            }
            node = sibling;
          }
          return null;
        };

        var neighbors = [];
        var prevRect = findNeighbor(target, false);
        if (prevRect) neighbors.push(prevRect);
        var nextRect = findNeighbor(target, true);
        if (nextRect) neighbors.push(nextRect);

        if (neighbors.length > 0) {
          var bestDx = 0;
          var bestDy = 0;
          var bestMag = Infinity;
          for (var i = 0; i < neighbors.length; i += 1) {
            var r = neighbors[i];
            var dx = Math.abs(r.left + r.width / 2 - targetCenterX);
            var dy = Math.abs(r.top + r.height / 2 - targetCenterY);
            var mag = dx * dx + dy * dy;
            if (mag < bestMag) {
              bestMag = mag;
              bestDx = dx;
              bestDy = dy;
            }
          }
          return bestDx >= bestDy ? "horizontal" : "vertical";
        }
      }

      var autoFlow = computed.gridAutoFlow || "row";
      return autoFlow.indexOf("column") !== -1 ? "vertical" : "horizontal";
    }

    return "vertical";
  }

  // Layout selection helpers
  function getLayoutSelectionPath(layoutTarget, codeId) {
    if (!layoutTarget) return [];

    var path = [];
    var current = layoutTarget;

    while (current && current !== document.documentElement) {
      if (current.matches && current.matches(reorderState.selector)) {
        var currentCodeId = resolveCodeRegionForNode(current)?.codeId || "";
        if (!codeId || currentCodeId === codeId) {
          path.unshift(current);
        }
      }
      if (codeId) {
        var parentCodeId =
          resolveCodeRegionForNode(current.parentElement)?.codeId || "";
        if (current.parentElement && parentCodeId && parentCodeId !== codeId) {
          break;
        }
      }
      current = current.parentElement;
    }

    return path;
  }

  function getInnermostLayoutCodeId(layoutTarget) {
    return resolveCodeRegionForNode(layoutTarget)?.codeId || "";
  }

  function getLayoutSelectionData(layoutTarget) {
    var codeId = getInnermostLayoutCodeId(layoutTarget);
    var path = getLayoutSelectionPath(layoutTarget, codeId);
    if (!path.length) return null;

    return {
      codeId: codeId,
      path: path,
      pathKey: getLayoutSelectionPathKey(path),
    };
  }

  function getLayoutSelectionPathKey(path) {
    return path
      .map(function (node) {
        return node.getAttribute("data-layout-id") || "";
      })
      .join(">");
  }

  // Depth of the topmost ADDRESSABLE element in a selection path — one that
  // resolves to a code region. Base-template wrappers (e.g. loader.html's
  // <main>) carry a data-layout-id but sit outside every region, so they have
  // no codeId: the host can't select, patch, or reorder them and silently
  // drops their selection events. Starting the drill-down below them keeps
  // the first click responsive instead of appearing dead.
  function firstAddressableLayoutDepth(path) {
    for (var i = 0; i < path.length; i += 1) {
      if (resolveCodeRegionForNode(path[i])) return i;
    }
    return -1;
  }

  function selectTopLayoutTarget(layoutTarget) {
    var selectionData = getLayoutSelectionData(layoutTarget);
    if (!selectionData) return null;

    var depth = firstAddressableLayoutDepth(selectionData.path);
    // Nothing addressable in the path. Don't latch the path either — a
    // latched path with no selection would make every later single click
    // short-circuit in shouldResetSelection and go dead.
    if (depth === -1) return null;

    lastLayoutSelectionPath = selectionData.pathKey;
    lastLayoutSelectionDepth = depth;

    return selectionData.path[depth] || null;
  }

  // Selects a same-level sibling without snapping back to the parent. Returns
  // null (so the caller falls back to selectTopLayoutTarget) unless the clicked
  // element shares every ancestor of the current selection.
  function selectSiblingLayoutTarget(layoutTarget) {
    if (lastLayoutSelectionDepth < 0 || !lastLayoutSelectionPath) return null;

    var selectionData = getLayoutSelectionData(layoutTarget);
    if (!selectionData) return null;
    var path = selectionData.path;

    var oldIds = lastLayoutSelectionPath.split(">");
    var depth = lastLayoutSelectionDepth;

    var commonPrefixLength = 0;
    while (
      commonPrefixLength < oldIds.length &&
      commonPrefixLength < path.length &&
      oldIds[commonPrefixLength] ===
        (path[commonPrefixLength]?.getAttribute("data-layout-id") || "")
    ) {
      commonPrefixLength += 1;
    }

    // Only treat the click as a same-level move when it shares every ancestor
    // of the current selection (i.e. a sibling, or a descendant of it).
    if (commonPrefixLength < depth || !path[depth]) return null;

    lastLayoutSelectionPath = selectionData.pathKey;
    lastLayoutSelectionDepth = depth;

    return path[depth];
  }

  function selectNextLayoutTarget(layoutTarget) {
    var selectionData = getLayoutSelectionData(layoutTarget);
    if (!selectionData) return null;
    var path = selectionData.path;
    var pathKey = selectionData.pathKey;

    if (pathKey !== lastLayoutSelectionPath) {
      var startDepth = firstAddressableLayoutDepth(path);
      if (startDepth === -1) return null;
      lastLayoutSelectionPath = pathKey;
      lastLayoutSelectionDepth = startDepth;
      return path[startDepth] || null;
    }

    lastLayoutSelectionDepth = Math.min(
      Math.max(lastLayoutSelectionDepth, 0) + 1,
      path.length - 1
    );

    return path[lastLayoutSelectionDepth] || null;
  }

  // Bridge -> host DOM events
  function emitLayoutDomEvent(
    eventType,
    layoutId,
    evt,
    element,
    codeId,
    breadcrumb
  ) {
    post({
      type: "DOM_EVENT",
      eventType: eventType,
      element: element || {
        dataset: {
          layoutId: layoutId,
          codeId: codeId || "",
        },
      },
      breadcrumb: breadcrumb || [],
      clientX: evt?.clientX,
      clientY: evt?.clientY,
    });
  }

  // Layout drag + reorder listeners
  function setupReorderListeners() {
    if (setupReorderListeners.__bound) return;
    setupReorderListeners.__bound = true;

    document.addEventListener(
      "dragstart",
      function (evt) {
        if (!reorderState.enabled) return;
        var el = getDraggableLayoutTarget(evt.target);
        if (!el) return;
        if (!el.classList.contains("studio-selected")) {
          evt.preventDefault();
          return;
        }

        reorderState.dragEl = el;
        reorderState.sourceCodeId =
          resolveCodeRegionForNode(el)?.codeId || null;
        reorderState.dragPath =
          getLayoutSelectionData(el)?.path.map(function (node) {
            return node.getAttribute("data-layout-id") || "";
          }) || null;
        reorderState.didDrop = false;
        syncDraggableLayoutElements(el);
        clearDragIntent();
        el.classList.add("studio-dragging");

        if (evt.dataTransfer) {
          var preview = createDragPreview(el);
          evt.dataTransfer.effectAllowed = "move";
          evt.dataTransfer.setData(
            "text/plain",
            el.getAttribute("data-layout-id") || ""
          );
          if (preview) {
            evt.dataTransfer.setDragImage(preview, 0, 0);
          }
        }
      },
      true
    );

    document.addEventListener(
      "pointerdown",
      function (evt) {
        if (!reorderState.enabled) return;
        var el = getDraggableLayoutTarget(evt.target);
        if (!el) return;
        if (!el.classList.contains("studio-selected")) return;
        syncDraggableLayoutElements(el);
      },
      true
    );

    document.addEventListener(
      "dragover",
      function (evt) {
        if (!reorderState.enabled || !reorderState.dragEl) return;
        var deepestTarget = toElement(evt.target)?.closest?.(
          reorderState.selector
        );
        var branchTarget = getBranchPlacementTarget(evt.target);
        var branchReorderTarget = getReorderTarget(branchTarget);
        var nestedReorderTarget = getReorderTarget(deepestTarget);
        var target = branchReorderTarget || nestedReorderTarget;
        if (!target) return;

        evt.preventDefault();

        var rect = target.getBoundingClientRect();
        var axis = getDragAxis(target);
        var edgeRatio = 0.35;
        if (!target.parentNode) return;

        if (axis === "horizontal") {
          var leftBand = rect.left + rect.width * edgeRatio;
          var rightBand = rect.right - rect.width * edgeRatio;

          if (evt.clientX < leftBand) {
            setDragIntent(
              branchReorderTarget || target,
              "before",
              "horizontal"
            );
          } else if (evt.clientX > rightBand) {
            setDragIntent(branchReorderTarget || target, "after", "horizontal");
          } else if (
            nestedReorderTarget &&
            nestedReorderTarget !== reorderState.dragEl &&
            !reorderState.dragEl.contains(nestedReorderTarget)
          ) {
            setDragIntent(nestedReorderTarget, "inside", "horizontal");
          } else {
            clearDragIntent();
          }
          return;
        }

        var topBand = rect.top + rect.height * edgeRatio;
        var bottomBand = rect.bottom - rect.height * edgeRatio;

        if (evt.clientY < topBand) {
          setDragIntent(branchReorderTarget || target, "before", "vertical");
        } else if (evt.clientY > bottomBand) {
          setDragIntent(branchReorderTarget || target, "after", "vertical");
        } else if (
          nestedReorderTarget &&
          nestedReorderTarget !== reorderState.dragEl &&
          !reorderState.dragEl.contains(nestedReorderTarget)
        ) {
          setDragIntent(nestedReorderTarget, "inside", "vertical");
        } else {
          clearDragIntent();
        }
      },
      true
    );

    document.addEventListener(
      "drop",
      function (evt) {
        if (!reorderState.enabled || !reorderState.dragEl) return;
        evt.preventDefault();
        reorderState.didDrop = true;
        finalizeDraggedLayoutPlacement(true);
      },
      true
    );

    document.addEventListener(
      "dragend",
      function () {
        if (!reorderState.dragEl) return;
        finalizeDraggedLayoutPlacement(!reorderState.didDrop);
      },
      true
    );
  }

  function handleEscapeKey(evt) {
    if (evt.key !== "Escape") return;

    if (interactionMode !== "layout") {
      emitDomEvent("escape", "", evt);
      return;
    }

    clearDragIntent();

    if (staticEditState.layoutEl) {
      exitStaticEditing();
      return;
    }

    if (!getSelectedLayoutElement()) return;

    emitLayoutDomEvent("escape", "", evt, {
      dataset: {},
    });
  }

  function ensureReorderAttributes() {
    syncDraggableLayoutElements(getSelectedLayoutElement());
  }

  function setupReorderObserver() {
    if (reorderState.observer) return;
    if (typeof MutationObserver !== "function") return;

    reorderState.observer = new MutationObserver(function () {
      if (!reorderState.enabled) return;
      ensureReorderAttributes();
    });

    reorderState.observer.observe(document.documentElement || document.body, {
      childList: true,
      subtree: true,
    });
  }

  // Studio field range helpers
  function getAllMarkerPairs() {
    var root = document.body || document.documentElement;
    if (!root) return [];

    var pendingByStudioId = {};
    var pairs = [];
    var walker = document.createTreeWalker(root, NodeFilter.SHOW_COMMENT);
    var commentNode = walker.nextNode();

    while (commentNode) {
      var marker = parseMarker(commentNode);
      if (marker) {
        if (marker.boundary === "start") {
          if (!pendingByStudioId[marker.studioId]) {
            pendingByStudioId[marker.studioId] = [];
          }
          pendingByStudioId[marker.studioId].push(commentNode);
        } else if (marker.boundary === "end") {
          var pending = pendingByStudioId[marker.studioId];
          if (pending?.length) {
            var startComment = pending.shift();
            pairs.push({
              studioId: marker.studioId,
              startComment: startComment,
              endComment: commentNode,
            });
          }
        }
      }

      commentNode = walker.nextNode();
    }

    return pairs;
  }

  function getPairsWithinNode(node, allPairs) {
    if (!node) return [];
    var pairs = allPairs || getAllMarkerPairs();
    return pairs.filter(function (pair) {
      return node.contains(pair.startComment);
    });
  }

  function getRangeNodes(pair) {
    if (!pair?.startComment || !pair?.endComment) return [];
    if (pair.startComment.parentNode !== pair.endComment.parentNode) return [];

    var nodes = [];
    var current = pair.startComment.nextSibling;

    while (current && current !== pair.endComment) {
      nodes.push(current);
      current = current.nextSibling;
    }

    return nodes;
  }

  function getWrapperForPair(pair) {
    var nextNode = pair.startComment?.nextSibling;
    if (
      nextNode &&
      nextNode.nodeType === Node.ELEMENT_NODE &&
      nextNode.getAttribute("data-studio-highlight-wrapper") === "true" &&
      nextNode.getAttribute("data-studio-id") === pair.studioId
    ) {
      return nextNode;
    }
    return null;
  }

  function createWrapperForPair(pair) {
    var fieldType = studioContextById[pair.studioId]?.fieldType;
    var tagName = ["markdown", "wysiwyg_basic", "wysiwyg_advanced"].includes(
      fieldType
    )
      ? "div"
      : "span";
    var wrapper = document.createElement(tagName);
    wrapper.setAttribute("data-studio-highlight-wrapper", "true");
    wrapper.setAttribute("data-studio-id", pair.studioId);
    return wrapper;
  }

  function wrapPairIfNeeded(pair) {
    var existing = getWrapperForPair(pair);
    if (existing) return existing;

    var nodes = getRangeNodes(pair);
    if (!nodes.length) return null;

    var wrapper = createWrapperForPair(pair);
    pair.startComment.parentNode.insertBefore(wrapper, nodes[0]);
    nodes.forEach(function (node) {
      wrapper.appendChild(node);
    });

    return wrapper;
  }

  function unwrapIfUnused(wrapper) {
    if (!wrapper) return;
    if (
      wrapper.classList.contains("studio-hover") ||
      wrapper.classList.contains("studio-selected")
    ) {
      return;
    }

    while (wrapper.firstChild) {
      wrapper.parentNode.insertBefore(wrapper.firstChild, wrapper);
    }
    wrapper.remove();
  }

  function getPairsByStudioId(studioId) {
    if (!studioId) return [];
    return getAllMarkerPairs().filter(function (pair) {
      return pair.studioId === studioId;
    });
  }

  function getPairsByField(fieldZuid, itemZuid) {
    if (!fieldZuid) return [];
    return getAllMarkerPairs().filter(function (pair) {
      var context = studioContextById[pair.studioId] || {};
      if (context.fieldZuid !== fieldZuid) return false;
      if (itemZuid && context.itemZuid && context.itemZuid !== itemZuid) {
        return false;
      }
      return true;
    });
  }

  function getPairRects(pair) {
    var nodes = getRangeNodes(pair);
    if (!nodes.length) return [];

    var range = document.createRange();
    range.setStartBefore(nodes[0]);
    range.setEndAfter(nodes[nodes.length - 1]);

    return Array.from(range.getClientRects());
  }

  function pickPairByPoint(pairs, clientX, clientY) {
    if (!pairs.length) return null;
    if (typeof clientX !== "number" || typeof clientY !== "number") {
      return pairs[0];
    }

    for (var i = 0; i < pairs.length; i += 1) {
      var rects = getPairRects(pairs[i]);
      for (var j = 0; j < rects.length; j += 1) {
        var rect = rects[j];
        if (
          clientX >= rect.left &&
          clientX <= rect.right &&
          clientY >= rect.top &&
          clientY <= rect.bottom
        ) {
          return pairs[i];
        }
      }
    }

    return pairs[0];
  }

  function resolveInteraction(target, clientX, clientY) {
    var allPairs = getAllMarkerPairs();
    var current = target;
    while (current && current !== document.documentElement) {
      var pairs = getPairsWithinNode(current, allPairs);

      if (pairs.length === 1) {
        return pairs[0];
      }

      if (pairs.length > 1) {
        return pickPairByPoint(pairs, clientX, clientY);
      }

      current = current.parentNode;
    }

    return null;
  }

  // How each field pair was last painted, keyed by studioId. The inline-edit
  // echo has to read the DOM back the same way it was written: a pair painted
  // as HTML must echo innerHTML, or the markup is flattened to characters and
  // saved that way. Datatype alone can't answer this — a `text` field holding
  // markup is painted as HTML (WebEngine renders it as HTML too), so the mode
  // is recorded at paint time rather than inferred from the field.
  var contentPaintModeByStudioId = {};

  function replacePairContent(pair, mode, nextValue) {
    if (pair.studioId) {
      contentPaintModeByStudioId[pair.studioId] = mode;
    }
    var wrapper = getWrapperForPair(pair);
    if (wrapper) {
      if (mode === "html") {
        if (wrapper.innerHTML !== nextValue) {
          wrapper.innerHTML = nextValue;
        }
      } else if ((wrapper.textContent || "") !== nextValue) {
        wrapper.textContent = nextValue;
      }
      return;
    }

    var nodes = getRangeNodes(pair);
    nodes.forEach(function (node) {
      node.remove();
    });

    if (mode === "html") {
      var template = document.createElement("template");
      template.innerHTML = nextValue;
      pair.startComment.parentNode.insertBefore(
        template.content,
        pair.endComment
      );
      return;
    }

    pair.startComment.parentNode.insertBefore(
      document.createTextNode(nextValue),
      pair.endComment
    );
  }

  // Bridge -> host field events
  function emitDomEvent(eventType, studioId, evt, value) {
    post({
      type: "DOM_EVENT",
      eventType: eventType,
      element: {
        dataset: buildDataset(studioId),
      },
      clientX: evt?.clientX,
      clientY: evt?.clientY,
      value: value,
    });
  }

  // Location + link interception
  function notifyPathChange(reason, locationOverride) {
    var loc = locationOverride || {
      path: window.location.pathname,
      search: window.location.search,
      hash: window.location.hash,
      href: window.location.href,
    };
    post({
      type: "PATH_CHANGE",
      reason: reason || null,
      location: loc,
    });
  }

  function notifyPathChangeForUrl(reason, href) {
    if (!href) return;

    try {
      var url = new URL(href, window.location.href);
      if (url.origin !== window.location.origin) return;

      notifyPathChange(reason, {
        path: url.pathname,
        search: url.search,
        hash: url.hash,
        href: url.href,
      });
    } catch (e) {
      // ignore invalid URLs
    }
  }

  function setupPathListeners() {
    var currentHref = window.location.href;
    ["pushState", "replaceState"].forEach(function (method) {
      if (!history[method]) return;
      var original = history[method];
      history[method] = function (state, title, url) {
        if (typeof url === "string") {
          try {
            var targetUrl = new URL(url, window.location.href);
            notifyPathChange(method, {
              path: targetUrl.pathname,
              search: targetUrl.search,
              hash: targetUrl.hash,
              href: targetUrl.href,
            });
          } catch (e) {
            notifyPathChange(method);
          }
        } else {
          notifyPathChange(method);
        }
        return null;
      };
      history[method].__original = original;
    });

    window.addEventListener("popstate", function () {
      var attemptedHref = window.location.href;
      if (attemptedHref !== currentHref) {
        var originalPushState = history.pushState.__original;
        if (typeof originalPushState === "function") {
          originalPushState.call(history, null, document.title, currentHref);
        }
      }
      notifyPathChange("popstate", {
        path: window.location.pathname,
        search: window.location.search,
        hash: window.location.hash,
        href: attemptedHref,
      });
    });

    window.addEventListener("hashchange", function () {
      var attemptedHref = window.location.href;
      if (attemptedHref !== currentHref) {
        var originalReplaceState = history.replaceState.__original;
        if (typeof originalReplaceState === "function") {
          originalReplaceState.call(history, null, document.title, currentHref);
        }
      }
      notifyPathChange("hashchange", {
        path: window.location.pathname,
        search: window.location.search,
        hash: window.location.hash,
        href: attemptedHref,
      });
    });

    notifyPathChange("init");
  }

  function handleLinkClick(evt) {
    // Layout mode: handleStudioClick owns clicks (it preventDefaults them
    // all, so links can't navigate anyway). Swallowing here would
    // stopImmediatePropagation past it — this listener binds first.
    if (interactionMode === "layout") return;

    var target = toElement(evt.target);
    if (!target) return;

    var el = target.closest && target.closest("a");
    if (!el) return;

    var href = el.getAttribute("href");
    if (!href) return;

    evt.preventDefault();
    evt.stopPropagation();
    if (typeof evt.stopImmediatePropagation === "function") {
      evt.stopImmediatePropagation();
    }

    if (href[0] === "#") return;

    notifyPathChangeForUrl("anchor", href);
  }

  function handleLinkPointerDown(evt) {
    // Layout mode: selection happens on mousedown (handleStudioMouseDown,
    // bound AFTER this listener). Swallowing the event here made every
    // element inside an <a> unselectable — and therefore unreorderable —
    // from the canvas.
    if (interactionMode === "layout") return;

    var target = toElement(evt.target);
    if (!target) return;

    var el = target.closest && target.closest("a");
    if (!el) return;

    evt.preventDefault();
    evt.stopPropagation();
    if (typeof evt.stopImmediatePropagation === "function") {
      evt.stopImmediatePropagation();
    }
  }

  function handleLinkKeyDown(evt) {
    if (evt.key !== "Enter") return;

    var target = toElement(evt.target);
    if (!target) return;

    var el = target.closest && target.closest("a");
    if (!el) return;

    var href = el.getAttribute("href");
    if (!href) return;

    evt.preventDefault();
    evt.stopPropagation();
    if (typeof evt.stopImmediatePropagation === "function") {
      evt.stopImmediatePropagation();
    }

    if (href[0] === "#") return;

    notifyPathChangeForUrl("anchor", href);
  }

  function handleFormSubmit(evt) {
    if (!evt.target || !window.HTMLFormElement) return;
    if (!(evt.target instanceof window.HTMLFormElement)) return;

    evt.preventDefault();
    evt.stopPropagation();

    var action = evt.target.getAttribute("action");
    notifyPathChangeForUrl("form", action || window.location.href);
  }

  // DOM interaction handlers
  function handleStudioClick(evt) {
    if (interactionMode === "layout") {
      evt.preventDefault();
      evt.stopPropagation();
      if (typeof evt.stopImmediatePropagation === "function") {
        evt.stopImmediatePropagation();
      }
      return;
    }

    var pair = resolveInteraction(evt.target, evt.clientX, evt.clientY);
    if (!pair?.studioId) {
      emitDomEvent("escape", "", evt);
      return;
    }
    emitDomEvent("click", pair.studioId, evt);
  }

  function handleStudioMouseMove(evt) {
    if (interactionMode === "layout") {
      var layoutTarget = toElement(evt.target)?.closest?.(
        reorderState.selector
      );
      var nextLayoutId = layoutTarget?.getAttribute("data-layout-id") || null;

      if (currentHoverLayoutId === nextLayoutId) {
        return;
      }

      if (currentHoverLayoutId) {
        emitLayoutDomEvent("mouseout", currentHoverLayoutId, evt);
      }

      currentHoverLayoutId = nextLayoutId;

      if (nextLayoutId) {
        var nextLayoutDataset = buildLayoutDataset(layoutTarget);
        var nextPayload = nextLayoutDataset
          ? {
              dataset: nextLayoutDataset,
            }
          : null;
        if (!nextPayload) return;
        emitLayoutDomEvent(
          "mouseover",
          nextLayoutId,
          evt,
          nextPayload,
          nextLayoutDataset.codeId
        );
      }

      return;
    }

    var pair = resolveInteraction(evt.target, evt.clientX, evt.clientY);
    var nextStudioId = pair?.studioId || null;

    if (currentHoverStudioId === nextStudioId) {
      return;
    }

    if (currentHoverStudioId) {
      emitDomEvent("mouseout", currentHoverStudioId, evt);
    }

    currentHoverStudioId = nextStudioId;

    if (nextStudioId) {
      emitDomEvent("mouseover", nextStudioId, evt);
    }
  }

  function handleStudioMouseLeave(evt) {
    if (interactionMode === "layout") {
      if (!currentHoverLayoutId) return;
      emitLayoutDomEvent("mouseout", currentHoverLayoutId, evt);
      currentHoverLayoutId = null;
      return;
    }

    if (!currentHoverStudioId) return;
    emitDomEvent("mouseout", currentHoverStudioId, evt);
    currentHoverStudioId = null;
  }

  function handleStudioMouseDown(evt) {
    if (interactionMode !== "layout") return;

    if (staticEditState.layoutEl) {
      if (staticEditState.layoutEl.contains(evt.target)) {
        return;
      }
      exitStaticEditing();
    }

    var deepestLayoutTarget = toElement(evt.target)?.closest?.(
      reorderState.selector
    );
    var selectionData = getLayoutSelectionData(deepestLayoutTarget);
    if (!selectionData) {
      emitLayoutDomEvent("escape", "", evt, {
        dataset: {},
      });
      return;
    }

    var shouldResetSelection =
      selectionData.pathKey !== lastLayoutSelectionPath ||
      lastLayoutSelectionDepth < 0;
    if (!shouldResetSelection) {
      return;
    }

    var layoutTarget =
      selectSiblingLayoutTarget(deepestLayoutTarget) ||
      selectTopLayoutTarget(deepestLayoutTarget);
    var layoutDataset = buildLayoutDataset(layoutTarget);
    if (!layoutDataset) return;

    emitLayoutDomEvent(
      "mousedown",
      layoutDataset.layoutId,
      evt,
      {
        dataset: layoutDataset,
      },
      layoutDataset.codeId,
      getLayoutBreadcrumb(layoutTarget)
    );
  }

  function handleStudioDoubleClick(evt) {
    if (interactionMode !== "layout") return;
    if (
      staticEditState.layoutEl &&
      staticEditState.layoutEl.contains(evt.target)
    ) {
      return;
    }

    var deepestLayoutTarget = toElement(evt.target)?.closest?.(
      reorderState.selector
    );
    if (!deepestLayoutTarget) return;

    var selectionData = getLayoutSelectionData(deepestLayoutTarget);
    var isAtLeaf =
      !!selectionData &&
      selectionData.pathKey === lastLayoutSelectionPath &&
      lastLayoutSelectionDepth === selectionData.path.length - 1;

    if (isAtLeaf) {
      var clickedImg = resolveClickedImg(deepestLayoutTarget, evt.target);
      if (clickedImg) {
        evt.preventDefault();
        var isLeafImg = clickedImg === deepestLayoutTarget;
        post({
          type: "STATIC_EDIT_IMAGE",
          codeId: selectionData.codeId,
          layoutId: deepestLayoutTarget.getAttribute("data-layout-id") || "",
          isLeafImg: isLeafImg,
          imgIndex: isLeafImg
            ? 0
            : getImgIndex(deepestLayoutTarget, clickedImg),
          currentSrc: clickedImg.getAttribute("src") || "",
        });
        return;
      }

      if (isLeafStaticallyEditable(deepestLayoutTarget)) {
        evt.preventDefault();
        enterStaticEditing(deepestLayoutTarget);
      } else {
        post({
          type: "STATIC_EDIT_REJECTED",
          layoutId: deepestLayoutTarget.getAttribute("data-layout-id") || "",
        });
      }
      return;
    }

    var layoutTarget = selectNextLayoutTarget(deepestLayoutTarget);
    var layoutDataset = buildLayoutDataset(layoutTarget);
    if (!layoutDataset) return;

    emitLayoutDomEvent(
      "dblclick",
      layoutDataset.layoutId,
      evt,
      {
        dataset: layoutDataset,
      },
      layoutDataset.codeId,
      getLayoutBreadcrumb(layoutTarget)
    );
  }

  function handleLayoutStaticInput(evt) {
    if (!staticEditState.layoutEl) return;
    if (!staticEditState.layoutEl.contains(evt.target)) return;

    post({
      type: "LAYOUT_CONTENT_UPDATE",
      codeId: staticEditState.codeId,
      layoutId: staticEditState.layoutId,
      innerHtml: staticEditState.layoutEl.innerHTML,
    });
  }

  function handleLayoutStaticKeydown(evt) {
    if (!staticEditState.layoutEl) return;
    if (!staticEditState.layoutEl.contains(evt.target)) return;
    if (evt.key === "Enter") {
      evt.preventDefault();
    }
  }

  function handleEditableInput(evt) {
    if (staticEditState.layoutEl) {
      handleLayoutStaticInput(evt);
      return;
    }

    var wrapper = toElement(evt.target)?.closest?.(
      "[data-studio-highlight-wrapper]"
    );
    if (!wrapper) return;

    var studioId = wrapper.getAttribute("data-studio-id");
    if (!studioId) return;

    // Echo the value back the way it was painted. Falls back to the datatype
    // rule for a pair we never painted (the host seeds on selection, so that
    // normally can't happen — this is just belt and braces).
    var paintMode = contentPaintModeByStudioId[studioId];
    var fieldType = studioContextById[studioId]?.fieldType;
    var echoHtml = paintMode
      ? paintMode === "html"
      : ["markdown", "wysiwyg_basic", "wysiwyg_advanced"].includes(fieldType);
    emitDomEvent(
      "input",
      studioId,
      evt,
      echoHtml ? wrapper.innerHTML : wrapper.textContent || ""
    );
  }

  // Host -> bridge commands
  function handleIncomingMessage(evt) {
    if (parentOrigin !== "*" && evt.origin !== parentOrigin) return;
    var data = evt.data;
    if (!data || data.source !== "zesty-studio-host") return;
    var payload = data.message?.payload;
    if (!payload || !payload.action) return;

    if (payload.action === "injectCss" && payload.css) {
      var style = document.createElement("style");
      style.appendChild(document.createTextNode(payload.css));
      document.head.appendChild(style);
      return;
    }

    if (payload.action === "setTextByField") {
      getPairsByField(payload.fieldZuid, payload.itemZuid).forEach(function (
        pair
      ) {
        replacePairContent(pair, "text", payload.value || "");
      });
      return;
    }

    if (payload.action === "setHtmlByField") {
      getPairsByField(payload.fieldZuid, payload.itemZuid).forEach(function (
        pair
      ) {
        replacePairContent(pair, "html", payload.html || "");
      });
      return;
    }

    if (payload.action === "enableReorderByUid") {
      reorderState.enabled = true;
      reorderState.selector = payload.selector || "[data-layout-id]";
      ensureReorderAttributes();
      setupReorderListeners();
      setupReorderObserver();
      postReorderOutput(reorderState.selector, null);
      return;
    }

    if (payload.action === "disableReorderByUid") {
      exitStaticEditing();
      reorderState.enabled = false;
      if (reorderState.dragEl) {
        finalizeDraggedLayoutPlacement(false);
      }
      reorderState.dragEl = null;
      reorderState.dragPath = null;
      cleanupDragPreview();
      clearDragIntent();
      reorderState.sourceCodeId = null;
      reorderState.didDrop = false;
      syncDraggableLayoutElements(null);
      return;
    }

    if (payload.action === "setInteractionMode") {
      exitStaticEditing();
      interactionMode = payload.mode === "layout" ? "layout" : "content";
      syncInteractionModeClass();
      currentHoverStudioId = null;
      currentHoverLayoutId = null;
      lastLayoutSelectionPath = null;
      lastLayoutSelectionDepth = -1;
      return;
    }

    if (payload.action === "addClassByLayoutId") {
      if (!payload.layoutId || !payload.className) return;
      getLayoutElements(payload.layoutId, payload.codeId).forEach(function (
        node
      ) {
        node.classList.add(payload.className);
      });
      if (payload.className === "studio-selected") {
        syncDraggableLayoutElements(
          getLayoutElement(payload.layoutId, payload.codeId)
        );
      }
      return;
    }

    if (payload.action === "removeClassByLayoutId") {
      if (!payload.layoutId || !payload.className) return;
      getLayoutElements(payload.layoutId, payload.codeId).forEach(function (
        node
      ) {
        node.classList.remove(payload.className);
      });
      if (payload.className === "studio-selected") {
        syncDraggableLayoutElements(getSelectedLayoutElement());
      }
      return;
    }

    if (payload.action === "setSelectedLayoutId") {
      var selectedLayoutTarget = getLayoutElement(
        payload.layoutId,
        payload.codeId
      );
      // Selecting a different element ends any in-progress static edit, so the
      // previously-edited element doesn't keep its static-editing outline.
      if (
        selectedLayoutTarget &&
        staticEditState.layoutEl &&
        staticEditState.layoutEl !== selectedLayoutTarget
      ) {
        exitStaticEditing();
      }
      var selectionData = getLayoutSelectionData(selectedLayoutTarget);
      if (!selectionData) return;
      lastLayoutSelectionPath = selectionData.pathKey;
      lastLayoutSelectionDepth = Math.max(
        0,
        selectionData.path.findIndex(function (node) {
          return (
            (node.getAttribute && node.getAttribute("data-layout-id")) ===
            payload.layoutId
          );
        })
      );
      return;
    }

    if (payload.action === "clearSelectedLayout") {
      exitStaticEditing();
      lastLayoutSelectionPath = null;
      lastLayoutSelectionDepth = -1;
      clearDragIntent();
      syncDraggableLayoutElements(null);
      return;
    }

    // Enter static editing on a specific element — used by the layers panel so
    // clicking a static content row triggers the same inline editing as
    // double-clicking the element on the canvas.
    if (payload.action === "enterStaticEditingByLayoutId") {
      if (interactionMode !== "layout") return;
      var staticEl = getLayoutElement(payload.layoutId, payload.codeId);
      if (!staticEl) return;
      if (staticEditState.layoutEl === staticEl) return;
      if (staticEditState.layoutEl) exitStaticEditing();
      if (isLeafStaticallyEditable(staticEl)) {
        enterStaticEditing(staticEl);
      } else {
        post({
          type: "STATIC_EDIT_REJECTED",
          layoutId: payload.layoutId || "",
        });
      }
      return;
    }

    if (payload.action === "updateImageSrc") {
      var imgLeaf = document.querySelector(
        '[data-layout-id="' + CSS.escape(payload.layoutId) + '"]'
      );
      if (!imgLeaf) return;
      var imgTarget = payload.isLeafImg
        ? imgLeaf
        : Array.prototype.slice.call(imgLeaf.querySelectorAll("img"))[
            payload.imgIndex
          ];
      if (imgTarget) imgTarget.setAttribute("src", payload.newSrc);
      return;
    }

    // The host owns pending layout source; mirror it so this bridge stops
    // reading the stale as-rendered template. Cached editability verdicts were
    // derived from the old source, so they have to go.
    //
    // The tree re-emit goes through the scheduler rather than a direct forced
    // post: inline editing syncs on every keystroke, and the scheduler is what
    // debounces that and suppresses posts mid-drag / mid-inline-edit. Those
    // suppressed cases re-emit on their own when they end (exitStaticEditing,
    // drop), by which point the synced source is already in place.
    if (payload.action === "syncTemplateSource" && payload.codeId) {
      if (typeof payload.source === "string") {
        patchedTemplateSourceByCodeId[payload.codeId] = payload.source;
        staticEditEligibilityCache.clear();
        scheduleLayersTreePost();
      }
      return;
    }

    if (payload.action === "updateElementAttr" && payload.attr) {
      var attrLeaf = document.querySelector(
        '[data-layout-id="' + CSS.escape(payload.layoutId) + '"]'
      );
      if (!attrLeaf) return;
      var attrTarget = payload.isSelf
        ? attrLeaf
        : Array.prototype.slice.call(
            attrLeaf.querySelectorAll(payload.tagName)
          )[payload.elementIndex];
      if (!attrTarget) return;
      if (payload.booleanAttr) {
        // Presence toggle: "true" adds the bare attribute, "false" removes it.
        if (payload.value === "true") attrTarget.setAttribute(payload.attr, "");
        else attrTarget.removeAttribute(payload.attr);
      } else {
        attrTarget.setAttribute(payload.attr, payload.value || "");
      }
      return;
    }

    // Text-slot live preview. Only fired for a pure-text leaf addressed by its
    // own data-layout-id, so replacing textContent is safe.
    if (payload.action === "updateElementText") {
      var textLeaf = document.querySelector(
        '[data-layout-id="' + CSS.escape(payload.layoutId) + '"]'
      );
      if (!textLeaf) return;

      // ALWAYS un-paint first. Whatever this write is, it addresses the leaf by
      // template coordinates, and a painted leaf isn't in template shape — a
      // plain edit would otherwise land inside the painted content and the echo
      // below would stage that resolved output into the template. A re-connect
      // simply re-paints straight after.
      restorePaintedLeaf(payload.layoutId);

      // An ADDRESSED run (static text, possibly sharing the leaf with other
      // elements). Write just that run, then hand the whole leaf back through
      // the very channel inline editing uses: the host swaps each nested layout
      // subtree back from the template, so a <span>'s Parsley is never baked in.
      //
      // Note what we can NOT do here: `textLeaf.textContent = value` would throw
      // the <span> away entirely. That write is only safe on a leaf with no
      // element children, which is the dynamic case below.
      if (typeof payload.textIndex === "number") {
        var runNode = getOwnTextNodes(textLeaf)[payload.textIndex];
        if (!runNode) return;
        // `value` is what the TEMPLATE should hold (a Parsley ref on connect), so
        // put it in the run first and echo THAT — the host stages it verbatim.
        runNode.nodeValue = payload.value || "";
        var innerHtml = textLeaf.innerHTML;
        // `previewValue` (when given) is the RESOLVED value to DISPLAY, so the
        // preview shows the real content while the saved template keeps the
        // Parsley from the echo above. No save + reload needed to see it.
        //
        // `previewAsHtml` marks a value that IS markup (a wysiwyg/markdown
        // field). Written as a text node it would show its own tags as
        // characters, so parse it instead. Safe to do here and only here:
        // `innerHtml` was already snapshotted above, so the template still
        // receives the Parsley and never the rendered output.
        if (typeof payload.previewValue === "string") {
          if (payload.previewAsHtml) {
            var runTpl = document.createElement("template");
            runTpl.innerHTML = payload.previewValue;
            // Keep hold of the nodes standing in for this run so the paint can
            // be undone exactly (restorePaintedLeaf) rather than approximated.
            var painted = Array.prototype.slice.call(runTpl.content.childNodes);
            runNode.parentNode.replaceChild(runTpl.content, runNode);
            recordPreview(
              payload.layoutId,
              payload.textIndex,
              payload.value || "",
              "run",
              painted,
              textLeaf
            );
          } else {
            runNode.nodeValue = payload.previewValue;
            recordPreview(
              payload.layoutId,
              payload.textIndex,
              payload.value || "",
              "run",
              [runNode],
              textLeaf
            );
          }
        }
        post({
          type: "LAYOUT_CONTENT_UPDATE",
          codeId: payload.codeId,
          layoutId: payload.layoutId,
          innerHtml: innerHtml,
        });
        // The leaf's content changed, so cached editability verdicts are stale.
        staticEditEligibilityCache.clear();
        return;
      }

      // A dynamic leaf: its whole content is the binding, and it has no element
      // children to lose. Display the resolved preview when given; the host
      // stages the template value (the Parsley) on its own.
      //
      // The leaf owns its whole content here, so a markup preview is a plain
      // innerHTML write — no run indices to keep aligned.
      if (payload.previewAsHtml && typeof payload.previewValue === "string") {
        textLeaf.innerHTML = payload.previewValue;
        recordPreview(
          payload.layoutId,
          undefined,
          payload.value || "",
          "leaf",
          [],
          textLeaf
        );
        return;
      }
      textLeaf.textContent =
        typeof payload.previewValue === "string"
          ? payload.previewValue
          : payload.value || "";
      if (typeof payload.previewValue === "string") {
        recordPreview(
          payload.layoutId,
          undefined,
          payload.value || "",
          "leaf",
          [],
          textLeaf
        );
      }
      return;
    }

    // Tag-change live preview: replace the element with one of the new tag,
    // carrying over every attribute (data-layout-id, data-studio-id, class,
    // the studio-selected outline, …) and its children.
    if (payload.action === "updateElementTag" && payload.newTag) {
      // Only swap to a tag the panel actually exposes — never createElement an
      // arbitrary (or scripting) tag from an untrusted message.
      if (!SUPPORTED_ELEMENTS[payload.newTag]) return;
      var tagLeaf = document.querySelector(
        '[data-layout-id="' + CSS.escape(payload.layoutId) + '"]'
      );
      if (!tagLeaf || !tagLeaf.parentNode) return;
      var swapped = document.createElement(payload.newTag);
      Array.prototype.forEach.call(tagLeaf.attributes, function (attribute) {
        swapped.setAttribute(attribute.name, attribute.value);
      });
      swapped.innerHTML = tagLeaf.innerHTML;
      tagLeaf.parentNode.replaceChild(swapped, tagLeaf);
      return;
    }

    if (payload.action === "requestLayersTree") {
      postLayersTree(true);
      return;
    }

    if (payload.action === "moveLayoutElement") {
      if (interactionMode !== "layout") return;
      var movePosition = payload.position;
      if (
        movePosition !== "before" &&
        movePosition !== "after" &&
        movePosition !== "inside"
      ) {
        return;
      }

      var moveEl = getLayoutElement(payload.layoutId, payload.codeId);
      var moveTargetEl = getLayoutElement(
        payload.targetLayoutId,
        payload.targetCodeId
      );
      if (!moveEl || !moveTargetEl || moveEl === moveTargetEl) return;
      if (moveEl.contains(moveTargetEl)) return;
      if (movePosition === "inside" && voidElementTags[moveTargetEl.tagName]) {
        return;
      }
      if (movePosition !== "inside" && !moveTargetEl.parentNode) return;

      exitStaticEditing();
      reorderState.sourceCodeId =
        resolveCodeRegionForNode(moveEl)?.codeId || null;

      if (movePosition === "before") {
        moveTargetEl.parentNode.insertBefore(moveEl, moveTargetEl);
      } else if (movePosition === "after") {
        moveTargetEl.parentNode.insertBefore(moveEl, moveTargetEl.nextSibling);
      } else {
        moveTargetEl.appendChild(moveEl);
      }

      postReorderOutput(reorderState.selector, moveEl);

      var moveSelectionData = getLayoutSelectionData(moveEl);
      if (moveSelectionData?.path?.length) {
        lastLayoutSelectionPath = moveSelectionData.pathKey;
        lastLayoutSelectionDepth = moveSelectionData.path.length - 1;
      }
      reorderState.sourceCodeId = null;
      syncDraggableLayoutElements(moveEl);
      scheduleLayersTreePost();
      return;
    }

    var targetPairs = payload.studioId
      ? getPairsByStudioId(payload.studioId)
      : [];
    if (!targetPairs.length) return;

    if (payload.action === "addClass") {
      targetPairs.forEach(function (pair) {
        var wrapper = wrapPairIfNeeded(pair);
        if (wrapper && payload.className) {
          wrapper.classList.add(payload.className);
        }
      });
      return;
    }

    if (payload.action === "removeClass") {
      targetPairs.forEach(function (pair) {
        var wrapper = getWrapperForPair(pair);
        if (!wrapper || !payload.className) return;
        wrapper.classList.remove(payload.className);
        unwrapIfUnused(wrapper);
      });
      return;
    }

    if (payload.action === "enableEditing") {
      targetPairs.forEach(function (pair) {
        var wrapper = wrapPairIfNeeded(pair);
        var fieldType = studioContextById[pair.studioId]?.fieldType;
        if (!wrapper || !editableFieldTypes[fieldType]) return;
        wrapper.setAttribute("contenteditable", "true");
        wrapper.setAttribute("spellcheck", "false");
      });
      return;
    }

    if (payload.action === "disableEditing") {
      targetPairs.forEach(function (pair) {
        var wrapper = getWrapperForPair(pair);
        if (!wrapper) return;
        wrapper.removeAttribute("contenteditable");
        wrapper.removeAttribute("spellcheck");
      });
    }
  }

  function postTemplateSourceMap() {
    post({
      type: "TEMPLATE_SOURCE_MAP",
      templateSourceByCodeId: getTemplateSourceByCodeId(),
    });
  }

  // Layers tree
  var voidElementTags = {
    AREA: true,
    BASE: true,
    BR: true,
    COL: true,
    EMBED: true,
    HR: true,
    IMG: true,
    INPUT: true,
    LINK: true,
    META: true,
    PARAM: true,
    SOURCE: true,
    TRACK: true,
    WBR: true,
  };

  // Element tags whose Inspector panel exposes controls, keyed by lowercase
  // tag name. `attrs` lists exposed attributes. Text tags (h1-h6, p, span) have
  // no attributes — their panel is just the Tag selector; their inner text is
  // edited by selecting the child text node, not the element. Add more tags
  // here as the panel grows to support them.
  var SUPPORTED_ELEMENTS = {
    img: { attrs: ["src", "alt"] },
    video: {
      attrs: ["src", "controls", "autoplay", "muted", "loop", "poster"],
    },
    // A link's destination. Because the panel surfaces `href`, a bound href no
    // longer gets its own binding row — it collapses into this panel, exactly
    // like an <img> src. The link's TEXT is edited on its child text node.
    a: { attrs: ["href"] },
    h1: { attrs: [] },
    h2: { attrs: [] },
    h3: { attrs: [] },
    h4: { attrs: [] },
    h5: { attrs: [] },
    h6: { attrs: [] },
    p: { attrs: [] },
    span: { attrs: [] },
    // Container / sectioning tags — panel is just the Tag selector.
    div: { attrs: [] },
    section: { attrs: [] },
    article: { attrs: [] },
    aside: { attrs: [] },
    header: { attrs: [] },
    footer: { attrs: [] },
    main: { attrs: [] },
    nav: { attrs: [] },
  };

  // Boolean HTML attributes: presence = on. This is a semantic fact about the
  // DOM (read with hasAttribute, written by toggling), so it belongs here.
  //
  // Human-facing copy deliberately does NOT: the bridge reports WHAT an element
  // has, the app decides what to CALL it. Slot labels and option labels live in
  // StudioInspectorPanel, so renaming a field never needs a bridge redeploy.
  var BOOLEAN_ATTRS = {
    controls: true,
    autoplay: true,
    muted: true,
    loop: true,
  };

  var layersTreeTimer = null;
  var lastLayersTreeJson = null;
  var LAYERS_LABEL_MAX = 120;

  function normalizeLayersText(text) {
    var t = (text || "").replace(/\s+/g, " ").trim();
    if (t.length > LAYERS_LABEL_MAX) {
      t = t.slice(0, LAYERS_LABEL_MAX) + "…";
    }
    return t;
  }

  function buildLayersTree() {
    var root = document.body || document.documentElement;
    if (!root) return [];

    var fieldOccurrenceByStudioId = {};
    var textNodeCount = 0;
    var attrElementCount = 0;
    var virtualRoot = { children: [] };

    // Locate the element inside the TEMPLATE that corresponds to a layout patch
    // — mirroring the patch's own addressing (the layout leaf itself, or the
    // Nth same-tag descendant of it).
    function getTemplateElementForPatch(layoutPatch, codeId) {
      if (!layoutPatch || !codeId) return null;
      var templateLeaf = getTemplateLeafElement(codeId, layoutPatch.layoutId);
      if (!templateLeaf) return null;
      if (layoutPatch.isSelf) return templateLeaf;
      var matches = Array.prototype.slice.call(
        templateLeaf.querySelectorAll(layoutPatch.tagName)
      );
      return matches[layoutPatch.elementIndex] || null;
    }

    // Build an attribute slot (e.g. <img> src/alt).
    //
    // Every slot carries BOTH views of its value, because the two modes want
    // different things:
    //   value       — the RESOLVED value off the rendered element (content mode)
    //   sourceValue — the RAW value in the template (layout mode), which may be
    //                 a Parsley expression like "{{this.hero.getUrl()}}"
    // Layout mode edits the template, so it must never show/write the resolved
    // output — that would bake the rendered value over the binding.
    function buildAttributeSlot(el, attr, layoutPatch, codeId) {
      var templateEl = getTemplateElementForPatch(layoutPatch, codeId);
      // Only editable in layout mode if we can actually read the source we'd be
      // rewriting.
      var layoutEditable = !!templateEl;

      // Boolean attributes (controls, autoplay, muted, loop) are presence
      // toggles the app renders as a dropdown; they're never field-bound. The
      // app derives the true/false options — the bridge just flags the kind.
      if (BOOLEAN_ATTRS[attr]) {
        return {
          kind: "attribute",
          key: attr,
          attr: attr,
          isDynamic: false,
          value: el.hasAttribute(attr) ? "true" : "false",
          sourceValue:
            templateEl && templateEl.hasAttribute(attr) ? "true" : "false",
          layoutEditable: layoutEditable,
          control: "select",
          booleanAttr: true,
        };
      }

      var studioId = el.getAttribute("data-studio-id");
      var bindings = (studioId && studioAttrBindingsById[studioId]) || [];
      var binding = null;
      for (var i = 0; i < bindings.length; i += 1) {
        if (bindings[i].attr === attr && bindings[i].fieldZuid) {
          binding = bindings[i];
          break;
        }
      }
      var slot = {
        kind: "attribute",
        key: attr,
        attr: attr,
        isDynamic: !!binding,
        sourceValue: templateEl ? templateEl.getAttribute(attr) || "" : "",
        value: el.getAttribute(attr) || "",
        layoutEditable: layoutEditable,
        control: "text",
      };
      if (binding) {
        slot.studioId = studioId;
        slot.fieldZuid = binding.fieldZuid;
        slot.fieldType = binding.fieldType;
        slot.itemZuid = binding.itemZuid;
        slot.modelZuid = binding.modelZuid;
      }
      return slot;
    }

    // Find a dynamic inline-text binding on an element: dynamic text is wrapped
    // in a studio field marker comment pair among the element's child nodes.
    // Returns the field dataset (fieldZuid, etc.) or null for static text.
    function findInlineFieldBinding(el) {
      var child = el.firstChild;
      while (child) {
        if (child.nodeType === Node.COMMENT_NODE) {
          var marker = parseMarker(child);
          if (marker && marker.boundary === "start") {
            var dataset = buildDataset(marker.studioId);
            if (dataset.fieldZuid) return dataset;
          }
        }
        child = child.nextSibling;
      }
      return null;
    }

    // Whether a binding is the leaf's ENTIRE content: its first meaningful child
    // is a start marker and its last is that marker's end. When true, the leaf
    // can be written whole even though the render put elements inside it —
    // there is nothing in there but the binding's own output, so replacing it is
    // exactly what a write should do. A rich-text field (wysiwyg/markdown)
    // renders <h2>/<p>/<a>, which is why the plain child-count check isn't
    // enough: it declares those leaves uneditable and their tree row unclickable.
    function bindingCoversLeaf(el) {
      var meaningful = Array.prototype.filter.call(el.childNodes, function (n) {
        // Layout whitespace between the markers and the tag isn't content.
        return !(n.nodeType === Node.TEXT_NODE && !(n.nodeValue || "").trim());
      });
      if (meaningful.length < 2) return false;

      var first = parseMarker(meaningful[0]);
      var last = parseMarker(meaningful[meaningful.length - 1]);
      return !!(
        first &&
        last &&
        first.boundary === "start" &&
        last.boundary === "end" &&
        first.studioId &&
        first.studioId === last.studioId
      );
    }

    // Assemble the attribute slots for a supported element. Text content is no
    // longer an element slot — it's edited by selecting the child text node.
    function buildElementSlots(el, config, layoutPatch, codeId) {
      return (config.attrs || []).map(function (attr) {
        return buildAttributeSlot(el, attr, layoutPatch, codeId);
      });
    }

    // Describe how a pure leaf element's single piece of content is surfaced in
    // the panel. Two shapes:
    //   "static"  — plain text; the child text node gets an editable Text slot.
    //   "dynamic" — a bound field; the field node gets a Text slot whose value
    //               is the underlying CODE REFERENCE from the template (e.g.
    //               "{{this.title}}"), not the resolved value, since in layout
    //               mode you're editing the code.
    // Returns null when the content isn't a single addressable value (mixed
    // content, or no data-layout-id of its own).
    function buildLeafContext(el, layoutPatch, codeId) {
      // Require the element's own data-layout-id (isSelf) so the node keys
      // stably on it and inner-content patching addresses the right element.
      if (!layoutPatch || !layoutPatch.isSelf) return null;

      // The panel edits the underlying template, so the value is always the raw
      // template content — plain text OR a Parsley expression ("{{this.title}}").
      // The live DOM only holds the *resolved* output, so read the template.
      var templateLeaf = getTemplateLeafElement(codeId, layoutPatch.layoutId);
      if (!templateLeaf) return null;

      // A dynamic leaf's content IS a bound field: there is one thing to edit
      // (the binding itself), so it is written whole — which means it must have
      // no nested markup for that write to destroy.
      if (findInlineFieldBinding(el)) {
        // Element children are only fatal when something OTHER than the binding
        // is in the leaf — a whole-leaf write would destroy it. When the binding
        // spans the leaf, those children are its own rendered output.
        if (el.children.length > 0 && !bindingCoversLeaf(el)) return null;
        return {
          kind: "dynamic",
          layoutPatch: layoutPatch,
          // textContent (not innerHTML) so entities decode once and re-escape
          // correctly on write-back.
          sourceText: (templateLeaf.textContent || "").trim(),
          layoutEditable: true,
        };
      }

      // Static text — including text sharing a leaf with other elements, e.g.
      // the "hello" in `<div>hello<span data-layout-id=2>world</span></div>`.
      //
      // A leaf with NO element children is always addressable: it has a single
      // run, nothing to disambiguate, and no sibling layout a write could
      // disturb — so a childless leaf holding non-field Parsley (e.g.
      // `<h1>{{instance.name}}</h1>`) stays editable as raw source, exactly as
      // before this per-run addressing existed.
      //
      // A leaf that SHARES itself with element children is editable only when
      // its own content (nested layouts held out) is identical between template
      // and render. That is the same check inline double-click editing trusts,
      // and it is what makes a run's INDEX meaningful: if nothing was
      // substituted or expanded, the Nth run here IS the Nth run in the source.
      // A {{each}} that unrolled, a field that emitted HTML — any of those make
      // the two differ, and we fail closed rather than write to the wrong run.
      // A preview WE painted is the one divergence that shouldn't fail closed:
      // we know the template value behind it, so the slot stays usable and keeps
      // reporting the binding. Without this an HTML preview drops the slot and
      // the connection reads as gone the next time the element is selected.
      var painted = getPreview(layoutPatch.layoutId);
      if (painted) {
        return {
          kind: "static",
          layoutPatch: layoutPatch,
          liveTextNodes: getOwnTextNodes(el),
          templateTextNodes: getOwnTextNodes(templateLeaf),
          layoutEditable: true,
          // Run indices stop lining up once injected markup adds nodes, so the
          // recorded value is authoritative over a positional lookup.
          paintedSourceValue: painted.sourceValue,
          paintedTextIndex: painted.textIndex,
        };
      }

      if (el.children.length > 0 && !isLeafStaticallyEditable(el)) return null;

      return {
        kind: "static",
        layoutPatch: layoutPatch,
        liveTextNodes: getOwnTextNodes(el),
        templateTextNodes: getOwnTextNodes(templateLeaf),
        layoutEditable: true,
      };
    }

    // Compute the coordinates the host needs to patch this element's attributes
    // back into the cached template source in layout mode. Tag-agnostic: an
    // element with its own [data-layout-id] is addressed directly (`isSelf`),
    // otherwise it's the Nth same-tag descendant of the nearest layout region.
    // Returns null when the element can't be tied to a code region.
    function buildElementLayoutPatch(el, codeId) {
      var tagName = el.tagName.toLowerCase();
      if (el.getAttribute("data-layout-id")) {
        return {
          codeId: codeId || null,
          layoutId: el.getAttribute("data-layout-id"),
          isSelf: true,
          tagName: tagName,
          elementIndex: 0,
        };
      }
      var host = el.closest && el.closest("[data-layout-id]");
      if (!host || !codeId) return null;
      var matches = Array.prototype.slice.call(host.querySelectorAll(tagName));
      var elementIndex = matches.indexOf(el);
      if (elementIndex < 0) return null;
      return {
        codeId: codeId,
        layoutId: host.getAttribute("data-layout-id"),
        isSelf: false,
        tagName: tagName,
        elementIndex: elementIndex,
      };
    }

    // Some dynamic content binds an element attribute (e.g. an <img> src)
    // rather than inline text, so it is marked with a `data-studio-id`
    // attribute on the element instead of comment-pair markers.
    //
    // A binding only gets its own row when the element's panel does NOT already
    // expose that attribute — otherwise the row is a redundant second entry
    // point to the same field (an <img> src is reachable from the image's own
    // panel). Bindings the panel can't reach (a bound href on an <a>, a bound
    // attribute on an unsupported tag) still surface as their own row, so they
    // never become unreachable.
    function appendAttributeBinding(el, sink, codeId) {
      var studioId = el.getAttribute("data-studio-id");
      if (!studioId) return;
      var bindings = studioAttrBindingsById[studioId];
      if (!bindings || !bindings.length) return;
      var hostTag = el.tagName.toLowerCase();
      var panelAttrs =
        (SUPPORTED_ELEMENTS[hostTag] && SUPPORTED_ELEMENTS[hostTag].attrs) ||
        [];
      bindings.forEach(function (binding) {
        if (!binding.fieldZuid) return;
        if (panelAttrs.indexOf(binding.attr) !== -1) return;
        var occurrenceKey = studioId + ":" + binding.attr;
        var occurrence = (fieldOccurrenceByStudioId[occurrenceKey] || 0) + 1;
        fieldOccurrenceByStudioId[occurrenceKey] = occurrence;
        sink.children.push({
          id:
            (codeId || "page") +
            ":attr:" +
            studioId +
            ":" +
            binding.attr +
            ":" +
            occurrence,
          kind: "field",
          tagName: null,
          codeId: codeId,
          layoutId: null,
          studioId: studioId,
          fieldZuid: binding.fieldZuid,
          fieldType: binding.fieldType,
          itemZuid: binding.itemZuid,
          modelZuid: binding.modelZuid,
          attr: binding.attr,
          hostTag: hostTag,
          label: "",
          children: [],
        });
      });
    }

    // Walk the child nodes of `domNode`, pushing tree nodes into the active
    // sink's `children`. Every [data-layout-id] element becomes a collapsible
    // container; the content inside an element becomes child "text" nodes —
    // static text and dynamic field output alike — so the panel mirrors the
    // design's "containers with content rows" shape. `textBuf` (a shared
    // {value} box) accumulates static text across non-layout wrapper recursion
    // so a run that spans inline tags collapses into one content row.
    function walk(domNode, sink, enclosingCodeId, textBuf, leafContext) {
      // Code-region markers are same-parent comment siblings, so each element
      // level keeps its own region stack; the active region decides where
      // subsequent nodes attach.
      var stack = [{ node: sink, codeId: enclosingCodeId }];
      var suppress = null;

      function current() {
        return stack[stack.length - 1];
      }

      function flushStaticText() {
        var raw = textBuf.value;
        var runNodes = textBuf.nodes;
        var text = normalizeLayersText(raw);
        textBuf.value = "";
        textBuf.nodes = [];
        if (!text) return;
        textNodeCount += 1;
        var textNode = {
          id: (current().codeId || "page") + ":text:" + textNodeCount,
          kind: "text",
          tagName: null,
          codeId: current().codeId,
          layoutId: null,
          label: text,
          children: [],
        };
        // A run inside a static leaf becomes an editable Text slot addressed by
        // its index among the leaf's own text runs.
        //
        // A run that spans inline wrappers (`hello <b>bold</b>` collapses into
        // one row) came from SEVERAL text nodes, so no single index names it —
        // it stays read-only rather than have us guess which node to write.
        var runIndex =
          leafContext && leafContext.kind === "static" && runNodes.length === 1
            ? leafContext.liveTextNodes.indexOf(runNodes[0])
            : -1;

        // A painted leaf reports the run WE wrote, whatever the injected markup
        // did to the positional index.
        if (
          runIndex === -1 &&
          leafContext &&
          leafContext.paintedSourceValue !== undefined
        ) {
          runIndex =
            typeof leafContext.paintedTextIndex === "number"
              ? leafContext.paintedTextIndex
              : 0;
        }

        if (runIndex !== -1) {
          var templateRun = leafContext.templateTextNodes[runIndex];
          textNode.id =
            (current().codeId || "page") +
            ":textOf:" +
            leafContext.layoutPatch.layoutId +
            ":" +
            runIndex;
          textNode.layoutPatch = leafContext.layoutPatch;
          textNode.slots = [
            {
              kind: "text",
              key: "text",
              control: "text",
              isDynamic: false,
              textIndex: runIndex,
              // Resolved text (content mode) vs raw template text (layout mode).
              value: (raw || "").trim(),
              sourceValue:
                leafContext.paintedSourceValue !== undefined
                  ? leafContext.paintedSourceValue
                  : templateRun
                  ? (templateRun.nodeValue || "").trim()
                  : "",
              layoutEditable: leafContext.layoutEditable,
            },
          ];
        }
        current().node.children.push(textNode);
      }

      var child = domNode.firstChild;
      while (child) {
        if (child.nodeType === Node.COMMENT_NODE) {
          var codeMarker = parseCodeMarker(child);
          if (codeMarker && !suppress) {
            flushStaticText();
            if (codeMarker.boundary === "start") {
              var codeNode = {
                id: codeMarker.codeId,
                kind: "codeFile",
                tagName: null,
                codeId: codeMarker.codeId,
                layoutId: null,
                children: [],
              };
              current().node.children.push(codeNode);
              stack.push({ node: codeNode, codeId: codeMarker.codeId });
            } else {
              for (var i = stack.length - 1; i > 0; i -= 1) {
                var popped = stack.pop();
                if (
                  popped.node.kind === "codeFile" &&
                  popped.node.codeId === codeMarker.codeId
                ) {
                  break;
                }
              }
            }
            child = child.nextSibling;
            continue;
          }

          var fieldMarker = parseMarker(child);
          if (fieldMarker) {
            if (fieldMarker.boundary === "start" && !suppress) {
              flushStaticText();
              var dataset = buildDataset(fieldMarker.studioId);
              if (!dataset.fieldZuid) {
                // Marker pair with no backing entity (e.g. an empty `[[]]`
                // entry in #studio-entities): unidentifiable, so swallow its
                // content without surfacing a row.
                suppress = {
                  node: null,
                  studioId: fieldMarker.studioId,
                  parts: [],
                };
              } else {
                var occurrence =
                  (fieldOccurrenceByStudioId[fieldMarker.studioId] || 0) + 1;
                fieldOccurrenceByStudioId[fieldMarker.studioId] = occurrence;
                var fieldNode = {
                  id:
                    (current().codeId || "page") +
                    ":field:" +
                    fieldMarker.studioId +
                    ":" +
                    occurrence,
                  kind: "field",
                  tagName: null,
                  codeId: current().codeId,
                  layoutId: null,
                  studioId: fieldMarker.studioId,
                  fieldZuid: dataset.fieldZuid,
                  fieldType: dataset.fieldType,
                  itemZuid: dataset.itemZuid,
                  modelZuid: dataset.modelZuid,
                  label: "",
                  children: [],
                };
                // A dynamic leaf's field row carries the same Text slot as a
                // static one — its value is just the template's Parsley
                // expression (e.g. "{{this.title}}") instead of plain text.
                // `fieldZuid` is deliberately omitted from the slot so the host
                // doesn't swap the value for the field's name (that's the
                // content-mode presentation).
                if (leafContext && leafContext.kind === "dynamic") {
                  fieldNode.layoutPatch = leafContext.layoutPatch;
                  fieldNode.slots = [
                    {
                      kind: "text",
                      key: "text",
                      control: "text",
                      isDynamic: true,
                      // Resolved output (content mode) vs the Parsley
                      // expression from the template (layout mode).
                      value: "",
                      sourceValue: leafContext.sourceText,
                      layoutEditable: leafContext.layoutEditable,
                    },
                  ];
                }
                current().node.children.push(fieldNode);
                suppress = {
                  node: fieldNode,
                  studioId: fieldMarker.studioId,
                  parts: [],
                };
              }
            } else if (
              fieldMarker.boundary === "end" &&
              suppress &&
              suppress.studioId === fieldMarker.studioId
            ) {
              if (suppress.node) {
                // Label the dynamic row with the field's rendered text.
                suppress.node.label = normalizeLayersText(
                  suppress.parts.join("")
                );
              }
              suppress = null;
            }
          }
        } else if (child.nodeType === Node.TEXT_NODE) {
          if (suppress) {
            suppress.parts.push(child.nodeValue || "");
          } else {
            textBuf.value += child.nodeValue || "";
            // Remember which nodes fed this run: one node means the run has an
            // address, several mean it spans wrappers and doesn't.
            if ((child.nodeValue || "").trim()) textBuf.nodes.push(child);
          }
        } else if (child.nodeType === Node.ELEMENT_NODE) {
          if (suppress) {
            suppress.parts.push(child.textContent || "");
          } else if (
            child.tagName !== "SCRIPT" &&
            child.tagName !== "STYLE" &&
            child.tagName !== "TEMPLATE"
          ) {
            var layoutId = child.getAttribute("data-layout-id");
            var tagLower = child.tagName.toLowerCase();
            var elConfig = SUPPORTED_ELEMENTS[tagLower];
            if (layoutId) {
              flushStaticText();
              var codeId = current().codeId;
              var elPatch = buildElementLayoutPatch(child, codeId);
              var containerNode = {
                id: (codeId || "page") + ":" + layoutId,
                kind: "element",
                tagName: tagLower,
                codeId: codeId,
                layoutId: layoutId,
                children: [],
              };
              // Supported tags (e.g. <img>, <h1>) expose panel controls (attrs
              // and/or the Tag selector) so the host can open the panel on click.
              if (elConfig) {
                containerNode.slots = buildElementSlots(
                  child,
                  elConfig,
                  elPatch,
                  codeId
                );
                containerNode.layoutPatch = elPatch;
              }
              current().node.children.push(containerNode);
              // A dynamic attribute (e.g. img src) belongs to this element.
              appendAttributeBinding(child, containerNode, codeId);

              // A leaf we painted a preview into holds ONE thing: the binding.
              // Walking it would emit a row per injected paragraph and link —
              // the connection reading as a pile of inlined static content. Emit
              // the single bound row instead and label it with the rendered text,
              // which is what a marker pair does via `suppress`.
              var paintedLeaf = getPreview(layoutId);
              if (paintedLeaf) {
                var paintedSlot = {
                  kind: "text",
                  key: "text",
                  control: "text",
                  isDynamic: true,
                  value: "",
                  sourceValue: paintedLeaf.sourceValue,
                  layoutEditable: true,
                };
                if (typeof paintedLeaf.textIndex === "number") {
                  paintedSlot.textIndex = paintedLeaf.textIndex;
                }
                containerNode.children.push({
                  id: (codeId || "page") + ":textOf:" + layoutId + ":painted",
                  kind: "field",
                  tagName: null,
                  codeId: codeId,
                  layoutId: null,
                  label: normalizeLayersText(child.textContent || ""),
                  layoutPatch: elPatch,
                  slots: [paintedSlot],
                  children: [],
                });
              } else {
                // A pure leaf's single piece of content becomes a panel-openable
                // row: a static text node, or a dynamic field row carrying its
                // code reference. Any element (even an unsupported <div>)
                // qualifies.
                walk(
                  child,
                  containerNode,
                  codeId,
                  { value: "", nodes: [] },
                  buildLeafContext(child, elPatch, codeId)
                );
              }
            } else if (elConfig && elConfig.attrs.length) {
              // A supported tag WITH attributes (img/video) but no data-layout-id
              // still gets a dedicated node so its attrs are editable (addressed
              // by tag + index). Attr-less tags (text/containers) without their
              // own layout id can't be tag-swapped, so they stay transparent
              // (fall through) rather than adding a dead panel row.
              flushStaticText();
              var attrCodeId = current().codeId;
              attrElementCount += 1;
              var attrStudioId = child.getAttribute("data-studio-id");
              var attrPatch = buildElementLayoutPatch(child, attrCodeId);
              var attrElNode = {
                id:
                  (attrCodeId || "page") +
                  ":attrEl:" +
                  (attrStudioId || tagLower + ":" + attrElementCount),
                kind: "element",
                tagName: tagLower,
                codeId: attrCodeId,
                layoutId: null,
                slots: buildElementSlots(
                  child,
                  elConfig,
                  attrPatch,
                  attrCodeId
                ),
                layoutPatch: attrPatch,
                children: [],
              };
              current().node.children.push(attrElNode);
              // Keep the dynamic attribute field rows under the element node.
              appendAttributeBinding(child, attrElNode, attrCodeId);
              walk(
                child,
                attrElNode,
                attrCodeId,
                { value: "", nodes: [] },
                null
              );
            } else {
              // Inline / structural wrapper without its own layout id: recurse
              // into the same sink so nested layout elements attach to this
              // level and the wrapper's text joins the surrounding run.
              flushStaticText();
              appendAttributeBinding(child, current().node, current().codeId);
              walk(
                child,
                current().node,
                current().codeId,
                textBuf,
                leafContext
              );
            }
          }
        }

        child = child.nextSibling;
      }

      flushStaticText();
    }

    walk(root, virtualRoot, null, { value: "", nodes: [] }, null);

    // Group nodes outside every code region under one anonymous page root so
    // the host always renders code-file-level roots.
    var roots = virtualRoot.children;
    var strays = roots.filter(function (node) {
      return node.kind !== "codeFile";
    });
    if (strays.length) {
      roots = [
        {
          id: "page",
          kind: "codeFile",
          tagName: null,
          codeId: null,
          layoutId: null,
          children: strays,
        },
      ].concat(
        roots.filter(function (node) {
          return node.kind === "codeFile";
        })
      );
    }

    return roots;
  }

  function postLayersTree(force) {
    var tree = buildLayersTree();
    var json = JSON.stringify(tree);
    if (!force && json === lastLayersTreeJson) return;
    lastLayersTreeJson = json;
    post({ type: "LAYERS_TREE", tree: tree });
  }

  function scheduleLayersTreePost() {
    if (layersTreeTimer) clearTimeout(layersTreeTimer);
    layersTreeTimer = setTimeout(function () {
      layersTreeTimer = null;
      if (reorderState.dragEl || staticEditState.layoutEl) return;
      postLayersTree(false);
    }, 250);
  }

  function setupLayersTreeObserver() {
    if (typeof MutationObserver !== "function") return;
    var observer = new MutationObserver(function () {
      if (reorderState.dragEl || staticEditState.layoutEl) return;
      scheduleLayersTreePost();
    });
    observer.observe(document.documentElement || document.body, {
      childList: true,
      subtree: true,
    });
  }

  document.addEventListener("pointerdown", handleLinkPointerDown, true);
  document.addEventListener("mousedown", handleLinkPointerDown, true);
  document.addEventListener("click", handleLinkClick, true);
  document.addEventListener("auxclick", handleLinkClick, true);
  document.addEventListener("keydown", handleLinkKeyDown, true);
  document.addEventListener("submit", handleFormSubmit, true);
  document.addEventListener("mousedown", handleStudioMouseDown, true);
  document.addEventListener("click", handleStudioClick, true);
  document.addEventListener("dblclick", handleStudioDoubleClick, true);
  document.addEventListener("mousemove", handleStudioMouseMove, true);
  document.addEventListener("mouseleave", handleStudioMouseLeave, true);
  document.addEventListener("input", handleEditableInput, true);
  document.addEventListener("keydown", handleLayoutStaticKeydown, true);
  document.addEventListener("keydown", handleEscapeKey, true);

  setupPathListeners();
  window.addEventListener("message", handleIncomingMessage);

  window.ZestyStudioBridge = { __initialized: true };
  syncInteractionModeClass();
  // Template source lives in <body>, while the bridge script will execute from <head>.
  // Wait until the DOM is ready so template[data-code-id] nodes are present before reading them.
  function postInitialDomState() {
    postTemplateSourceMap();
    postLayersTree(true);
    setupLayersTreeObserver();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", postInitialDomState, {
      once: true,
    });
  } else {
    postInitialDomState();
  }
  post({ type: "BRIDGE_READY" });
})();
