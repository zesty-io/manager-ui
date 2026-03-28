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
  var reorderState = {
    enabled: false,
    selector: "[data-layout-id]",
    dragEl: null,
    codeId: null,
    observer: null,
  };

  var studioContextById = {};

  var bridgeScriptUrl =
    (document.currentScript && document.currentScript.src) || null;

  // Bridge -> host messaging
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

      Object.keys(entities).forEach(function (studioId) {
        var entityList = Array.isArray(entities[studioId])
          ? entities[studioId]
          : [];
        var firstEntity = entityList.find(function (entity) {
          return entity && typeof entity === "object";
        });

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
        };
      });

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

  // Marker parsing
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
    };
  }

  // Layout template + reorder helpers
  function getTemplateSourceByCodeId() {
    var templateSourceByCodeId = {};

    document
      .querySelectorAll("template[data-code-id]")
      .forEach(function (node) {
        var codeId = node.getAttribute("data-code-id");
        if (!codeId) return;
        templateSourceByCodeId[codeId] = node.innerHTML || "";
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

  function getOrderedBlocksWithinNodes(selector, nodes) {
    var matches = [];

    nodes.forEach(function (node) {
      if (node.nodeType !== Node.ELEMENT_NODE) return;
      if (node.matches && node.matches(selector)) {
        matches.push(node);
      }
      matches.push.apply(
        matches,
        Array.prototype.slice.call(node.querySelectorAll(selector))
      );
    });

    return matches;
  }

  function resolveCodeRegionForNode(node) {
    var currentNode = node;
    var currentParent = currentNode?.parentNode || null;

    while (currentNode && currentParent) {
      var siblings = Array.prototype.slice.call(currentParent.childNodes);
      var nodeIndex = siblings.indexOf(currentNode);

      if (nodeIndex !== -1) {
        var startComment = null;
        var codeId = null;

        for (var i = nodeIndex - 1; i >= 0; i -= 1) {
          var startMarker = parseCodeMarker(siblings[i]);
          if (startMarker?.boundary === "start") {
            startComment = siblings[i];
            codeId = startMarker.codeId;
            break;
          }
        }

        if (startComment && codeId) {
          for (var j = nodeIndex + 1; j < siblings.length; j += 1) {
            var endMarker = parseCodeMarker(siblings[j]);
            if (endMarker?.boundary === "end" && endMarker.codeId === codeId) {
              return {
                codeId: codeId,
                startComment: startComment,
                endComment: siblings[j],
              };
            }
          }
        }
      }

      currentNode = currentParent;
      currentParent = currentParent.parentNode;
    }

    return null;
  }

  function elementPayload(el) {
    if (!el) return null;
    var ds = {};
    for (var k in el.dataset) ds[k] = el.dataset[k];
    return { dataset: ds };
  }

  function postReorderOutput(selector, anchorNode) {
    var codeRegion = resolveCodeRegionForNode(
      anchorNode || reorderState.dragEl
    );
    var ordered = codeRegion
      ? getOrderedBlocksWithinNodes(
          selector,
          getNodesBetween(codeRegion.startComment, codeRegion.endComment)
        )
      : getOrderedBlocks(selector);

    post({
      type: "REORDER_OUTPUT",
      codeId: codeRegion?.codeId || null,
      selector: selector,
      orderedLayoutIds: ordered
        .map(function (el) {
          return el.getAttribute("data-layout-id");
        })
        .filter(Boolean),
      outputHtml: ordered
        .map(function (el) {
          return el.outerHTML;
        })
        .join("\n"),
    });
  }

  function getReorderTarget(target) {
    if (!target || !target.closest) return null;
    var el = target.closest(reorderState.selector);
    if (!el || el === reorderState.dragEl) return null;
    if (reorderState.codeId) {
      var targetCodeRegion = resolveCodeRegionForNode(el);
      if (
        !targetCodeRegion ||
        targetCodeRegion.codeId !== reorderState.codeId
      ) {
        return null;
      }
    }
    return el;
  }

  function emitLayoutDomEvent(eventType, layoutId, evt, element) {
    post({
      type: "DOM_EVENT",
      eventType: eventType,
      element: element || {
        dataset: {
          layoutId: layoutId,
        },
      },
      clientX: evt?.clientX,
      clientY: evt?.clientY,
    });
  }

  function setupReorderListeners() {
    if (setupReorderListeners.__bound) return;
    setupReorderListeners.__bound = true;

    document.addEventListener(
      "dragstart",
      function (evt) {
        if (!reorderState.enabled) return;
        var el =
          evt.target && evt.target.closest
            ? evt.target.closest(reorderState.selector)
            : null;
        if (!el) return;

        reorderState.dragEl = el;
        reorderState.codeId = resolveCodeRegionForNode(el)?.codeId || null;
        el.setAttribute("draggable", "true");
        el.classList.add("studio-dragging");

        if (evt.dataTransfer) {
          evt.dataTransfer.effectAllowed = "move";
          evt.dataTransfer.setData(
            "text/plain",
            el.getAttribute("data-layout-id") || ""
          );
        }
      },
      true
    );

    document.addEventListener(
      "pointerdown",
      function (evt) {
        if (!reorderState.enabled) return;
        var el =
          evt.target && evt.target.closest
            ? evt.target.closest(reorderState.selector)
            : null;
        if (!el) return;
        el.setAttribute("draggable", "true");
      },
      true
    );

    document.addEventListener(
      "dragover",
      function (evt) {
        if (!reorderState.enabled || !reorderState.dragEl) return;
        var target = getReorderTarget(evt.target);
        if (!target || !target.parentNode) return;

        evt.preventDefault();

        var rect = target.getBoundingClientRect();
        var shouldInsertAfter = evt.clientY > rect.top + rect.height / 2;
        var parent = target.parentNode;

        if (shouldInsertAfter) {
          if (target.nextSibling !== reorderState.dragEl) {
            parent.insertBefore(reorderState.dragEl, target.nextSibling);
          }
        } else if (target !== reorderState.dragEl.nextSibling) {
          parent.insertBefore(reorderState.dragEl, target);
        }
      },
      true
    );

    document.addEventListener(
      "drop",
      function (evt) {
        if (!reorderState.enabled || !reorderState.dragEl) return;
        evt.preventDefault();
        postReorderOutput(reorderState.selector, reorderState.dragEl);
      },
      true
    );

    document.addEventListener(
      "dragend",
      function () {
        if (!reorderState.dragEl) return;
        postReorderOutput(reorderState.selector, reorderState.dragEl);
        reorderState.dragEl.classList.remove("studio-dragging");
        reorderState.dragEl = null;
        reorderState.codeId = null;
      },
      true
    );
  }

  function ensureReorderAttributes() {
    getOrderedBlocks(reorderState.selector).forEach(function (node) {
      node.setAttribute("draggable", "true");
    });
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

  function replacePairContent(pair, mode, nextValue) {
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

  // Host event emitters
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
    var target = toElement(evt.target);
    if (!target) return;

    var el = target.closest && target.closest("a");
    if (!el) return;
    if (el.target && el.target !== "_self") return;
    if (el.hasAttribute("download")) return;

    var href = el.getAttribute("href");
    if (!href || href[0] === "#") return;

    try {
      var url = new URL(href, window.location.href);
      if (url.origin !== window.location.origin) return;

      evt.preventDefault();
      evt.stopPropagation();

      notifyPathChange("anchor", {
        path: url.pathname,
        search: url.search,
        hash: url.hash,
        href: url.href,
      });
    } catch (e) {
      // ignore invalid URLs
    }
  }

  // Interaction handlers
  function handleStudioClick(evt) {
    if (interactionMode === "layout") {
      var layoutTarget = toElement(evt.target)?.closest?.(
        reorderState.selector
      );
      var layoutPayload = elementPayload(layoutTarget);
      if (!layoutPayload) return;
      emitLayoutDomEvent(
        "click",
        layoutTarget.getAttribute("data-layout-id"),
        evt,
        layoutPayload
      );
      return;
    }

    var pair = resolveInteraction(evt.target, evt.clientX, evt.clientY);
    if (!pair?.studioId) return;
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
        var nextPayload = elementPayload(layoutTarget);
        if (!nextPayload) return;
        emitLayoutDomEvent("mouseover", nextLayoutId, evt, nextPayload);
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

  function handleEditableInput(evt) {
    var wrapper = toElement(evt.target)?.closest?.(
      "[data-studio-highlight-wrapper]"
    );
    if (!wrapper) return;

    var studioId = wrapper.getAttribute("data-studio-id");
    if (!studioId) return;

    var fieldType = studioContextById[studioId]?.fieldType;
    emitDomEvent(
      "input",
      studioId,
      evt,
      ["markdown", "wysiwyg_basic", "wysiwyg_advanced"].includes(fieldType)
        ? wrapper.innerHTML
        : wrapper.textContent || ""
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
      reorderState.enabled = false;
      reorderState.dragEl = null;
      reorderState.codeId = null;
      return;
    }

    if (payload.action === "setInteractionMode") {
      interactionMode = payload.mode === "layout" ? "layout" : "content";
      currentHoverStudioId = null;
      currentHoverLayoutId = null;
      return;
    }

    if (payload.action === "addClassByLayoutId") {
      if (!payload.layoutId || !payload.className) return;
      document
        .querySelectorAll('[data-layout-id="' + payload.layoutId + '"]')
        .forEach(function (node) {
          node.classList.add(payload.className);
        });
      return;
    }

    if (payload.action === "removeClassByLayoutId") {
      if (!payload.layoutId || !payload.className) return;
      document
        .querySelectorAll('[data-layout-id="' + payload.layoutId + '"]')
        .forEach(function (node) {
          node.classList.remove(payload.className);
        });
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

  document.addEventListener("click", handleLinkClick, true);
  document.addEventListener("click", handleStudioClick, true);
  document.addEventListener("mousemove", handleStudioMouseMove, true);
  document.addEventListener("mouseleave", handleStudioMouseLeave, true);
  document.addEventListener("input", handleEditableInput, true);

  setupPathListeners();
  window.addEventListener("message", handleIncomingMessage);

  window.ZestyStudioBridge = { __initialized: true };
  // Template source lives in <body>, while the bridge script will execute from <head>.
  // Wait until the DOM is ready so template[data-code-id] nodes are present before reading them.
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", postTemplateSourceMap, {
      once: true,
    });
  } else {
    postTemplateSourceMap();
  }
  post({ type: "BRIDGE_READY" });
})();
