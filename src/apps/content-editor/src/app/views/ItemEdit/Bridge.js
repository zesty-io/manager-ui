(function () {
  if (window.ZestyStudioBridge?.__initialized) return;

  var parentOrigin = "*";
  var markerIdPattern = /data-studio-id\s*=\s*"([^"]+)"/i;
  var markerBoundaryPattern = /data-studio-boundary\s*=\s*"(start|end)"/i;
  var editableFieldTypes = {
    text: true,
    textarea: true,
    markdown: true,
    wysiwyg_basic: true,
    wysiwyg_advanced: true,
  };

  var currentHoverStudioId = null;

  var studioContextById = {};

  var bridgeScriptUrl =
    (document.currentScript && document.currentScript.src) || null;

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

  function toElement(node) {
    if (!node) return null;
    if (node.nodeType === Node.ELEMENT_NODE) return node;
    return node.parentElement || null;
  }

  function parseMarker(commentNode) {
    if (!commentNode || commentNode.nodeType !== Node.COMMENT_NODE) {
      return null;
    }

    var content = commentNode.nodeValue || "";
    var idMatch = content.match(markerIdPattern);
    var boundaryMatch = content.match(markerBoundaryPattern);
    var studioId = idMatch?.[1];
    var boundary = boundaryMatch?.[1];

    if (!studioId || !boundary) return null;

    return {
      studioId: studioId,
      boundary: boundary,
    };
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
    var current = target;
    while (current && current !== document.documentElement) {
      var pairs = getAllMarkerPairs().filter(function (pair) {
        return current.contains(pair.startComment);
      });

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

  function handleStudioClick(evt) {
    var pair = resolveInteraction(evt.target, evt.clientX, evt.clientY);
    if (!pair?.studioId) return;
    emitDomEvent("click", pair.studioId, evt);
  }

  function handleStudioMouseMove(evt) {
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

  document.addEventListener("click", handleLinkClick, true);
  document.addEventListener("click", handleStudioClick, true);
  document.addEventListener("mousemove", handleStudioMouseMove, true);
  document.addEventListener("mouseleave", handleStudioMouseLeave, true);
  document.addEventListener("input", handleEditableInput, true);

  setupPathListeners();
  window.addEventListener("message", handleIncomingMessage);

  window.ZestyStudioBridge = { __initialized: true };
  post({ type: "BRIDGE_READY" });
})();
