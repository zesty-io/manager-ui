/* Ephox advanced code plugin
 *
 * Copyright 2010-2016 Ephox Corporation.  All rights reserved.
 *
 * Version: 2.0.0-92
 */

!(function(s) {
  "use strict";
  var t,
    n,
    o,
    e = {},
    r = { exports: e };
  (n = e),
    (o = r),
    (t = void 0),
    (function(e) {
      "object" == typeof n && void 0 !== o
        ? (o.exports = e())
        : "function" == typeof t && t.amd
        ? t([], e)
        : (("undefined" != typeof window
            ? window
            : "undefined" != typeof global
            ? global
            : "undefined" != typeof self
            ? self
            : this
          ).EphoxContactWrapper = e());
    })(function() {
      return (function i(c, u, a) {
        function s(t, e) {
          if (!u[t]) {
            if (!c[t]) {
              var n = !1;
              if (!e && n) return n(t, !0);
              if (l) return l(t, !0);
              var o = new Error("Cannot find module '" + t + "'");
              throw ((o.code = "MODULE_NOT_FOUND"), o);
            }
            var r = (u[t] = { exports: {} });
            c[t][0].call(
              r.exports,
              function(e) {
                return s(c[t][1][e] || e);
              },
              r,
              r.exports,
              i,
              c,
              u,
              a
            );
          }
          return u[t].exports;
        }
        for (var l = !1, e = 0; e < a.length; e++) s(a[e]);
        return s;
      })(
        {
          1: [
            function(e, t, n) {
              var o,
                r,
                i = (t.exports = {});
              function c() {
                throw new Error("setTimeout has not been defined");
              }
              function u() {
                throw new Error("clearTimeout has not been defined");
              }
              function a(t) {
                if (o === setTimeout) return setTimeout(t, 0);
                if ((o === c || !o) && setTimeout)
                  return (o = setTimeout), setTimeout(t, 0);
                try {
                  return o(t, 0);
                } catch (e) {
                  try {
                    return o.call(null, t, 0);
                  } catch (e) {
                    return o.call(this, t, 0);
                  }
                }
              }
              !(function() {
                try {
                  o = "function" == typeof setTimeout ? setTimeout : c;
                } catch (e) {
                  o = c;
                }
                try {
                  r = "function" == typeof clearTimeout ? clearTimeout : u;
                } catch (e) {
                  r = u;
                }
              })();
              var s,
                l = [],
                f = !1,
                d = -1;
              function m() {
                f &&
                  s &&
                  ((f = !1),
                  s.length ? (l = s.concat(l)) : (d = -1),
                  l.length && p());
              }
              function p() {
                if (!f) {
                  var e = a(m);
                  f = !0;
                  for (var t = l.length; t; ) {
                    for (s = l, l = []; ++d < t; ) s && s[d].run();
                    (d = -1), (t = l.length);
                  }
                  (s = null),
                    (f = !1),
                    (function(t) {
                      if (r === clearTimeout) return clearTimeout(t);
                      if ((r === u || !r) && clearTimeout)
                        return (r = clearTimeout), clearTimeout(t);
                      try {
                        r(t);
                      } catch (e) {
                        try {
                          return r.call(null, t);
                        } catch (e) {
                          return r.call(this, t);
                        }
                      }
                    })(e);
                }
              }
              function h(e, t) {
                (this.fun = e), (this.array = t);
              }
              function y() {}
              (i.nextTick = function(e) {
                var t = new Array(arguments.length - 1);
                if (1 < arguments.length)
                  for (var n = 1; n < arguments.length; n++)
                    t[n - 1] = arguments[n];
                l.push(new h(e, t)), 1 !== l.length || f || a(p);
              }),
                (h.prototype.run = function() {
                  this.fun.apply(null, this.array);
                }),
                (i.title = "browser"),
                (i.browser = !0),
                (i.env = {}),
                (i.argv = []),
                (i.version = ""),
                (i.versions = {}),
                (i.on = y),
                (i.addListener = y),
                (i.once = y),
                (i.off = y),
                (i.removeListener = y),
                (i.removeAllListeners = y),
                (i.emit = y),
                (i.prependListener = y),
                (i.prependOnceListener = y),
                (i.listeners = function(e) {
                  return [];
                }),
                (i.binding = function(e) {
                  throw new Error("process.binding is not supported");
                }),
                (i.cwd = function() {
                  return "/";
                }),
                (i.chdir = function(e) {
                  throw new Error("process.chdir is not supported");
                }),
                (i.umask = function() {
                  return 0;
                });
            },
            {}
          ],
          2: [
            function(e, f, t) {
              (function(n) {
                !(function(e) {
                  var t = setTimeout;
                  function o() {}
                  function i(e) {
                    if ("object" != typeof this)
                      throw new TypeError(
                        "Promises must be constructed via new"
                      );
                    if ("function" != typeof e)
                      throw new TypeError("not a function");
                    (this._state = 0),
                      (this._handled = !1),
                      (this._value = void 0),
                      (this._deferreds = []),
                      l(e, this);
                  }
                  function r(n, o) {
                    for (; 3 === n._state; ) n = n._value;
                    0 !== n._state
                      ? ((n._handled = !0),
                        i._immediateFn(function() {
                          var e = 1 === n._state ? o.onFulfilled : o.onRejected;
                          if (null !== e) {
                            var t;
                            try {
                              t = e(n._value);
                            } catch (e) {
                              return void u(o.promise, e);
                            }
                            c(o.promise, t);
                          } else (1 === n._state ? c : u)(o.promise, n._value);
                        }))
                      : n._deferreds.push(o);
                  }
                  function c(t, e) {
                    try {
                      if (e === t)
                        throw new TypeError(
                          "A promise cannot be resolved with itself."
                        );
                      if (
                        e &&
                        ("object" == typeof e || "function" == typeof e)
                      ) {
                        var n = e.then;
                        if (e instanceof i)
                          return (t._state = 3), (t._value = e), void a(t);
                        if ("function" == typeof n)
                          return void l(
                            ((o = n),
                            (r = e),
                            function() {
                              o.apply(r, arguments);
                            }),
                            t
                          );
                      }
                      (t._state = 1), (t._value = e), a(t);
                    } catch (e) {
                      u(t, e);
                    }
                    var o, r;
                  }
                  function u(e, t) {
                    (e._state = 2), (e._value = t), a(e);
                  }
                  function a(e) {
                    2 === e._state &&
                      0 === e._deferreds.length &&
                      i._immediateFn(function() {
                        e._handled || i._unhandledRejectionFn(e._value);
                      });
                    for (var t = 0, n = e._deferreds.length; t < n; t++)
                      r(e, e._deferreds[t]);
                    e._deferreds = null;
                  }
                  function s(e, t, n) {
                    (this.onFulfilled = "function" == typeof e ? e : null),
                      (this.onRejected = "function" == typeof t ? t : null),
                      (this.promise = n);
                  }
                  function l(e, t) {
                    var n = !1;
                    try {
                      e(
                        function(e) {
                          n || ((n = !0), c(t, e));
                        },
                        function(e) {
                          n || ((n = !0), u(t, e));
                        }
                      );
                    } catch (e) {
                      if (n) return;
                      (n = !0), u(t, e);
                    }
                  }
                  (i.prototype.catch = function(e) {
                    return this.then(null, e);
                  }),
                    (i.prototype.then = function(e, t) {
                      var n = new this.constructor(o);
                      return r(this, new s(e, t, n)), n;
                    }),
                    (i.all = function(e) {
                      var u = Array.prototype.slice.call(e);
                      return new i(function(o, r) {
                        if (0 === u.length) return o([]);
                        var i = u.length;
                        function c(t, e) {
                          try {
                            if (
                              e &&
                              ("object" == typeof e || "function" == typeof e)
                            ) {
                              var n = e.then;
                              if ("function" == typeof n)
                                return void n.call(
                                  e,
                                  function(e) {
                                    c(t, e);
                                  },
                                  r
                                );
                            }
                            (u[t] = e), 0 == --i && o(u);
                          } catch (e) {
                            r(e);
                          }
                        }
                        for (var e = 0; e < u.length; e++) c(e, u[e]);
                      });
                    }),
                    (i.resolve = function(t) {
                      return t && "object" == typeof t && t.constructor === i
                        ? t
                        : new i(function(e) {
                            e(t);
                          });
                    }),
                    (i.reject = function(n) {
                      return new i(function(e, t) {
                        t(n);
                      });
                    }),
                    (i.race = function(r) {
                      return new i(function(e, t) {
                        for (var n = 0, o = r.length; n < o; n++)
                          r[n].then(e, t);
                      });
                    }),
                    (i._immediateFn =
                      ("function" == typeof n &&
                        function(e) {
                          n(e);
                        }) ||
                      function(e) {
                        t(e, 0);
                      }),
                    (i._unhandledRejectionFn = function(e) {
                      "undefined" != typeof console &&
                        console &&
                        console.warn(
                          "Possible Unhandled Promise Rejection:",
                          e
                        );
                    }),
                    (i._setImmediateFn = function(e) {
                      i._immediateFn = e;
                    }),
                    (i._setUnhandledRejectionFn = function(e) {
                      i._unhandledRejectionFn = e;
                    }),
                    void 0 !== f && f.exports
                      ? (f.exports = i)
                      : e.Promise || (e.Promise = i);
                })(this);
              }.call(this, e("timers").setImmediate));
            },
            { timers: 3 }
          ],
          3: [
            function(a, e, s) {
              (function(e, t) {
                var o = a("process/browser.js").nextTick,
                  n = Function.prototype.apply,
                  r = Array.prototype.slice,
                  i = {},
                  c = 0;
                function u(e, t) {
                  (this._id = e), (this._clearFn = t);
                }
                (s.setTimeout = function() {
                  return new u(
                    n.call(setTimeout, window, arguments),
                    clearTimeout
                  );
                }),
                  (s.setInterval = function() {
                    return new u(
                      n.call(setInterval, window, arguments),
                      clearInterval
                    );
                  }),
                  (s.clearTimeout = s.clearInterval = function(e) {
                    e.close();
                  }),
                  (u.prototype.unref = u.prototype.ref = function() {}),
                  (u.prototype.close = function() {
                    this._clearFn.call(window, this._id);
                  }),
                  (s.enroll = function(e, t) {
                    clearTimeout(e._idleTimeoutId), (e._idleTimeout = t);
                  }),
                  (s.unenroll = function(e) {
                    clearTimeout(e._idleTimeoutId), (e._idleTimeout = -1);
                  }),
                  (s._unrefActive = s.active = function(e) {
                    clearTimeout(e._idleTimeoutId);
                    var t = e._idleTimeout;
                    0 <= t &&
                      (e._idleTimeoutId = setTimeout(function() {
                        e._onTimeout && e._onTimeout();
                      }, t));
                  }),
                  (s.setImmediate =
                    "function" == typeof e
                      ? e
                      : function(e) {
                          var t = c++,
                            n = !(arguments.length < 2) && r.call(arguments, 1);
                          return (
                            (i[t] = !0),
                            o(function() {
                              i[t] &&
                                (n ? e.apply(null, n) : e.call(null),
                                s.clearImmediate(t));
                            }),
                            t
                          );
                        }),
                  (s.clearImmediate =
                    "function" == typeof t
                      ? t
                      : function(e) {
                          delete i[e];
                        });
              }.call(
                this,
                a("timers").setImmediate,
                a("timers").clearImmediate
              ));
            },
            { "process/browser.js": 1, timers: 3 }
          ],
          4: [
            function(e, t, n) {
              var o = e("promise-polyfill"),
                r =
                  "undefined" != typeof window
                    ? window
                    : Function("return this;")();
              t.exports = { boltExport: r.Promise || o };
            },
            { "promise-polyfill": 2 }
          ]
        },
        {},
        [4]
      )(4);
    });
  var l = r.exports.boltExport,
    f = {},
    d = function(e, t, n) {
      var o = n();
      tinymce.util.Tools.each(f[e].callbacks, function(e) {
        e(o);
      }),
        (f[e] = { module: o, callbacks: null });
    },
    m = function(e, t, n) {
      var o, r, i, c, u, a;
      e in f
        ? ((u = n),
          null === (a = f[e]).module ? a.callbacks.push(u) : u(a.module))
        : ((o = e),
          (r = t),
          (i = n),
          (c = s.document.createElement("script")),
          (tinymce.codeMirrorLazyLoader = { define: d }),
          (f[o] = { module: null, callbacks: [i] }),
          (c.src = r),
          s.document.body.appendChild(c));
    },
    p = {
      fromTinySettings: function(e) {
        var t;
        return (
          !(t = {
            lineWrapping: e.codemirror_linewrapping,
            lineNumbers: e.codemirror_linenumbers,
            foldGutter: e.codemirror_foldgutter,
            theme: e.codemirror_theme
          }) === e.codemirror_gutter && (t.gutters = []),
          t
        );
      },
      setupCodeMirrorInstance: function(e, t, n, o) {
        var r,
          i,
          c =
            ((r = e),
            {
              completeAfter: (i = function(e, t) {
                return (
                  (t && !t()) ||
                    setTimeout(function() {
                      e.state.completionActive ||
                        e.showHint({ completeSingle: !1 });
                    }, 100),
                  r.Pass
                );
              }),
              completeIfAfterLt: function(t) {
                return i(t, function() {
                  var e = t.getCursor();
                  return "<" === t.getRange(r.Pos(e.line, e.ch - 1), e);
                });
              },
              completeIfInTag: function(t) {
                return i(t, function() {
                  var e = t.getTokenAt(t.getCursor());
                  return (
                    !!(
                      "string" !== e.type ||
                      (/['"]/.test(e.string.charAt(e.string.length - 1)) &&
                        1 !== e.string.length)
                    ) && r.innerMode(t.getMode(), e.state).state.tagName
                  );
                });
              }
            }),
          u = e(
            function(e) {
              t.appendChild(e);
            },
            tinymce.util.Tools.extend(
              {
                lineWrapping: !0,
                lineNumbers: !0,
                foldGutter: !0,
                matchTags: { bothTags: !0 },
                keyMap: "sublime",
                gutters: ["CodeMirror-linenumbers", "CodeMirror-foldgutter"],
                extraKeys: {
                  "Alt-F": "findPersistent",
                  "Ctrl-J": "toMatchingTag",
                  "Ctrl-B": "selectNextOccurrence",
                  "'<'": c.completeAfter,
                  "'/'": c.completeIfAfterLt,
                  "' '": c.completeIfInTag,
                  "'='": c.completeIfInTag,
                  "Ctrl-Q": function(e) {
                    e.foldCode(e.getCursor());
                  }
                }
              },
              n,
              { value: o, mode: "text/html" }
            )
          );
        return (
          tinymce.DOM.bind(t, "keyup keydown keypress", function(e) {
            27 !== e.keyCode && e.stopPropagation();
          }),
          setTimeout(function() {
            u && (u.refresh(), u.focus());
          }, 100),
          u
        );
      }
    },
    h = {
      fromTinySettings: p.fromTinySettings,
      renderTo: function(e, t, c, u, a) {
        return new l(function(i) {
          tinymce.DOM.styleSheetLoader.load(t),
            m("ephox.wrap.CodeMirror", e, function(e) {
              var t, n, o, r;
              ((t = e),
              (n = c),
              (o = a),
              (r = u),
              new l(function(e) {
                e(p.setupCodeMirrorInstance(t, n, o, r));
              })).then(i);
            });
        });
      }
    },
    i = function(e, r) {
      e.windowManager.open({
        title: r.title,
        body: r.body,
        buttons: [
          { text: "Ok", subtype: "primary", onclick: "submit", disabled: !0 },
          { text: "Cancel", onclick: "close" }
        ],
        onPostRender: function() {
          var e,
            t,
            n,
            o = this.getRoot();
          (t = o.find("form > *")[0]),
            (n = o.getEl("body")),
            (e = new tinymce.ui.Throbber(n)).show(1e3),
            r.onPostRender(t).then(function() {
              e.hide(), o.statusbar.items().disabled(!1);
            });
        },
        onSubmit: function(e) {
          r.onSubmit(e.data);
        }
      });
    },
    u = {
      show: function(s, l) {
        var f;
        i(s, {
          title: "Source code",
          body: {
            type: "panel",
            border: 1,
            classes: "codemirror",
            minWidth: s.getParam("code_dialog_width", 600),
            minHeight: s.getParam(
              "code_dialog_height",
              Math.min(tinymce.DOM.getViewPort().h - 200, 500)
            )
          },
          onPostRender: function(e) {
            var t, n, o, r, i, c, u, a;
            return (
              (i = s.settings),
              (c = l),
              (o = i.codemirror_script || c + "/codemirror.min.js"),
              (u = s.settings),
              (a = l),
              (r = u.codemirror_css || a + "/codemirror.min.css"),
              (t = e.getEl("body")),
              (n = s.getContent({ source_view: !0 })),
              h
                .renderTo(o, r, t, n, h.fromTinySettings(s.settings))
                .then(function(e) {
                  f = e;
                })
            );
          },
          onSubmit: function() {
            s.focus(),
              s.undoManager.transact(function() {
                s.setContent(f.getValue());
              }),
              s.selection.setCursorLocation(),
              s.nodeChanged();
          }
        });
      }
    },
    y = function(e, n) {
      return new l(function(t) {
        tinymce.DOM.styleSheetLoader.load(n),
          m("ephox.wrap.CodeMirror", e, function(e) {
            t(e);
          });
      });
    },
    g = function(e, t, n, o) {
      return p.setupCodeMirrorInstance(e, t, p.fromTinySettings(n), o);
    },
    a = {
      show: function(r, e) {
        var t,
          n,
          o,
          i,
          c =
            ((t = r.settings),
            (n = e),
            t.codemirror_script || n + "/codemirror.min.js"),
          u =
            ((o = r.settings),
            (i = e),
            o.codemirror_css || i + "/codemirror.min.css"),
          a = r.getContent({ source_view: !0 }),
          s = r.windowManager.open({
            title: "Source Code",
            size: "large",
            body: { type: "panel", items: [] },
            buttons: [
              { type: "cancel", name: "cancel", text: "Cancel" },
              { type: "submit", name: "save", text: "Save", primary: !0 }
            ]
          });
        s.block("Loading..."),
          y(c, u).then(function(e) {
            var o;
            s.unblock(),
              s.redial(
                ((o = e),
                {
                  title: "Source Code",
                  size: "large",
                  body: {
                    type: "panel",
                    items: [
                      {
                        name: "codeview",
                        type: "customeditor",
                        tag: "div",
                        init: function(n) {
                          return new l(function(e) {
                            (n.style.width = "100%"),
                              n.parentNode.classList.add("mce-codemirror");
                            var t = g(o, n, r.settings, a);
                            e({
                              getValue: function() {
                                return t.doc.getValue();
                              },
                              setValue: function(e) {
                                return t.doc.setValue(e);
                              },
                              destroy: function() {
                                t.destroy();
                              }
                            });
                          });
                        }
                      }
                    ]
                  },
                  buttons: [
                    { type: "cancel", name: "cancel", text: "Cancel" },
                    { type: "submit", name: "save", text: "Save", primary: !0 }
                  ],
                  initialData: { codeview: a },
                  onSubmit: function(e) {
                    r.focus(),
                      r.undoManager.transact(function() {
                        r.setContent(e.getData().codeview);
                      }),
                      r.selection.setCursorLocation(),
                      r.nodeChanged(),
                      e.close();
                  }
                })
              );
          });
      }
    },
    c = function(o, r) {
      return function() {
        for (var e = [], t = 0; t < arguments.length; t++) e[t] = arguments[t];
        var n = o.console;
        n && r in n && n[r].apply(n, arguments);
      };
    },
    v = {
      log: c(s.window, "log"),
      error: c(s.window, "error"),
      warn: c(s.window, "warm")
    },
    w = function(e) {
      return parseInt(e, 10);
    },
    _ = function(e, t, n) {
      return { major: e, minor: t, patch: n };
    },
    T = function(e) {
      var t = /([0-9]+)\.([0-9]+)\.([0-9]+)(?:(\-.+)?)/.exec(e);
      return t ? _(w(t[1]), w(t[2]), w(t[3])) : _(0, 0, 0);
    },
    b = function(e, t) {
      var n = e - t;
      return 0 === n ? 0 : 0 < n ? 1 : -1;
    },
    C = function(e, t) {
      return (
        -1 ===
        (function(e, t) {
          var n = b(e.major, t.major);
          if (0 !== n) return n;
          var o = b(e.minor, t.minor);
          if (0 !== o) return o;
          var r = b(e.patch, t.patch);
          return 0 !== r ? r : 0;
        })(
          (n = e)
            ? T(
                [(o = n).majorVersion, o.minorVersion]
                  .join(".")
                  .split(".")
                  .slice(0, 3)
                  .join(".")
              )
            : null,
          T(t)
        )
      );
      var n, o;
    },
    x = function(e, t, n) {
      return function() {
        e.show(t, n);
      };
    };
  tinymce.PluginManager.add("advcode", function(e, t) {
    return C(tinymce, "4.3.13")
      ? (v.error(
          "The advcode plugin requires at least 4.3.13 version of TinyMCE."
        ),
        function() {})
      : (C(tinymce, "5.0.0")
          ? ((c = x(u, (i = e), t)),
            i.addCommand("mceCodeEditor", c),
            i.addButton("code", {
              icon: "code",
              tooltip: "Source code",
              onclick: c
            }),
            i.addMenuItem("code", {
              icon: "code",
              text: "Source code",
              context: "tools",
              onclick: c
            }))
          : ((o = "sourcecode"),
            (r = x(a, (n = e), t)),
            n.addCommand("mceCodeEditor", r),
            n.ui.registry.addButton("code", {
              icon: o,
              tooltip: "Source code",
              onAction: r
            }),
            n.ui.registry.addMenuItem("code", {
              icon: o,
              text: "Source code",
              onAction: r
            })),
        {});
    var n, o, r, i, c;
  });
})(window);
