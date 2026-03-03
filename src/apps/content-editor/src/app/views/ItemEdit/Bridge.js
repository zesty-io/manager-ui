(function () {
  if (window.ZestyStudioBridge?.__initialized) return;

  var targetSelector = "we";
  var parentOrigin = "*";

  // Try to identify this script so we can best-effort filter errors to it
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

  // Global sync/runtime error handler
  window.addEventListener(
    "error",
    function (event) {
      // Only real JS runtime errors
      var ErrorEventCtor = window.ErrorEvent;
      if (
        typeof ErrorEventCtor === "function" &&
        !(event instanceof ErrorEventCtor)
      ) {
        return;
      }

      // Must have a filename to attribute ownership
      if (!event.filename) return;

      // Only errors from this script
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

  function closestTarget(el) {
    while (el && el !== document.documentElement) {
      if (el.matches?.(targetSelector)) return el;
      el = el.parentElement;
    }
    return null;
  }

  function elementPayload(el) {
    if (!el) return null;
    var ds = {};
    for (var k in el.dataset) ds[k] = el.dataset[k];
    return { dataset: ds };
  }

  function getElementValue(el) {
    if (!el || !el.dataset) return "";
    return el.dataset.weType === "wysiwyg_advanced"
      ? (el.innerHTML || "").trim()
      : (el.textContent || "").replace(/\s+/g, " ").trim();
  }

  // Reorder state for generic draggable blocks (e.g. [data-we-uid])
  var reorderState = {
    enabled: false,
    selector: "[data-we-uid]",
    dragEl: null,
    observer: null,
  };

  function getOrderedBlocks(selector) {
    return Array.prototype.slice.call(document.querySelectorAll(selector));
  }

  function postReorderOutput(selector) {
    var ordered = getOrderedBlocks(selector);
    post({
      type: "REORDER_OUTPUT",
      selector: selector,
      orderedUids: ordered
        .map(function (el) {
          return el.getAttribute("data-we-uid");
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
    return el;
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
        el.setAttribute("draggable", "true");
        el.classList.add("studio-dragging");
        if (evt.dataTransfer) {
          evt.dataTransfer.effectAllowed = "move";
          evt.dataTransfer.setData(
            "text/plain",
            el.getAttribute("data-we-uid") || ""
          );
        }
      },
      true
    );

    // Ensure target is draggable even when nodes are injected after bridge init
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
        postReorderOutput(reorderState.selector);
      },
      true
    );

    document.addEventListener(
      "dragend",
      function () {
        if (!reorderState.dragEl) return;
        postReorderOutput(reorderState.selector);
        reorderState.dragEl.classList.remove("studio-dragging");
        reorderState.dragEl = null;
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

  // Path Change
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

  // Intercept same-origin link navigation so the host controls routing
  document.addEventListener(
    "click",
    function (evt) {
      var target = evt.target;
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
    },
    true
  );

  // DOM events
  function handleEvent(eventType, withValue) {
    return function (evt) {
      var el = closestTarget(evt.target);
      if (!el) return;

      var payload = elementPayload(el);
      if (!payload) return;

      post({
        type: "DOM_EVENT",
        eventType: eventType,
        element: payload,
        clientX: evt.clientX,
        clientY: evt.clientY,
        value: withValue ? getElementValue(el) : undefined,
      });
    };
  }

  document.addEventListener("click", handleEvent("click", false), true);
  document.addEventListener("mouseover", handleEvent("mouseover", false), true);
  document.addEventListener("mouseout", handleEvent("mouseout", false), true);
  document.addEventListener("input", handleEvent("input", true), true);
  document.addEventListener("blur", handleEvent("blur", true), true);

  setupPathListeners();

  // Prevent line breaks in inline fields
  document.addEventListener(
    "keydown",
    function (evt) {
      var el = closestTarget(evt.target);
      if (
        el &&
        el.getAttribute("contenteditable") === "true" &&
        ["text", "textarea"].includes(el.dataset.weType) &&
        evt.key === "Enter"
      ) {
        evt.preventDefault();
        evt.stopPropagation();
      }
    },
    true
  );

  // Incoming commands
  window.addEventListener("message", function (evt) {
    if (parentOrigin !== "*" && evt.origin !== parentOrigin) return;
    var data = evt.data;
    if (!data || data.source !== "zesty-studio-host") return;
    var payload = data.message?.payload;
    if (!payload || !payload.action) return;

    var fieldEls = null;
    if (payload.fieldZuid && payload.itemZuid) {
      fieldEls = document.querySelectorAll(
        'we[data-we-field-zuid="' +
          payload.fieldZuid +
          '"][data-we-item-zuid="' +
          payload.itemZuid +
          '"]'
      );
    }

    switch (payload.action) {
      case "addClass":
        fieldEls?.forEach(function (node) {
          node.classList.add(payload.className);
        });
        break;
      case "removeClass":
        fieldEls?.forEach(function (node) {
          node.classList.remove(payload.className);
        });
        break;
      case "scrollIntoView":
        fieldEls?.[0]?.scrollIntoView({ behavior: "smooth", block: "center" });
        break;
      case "setStyle":
        if (payload.style) {
          fieldEls?.forEach(function (node) {
            Object.assign(node.style, payload.style);
          });
        }
        break;
      case "injectCss":
        if (payload.css) {
          var style = document.createElement("style");
          style.appendChild(document.createTextNode(payload.css));
          document.head.appendChild(style);
        }
        break;
      case "enableEditing":
        fieldEls?.forEach(function (node, index) {
          node.setAttribute("contenteditable", "true");
          if (index === 0) node.focus();
        });
        break;
      case "disableEditing":
        fieldEls?.forEach(function (node) {
          node.removeAttribute("contenteditable");
        });
        break;
      case "setTextByField":
        if (fieldEls?.length) {
          fieldEls.forEach(function (node) {
            node.textContent = payload.value || "";
          });
        }
        break;
      case "setHtmlByField":
        if (fieldEls?.length) {
          fieldEls.forEach(function (node) {
            node.innerHTML = payload.html || "";
          });
        }
        break;
      case "enableReorderByUid":
        reorderState.enabled = true;
        reorderState.selector = payload.selector || "[data-we-uid]";

        ensureReorderAttributes();
        setupReorderListeners();
        setupReorderObserver();
        postReorderOutput(reorderState.selector);
        break;
    }
  });

  // Final exposed object (only to prevent re-init)
  window.ZestyStudioBridge = { __initialized: true };

  post({ type: "BRIDGE_READY" });
})();
