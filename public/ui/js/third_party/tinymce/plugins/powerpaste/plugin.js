/* Tiny PowerPaste plugin
 *
 * Copyright 2010-2019 Tiny Technologies LLC. All rights reserved.
 *
 * Version: 5.1.0-412
 */

!(function(g) {
  "use strict";
  var n = function(t) {
      return parseInt(t, 10);
    },
    r = function(t, e, n) {
      return { major: t, minor: e, patch: n };
    },
    o = function(t) {
      var e = /([0-9]+)\.([0-9]+)\.([0-9]+)(?:(\-.+)?)/.exec(t);
      return e ? r(n(e[1]), n(e[2]), n(e[3])) : r(0, 0, 0);
    },
    i = function(t, e) {
      var n = t - e;
      return 0 === n ? 0 : 0 < n ? 1 : -1;
    },
    c = function(t, e) {
      return (
        !!t &&
        -1 ===
          (function(t, e) {
            var n = i(t.major, e.major);
            if (0 !== n) return n;
            var r = i(t.minor, e.minor);
            if (0 !== r) return r;
            var o = i(t.patch, e.patch);
            return 0 !== o ? o : 0;
          })(
            o(
              [(n = t).majorVersion, n.minorVersion]
                .join(".")
                .split(".")
                .slice(0, 3)
                .join(".")
            ),
            o(e)
          )
      );
      var n;
    },
    t = function(r, o) {
      return function() {
        for (var t = [], e = 0; e < arguments.length; e++) t[e] = arguments[e];
        var n = r.console;
        n && o in n && n[o].apply(n, arguments);
      };
    },
    e = {
      log: t(window, "log"),
      error: t(window, "error"),
      warn: t(window, "warm")
    },
    s = {
      register: function(t, e) {
        t.addCommand("mceTogglePlainTextPaste", e.toggle);
      }
    },
    f = function(t) {
      return t.getParam("powerpaste_block_drop", !1, "boolean");
    },
    a = function(t) {
      return void 0 !== t.settings.images_upload_url;
    },
    l = function(t) {
      return t.getParam("paste_as_text", !1);
    },
    L = function(t) {
      return t.getParam("automatic_uploads", !0, "boolean");
    },
    N = function(t) {
      return t.getParam("powerpaste_keep_unsupported_src", !1, "boolean");
    },
    u = function(t, e) {
      t.dom.bind(
        e,
        "drop dragstart dragend dragover dragenter dragleave dragdrop draggesture",
        function(t) {
          t.preventDefault(), t.stopImmediatePropagation();
        }
      );
    },
    d = function(e) {
      e.on("init", function(t) {
        u(e, e.getBody()), e.inline || u(e, e.getDoc());
      });
    },
    _ = function() {},
    v = function(n, r) {
      return function() {
        for (var t = [], e = 0; e < arguments.length; e++) t[e] = arguments[e];
        return n(r.apply(null, t));
      };
    },
    h = function(t) {
      return function() {
        return t;
      };
    },
    m = function(t) {
      return t;
    };
  function y(r) {
    for (var o = [], t = 1; t < arguments.length; t++) o[t - 1] = arguments[t];
    return function() {
      for (var t = [], e = 0; e < arguments.length; e++) t[e] = arguments[e];
      var n = o.concat(t);
      return r.apply(null, n);
    };
  }
  var p,
    b,
    T,
    x,
    E,
    w,
    I,
    S,
    C = function(t) {
      return function() {
        throw new Error(t);
      };
    },
    O = h(!1),
    D = h(!0),
    P = O,
    A = D,
    k = function() {
      return M;
    },
    M =
      ((x = {
        fold: function(t, e) {
          return t();
        },
        is: P,
        isSome: P,
        isNone: A,
        getOr: (T = function(t) {
          return t;
        }),
        getOrThunk: (b = function(t) {
          return t();
        }),
        getOrDie: function(t) {
          throw new Error(t || "error: getOrDie called on none.");
        },
        getOrNull: function() {
          return null;
        },
        getOrUndefined: function() {},
        or: T,
        orThunk: b,
        map: k,
        ap: k,
        each: function() {},
        bind: k,
        flatten: k,
        exists: P,
        forall: A,
        filter: k,
        equals: (p = function(t) {
          return t.isNone();
        }),
        equals_: p,
        toArray: function() {
          return [];
        },
        toString: h("none()")
      }),
      Object.freeze && Object.freeze(x),
      x),
    R = function(n) {
      var t = function() {
          return n;
        },
        e = function() {
          return o;
        },
        r = function(t) {
          return t(n);
        },
        o = {
          fold: function(t, e) {
            return e(n);
          },
          is: function(t) {
            return n === t;
          },
          isSome: A,
          isNone: P,
          getOr: t,
          getOrThunk: t,
          getOrDie: t,
          getOrNull: t,
          getOrUndefined: t,
          or: e,
          orThunk: e,
          map: function(t) {
            return R(t(n));
          },
          ap: function(t) {
            return t.fold(k, function(t) {
              return R(t(n));
            });
          },
          each: function(t) {
            t(n);
          },
          bind: r,
          flatten: t,
          exists: r,
          forall: r,
          filter: function(t) {
            return t(n) ? o : M;
          },
          equals: function(t) {
            return t.is(n);
          },
          equals_: function(t, e) {
            return t.fold(P, function(t) {
              return e(n, t);
            });
          },
          toArray: function() {
            return [n];
          },
          toString: function() {
            return "some(" + n + ")";
          }
        };
      return o;
    },
    F = {
      some: R,
      none: k,
      from: function(t) {
        return null == t ? M : R(t);
      }
    },
    j = function(e) {
      return function(t) {
        return (
          (function(t) {
            if (null === t) return "null";
            var e = typeof t;
            return "object" === e &&
              (Array.prototype.isPrototypeOf(t) ||
                (t.constructor && "Array" === t.constructor.name))
              ? "array"
              : "object" === e &&
                (String.prototype.isPrototypeOf(t) ||
                  (t.constructor && "String" === t.constructor.name))
              ? "string"
              : e;
          })(t) === e
        );
      };
    },
    U = j("string"),
    B = j("object"),
    Y = j("array"),
    W = j("boolean"),
    H = j("function"),
    q = j("number"),
    $ = Array.prototype.slice,
    V =
      void 0 === (E = Array.prototype.indexOf)
        ? function(t, e) {
            return nt(t, e);
          }
        : function(t, e) {
            return E.call(t, e);
          },
    X = function(t, e) {
      return -1 < V(t, e);
    },
    G = function(t, e) {
      return et(t, e).isSome();
    },
    z = function(t, e) {
      for (var n = t.length, r = new Array(n), o = 0; o < n; o++) {
        var i = t[o];
        r[o] = e(i, o, t);
      }
      return r;
    },
    K = function(t, e) {
      for (var n = 0, r = t.length; n < r; n++) {
        e(t[n], n, t);
      }
    },
    J = function(t, e) {
      for (var n = [], r = [], o = 0, i = t.length; o < i; o++) {
        var a = t[o];
        (e(a, o, t) ? n : r).push(a);
      }
      return { pass: n, fail: r };
    },
    Z = function(t, e) {
      for (var n = [], r = 0, o = t.length; r < o; r++) {
        var i = t[r];
        e(i, r, t) && n.push(i);
      }
      return n;
    },
    Q = function(t, e, n) {
      return (
        K(t, function(t) {
          n = e(n, t);
        }),
        n
      );
    },
    tt = function(t, e) {
      for (var n = 0, r = t.length; n < r; n++) {
        var o = t[n];
        if (e(o, n, t)) return F.some(o);
      }
      return F.none();
    },
    et = function(t, e) {
      for (var n = 0, r = t.length; n < r; n++) {
        if (e(t[n], n, t)) return F.some(n);
      }
      return F.none();
    },
    nt = function(t, e) {
      for (var n = 0, r = t.length; n < r; ++n) if (t[n] === e) return n;
      return -1;
    },
    rt = Array.prototype.push,
    ot = function(t) {
      for (var e = [], n = 0, r = t.length; n < r; ++n) {
        if (!Y(t[n]))
          throw new Error(
            "Arr.flatten item " + n + " was not an array, input: " + t
          );
        rt.apply(e, t[n]);
      }
      return e;
    },
    it = function(t, e) {
      var n = z(t, e);
      return ot(n);
    },
    at = function(t, e) {
      for (var n = 0, r = t.length; n < r; ++n) {
        if (!0 !== e(t[n], n, t)) return !1;
      }
      return !0;
    },
    ut =
      (H(Array.from) && Array.from,
      function() {
        return (ut =
          Object.assign ||
          function(t) {
            for (var e, n = 1, r = arguments.length; n < r; n++)
              for (var o in (e = arguments[n]))
                Object.prototype.hasOwnProperty.call(e, o) && (t[o] = e[o]);
            return t;
          }).apply(this, arguments);
      }),
    ct = Object.keys,
    st = function(t, e) {
      for (var n = ct(t), r = 0, o = n.length; r < o; r++) {
        var i = n[r];
        e(t[i], i, t);
      }
    },
    ft = function(t, r) {
      return lt(t, function(t, e, n) {
        return { k: e, v: r(t, e, n) };
      });
    },
    lt = function(r, o) {
      var i = {};
      return (
        st(r, function(t, e) {
          var n = o(t, e, r);
          i[n.k] = n.v;
        }),
        i
      );
    },
    dt = function(t, n) {
      var r = [];
      return (
        st(t, function(t, e) {
          r.push(n(t, e));
        }),
        r
      );
    },
    mt = function(t) {
      return dt(t, function(t) {
        return t;
      });
    },
    pt = function(t) {
      return ct(t).length;
    },
    gt = function(a) {
      if (!Y(a)) throw new Error("cases must be an array");
      if (0 === a.length) throw new Error("there must be at least one case");
      var u = [],
        n = {};
      return (
        K(a, function(t, r) {
          var e = ct(t);
          if (1 !== e.length) throw new Error("one and only one name per case");
          var o = e[0],
            i = t[o];
          if (void 0 !== n[o]) throw new Error("duplicate key detected:" + o);
          if ("cata" === o)
            throw new Error("cannot have a case named cata (sorry)");
          if (!Y(i)) throw new Error("case arguments must be an array");
          u.push(o),
            (n[o] = function() {
              var t = arguments.length;
              if (t !== i.length)
                throw new Error(
                  "Wrong number of arguments to case " +
                    o +
                    ". Expected " +
                    i.length +
                    " (" +
                    i +
                    "), got " +
                    t
                );
              for (var n = new Array(t), e = 0; e < n.length; e++)
                n[e] = arguments[e];
              return {
                fold: function() {
                  if (arguments.length !== a.length)
                    throw new Error(
                      "Wrong number of arguments to fold. Expected " +
                        a.length +
                        ", got " +
                        arguments.length
                    );
                  return arguments[r].apply(null, n);
                },
                match: function(t) {
                  var e = ct(t);
                  if (u.length !== e.length)
                    throw new Error(
                      "Wrong number of arguments to match. Expected: " +
                        u.join(",") +
                        "\nActual: " +
                        e.join(",")
                    );
                  if (
                    !at(u, function(t) {
                      return X(e, t);
                    })
                  )
                    throw new Error(
                      "Not all branches were specified when using match. Specified: " +
                        e.join(", ") +
                        "\nRequired: " +
                        u.join(", ")
                    );
                  return t[o].apply(null, n);
                },
                log: function(t) {
                  g.console.log(t, {
                    constructors: u,
                    constructor: o,
                    params: n
                  });
                }
              };
            });
        }),
        n
      );
    },
    vt = gt([
      { blob: ["id", "imageresult", "objurl"] },
      { url: ["id", "url", "raw"] }
    ]),
    ht = ut(
      {
        cata: function(t, e, n) {
          return t.fold(e, n);
        }
      },
      vt
    ),
    yt = {},
    bt = { exports: yt };
  (I = yt),
    (S = bt),
    (w = void 0),
    (function(t) {
      "object" == typeof I && void 0 !== S
        ? (S.exports = t())
        : "function" == typeof w && w.amd
        ? w([], t)
        : (("undefined" != typeof window
            ? window
            : "undefined" != typeof global
            ? global
            : "undefined" != typeof self
            ? self
            : this
          ).EphoxContactWrapper = t());
    })(function() {
      return (function i(a, u, c) {
        function s(e, t) {
          if (!u[e]) {
            if (!a[e]) {
              var n = !1;
              if (!t && n) return n(e, !0);
              if (f) return f(e, !0);
              var r = new Error("Cannot find module '" + e + "'");
              throw ((r.code = "MODULE_NOT_FOUND"), r);
            }
            var o = (u[e] = { exports: {} });
            a[e][0].call(
              o.exports,
              function(t) {
                return s(a[e][1][t] || t);
              },
              o,
              o.exports,
              i,
              a,
              u,
              c
            );
          }
          return u[e].exports;
        }
        for (var f = !1, t = 0; t < c.length; t++) s(c[t]);
        return s;
      })(
        {
          1: [
            function(t, e, n) {
              var r,
                o,
                i = (e.exports = {});
              function a() {
                throw new Error("setTimeout has not been defined");
              }
              function u() {
                throw new Error("clearTimeout has not been defined");
              }
              function c(e) {
                if (r === setTimeout) return setTimeout(e, 0);
                if ((r === a || !r) && setTimeout)
                  return (r = setTimeout), setTimeout(e, 0);
                try {
                  return r(e, 0);
                } catch (t) {
                  try {
                    return r.call(null, e, 0);
                  } catch (t) {
                    return r.call(this, e, 0);
                  }
                }
              }
              !(function() {
                try {
                  r = "function" == typeof setTimeout ? setTimeout : a;
                } catch (t) {
                  r = a;
                }
                try {
                  o = "function" == typeof clearTimeout ? clearTimeout : u;
                } catch (t) {
                  o = u;
                }
              })();
              var s,
                f = [],
                l = !1,
                d = -1;
              function m() {
                l &&
                  s &&
                  ((l = !1),
                  s.length ? (f = s.concat(f)) : (d = -1),
                  f.length && p());
              }
              function p() {
                if (!l) {
                  var t = c(m);
                  l = !0;
                  for (var e = f.length; e; ) {
                    for (s = f, f = []; ++d < e; ) s && s[d].run();
                    (d = -1), (e = f.length);
                  }
                  (s = null),
                    (l = !1),
                    (function(e) {
                      if (o === clearTimeout) return clearTimeout(e);
                      if ((o === u || !o) && clearTimeout)
                        return (o = clearTimeout), clearTimeout(e);
                      try {
                        o(e);
                      } catch (t) {
                        try {
                          return o.call(null, e);
                        } catch (t) {
                          return o.call(this, e);
                        }
                      }
                    })(t);
                }
              }
              function g(t, e) {
                (this.fun = t), (this.array = e);
              }
              function v() {}
              (i.nextTick = function(t) {
                var e = new Array(arguments.length - 1);
                if (1 < arguments.length)
                  for (var n = 1; n < arguments.length; n++)
                    e[n - 1] = arguments[n];
                f.push(new g(t, e)), 1 !== f.length || l || c(p);
              }),
                (g.prototype.run = function() {
                  this.fun.apply(null, this.array);
                }),
                (i.title = "browser"),
                (i.browser = !0),
                (i.env = {}),
                (i.argv = []),
                (i.version = ""),
                (i.versions = {}),
                (i.on = v),
                (i.addListener = v),
                (i.once = v),
                (i.off = v),
                (i.removeListener = v),
                (i.removeAllListeners = v),
                (i.emit = v),
                (i.prependListener = v),
                (i.prependOnceListener = v),
                (i.listeners = function(t) {
                  return [];
                }),
                (i.binding = function(t) {
                  throw new Error("process.binding is not supported");
                }),
                (i.cwd = function() {
                  return "/";
                }),
                (i.chdir = function(t) {
                  throw new Error("process.chdir is not supported");
                }),
                (i.umask = function() {
                  return 0;
                });
            },
            {}
          ],
          2: [
            function(t, l, e) {
              (function(n) {
                !(function(t) {
                  var e = setTimeout;
                  function r() {}
                  function i(t) {
                    if ("object" != typeof this)
                      throw new TypeError(
                        "Promises must be constructed via new"
                      );
                    if ("function" != typeof t)
                      throw new TypeError("not a function");
                    (this._state = 0),
                      (this._handled = !1),
                      (this._value = void 0),
                      (this._deferreds = []),
                      f(t, this);
                  }
                  function o(n, r) {
                    for (; 3 === n._state; ) n = n._value;
                    0 !== n._state
                      ? ((n._handled = !0),
                        i._immediateFn(function() {
                          var t = 1 === n._state ? r.onFulfilled : r.onRejected;
                          if (null !== t) {
                            var e;
                            try {
                              e = t(n._value);
                            } catch (t) {
                              return void u(r.promise, t);
                            }
                            a(r.promise, e);
                          } else (1 === n._state ? a : u)(r.promise, n._value);
                        }))
                      : n._deferreds.push(r);
                  }
                  function a(e, t) {
                    try {
                      if (t === e)
                        throw new TypeError(
                          "A promise cannot be resolved with itself."
                        );
                      if (
                        t &&
                        ("object" == typeof t || "function" == typeof t)
                      ) {
                        var n = t.then;
                        if (t instanceof i)
                          return (e._state = 3), (e._value = t), void c(e);
                        if ("function" == typeof n)
                          return void f(
                            ((r = n),
                            (o = t),
                            function() {
                              r.apply(o, arguments);
                            }),
                            e
                          );
                      }
                      (e._state = 1), (e._value = t), c(e);
                    } catch (t) {
                      u(e, t);
                    }
                    var r, o;
                  }
                  function u(t, e) {
                    (t._state = 2), (t._value = e), c(t);
                  }
                  function c(t) {
                    2 === t._state &&
                      0 === t._deferreds.length &&
                      i._immediateFn(function() {
                        t._handled || i._unhandledRejectionFn(t._value);
                      });
                    for (var e = 0, n = t._deferreds.length; e < n; e++)
                      o(t, t._deferreds[e]);
                    t._deferreds = null;
                  }
                  function s(t, e, n) {
                    (this.onFulfilled = "function" == typeof t ? t : null),
                      (this.onRejected = "function" == typeof e ? e : null),
                      (this.promise = n);
                  }
                  function f(t, e) {
                    var n = !1;
                    try {
                      t(
                        function(t) {
                          n || ((n = !0), a(e, t));
                        },
                        function(t) {
                          n || ((n = !0), u(e, t));
                        }
                      );
                    } catch (t) {
                      if (n) return;
                      (n = !0), u(e, t);
                    }
                  }
                  (i.prototype.catch = function(t) {
                    return this.then(null, t);
                  }),
                    (i.prototype.then = function(t, e) {
                      var n = new this.constructor(r);
                      return o(this, new s(t, e, n)), n;
                    }),
                    (i.all = function(t) {
                      var u = Array.prototype.slice.call(t);
                      return new i(function(r, o) {
                        if (0 === u.length) return r([]);
                        var i = u.length;
                        function a(e, t) {
                          try {
                            if (
                              t &&
                              ("object" == typeof t || "function" == typeof t)
                            ) {
                              var n = t.then;
                              if ("function" == typeof n)
                                return void n.call(
                                  t,
                                  function(t) {
                                    a(e, t);
                                  },
                                  o
                                );
                            }
                            (u[e] = t), 0 == --i && r(u);
                          } catch (t) {
                            o(t);
                          }
                        }
                        for (var t = 0; t < u.length; t++) a(t, u[t]);
                      });
                    }),
                    (i.resolve = function(e) {
                      return e && "object" == typeof e && e.constructor === i
                        ? e
                        : new i(function(t) {
                            t(e);
                          });
                    }),
                    (i.reject = function(n) {
                      return new i(function(t, e) {
                        e(n);
                      });
                    }),
                    (i.race = function(o) {
                      return new i(function(t, e) {
                        for (var n = 0, r = o.length; n < r; n++)
                          o[n].then(t, e);
                      });
                    }),
                    (i._immediateFn =
                      "function" == typeof n
                        ? function(t) {
                            n(t);
                          }
                        : function(t) {
                            e(t, 0);
                          }),
                    (i._unhandledRejectionFn = function(t) {
                      "undefined" != typeof console &&
                        console &&
                        console.warn(
                          "Possible Unhandled Promise Rejection:",
                          t
                        );
                    }),
                    (i._setImmediateFn = function(t) {
                      i._immediateFn = t;
                    }),
                    (i._setUnhandledRejectionFn = function(t) {
                      i._unhandledRejectionFn = t;
                    }),
                    void 0 !== l && l.exports
                      ? (l.exports = i)
                      : t.Promise || (t.Promise = i);
                })(this);
              }.call(this, t("timers").setImmediate));
            },
            { timers: 3 }
          ],
          3: [
            function(c, t, s) {
              (function(t, e) {
                var r = c("process/browser.js").nextTick,
                  n = Function.prototype.apply,
                  o = Array.prototype.slice,
                  i = {},
                  a = 0;
                function u(t, e) {
                  (this._id = t), (this._clearFn = e);
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
                  (s.clearTimeout = s.clearInterval = function(t) {
                    t.close();
                  }),
                  (u.prototype.unref = u.prototype.ref = function() {}),
                  (u.prototype.close = function() {
                    this._clearFn.call(window, this._id);
                  }),
                  (s.enroll = function(t, e) {
                    clearTimeout(t._idleTimeoutId), (t._idleTimeout = e);
                  }),
                  (s.unenroll = function(t) {
                    clearTimeout(t._idleTimeoutId), (t._idleTimeout = -1);
                  }),
                  (s._unrefActive = s.active = function(t) {
                    clearTimeout(t._idleTimeoutId);
                    var e = t._idleTimeout;
                    0 <= e &&
                      (t._idleTimeoutId = setTimeout(function() {
                        t._onTimeout && t._onTimeout();
                      }, e));
                  }),
                  (s.setImmediate =
                    "function" == typeof t
                      ? t
                      : function(t) {
                          var e = a++,
                            n = !(arguments.length < 2) && o.call(arguments, 1);
                          return (
                            (i[e] = !0),
                            r(function() {
                              i[e] &&
                                (n ? t.apply(null, n) : t.call(null),
                                s.clearImmediate(e));
                            }),
                            e
                          );
                        }),
                  (s.clearImmediate =
                    "function" == typeof e
                      ? e
                      : function(t) {
                          delete i[t];
                        });
              }.call(
                this,
                c("timers").setImmediate,
                c("timers").clearImmediate
              ));
            },
            { "process/browser.js": 1, timers: 3 }
          ],
          4: [
            function(t, e, n) {
              var r = t("promise-polyfill"),
                o =
                  "undefined" != typeof window
                    ? window
                    : Function("return this;")();
              e.exports = { boltExport: o.Promise || r };
            },
            { "promise-polyfill": 2 }
          ]
        },
        {},
        [4]
      )(4);
    });
  var Tt = bt.exports.boltExport,
    xt = function(t) {
      var n = F.none(),
        e = [],
        r = function(t) {
          o() ? a(t) : e.push(t);
        },
        o = function() {
          return n.isSome();
        },
        i = function(t) {
          K(t, a);
        },
        a = function(e) {
          n.each(function(t) {
            g.setTimeout(function() {
              e(t);
            }, 0);
          });
        };
      return (
        t(function(t) {
          (n = F.some(t)), i(e), (e = []);
        }),
        {
          get: r,
          map: function(n) {
            return xt(function(e) {
              r(function(t) {
                e(n(t));
              });
            });
          },
          isReady: o
        }
      );
    },
    Et = {
      nu: xt,
      pure: function(e) {
        return xt(function(t) {
          t(e);
        });
      }
    },
    wt = function(t) {
      g.setTimeout(function() {
        throw t;
      }, 0);
    },
    It = function(n) {
      var t = function(t) {
        n().then(t, wt);
      };
      return {
        map: function(t) {
          return It(function() {
            return n().then(t);
          });
        },
        bind: function(e) {
          return It(function() {
            return n().then(function(t) {
              return e(t).toPromise();
            });
          });
        },
        anonBind: function(t) {
          return It(function() {
            return n().then(function() {
              return t.toPromise();
            });
          });
        },
        toLazy: function() {
          return Et.nu(t);
        },
        toCached: function() {
          var t = null;
          return It(function() {
            return null === t && (t = n()), t;
          });
        },
        toPromise: n,
        get: t
      };
    },
    St = {
      nu: function(t) {
        return It(function() {
          return new Tt(t);
        });
      },
      pure: function(t) {
        return It(function() {
          return Tt.resolve(t);
        });
      }
    },
    Lt = function(a, t) {
      return t(function(r) {
        var o = [],
          i = 0;
        0 === a.length
          ? r([])
          : K(a, function(t, e) {
              var n;
              t.get(
                ((n = e),
                function(t) {
                  (o[n] = t), ++i >= a.length && r(o);
                })
              );
            });
      });
    },
    Nt = function(t) {
      return Lt(t, St.nu);
    },
    _t = function(t, e) {
      var n = z(t, e);
      return Nt(n);
    },
    Ct = 0,
    Ot = function(t) {
      var e = new Date().getTime();
      return t + "_" + Math.floor(1e9 * Math.random()) + ++Ct + String(e);
    };
  function Dt(t, e) {
    return (
      (n = g.document.createElement("canvas")),
      (r = t),
      (o = e),
      (n.width = r),
      (n.height = o),
      n
    );
    var n, r, o;
  }
  function Pt(t) {
    var e = Dt(t.width, t.height);
    return At(e).drawImage(t, 0, 0), e;
  }
  function At(t) {
    return t.getContext("2d");
  }
  var kt = window.Promise
    ? window.Promise
    : (function() {
        var i = function(t) {
            if ("object" != typeof this)
              throw new TypeError("Promises must be constructed via new");
            if ("function" != typeof t) throw new TypeError("not a function");
            (this._state = null),
              (this._value = null),
              (this._deferreds = []),
              f(t, n(o, this), n(u, this));
          },
          t =
            i.immediateFn ||
            ("function" == typeof window.setImmediate && window.setImmediate) ||
            function(t) {
              g.setTimeout(t, 1);
            };
        function n(t, e) {
          return function() {
            return t.apply(e, arguments);
          };
        }
        var r =
          Array.isArray ||
          function(t) {
            return "[object Array]" === Object.prototype.toString.call(t);
          };
        function a(n) {
          var r = this;
          null !== this._state
            ? t(function() {
                var t = r._state ? n.onFulfilled : n.onRejected;
                if (null !== t) {
                  var e;
                  try {
                    e = t(r._value);
                  } catch (t) {
                    return void n.reject(t);
                  }
                  n.resolve(e);
                } else (r._state ? n.resolve : n.reject)(r._value);
              })
            : this._deferreds.push(n);
        }
        function o(t) {
          try {
            if (t === this)
              throw new TypeError("A promise cannot be resolved with itself.");
            if (t && ("object" == typeof t || "function" == typeof t)) {
              var e = t.then;
              if ("function" == typeof e)
                return void f(n(e, t), n(o, this), n(u, this));
            }
            (this._state = !0), (this._value = t), c.call(this);
          } catch (t) {
            u.call(this, t);
          }
        }
        function u(t) {
          (this._state = !1), (this._value = t), c.call(this);
        }
        function c() {
          for (var t = 0, e = this._deferreds; t < e.length; t++) {
            var n = e[t];
            a.call(this, n);
          }
          this._deferreds = [];
        }
        function s(t, e, n, r) {
          (this.onFulfilled = "function" == typeof t ? t : null),
            (this.onRejected = "function" == typeof e ? e : null),
            (this.resolve = n),
            (this.reject = r);
        }
        function f(t, e, n) {
          var r = !1;
          try {
            t(
              function(t) {
                r || ((r = !0), e(t));
              },
              function(t) {
                r || ((r = !0), n(t));
              }
            );
          } catch (t) {
            if (r) return;
            (r = !0), n(t);
          }
        }
        return (
          (i.prototype.catch = function(t) {
            return this.then(null, t);
          }),
          (i.prototype.then = function(n, r) {
            var o = this;
            return new i(function(t, e) {
              a.call(o, new s(n, r, t, e));
            });
          }),
          (i.all = function() {
            for (var t = [], e = 0; e < arguments.length; e++)
              t[e] = arguments[e];
            var u = Array.prototype.slice.call(
              1 === t.length && r(t[0]) ? t[0] : t
            );
            return new i(function(r, o) {
              if (0 === u.length) return r([]);
              var i = u.length;
              function a(e, t) {
                try {
                  if (t && ("object" == typeof t || "function" == typeof t)) {
                    var n = t.then;
                    if ("function" == typeof n)
                      return void n.call(
                        t,
                        function(t) {
                          a(e, t);
                        },
                        o
                      );
                  }
                  (u[e] = t), 0 == --i && r(u);
                } catch (t) {
                  o(t);
                }
              }
              for (var t = 0; t < u.length; t++) a(t, u[t]);
            });
          }),
          (i.resolve = function(e) {
            return e && "object" == typeof e && e.constructor === i
              ? e
              : new i(function(t) {
                  t(e);
                });
          }),
          (i.reject = function(n) {
            return new i(function(t, e) {
              e(n);
            });
          }),
          (i.race = function(o) {
            return new i(function(t, e) {
              for (var n = 0, r = o; n < r.length; n++) r[n].then(t, e);
            });
          }),
          i
        );
      })();
  function Mt(r) {
    return new kt(function(t, n) {
      var e = new g.XMLHttpRequest();
      e.open("GET", r, !0),
        (e.responseType = "blob"),
        (e.onload = function() {
          200 === this.status && t(this.response);
        }),
        (e.onerror = function() {
          var t,
            e = this;
          n(
            0 === this.status
              ? (((t = new Error("No access to download image")).code = 18),
                (t.name = "SecurityError"),
                t)
              : new Error("Error " + e.status + " downloading image")
          );
        }),
        e.send();
    });
  }
  function Rt(t) {
    var e = t.split(","),
      n = /data:([^;]+)/.exec(e[0]);
    if (!n) return F.none();
    for (
      var r = n[1],
        o = e[1],
        i = g.atob(o),
        a = i.length,
        u = Math.ceil(a / 1024),
        c = new Array(u),
        s = 0;
      s < u;
      ++s
    ) {
      for (
        var f = 1024 * s,
          l = Math.min(f + 1024, a),
          d = new Array(l - f),
          m = f,
          p = 0;
        m < l;
        ++p, ++m
      )
        d[p] = i[m].charCodeAt(0);
      c[s] = new Uint8Array(d);
    }
    return F.some(new g.Blob(c, { type: r }));
  }
  function Ft(n) {
    return new kt(function(t, e) {
      Rt(n).fold(function() {
        e("uri is not base64: " + n);
      }, t);
    });
  }
  function jt(t, r, o) {
    return (
      (r = r || "image/png"),
      g.HTMLCanvasElement.prototype.toBlob
        ? new kt(function(e, n) {
            t.toBlob(
              function(t) {
                t ? e(t) : n();
              },
              r,
              o
            );
          })
        : Ft(t.toDataURL(r, o))
    );
  }
  function Ut(t) {
    return ((u = t),
    new kt(function(t, e) {
      var n = g.URL.createObjectURL(u),
        r = new g.Image(),
        o = function() {
          r.removeEventListener("load", i), r.removeEventListener("error", a);
        };
      function i() {
        o(), t(r);
      }
      function a() {
        o(), e("Unable to load data of type " + u.type + ": " + n);
      }
      r.addEventListener("load", i),
        r.addEventListener("error", a),
        (r.src = n),
        r.complete && i();
    })).then(function(t) {
      var e;
      (e = t), g.URL.revokeObjectURL(e.src);
      var n,
        r,
        o = Dt(
          (r = t).naturalWidth || r.width,
          (n = t).naturalHeight || n.height
        );
      return At(o).drawImage(t, 0, 0), o;
    });
    var u;
  }
  function Bt(n) {
    return new kt(function(t) {
      var e = new g.FileReader();
      (e.onloadend = function() {
        t(e.result);
      }),
        e.readAsDataURL(n);
    });
  }
  var Yt = function(t) {
    return F.from(
      0 === (e = t).indexOf("blob:")
        ? Mt(e)
        : 0 === e.indexOf("data:")
        ? Ft(e)
        : null
    );
    var e;
  };
  function Wt(t, e, n) {
    var r = e.type;
    function o(r, o) {
      return t.then(function(t) {
        return (n = o), (e = (e = r) || "image/png"), t.toDataURL(e, n);
        var e, n;
      });
    }
    return {
      getType: h(r),
      toBlob: function() {
        return kt.resolve(e);
      },
      toDataURL: function() {
        return n;
      },
      toBase64: function() {
        return n.split(",")[1];
      },
      toAdjustedBlob: function(e, n) {
        return t.then(function(t) {
          return jt(t, e, n);
        });
      },
      toAdjustedDataURL: o,
      toAdjustedBase64: function(t, e) {
        return o(t, e).then(function(t) {
          return t.split(",")[1];
        });
      },
      toCanvas: function() {
        return t.then(Pt);
      }
    };
  }
  function Ht(t) {
    return ((e = t),
    (n = e.src),
    0 === n.indexOf("data:") ? Ft(n) : Mt(n)).then(function(t) {
      return Bt((e = t)).then(function(t) {
        return Wt(Ut(e), e, t);
      });
      var e;
    });
    var e, n;
  }
  var qt,
    $t,
    Vt = function(t, e) {
      return (r = e), Wt(Ut((n = t)), n, r);
      var n, r;
    },
    Xt = function(t, e, n) {
      return void 0 === e && void 0 === n ? Gt(t) : t.toAdjustedBlob(e, n);
    },
    Gt = function(t) {
      return t.toBlob();
    },
    zt = function(t) {
      return t.toDataURL();
    },
    Kt = function(t) {
      var e = g.URL.createObjectURL(t);
      return Jt(t, e);
    },
    Jt = function(i, a) {
      return St.nu(function(o) {
        var t;
        ((t = i), Bt(t)).then(function(t) {
          var e = Vt(i, t),
            n = Ot("image"),
            r = ht.blob(n, e, a);
          o(r);
        });
      });
    },
    Zt = function(t) {
      return _t(t, Kt);
    },
    Qt =
      (g.Node.ATTRIBUTE_NODE, g.Node.CDATA_SECTION_NODE, g.Node.COMMENT_NODE),
    te = g.Node.DOCUMENT_NODE,
    ee =
      (g.Node.DOCUMENT_TYPE_NODE,
      g.Node.DOCUMENT_FRAGMENT_NODE,
      g.Node.ELEMENT_NODE),
    ne = g.Node.TEXT_NODE,
    re =
      (g.Node.PROCESSING_INSTRUCTION_NODE,
      g.Node.ENTITY_REFERENCE_NODE,
      g.Node.ENTITY_NODE,
      g.Node.NOTATION_NODE,
      void 0 !== g.window ? g.window : Function("return this;")()),
    oe = function(t, e) {
      return (function(t, e) {
        for (var n = null != e ? e : re, r = 0; r < t.length && null != n; ++r)
          n = n[t[r]];
        return n;
      })(t.split("."), e);
    },
    ie = function(t, e) {
      return (function(t, e) {
        for (var n, r, o = void 0 !== e ? e : re, i = 0; i < t.length; ++i)
          (n = o),
            (r = t[i]),
            (void 0 !== n[r] && null !== n[r]) || (n[r] = {}),
            (o = n[r]);
        return o;
      })(t.split("."), e);
    },
    ae = function(t) {
      return t.dom().nodeName.toLowerCase();
    },
    ue = function(t) {
      return t.dom().nodeType;
    },
    ce = function(e) {
      return function(t) {
        return ue(t) === e;
      };
    },
    se = function(t) {
      return ue(t) === Qt || "#comment" === ae(t);
    },
    fe = ce(ee),
    le = ce(ne),
    de = function(t, e, n) {
      if (!(U(n) || W(n) || q(n)))
        throw (g.console.error(
          "Invalid call to Attr.set. Key ",
          e,
          ":: Value ",
          n,
          ":: Element ",
          t
        ),
        new Error("Attribute value was not simple"));
      t.setAttribute(e, n + "");
    },
    me = function(t, e, n) {
      de(t.dom(), e, n);
    },
    pe = function(t, e) {
      var n = t.dom();
      st(e, function(t, e) {
        de(n, e, t);
      });
    },
    ge = function(t, e) {
      var n = t.dom().getAttribute(e);
      return null === n ? void 0 : n;
    },
    ve = function(t, e) {
      var n = t.dom();
      return !(!n || !n.hasAttribute) && n.hasAttribute(e);
    },
    he = function(t, e) {
      t.dom().removeAttribute(e);
    },
    ye = function(t) {
      if (null == t) throw new Error("Node cannot be null or undefined");
      return { dom: h(t) };
    },
    be = {
      fromHtml: function(t, e) {
        var n = (e || g.document).createElement("div");
        if (((n.innerHTML = t), !n.hasChildNodes() || 1 < n.childNodes.length))
          throw (g.console.error("HTML does not have a single root node", t),
          new Error("HTML must have a single root node"));
        return ye(n.childNodes[0]);
      },
      fromTag: function(t, e) {
        var n = (e || g.document).createElement(t);
        return ye(n);
      },
      fromText: function(t, e) {
        var n = (e || g.document).createTextNode(t);
        return ye(n);
      },
      fromDom: ye,
      fromPoint: function(t, e, n) {
        var r = t.dom();
        return F.from(r.elementFromPoint(e, n)).map(ye);
      }
    },
    Te = {
      "cement.dialog.paste.title": "Paste Formatting Options",
      "cement.dialog.paste.instructions":
        "Choose to keep or remove formatting in the pasted content.",
      "cement.dialog.paste.merge": "Keep Formatting",
      "cement.dialog.paste.clean": "Remove Formatting",
      "loading.wait": "Please wait...",
      "safari.imagepaste":
        'Safari does not support direct paste of images. <a href="https://support.ephox.com/entries/88543243-Safari-Direct-paste-of-images-does-not-work" style="text-decoration: underline">More information on image pasting for Safari</a>',
      "webview.imagepaste":
        'Safari does not support direct paste of images. <a href="https://support.ephox.com/entries/88543243-Safari-Direct-paste-of-images-does-not-work" style="text-decoration: underline">More information on image pasting for Safari</a>',
      "error.code.images.not.found": "The images service was not found: (",
      "error.imageupload": "Image failed to upload: (",
      "error.full.stop": ").",
      "errors.local.images.disallowed":
        "Local image paste has been disabled. Local images have been removed from pasted content.",
      "errors.imageimport.failed": "Some images failed to import.",
      "errors.imageimport.unsupported": "Unsupported image type.",
      "errors.imageimport.invalid": "Image is invalid."
    },
    xe = {
      translate: function(t) {
        return tinymce.translate(Te[t]);
      }
    },
    Ee = {
      insert: function(t, e) {
        var n,
          r = e.getDoc(),
          o = "ephoxInsertMarker",
          i = e.selection,
          a = e.dom;
        i.setContent('<span id="' + o + '">&nbsp;</span>'), (n = a.get(o));
        for (
          var u = r.createDocumentFragment();
          t.firstChild && !a.isBlock(t.firstChild);

        )
          u.appendChild(t.firstChild);
        for (
          var c = r.createDocumentFragment();
          t.lastChild && !a.isBlock(t.lastChild);

        )
          c.appendChild(t.lastChild);
        if (
          (n.parentNode.insertBefore(u, n), a.insertAfter(c, n), t.firstChild)
        ) {
          if (a.isBlock(t.firstChild)) {
            for (; !a.isBlock(n.parentNode) && n.parentNode !== a.getRoot(); )
              n = a.split(n.parentNode, n);
            a.is(n.parentNode, "td,th") ||
              n.parentNode === a.getRoot() ||
              (n = a.split(n.parentNode, n));
          }
          a.replace(t, n);
        } else a.remove(n);
      }
    },
    we = {
      each: tinymce.each,
      trim: tinymce.trim,
      bind: function(t, e) {
        return function() {
          return t.apply(e, arguments);
        };
      },
      extend: function(n) {
        for (var t = [], e = 1; e < arguments.length; e++)
          t[e - 1] = arguments[e];
        return (
          tinymce.each(Array.prototype.slice.call(arguments, 1), function(t) {
            for (var e in t) n[e] = t[e];
          }),
          n
        );
      },
      ephoxGetComputedStyle: function(t) {
        return t.ownerDocument.defaultView
          ? t.ownerDocument.defaultView.getComputedStyle(t, null)
          : t.currentStyle || {};
      },
      log: function(t) {
        "undefined" != typeof console && console.log && console.log(t);
      },
      compose: function(t) {
        var r = Array.prototype.slice.call(t).reverse();
        return function(t) {
          for (var e = t, n = 0; n < r.length; n++) e = (0, r[n])(e);
          return e;
        };
      }
    },
    Ie = { strip_class_attributes: "all", retain_style_properties: "none" },
    Se = { strip_class_attributes: "none", retain_style_properties: "valid" },
    Le = function(t, e, n) {
      var r = (function(t, e) {
        if (t && "string" != typeof t) return t;
        switch (t) {
          case "clean":
            return Ie;
          case "merge":
            return Se;
          default:
            return e;
        }
      })(t, e);
      return (r = we.extend(r, { base_64_images: n }));
    },
    Ne = {
      create: function(t, e, n) {
        var r = Le(t, Ie, n),
          o = Le(e, Se, n),
          i = o;
        return {
          setWordContent: function(t) {
            i = t ? r : o;
          },
          get: function(t) {
            return i[t];
          }
        };
      }
    },
    _e = "startElement",
    Ce = "endElement",
    Oe = "text",
    De = "comment",
    Pe = function(o) {
      var i,
        e,
        a = 0,
        u = function() {
          return i;
        };
      e = function() {
        return (
          (i = {}),
          (a = 0),
          we.each(o.attributes, function(t) {
            var e,
              n = t.nodeName,
              r = t.value;
            (!1 !== (e = t).specified ||
              ("name" === e.nodeName && "" !== e.value)) &&
              null != r &&
              ((i[n] = r), a++);
          }),
          void 0 === i.style &&
            o.style.cssText &&
            ((i.style = o.style.cssText), a++),
          (e = u),
          i
        );
      };
      var c,
        s,
        f = function(n) {
          we.each(e(), function(t, e) {
            n(e, t);
          });
        };
      return {
        get: function(t) {
          return e()[t];
        },
        each: f,
        filter: function(t) {
          var n, r;
          c || (s = e),
            (r = t),
            (c =
              (n = c) && r
                ? function(t, e) {
                    return r(t, n(t, e));
                  }
                : n || r),
            (e = function() {
              return (
                (e = s),
                f(function(t, e) {
                  var n = c(t, e);
                  null === n
                    ? (o.removeAttribute(t), delete i[t], a--)
                    : n !== e &&
                      ("class" === t ? (o.className = n) : o.setAttribute(t, n),
                      (i[t] = n));
                }),
                (e = u),
                i
              );
            });
        },
        getAttributes: function() {
          return e();
        },
        getAttributeCount: function() {
          return e(), a;
        }
      };
    },
    Ae = function(t) {
      return t.replace(/-(.)/g, function(t, e) {
        return e.toUpperCase();
      });
    },
    ke = !1,
    Me = function(i, t, e) {
      var n, r, o, a, u, c, s, f, l, d;
      switch (i.nodeType) {
        case 1:
          t
            ? (n = Ce)
            : ((n = _e),
              (a = Pe(i)),
              (u = {}),
              (c = i),
              (s = function(t, e) {
                u[t] = e;
              }),
              (null != (d = e || c.getAttribute("style")) && d.split) ||
                (d = c.style.cssText),
              we.each(d.split(";"), function(t) {
                var e = t.indexOf(":");
                0 < e &&
                  ((f = we.trim(t.substring(0, e))).toUpperCase() === f &&
                    (f = f.toLowerCase()),
                  (f = f.replace(/([A-Z])/g, function(t, e) {
                    return "-" + e.toLowerCase();
                  })),
                  (l = we.trim(t.substring(e + 1))),
                  ke || (ke = 0 === f.indexOf("mso-")),
                  s(f, l));
              }),
              ke || ((l = c.style["mso-list"]) && s("mso-list", l))),
            (r =
              "HTML" !== i.scopeName &&
              i.scopeName &&
              i.tagName &&
              i.tagName.indexOf(":") <= 0
                ? (i.scopeName + ":" + i.tagName).toUpperCase()
                : i.tagName);
          break;
        case 3:
          (n = Oe), (o = i.nodeValue);
          break;
        case 8:
          (n = De), (o = i.nodeValue);
          break;
        default:
          we.log("WARNING: Unsupported node type encountered: " + i.nodeType);
      }
      var m = function() {
          return n;
        },
        p = function(t) {
          n === _e && a.filter(t);
        };
      return {
        getNode: function() {
          return a && a.getAttributes(), i;
        },
        tag: function() {
          return r;
        },
        type: m,
        text: function() {
          return o;
        },
        toString: function() {
          return "Type: " + n + ", Tag: " + r + " Text: " + o;
        },
        getAttribute: function(t) {
          return a.get(t.toLowerCase());
        },
        filterAttributes: p,
        filterStyles: function(r) {
          if (m() === _e) {
            var o = "";
            we.each(u, function(t, e) {
              var n = r(e, t);
              null === n
                ? (i.style.removeProperty
                    ? i.style.removeProperty(Ae(e))
                    : i.style.removeAttribute(Ae(e)),
                  delete u[e])
                : ((o += e + ": " + n + "; "), (u[e] = n));
            }),
              (o = o || null),
              p(function(t, e) {
                return "style" === t ? o : e;
              }),
              (i.style.cssText = o);
          }
        },
        getAttributeCount: function() {
          return a.getAttributeCount();
        },
        attributes: function(t) {
          a.each(t);
        },
        getStyle: function(t) {
          return u[t];
        },
        styles: function(n) {
          we.each(u, function(t, e) {
            n(e, t);
          });
        },
        getComputedStyle: function() {
          return we.ephoxGetComputedStyle(i);
        },
        isWhitespace: function() {
          return n === Oe && /^[\s\u00A0]*$/.test(o);
        }
      };
    },
    Re = function(t, e) {
      return Me(e.createElement(t), !0);
    },
    Fe = Re("HTML", window.document),
    je = {
      START_ELEMENT_TYPE: _e,
      END_ELEMENT_TYPE: Ce,
      TEXT_TYPE: Oe,
      COMMENT_TYPE: De,
      FINISHED: Fe,
      token: Me,
      createStartElement: function(t, e, n, r) {
        var o = r.createElement(t),
          i = "";
        return (
          we.each(e, function(t, e) {
            o.setAttribute(e, t);
          }),
          we.each(n, function(t, e) {
            (i += e + ":" + t + ";"), (o.style[Ae(e)] = t);
          }),
          Me(o, !1, "" !== i ? i : null)
        );
      },
      createEndElement: Re,
      createComment: function(t, e) {
        return Me(e.createComment(t), !1);
      },
      createText: function(t, e) {
        return Me(e.createTextNode(t));
      }
    },
    Ue = function(i) {
      var a = i.createDocumentFragment(),
        u = function(t) {
          a.appendChild(t);
        };
      return {
        dom: a,
        receive: function(t) {
          var e, n, r, o;
          switch (t.type()) {
            case je.START_ELEMENT_TYPE:
              (o = t.getNode().cloneNode(!1)), u((r = o)), (a = r);
              break;
            case je.TEXT_TYPE:
              (e = t), (n = i.createTextNode(e.text())), u(n);
              break;
            case je.END_ELEMENT_TYPE:
              a = a.parentNode;
              break;
            case je.COMMENT_TYPE:
              break;
            default:
              throw { message: "Unsupported token type: " + t.type() };
          }
        }
      };
    },
    Be = function(t, o) {
      var i;
      (o = o || window.document),
        (i = o.createElement("div")),
        o.body.appendChild(i),
        (i.style.position = "absolute"),
        (i.style.left = "-10000px"),
        (i.innerHTML = t);
      var a = i.firstChild || je.FINISHED,
        u = [],
        c = !1;
      return {
        hasNext: function() {
          return void 0 !== a;
        },
        next: function() {
          var t,
            e,
            n = a,
            r = c;
          return (
            !c && a.firstChild
              ? (u.push(a), (a = a.firstChild))
              : c || 1 !== a.nodeType
              ? a.nextSibling
                ? ((a = a.nextSibling), (c = !1))
                : ((a = u.pop()), (c = !0))
              : (c = !0),
            n === je.FINISHED ||
              a ||
              (o.body.removeChild(i), (a = je.FINISHED)),
            (e = r),
            (t = n) === je.FINISHED ? t : t ? je.token(t, e) : void 0
          );
        }
      };
    },
    Ye = function(p, g) {
      return function(e, t, n) {
        var r,
          o,
          i,
          a = !1,
          u = function() {
            g && g(m), (a = !1), (o = []), (i = []);
          },
          c = function(t) {
            we.each(t, function(t) {
              e.receive(t);
            });
          },
          s = function(t) {
            a ? i.push(t) : e.receive(t);
          },
          f = function() {
            l(), c(i), u();
          },
          l = function() {
            we.each(r, function(t) {
              s(t);
            }),
              d();
          },
          d = function() {
            r = [];
          },
          m = {
            document: n || window.document,
            settings: t || {},
            emit: s,
            receive: function(t) {
              g && o.push(t), p(m, t), t === je.FINISHED && f();
            },
            startTransaction: function() {
              a = !0;
            },
            rollback: function() {
              c(o), u();
            },
            commit: f,
            defer: function(t) {
              (r = r || []).push(t);
            },
            hasDeferred: function() {
              return r && 0 < r.length;
            },
            emitDeferred: l,
            dropDeferred: d
          };
        return u(), m;
      };
    },
    We = Ye,
    He = function(n) {
      return Ye(function(t, e) {
        e.filterAttributes(we.bind(n, t)), t.emit(e);
      });
    },
    qe = /^(P|H[1-6]|T[DH]|LI|DIV|BLOCKQUOTE|PRE|ADDRESS|FIELDSET|DD|DT|CENTER)$/,
    $e = function() {
      return null;
    },
    Ve = !1,
    Xe = We(function(t, e) {
      var n,
        r = function() {
          Ve ||
            (t.emit(je.createStartElement("P", {}, {}, t.document)), (Ve = !0));
        };
      switch (e.type()) {
        case je.TEXT_TYPE:
          r(), t.emit(e);
          break;
        case je.END_ELEMENT_TYPE:
          Ve && ((n = e), qe.test(n.tag()) || e === je.FINISHED)
            ? (t.emit(je.createEndElement("P", t.document)), (Ve = !1))
            : "BR" === e.tag() && t.emit(e);
          break;
        case je.START_ELEMENT_TYPE:
          "BR" === e.tag()
            ? (e.filterAttributes($e), e.filterStyles($e), t.emit(e))
            : "IMG" === e.tag() &&
              e.getAttribute("alt") &&
              (r(), t.emit(je.createText(e.getAttribute("alt"), t.document)));
      }
      e === je.FINISHED && t.emit(e);
    }),
    Ge = function(t) {
      var e = t;
      return 65279 === e.charCodeAt(e.length - 1)
        ? e.substring(0, e.length - 1)
        : t;
    },
    ze = [Ge],
    Ke =
      tinymce.isIE && 9 <= document.documentMode
        ? [
            function(t) {
              return t.replace(/<BR><BR>/g, "<br>");
            },
            function(t) {
              return t.replace(/<br>/g, " ");
            },
            function(t) {
              return t.replace(/<br><br>/g, "<BR><BR>");
            },
            function(t) {
              return /<(h[1-6r]|p|div|address|pre|form|table|tbody|thead|tfoot|th|tr|td|li|ol|ul|caption|blockquote|center|dl|dt|dd|dir|fieldset)/.test(
                t
              )
                ? t.replace(
                    /(?:<br>&nbsp;[\s\r\n]+|<br>)*(<\/?(h[1-6r]|p|div|address|pre|form|table|tbody|thead|tfoot|th|tr|td|li|ol|ul|caption|blockquote|center|dl|dt|dd|dir|fieldset)[^>]*>)(?:<br>&nbsp;[\s\r\n]+|<br>)*/g,
                    "$1"
                  )
                : t;
            }
          ].concat(ze)
        : ze,
    Je = { all: we.compose(Ke), textOnly: Ge },
    Ze = /^(mso-.*|tab-stops|tab-interval|language|text-underline|text-effect|text-line-through|font-color|horiz-align|list-image-[0-9]+|separator-image|table-border-color-(dark|light)|vert-align|vnd\..*)$/,
    Qe = We(function(t, e) {
      var r,
        n = t.settings.get("retain_style_properties");
      e.filterStyles(
        ((r = n),
        function(t, e) {
          var n = !1;
          switch (r) {
            case "all":
            case "*":
              n = !0;
              break;
            case "valid":
              n = !Ze.test(t);
              break;
            case void 0:
            case "none":
              n = "list-style-type" === t;
              break;
            default:
              n = 0 <= ("," + r + ",").indexOf("," + t + ",");
          }
          return n ? e : null;
        })
      ),
        t.emit(e);
    }),
    tn = We(function(t, e) {
      t.seenList ||
        (t.inferring
          ? "LI" === e.tag() &&
            (e.type() === je.START_ELEMENT_TYPE
              ? t.inferring++
              : (t.inferring--, t.inferring || (t.needsClosing = !0)))
          : ("OL" === e.tag() || "UL" === e.tag()
              ? (t.seenList = !0)
              : "LI" === e.tag() &&
                ((t.inferring = 1),
                t.needsClosing ||
                  t.emit(je.createStartElement("UL", {}, {}, t.document))),
            !t.needsClosing ||
              t.inferring ||
              e.isWhitespace() ||
              ((t.needsClosing = !1),
              t.emit(je.createEndElement("UL", t.document))))),
        t.emit(e);
    }),
    en = He(function(t, e) {
      return "name" === t || "id" === t ? null : e;
    }),
    nn = He(function(t, e) {
      if ("class" === t)
        switch (this.settings.get("strip_class_attributes")) {
          case "mso":
            return 0 === e.indexOf("Mso") ? null : e;
          case "none":
            return e;
          default:
            return null;
        }
      return e;
    }),
    rn = (function() {
      if (
        0 < navigator.userAgent.indexOf("Gecko") &&
        navigator.userAgent.indexOf("WebKit") < 0
      )
        return !1;
      var t = document.createElement("div");
      try {
        t.innerHTML = '<p style="mso-list: Ignore;">&nbsp;</p>';
      } catch (t) {
        return !1;
      }
      return "Ignore" === je.token(t.firstChild).getStyle("mso-list");
    })(),
    on = function(t, e) {
      return t.type() === je.START_ELEMENT_TYPE
        ? 0 === t.getAttributeCount() ||
            (e &&
              1 === t.getAttributeCount() &&
              null !== t.getAttribute("style") &&
              void 0 !== t.getAttribute("style"))
        : t.type() === je.END_ELEMENT_TYPE;
    },
    an = rn,
    un = function(t) {
      return "A" === t.tag() || "SPAN" === t.tag();
    },
    cn = function(t) {
      var e = t.getStyle("mso-list");
      return e && "skip" !== e;
    },
    sn = [],
    fn = [],
    ln = !1,
    dn = function(t, e) {
      var n,
        r,
        o = 1;
      for (n = e + 1; n < t; n++)
        if ((r = sn[n]) && "SPAN" === r.tag())
          if (r.type() === je.START_ELEMENT_TYPE) o++;
          else if (r.type() === je.END_ELEMENT_TYPE && 0 === --o)
            return void (sn[n] = null);
    },
    mn = function(t, e) {
      if ((sn.push(e), (fn = fn || []), e.type() === je.START_ELEMENT_TYPE))
        fn.push(e);
      else if (e.type() === je.END_ELEMENT_TYPE && (fn.pop(), 0 === fn.length))
        return void (function(t) {
          if (ln) {
            var e = void 0,
              n = sn.length,
              r = void 0;
            for (r = 0; r < n; r++)
              (e = sn[r]) &&
                (e.type() === je.START_ELEMENT_TYPE &&
                "SPAN" === e.tag() &&
                on(e)
                  ? dn(n, r)
                  : t.emit(e));
          }
          (sn = []), (fn = []), (ln = !1);
        })(t);
    },
    pn = We(function(t, e) {
      var n = function(t) {
        return !(
          0 <=
            ",FONT,EM,STRONG,SAMP,ACRONYM,CITE,CODE,DFN,KBD,TT,B,I,U,S,SUB,SUP,INS,DEL,VAR,SPAN,".indexOf(
              "," + t.tag() + ","
            ) && on(t, !0)
        );
      };
      0 === (sn = sn || []).length
        ? e.type() === je.START_ELEMENT_TYPE
          ? n(e)
            ? t.emit(e)
            : mn(t, e)
          : t.emit(e)
        : (ln || (ln = n(e)), mn(t, e));
    }),
    gn = He(function(t, e) {
      return "style" === t && "" === e ? null : e;
    }),
    vn = He(function(t, e) {
      return "lang" === t ? null : e;
    }),
    hn = We(function(t, e) {
      if ("IMG" === e.tag()) {
        if (e.type() === je.END_ELEMENT_TYPE && t.skipEnd)
          return void (t.skipEnd = !1);
        if (e.type() === je.START_ELEMENT_TYPE) {
          if (/^file:/.test(e.getAttribute("src")))
            return void (t.skipEnd = !0);
          if (
            t.settings.get("base_64_images") &&
            /^data:image\/.*;base64/.test(e.getAttribute("src"))
          )
            return void (t.skipEnd = !0);
        }
      }
      t.emit(e);
    }),
    yn = We(function(t, e) {
      "META" !== e.tag() && "LINK" !== e.tag() && t.emit(e);
    }),
    bn = function(t) {
      return !on(t) && !/^OLE_LINK/.test(t.getAttribute("name"));
    },
    Tn = [],
    xn = We(function(t, e) {
      var n;
      e.type() === je.START_ELEMENT_TYPE && "A" === e.tag()
        ? (Tn.push(e), bn(e) && t.defer(e))
        : e.type() === je.END_ELEMENT_TYPE && "A" === e.tag()
        ? ((n = Tn.pop()),
          bn(n) && t.defer(e),
          0 === Tn.length && t.emitDeferred())
        : t.hasDeferred()
        ? t.defer(e)
        : t.emit(e);
    }),
    En = !1,
    wn = [
      We(function(t, e) {
        "SCRIPT" === e.tag()
          ? (En = e.type() === je.START_ELEMENT_TYPE)
          : En ||
            (e.filterAttributes(function(t, e) {
              return /^on/.test(t) || "language" === t ? null : e;
            }),
            t.emit(e));
      }),
      en,
      hn,
      Qe,
      vn,
      gn,
      nn,
      xn,
      pn,
      yn,
      tn
    ],
    In = We(function(t, n) {
      n.filterAttributes(function(t, e) {
        return "align" === t
          ? null
          : ("UL" !== n.tag() && "OL" !== n.tag()) || "type" !== t
          ? e
          : null;
      }),
        t.emit(n);
    }),
    Sn = He(function(t, e) {
      return /^xmlns(:|$)/.test(t) ? null : e;
    }),
    Ln = We(function(t, e) {
      (e.tag && /^([OVWXP]|U[0-9]+|ST[0-9]+):/.test(e.tag())) || t.emit(e);
    }),
    Nn = He(function(t, e) {
      return "href" === t &&
        (0 <= e.indexOf("#_Toc") || 0 <= e.indexOf("#_mso"))
        ? null
        : e;
    }),
    _n = He(function(t, e) {
      return /^v:/.test(t) ? null : e;
    }),
    Cn = [
      { regex: /^\(?[dc][\.\)]$/, type: { tag: "OL", type: "lower-alpha" } },
      { regex: /^\(?[DC][\.\)]$/, type: { tag: "OL", type: "upper-alpha" } },
      {
        regex: /^\(?M*(CM|CD|D?C{0,3})(XC|XL|L?X{0,3})(IX|IV|V?I{0,3})[\.\)]$/,
        type: { tag: "OL", type: "upper-roman" }
      },
      {
        regex: /^\(?m*(cm|cd|d?c{0,3})(xc|xl|l?x{0,3})(ix|iv|v?i{0,3})[\.\)]$/,
        type: { tag: "OL", type: "lower-roman" }
      },
      { regex: /^\(?[0-9]+[\.\)]$/, type: { tag: "OL" } },
      {
        regex: /^([0-9]+\.)*[0-9]+\.?$/,
        type: { tag: "OL", variant: "outline" }
      },
      { regex: /^\(?[a-z]+[\.\)]$/, type: { tag: "OL", type: "lower-alpha" } },
      { regex: /^\(?[A-Z]+[\.\)]$/, type: { tag: "OL", type: "upper-alpha" } }
    ],
    On = {
      "\u2022": { tag: "UL", type: "disc" },
      "\xb7": { tag: "UL", type: "disc" },
      "\xa7": { tag: "UL", type: "square" }
    },
    Dn = {
      o: { tag: "UL", type: "circle" },
      "-": { tag: "UL", type: "disc" },
      "\u25cf": { tag: "UL", type: "disc" }
    },
    Pn = function(t, e) {
      var n = { tag: t.tag, type: t.type, variant: e };
      return t.start && (n.start = t.start), t.type || delete n.type, n;
    },
    An = function(t, e, n) {
      return (
        t === e ||
        (t &&
          e &&
          t.tag === e.tag &&
          t.type === e.type &&
          (n || t.variant === e.variant))
      );
    },
    kn = {
      guessListType: function(t, e, n) {
        var r,
          o,
          i,
          a = null;
        return (
          t && ((r = t.text), (o = t.symbolFont)),
          (r = we.trim(r)),
          (a = Dn[r])
            ? (a = Pn(a, r))
            : o
            ? (a = (a = On[r]) ? Pn(a, r) : { tag: "UL", variant: r })
            : (we.each(Cn, function(t) {
                if (t.regex.test(r)) {
                  if (e && An(t.type, e, !0))
                    return ((a = t.type).start = parseInt(r, 10)), !1;
                  a || (a = t.type), (a.start = parseInt(r, 10));
                }
              }),
              a &&
                !a.variant &&
                ((i =
                  "(" === r.charAt(0)
                    ? "()"
                    : ")" === r.charAt(r.length - 1)
                    ? ")"
                    : "."),
                (a = Pn(a, i)))),
          a &&
            "OL" === a.tag &&
            n &&
            ("P" !== n.tag() || /^MsoHeading/.test(n.getAttribute("class"))) &&
            (a = null),
          a
        );
      },
      eqListType: An,
      checkFont: function(t, e) {
        if (t.type() === je.START_ELEMENT_TYPE) {
          var n = t.getStyle("font-family");
          n
            ? (e = "Wingdings" === n || "Symbol" === n)
            : /^(P|H[1-6]|DIV)$/.test(t.tag()) && (e = !1);
        }
        return e;
      }
    },
    Mn = function(t) {
      var e = t.indexOf(".");
      if (0 <= e && void 0 === we.trim(t.substring(e + 1)))
        return (void 0)[2], !1;
    },
    Rn =
      ((qt = function(t, e) {
        var n,
          r = /([^{]+){([^}]+)}/g;
        for (r.lastIndex = 0; null !== (n = r.exec(t)); )
          we.each(n[1].split(","), Mn(void 0));
        return !1;
      }),
      ($t = {}),
      function(t, e) {
        var n,
          r = t + "," + e;
        return $t.hasOwnProperty(r)
          ? $t[r]
          : ((n = qt.call(null, t, e)), ($t[r] = n));
      }),
    Fn = function(t, e) {
      var n,
        r,
        o,
        i = !1,
        a = function(t) {
          var e = t.style.fontFamily;
          e && (i = "Wingdings" === e || "Symbol" === e);
        };
      if (
        t.type() === je.START_ELEMENT_TYPE &&
        e.openedTag &&
        "SPAN" === t.tag()
      ) {
        for (
          a((n = e.openedTag.getNode())),
            1 < n.childNodes.length &&
              "A" === n.firstChild.tagName &&
              "" === n.firstChild.textContent &&
              (n = n.childNodes[1]);
          n.firstChild &&
          ("SPAN" === n.firstChild.tagName || "A" === n.firstChild.tagName);

        )
          a((n = n.firstChild));
        if (!(n = n.firstChild) || 3 !== n.nodeType)
          return n && "IMG" === n.tagName;
        if (
          ((r = n.value),
          we.trim(r) || (r = (n = n.parentNode.nextSibling) ? n.value : ""),
          !n || we.trim(n.parentNode.textContent) != r)
        )
          return !1;
        if (
          (o = kn.guessListType(
            { text: r, symbolFont: i },
            null,
            e.originalToken
          ))
        )
          return (
            n.nextSibling &&
            "SPAN" === n.nextSibling.tagName &&
            /^[\u00A0\s]/.test(n.nextSibling.firstChild.value) &&
            ("P" === e.openedTag.tag() || "UL" === o.tag)
          );
      }
      return !1;
    },
    jn = function() {
      var a, u;
      return {
        guessIndentLevel: function(t, e, n, r) {
          var o, i;
          return r && /^([0-9]+\.)+[0-9]+\.?$/.test(r.text)
            ? r.text.replace(/([0-9]+|\.$)/g, "").length + 1
            : ((o = u || parseInt(Rn(n, e.getAttribute("class")))),
              (i = (function(t, e) {
                var n,
                  r = 0;
                for (n = t.parentNode; null != n && n !== e.parentNode; )
                  (r += n.offsetLeft), (n = n.offsetParent);
                return r;
              })(t.getNode(), e.getNode())),
              o ? (a ? (i += a) : 0 === i && (i += a = o)) : (o = 48),
              (u = o = Math.min(i, o)),
              Math.max(1, Math.floor(i / o)) || 1);
        }
      };
    },
    Un = function() {
      var e = !1;
      return {
        check: function(t) {
          return e && t.type() === je.TEXT_TYPE
            ? (t.text(), !0)
            : t.type() === je.START_ELEMENT_TYPE && "STYLE" === t.tag()
            ? (e = !0)
            : t.type() === je.END_ELEMENT_TYPE &&
              "STYLE" === t.tag() &&
              !(e = !1);
        }
      };
    },
    Bn = ["disc", "circle", "square"];
  function Yn(a, u) {
    var i,
      o = [],
      c = [],
      s = 0,
      f = function(t, e) {
        var n = {},
          r = {};
        s++,
          e && t.type && (n = { "list-style-type": t.type }),
          t.start && 1 < t.start && (r = { start: t.start }),
          o.push(t),
          a.emit(je.createStartElement(t.tag, r, n, u)),
          (i = t);
      },
      l = function() {
        a.emit(je.createEndElement(o.pop().tag, u)), s--, (i = o[o.length - 1]);
      },
      d = function() {
        var t = c ? c.pop() : "P";
        "P" !== t && a.emit(je.createEndElement(t, u)),
          a.emit(je.createEndElement("LI", u));
      },
      m = function(t, e, n) {
        var r = {};
        if (t) {
          var o = t.getStyle("margin-left");
          void 0 !== o && (r["margin-left"] = o);
        } else r["list-style-type"] = "none";
        i &&
          !kn.eqListType(i, e) &&
          (l(),
          n &&
            (a.emit(je.createStartElement("P", {}, {}, u)),
            a.emit(je.createText("\xa0", u)),
            a.emit(je.createEndElement("P", u))),
          f(e, !0)),
          a.emit(je.createStartElement("LI", {}, r, u)),
          t && "P" !== t.tag()
            ? (c.push(t.tag()),
              t.filterStyles(function() {
                return null;
              }),
              a.emit(t))
            : c.push("P");
      };
    return {
      openList: f,
      closelist: l,
      closeAllLists: function() {
        for (; 0 < s; ) d(), l();
        a.commit();
      },
      closeItem: d,
      openLI: m,
      openItem: function(t, e, n, r) {
        if (n) {
          for (s || (s = 0); t < s; ) d(), l();
          var o, i;
          if (
            ((i = t),
            "UL" === (o = n).tag && Bn[i - 1] === o.type && (o = { tag: "UL" }),
            (n = o),
            s === t)
          )
            d(), m(e, n, r);
          else
            for (
              1 < t &&
              0 < c.length &&
              "P" !== c[c.length - 1] &&
              (a.emit(je.createEndElement(c[c.length - 1], u)),
              (c[c.length - 1] = "P"));
              s < t;

            )
              f(n, s === t - 1), m(s === t ? e : void 0, n);
        }
      },
      getCurrentListType: function() {
        return i;
      },
      getCurrentLevel: function() {
        return s;
      }
    };
  }
  var Wn = function(t, e) {
      we.log("Unexpected token in list conversion: " + e.toString()),
        t.rollback();
    },
    Hn = function(t, e, n) {
      n.type() === je.TEXT_TYPE && "" === we.trim(n.text())
        ? t.defer(n)
        : e.skippedPara ||
          n.type() !== je.START_ELEMENT_TYPE ||
          "P" !== n.tag() ||
          cn(n)
        ? $n(t, e, n)
        : ((e.openedTag = n), t.defer(n), (e.nextFilter = qn));
    },
    qn = function(t, e, n) {
      n.type() !== je.START_ELEMENT_TYPE ||
      "SPAN" !== n.tag() ||
      0 !== e.spanCount.length ||
      (!an && Fn(n, e)) ||
      cn(n)
        ? n.type() === je.END_ELEMENT_TYPE
          ? "SPAN" === n.tag()
            ? (t.defer(n), e.spanCount.pop())
            : "P" === n.tag()
            ? (t.defer(n),
              (e.skippedPara = !0),
              (e.openedTag = null),
              (e.nextFilter = Hn))
            : ((e.nextFilter = $n), e.nextFilter(t, e, n))
          : n.isWhitespace()
          ? t.defer(n)
          : ((e.nextFilter = $n), e.nextFilter(t, e, n))
        : (t.defer(n), e.spanCount.push(n));
    },
    $n = function(t, e, n) {
      var r = function() {
        e.emitter.closeAllLists(),
          t.emitDeferred(),
          (e.openedTag = null),
          t.emit(n),
          (e.nextFilter = $n);
      };
      if (n.type() === je.START_ELEMENT_TYPE && cn(n) && "LI" !== n.tag()) {
        var o = / level([0-9]+)/.exec(n.getStyle("mso-list"));
        o && o[1]
          ? ((e.itemLevel = parseInt(o[1], 10) + e.styleLevelAdjust),
            e.nextFilter === $n ? t.emitDeferred() : t.dropDeferred(),
            (e.nextFilter = Xn),
            t.startTransaction(),
            (e.originalToken = n),
            (e.commentMode = !1))
          : r();
      } else
        !an &&
        ((n.type() === je.COMMENT_TYPE && "[if !supportLists]" === n.text()) ||
          Fn(n, t))
          ? (n.type() === je.START_ELEMENT_TYPE &&
              "SPAN" === n.tag() &&
              e.spanCount.push(n),
            (e.nextFilter = Xn),
            t.startTransaction(),
            (e.originalToken = e.openedTag),
            (e.commentMode = !0),
            (e.openedTag = null),
            t.dropDeferred())
          : n.type() === je.END_ELEMENT_TYPE && un(n)
          ? (t.defer(n), e.spanCount.pop())
          : n.type() === je.START_ELEMENT_TYPE
          ? un(n)
            ? (t.defer(n), e.spanCount.push(n))
            : (e.openedTag && (e.emitter.closeAllLists(), t.emitDeferred()),
              (e.openedTag = n),
              t.defer(n))
          : r();
    },
    Vn = function(t, e, n) {
      n.type() === je.END_ELEMENT_TYPE &&
        e.originalToken.tag() === n.tag() &&
        ((e.nextFilter = Hn), (e.styleLevelAdjust = -1)),
        t.emit(n);
    },
    Xn = function(t, e, n) {
      if (
        (n.type() === je.START_ELEMENT_TYPE &&
          "Ignore" === n.getStyle("mso-list") &&
          (e.nextFilter = Gn),
        n.type() === je.START_ELEMENT_TYPE && "SPAN" === n.tag())
      )
        e.spanCount.push(n),
          ((e.commentMode && "" === n.getAttribute("style")) ||
            null === n.getAttribute("style")) &&
            (e.nextFilter = Gn);
      else if ("A" === n.tag())
        n.type() === je.START_ELEMENT_TYPE
          ? e.spanCount.push(n)
          : e.spanCount.pop();
      else if (n.type() === je.TEXT_TYPE)
        if (e.commentMode) (e.nextFilter = Gn), e.nextFilter(t, e, n);
        else {
          var r = e.originalToken,
            o = e.spanCount;
          e.emitter.closeAllLists(),
            t.emit(r),
            we.each(o, we.bind(t.emit, t)),
            t.emit(n),
            t.commit(),
            (e.originalToken = r),
            (e.nextFilter = Vn);
        }
      else (e.commentMode || n.type() !== je.COMMENT_TYPE) && Wn(t, n);
    },
    Gn = function(t, e, n) {
      n.type() === je.TEXT_TYPE
        ? n.isWhitespace() ||
          ((e.nextFilter = zn),
          (e.bulletInfo = { text: n.text(), symbolFont: e.symbolFont }))
        : un(n)
        ? n.type() === je.START_ELEMENT_TYPE
          ? e.spanCount.push(n)
          : e.spanCount.pop()
        : n.type() === je.START_ELEMENT_TYPE && "IMG" === n.tag()
        ? ((e.nextFilter = zn),
          (e.bulletInfo = { text: "\u2202", symbolFont: !0 }))
        : Wn(t, n);
    },
    zn = function(t, e, n) {
      n.type() === je.START_ELEMENT_TYPE && un(n)
        ? (e.spanCount.push(n), (e.nextFilter = Kn))
        : n.type() === je.END_ELEMENT_TYPE && un(n)
        ? (e.spanCount.pop(), (e.nextFilter = Jn))
        : (n.type() === je.END_ELEMENT_TYPE && "IMG" === n.tag()) || Wn(t, n);
    },
    Kn = function(t, e, n) {
      n.type() === je.END_ELEMENT_TYPE &&
        (un(n) && e.spanCount.pop(), (e.nextFilter = Jn));
    },
    Jn = function(o, i, a) {
      var t = function(t) {
        var e, n, r;
        if (
          ((i.nextFilter = Zn),
          i.commentMode &&
            (i.itemLevel = i.indentGuesser.guessIndentLevel(
              a,
              i.originalToken,
              i.styles.styles,
              i.bulletInfo
            )),
          (i.listType = kn.guessListType(
            i.bulletInfo,
            ((e = i.emitter.getCurrentListType()),
            (n = i.emitter.getCurrentLevel()),
            (r = i.itemLevel),
            n === r ? e : null),
            i.originalToken
          )),
          i.listType)
        ) {
          for (
            i.emitter.openItem(
              i.itemLevel,
              i.originalToken,
              i.listType,
              i.skippedPara
            ),
              o.emitDeferred();
            0 < i.spanCount.length;

          )
            o.emit(i.spanCount.shift());
          t && o.emit(a);
        } else
          we.log(
            "Unknown list type: " +
              i.bulletInfo.text +
              " Symbol font? " +
              i.bulletInfo.symbolFont
          ),
            o.rollback();
      };
      a.type() === je.TEXT_TYPE || a.type() === je.START_ELEMENT_TYPE
        ? t(!0)
        : a.type() === je.COMMENT_TYPE
        ? t("[endif]" !== a.text())
        : a.type() === je.END_ELEMENT_TYPE
        ? un(a) && i.spanCount.pop()
        : Wn(o, a);
    },
    Zn = function(t, e, n) {
      n.type() === je.END_ELEMENT_TYPE && n.tag() === e.originalToken.tag()
        ? ((e.nextFilter = Hn), (e.skippedPara = !1))
        : t.emit(n);
    },
    Qn = { initial: $n },
    tr = {},
    er = function(t) {
      (tr.nextFilter = Qn.initial),
        (tr.itemLevel = 0),
        (tr.originalToken = null),
        (tr.commentMode = !1),
        (tr.openedTag = null),
        (tr.symbolFont = !1),
        (tr.listType = null),
        (tr.indentGuesser = jn()),
        (tr.emitter = Yn(t, t.document)),
        (tr.styles = Un()),
        (tr.spanCount = []),
        (tr.skippedPara = !1),
        (tr.styleLevelAdjust = 0),
        (tr.bulletInfo = void 0);
    };
  er({});
  var nr = [
      Ln,
      We(
        function(t, e) {
          tr.styles.check(e) ||
            ((tr.symbolFont = kn.checkFont(e, tr.symbolFont)),
            tr.nextFilter(t, tr, e));
        },
        function(t) {
          er(t);
        }
      ),
      Nn,
      _n,
      Sn,
      In
    ],
    rr = function(t, e, n, r) {
      for (
        var o = Ue(n),
          i = Be(t, n),
          a = (function(t, e, n, r) {
            var o,
              i = e;
            for (o = t.length - 1; 0 <= o; o--) i = t[o](i, n, r);
            return i;
          })(r, o, e, n);
        i.hasNext();

      )
        a.receive(i.next());
      return o.dom;
    },
    or = function(t) {
      return (
        0 <= t.indexOf("<o:p>") ||
        0 <= t.indexOf("p.MsoNormal, li.MsoNormal, div.MsoNormal") ||
        0 <= t.indexOf("MsoListParagraphCxSpFirst") ||
        0 <= t.indexOf("<w:WordDocument>")
      );
    },
    ir = {
      filter: function(t, e, n) {
        var r = Je.all(t),
          o = or(r);
        e.setWordContent(o);
        var i = wn;
        return o && (i = nr.concat(wn)), rr(r, e, n, i);
      },
      filterPlainText: function(t, e, n) {
        var r = Je.textOnly(t);
        return rr(r, e, n, [Xe]);
      },
      isWordContent: or
    },
    ar = { officeStyles: "prompt", htmlStyles: "clean" },
    ur = {
      openDialog: function(t, e, n) {
        var r,
          o = e("cement.dialog.paste.clean"),
          i = e("cement.dialog.paste.merge"),
          a = [
            {
              text: o,
              ariaLabel: o,
              onclick: function() {
                r.close(), n("clean");
              }
            },
            {
              text: i,
              ariaLabel: i,
              onclick: function() {
                r.close(), n("merge");
              }
            }
          ],
          u = {
            title: e("cement.dialog.paste.title"),
            spacing: 10,
            padding: 10,
            items: [
              { type: "container", html: e("cement.dialog.paste.instructions") }
            ],
            buttons: a
          };
        (r = t.windowManager.open(u)),
          setTimeout(function() {
            r && r.getEl().focus();
          }, 1);
      }
    },
    cr = {
      openDialog: function(t, e, n) {
        var r = e("cement.dialog.paste.clean"),
          o = e("cement.dialog.paste.merge"),
          i = {
            title: e("cement.dialog.paste.title"),
            body: {
              type: "panel",
              items: [
                {
                  type: "htmlpanel",
                  name: "instructions",
                  html: e("cement.dialog.paste.instructions")
                }
              ]
            },
            buttons: [
              { text: r, type: "custom", name: "clean" },
              { text: o, type: "custom", name: "merge" }
            ],
            onAction: function(t, e) {
              switch (e.name) {
                case "clean":
                  t.close(), n("clean");
                  break;
                case "merge":
                  t.close(), n("merge");
              }
            }
          };
        t.windowManager.open(i);
      }
    };
  function sr(a, u, c) {
    return {
      showDialog: function(o) {
        var t,
          e = a.settings.powerpaste_word_import || ar.officeStyles,
          n = a.settings.powerpaste_html_import || ar.htmlStyles,
          r = ir.isWordContent(o) ? e : n,
          i = function(t) {
            var e = { content: o };
            a.fire("PastePreProcess", { content: e, internal: !1 });
            var n = Ne.create(t, t, !0),
              r = ir.filter(e.content, n, a.getDoc());
            a.fire("PastePostProcess", { node: r, internal: !1 }),
              a.undoManager.transact(function() {
                Ee.insert(r, a);
              });
          };
        "clean" === (t = r) || "merge" === t
          ? i(r)
          : (c ? cr : ur).openDialog(a, u, i);
      }
    };
  }
  function fr(u, t, e, r, c) {
    var s,
      f = /^image\/(jpe?g|png|gif|bmp)$/i;
    u.on("dragstart dragend", function(t) {
      s = "dragstart" === t.type;
    }),
      u.on("dragover dragend dragleave", function(t) {
        s || t.preventDefault();
      });
    var l = function(t, e) {
        return e in t && 0 < t[e].length;
      },
      d = function(t) {
        var e = t["text/plain"];
        return !!e && 0 === e.indexOf("file://");
      },
      m = function(t) {
        Zt(t).get(function(t) {
          var e = z(t, function(t) {
            var e = be.fromTag("img"),
              n = ht.cata(t, r.getLocalURL, function(t, e, n) {
                return e;
              });
            return me(e, "src", n), e.dom().outerHTML;
          }).join("");
          u.insertContent(e, { merge: !1 !== u.settings.paste_merge_formats }),
            L(u) && r.uploadImages(t);
        });
      };
    u.on("drop", function(t) {
      if (!s) {
        if (
          tinymce.dom.RangeUtils &&
          tinymce.dom.RangeUtils.getCaretRangeFromPoint
        ) {
          var e = tinymce.dom.RangeUtils.getCaretRangeFromPoint(
            t.clientX,
            t.clientY,
            u.getDoc()
          );
          e && u.selection.setRng(e);
        }
        var n =
          ((a = (i = t).target.files || i.dataTransfer.files),
          Z(a, function(t) {
            return f.test(t.type);
          }));
        if (0 < n.length) return m(n), void t.preventDefault();
        var r = (function(t) {
          var e = {};
          if (t) {
            if (t.getData) {
              var n = t.getData("Text");
              n && 0 < n.length && (e["text/plain"] = n);
            }
            if (t.types)
              for (var r = 0; r < t.types.length; r++) {
                var o = t.types[r];
                e[o] = t.getData(o);
              }
          }
          return e;
        })(t.dataTransfer);
        d((o = r)) ||
          (!l(o, "text/html") && !l(o, "text/plain")) ||
          (sr(u, xe.translate, c).showDialog(r["text/html"] || r["text/plain"]),
          t.preventDefault());
      }
      var o, i, a;
    });
  }
  var lr = function() {
      for (var e = [], t = 0; t < arguments.length; t++) e[t] = arguments[t];
      return function() {
        for (var n = [], t = 0; t < arguments.length; t++) n[t] = arguments[t];
        if (e.length !== n.length)
          throw new Error(
            'Wrong number of arguments to struct. Expected "[' +
              e.length +
              ']", got ' +
              n.length +
              " arguments"
          );
        var r = {};
        return (
          K(e, function(t, e) {
            r[t] = h(n[e]);
          }),
          r
        );
      };
    },
    dr = function(t) {
      return t.slice(0).sort();
    },
    mr = function(e, t) {
      if (!Y(t))
        throw new Error(
          "The " + e + " fields must be an array. Was: " + t + "."
        );
      K(t, function(t) {
        if (!U(t))
          throw new Error(
            "The value " + t + " in the " + e + " fields was not a string."
          );
      });
    },
    pr = function(o, i) {
      var n,
        a = o.concat(i);
      if (0 === a.length)
        throw new Error(
          "You must specify at least one required or optional field."
        );
      return (
        mr("required", o),
        mr("optional", i),
        (n = dr(a)),
        tt(n, function(t, e) {
          return e < n.length - 1 && t === n[e + 1];
        }).each(function(t) {
          throw new Error(
            "The field: " +
              t +
              " occurs more than once in the combined fields: [" +
              n.join(", ") +
              "]."
          );
        }),
        function(e) {
          var n = ct(e);
          at(o, function(t) {
            return X(n, t);
          }) ||
            (function(t, e) {
              throw new Error(
                "All required keys (" +
                  dr(t).join(", ") +
                  ") were not specified. Specified keys were: " +
                  dr(e).join(", ") +
                  "."
              );
            })(o, n);
          var t = Z(n, function(t) {
            return !X(a, t);
          });
          0 < t.length &&
            (function(t) {
              throw new Error(
                "Unsupported keys for object: " + dr(t).join(", ")
              );
            })(t);
          var r = {};
          return (
            K(o, function(t) {
              r[t] = h(e[t]);
            }),
            K(i, function(t) {
              r[t] = h(
                Object.prototype.hasOwnProperty.call(e, t)
                  ? F.some(e[t])
                  : F.none()
              );
            }),
            r
          );
        }
      );
    },
    gr = lr("id", "imageresult", "objurl");
  function vr() {
    var o = {},
      n = function(t) {
        g.URL.revokeObjectURL(t.objurl());
      };
    return {
      add: function(t, e, n) {
        var r = gr(t, e, n);
        return (o[t] = r);
      },
      get: function(t) {
        return F.from(o[t]);
      },
      remove: function(t) {
        var e = o[t];
        delete o[t], void 0 !== e && n(e);
      },
      lookupByData: function(e) {
        return (function(t, e) {
          for (var n = ct(t), r = 0, o = n.length; r < o; r++) {
            var i = n[r],
              a = t[i];
            if (e(a, i, t)) return F.some(a);
          }
          return F.none();
        })(o, function(t) {
          return zt(t.imageresult()) === e;
        });
      },
      destroy: function() {
        st(o, n), (o = {});
      }
    };
  }
  var hr,
    yr,
    br = function(t) {
      var r = lr.apply(null, t),
        o = [];
      return {
        bind: function(t) {
          if (void 0 === t)
            throw new Error("Event bind error: undefined handler");
          o.push(t);
        },
        unbind: function(e) {
          o = Z(o, function(t) {
            return t !== e;
          });
        },
        trigger: function() {
          for (var t = [], e = 0; e < arguments.length; e++)
            t[e] = arguments[e];
          var n = r.apply(null, t);
          K(o, function(t) {
            t(n);
          });
        }
      };
    },
    Tr = {
      create: function(t) {
        return {
          registry: ft(t, function(t) {
            return { bind: t.bind, unbind: t.unbind };
          }),
          trigger: ft(t, function(t) {
            return t.trigger;
          })
        };
      }
    },
    xr = function(t) {
      return t.replace(/\./g, "-");
    },
    Er = function(t, e) {
      return t + "-" + e;
    },
    wr = function(t) {
      var n = xr(t);
      return {
        resolve: function(t) {
          var e = t.split(" ");
          return z(e, function(t) {
            return Er(n, t);
          }).join(" ");
        }
      };
    },
    Ir = { resolve: wr("ephox-salmon").resolve },
    Sr = Ir.resolve("upload-image-in-progress"),
    Lr = "data-" + Ir.resolve("image-blob"),
    Nr = "data-" + Ir.resolve("image-upload"),
    _r = { uploadInProgress: h(Sr), blobId: h(Lr), trackedImage: h(Nr) },
    Cr = function(n) {
      var r,
        o = !1;
      return function() {
        for (var t = [], e = 0; e < arguments.length; e++) t[e] = arguments[e];
        return o || ((o = !0), (r = n.apply(null, t))), r;
      };
    },
    Or = function(t) {
      var e = le(t) ? t.dom().parentNode : t.dom();
      return null != e && e.ownerDocument.body.contains(e);
    },
    Dr = function(t, e) {
      for (
        var n = [],
          r = function(t) {
            return n.push(t), e(t);
          },
          o = e(t);
        (o = o.bind(r)).isSome();

      );
      return n;
    },
    Pr = function(t, e, n) {
      return 0 != (t.compareDocumentPosition(e) & n);
    },
    Ar = function(t, e) {
      return Pr(t, e, g.Node.DOCUMENT_POSITION_CONTAINED_BY);
    },
    kr = function() {
      return Mr(0, 0);
    },
    Mr = function(t, e) {
      return { major: t, minor: e };
    },
    Rr = {
      nu: Mr,
      detect: function(t, e) {
        var n = String(e).toLowerCase();
        return 0 === t.length
          ? kr()
          : (function(t, e) {
              var n = (function(t, e) {
                for (var n = 0; n < t.length; n++) {
                  var r = t[n];
                  if (r.test(e)) return r;
                }
              })(t, e);
              if (!n) return { major: 0, minor: 0 };
              var r = function(t) {
                return Number(e.replace(n, "$" + t));
              };
              return Mr(r(1), r(2));
            })(t, n);
      },
      unknown: kr
    },
    Fr = "Firefox",
    jr = function(t, e) {
      return function() {
        return e === t;
      };
    },
    Ur = function(t) {
      var e = t.current;
      return {
        current: e,
        version: t.version,
        isEdge: jr("Edge", e),
        isChrome: jr("Chrome", e),
        isIE: jr("IE", e),
        isOpera: jr("Opera", e),
        isFirefox: jr(Fr, e),
        isSafari: jr("Safari", e)
      };
    },
    Br = {
      unknown: function() {
        return Ur({ current: void 0, version: Rr.unknown() });
      },
      nu: Ur,
      edge: h("Edge"),
      chrome: h("Chrome"),
      ie: h("IE"),
      opera: h("Opera"),
      firefox: h(Fr),
      safari: h("Safari")
    },
    Yr = "Windows",
    Wr = "Android",
    Hr = "Solaris",
    qr = "FreeBSD",
    $r = function(t, e) {
      return function() {
        return e === t;
      };
    },
    Vr = function(t) {
      var e = t.current;
      return {
        current: e,
        version: t.version,
        isWindows: $r(Yr, e),
        isiOS: $r("iOS", e),
        isAndroid: $r(Wr, e),
        isOSX: $r("OSX", e),
        isLinux: $r("Linux", e),
        isSolaris: $r(Hr, e),
        isFreeBSD: $r(qr, e)
      };
    },
    Xr = {
      unknown: function() {
        return Vr({ current: void 0, version: Rr.unknown() });
      },
      nu: Vr,
      windows: h(Yr),
      ios: h("iOS"),
      android: h(Wr),
      linux: h("Linux"),
      osx: h("OSX"),
      solaris: h(Hr),
      freebsd: h(qr)
    },
    Gr = function(t, e) {
      var n = String(e).toLowerCase();
      return tt(t, function(t) {
        return t.search(n);
      });
    },
    zr = function(t, n) {
      return Gr(t, n).map(function(t) {
        var e = Rr.detect(t.versionRegexes, n);
        return { current: t.name, version: e };
      });
    },
    Kr = function(t, n) {
      return Gr(t, n).map(function(t) {
        var e = Rr.detect(t.versionRegexes, n);
        return { current: t.name, version: e };
      });
    },
    Jr = function(t, e, n) {
      return (
        "" === e || (!(t.length < e.length) && t.substr(n, n + e.length) === e)
      );
    },
    Zr = function(t, e) {
      return eo(t, e) ? ((n = t), (r = e.length), n.substring(r)) : t;
      var n, r;
    },
    Qr = function(t, e) {
      return no(t, e)
        ? ((n = t), (r = e.length), n.substring(0, n.length - r))
        : t;
      var n, r;
    },
    to = function(t, e) {
      return -1 !== t.indexOf(e);
    },
    eo = function(t, e) {
      return Jr(t, e, 0);
    },
    no = function(t, e) {
      return Jr(t, e, t.length - e.length);
    },
    ro = function(t) {
      return t.replace(/^\s+|\s+$/g, "");
    },
    oo = /.*?version\/\ ?([0-9]+)\.([0-9]+).*/,
    io = function(e) {
      return function(t) {
        return to(t, e);
      };
    },
    ao = [
      {
        name: "Edge",
        versionRegexes: [/.*?edge\/ ?([0-9]+)\.([0-9]+)$/],
        search: function(t) {
          return (
            to(t, "edge/") &&
            to(t, "chrome") &&
            to(t, "safari") &&
            to(t, "applewebkit")
          );
        }
      },
      {
        name: "Chrome",
        versionRegexes: [/.*?chrome\/([0-9]+)\.([0-9]+).*/, oo],
        search: function(t) {
          return to(t, "chrome") && !to(t, "chromeframe");
        }
      },
      {
        name: "IE",
        versionRegexes: [
          /.*?msie\ ?([0-9]+)\.([0-9]+).*/,
          /.*?rv:([0-9]+)\.([0-9]+).*/
        ],
        search: function(t) {
          return to(t, "msie") || to(t, "trident");
        }
      },
      {
        name: "Opera",
        versionRegexes: [oo, /.*?opera\/([0-9]+)\.([0-9]+).*/],
        search: io("opera")
      },
      {
        name: "Firefox",
        versionRegexes: [/.*?firefox\/\ ?([0-9]+)\.([0-9]+).*/],
        search: io("firefox")
      },
      {
        name: "Safari",
        versionRegexes: [oo, /.*?cpu os ([0-9]+)_([0-9]+).*/],
        search: function(t) {
          return (to(t, "safari") || to(t, "mobile/")) && to(t, "applewebkit");
        }
      }
    ],
    uo = [
      {
        name: "Windows",
        search: io("win"),
        versionRegexes: [/.*?windows\ nt\ ?([0-9]+)\.([0-9]+).*/]
      },
      {
        name: "iOS",
        search: function(t) {
          return to(t, "iphone") || to(t, "ipad");
        },
        versionRegexes: [
          /.*?version\/\ ?([0-9]+)\.([0-9]+).*/,
          /.*cpu os ([0-9]+)_([0-9]+).*/,
          /.*cpu iphone os ([0-9]+)_([0-9]+).*/
        ]
      },
      {
        name: "Android",
        search: io("android"),
        versionRegexes: [/.*?android\ ?([0-9]+)\.([0-9]+).*/]
      },
      {
        name: "OSX",
        search: io("os x"),
        versionRegexes: [/.*?os\ x\ ?([0-9]+)_([0-9]+).*/]
      },
      { name: "Linux", search: io("linux"), versionRegexes: [] },
      { name: "Solaris", search: io("sunos"), versionRegexes: [] },
      { name: "FreeBSD", search: io("freebsd"), versionRegexes: [] }
    ],
    co = { browsers: h(ao), oses: h(uo) },
    so = function(t) {
      var e,
        n,
        r,
        o,
        i,
        a,
        u,
        c,
        s,
        f,
        l,
        d = co.browsers(),
        m = co.oses(),
        p = zr(d, t).fold(Br.unknown, Br.nu),
        g = Kr(m, t).fold(Xr.unknown, Xr.nu);
      return {
        browser: p,
        os: g,
        deviceType:
          ((n = p),
          (r = t),
          (o = (e = g).isiOS() && !0 === /ipad/i.test(r)),
          (i = e.isiOS() && !o),
          (a = e.isAndroid() && 3 === e.version.major),
          (u = e.isAndroid() && 4 === e.version.major),
          (c = o || a || (u && !0 === /mobile/i.test(r))),
          (s = e.isiOS() || e.isAndroid()),
          (f = s && !c),
          (l = n.isSafari() && e.isiOS() && !1 === /safari/i.test(r)),
          {
            isiPad: h(o),
            isiPhone: h(i),
            isTablet: h(c),
            isPhone: h(f),
            isTouch: h(s),
            isAndroid: e.isAndroid,
            isiOS: e.isiOS,
            isWebView: h(l)
          })
      };
    },
    fo = {
      detect: Cr(function() {
        var t = g.navigator.userAgent;
        return so(t);
      })
    },
    lo = ee,
    mo = te,
    po = function(t, e) {
      var n = t.dom();
      if (n.nodeType !== lo) return !1;
      var r = n;
      if (void 0 !== r.matches) return r.matches(e);
      if (void 0 !== r.msMatchesSelector) return r.msMatchesSelector(e);
      if (void 0 !== r.webkitMatchesSelector) return r.webkitMatchesSelector(e);
      if (void 0 !== r.mozMatchesSelector) return r.mozMatchesSelector(e);
      throw new Error("Browser lacks native selectors");
    },
    go = function(t) {
      return (
        (t.nodeType !== lo && t.nodeType !== mo) || 0 === t.childElementCount
      );
    },
    vo = function(t, e) {
      var n = void 0 === e ? g.document : e.dom();
      return go(n) ? [] : z(n.querySelectorAll(t), be.fromDom);
    },
    ho = function(t, e) {
      return t.dom() === e.dom();
    },
    yo = (fo.detect().browser.isIE(), po),
    bo = function(t) {
      return be.fromDom(t.dom().ownerDocument);
    },
    To = function(t) {
      return F.from(t.dom().parentNode).map(be.fromDom);
    },
    xo = function(t, e) {
      for (
        var n = H(e) ? e : O, r = t.dom(), o = [];
        null !== r.parentNode && void 0 !== r.parentNode;

      ) {
        var i = r.parentNode,
          a = be.fromDom(i);
        if ((o.push(a), !0 === n(a))) break;
        r = i;
      }
      return o;
    },
    Eo = function(t) {
      return F.from(t.dom().previousSibling).map(be.fromDom);
    },
    wo = function(t) {
      return F.from(t.dom().nextSibling).map(be.fromDom);
    },
    Io = function(t) {
      return (e = Dr(t, Eo)), (n = $.call(e, 0)).reverse(), n;
      var e, n;
    },
    So = function(t) {
      return z(t.dom().childNodes, be.fromDom);
    },
    Lo = function(t) {
      return (e = 0), (n = t.dom().childNodes), F.from(n[e]).map(be.fromDom);
      var e, n;
    },
    No = function(t) {
      return t.dom().childNodes.length;
    },
    _o =
      (lr("element", "offset"),
      function(t, e) {
        var n = [];
        return (
          K(So(t), function(t) {
            e(t) && (n = n.concat([t])), (n = n.concat(_o(t, e)));
          }),
          n
        );
      }),
    Co = function(t, e) {
      return vo(e, t);
    },
    Oo = _r.trackedImage(),
    Do = function(t, e) {
      return Co(t, "img[" + Oo + '="' + e + '"]');
    },
    Po = function(t) {
      return Co(t, "img:not([" + Oo + "])[" + _r.blobId() + "]");
    };
  function Ao() {
    var o = [],
      i = [],
      t = Tr.create({ complete: br(["response"]) }),
      a = function() {
        t.trigger.complete(i), (i = []);
      },
      u = function() {
        return 0 < o.length;
      };
    return {
      findById: Do,
      findAll: Po,
      register: function(t, e) {
        me(t, Oo, e), o.push(e);
      },
      report: function(t, e, r) {
        var n;
        K(e, function(t) {
          var e, n;
          he(t, Oo), (e = r), (n = t), i.push({ success: e, element: n.dom() });
        }),
          (n = t),
          (o = Z(o, function(t, e) {
            return t !== n;
          })),
          !1 === u() && a();
      },
      inProgress: u,
      isActive: function(t) {
        return X(o, t);
      },
      events: t.registry
    };
  }
  ((yr = hr || (hr = {})).JSON = "json"),
    (yr.Blob = "blob"),
    (yr.Text = "text"),
    (yr.FormData = "formdata"),
    (yr.MultipartFormData = "multipart/form-data");
  var ko,
    Mo = function(n) {
      return {
        is: function(t) {
          return n === t;
        },
        isValue: D,
        isError: O,
        getOr: h(n),
        getOrThunk: h(n),
        getOrDie: h(n),
        or: function(t) {
          return Mo(n);
        },
        orThunk: function(t) {
          return Mo(n);
        },
        fold: function(t, e) {
          return e(n);
        },
        map: function(t) {
          return Mo(t(n));
        },
        mapError: function(t) {
          return Mo(n);
        },
        each: function(t) {
          t(n);
        },
        bind: function(t) {
          return t(n);
        },
        exists: function(t) {
          return t(n);
        },
        forall: function(t) {
          return t(n);
        },
        toOption: function() {
          return F.some(n);
        }
      };
    },
    Ro = function(n) {
      return {
        is: O,
        isValue: O,
        isError: D,
        getOr: m,
        getOrThunk: function(t) {
          return t();
        },
        getOrDie: function() {
          return C(String(n))();
        },
        or: function(t) {
          return t;
        },
        orThunk: function(t) {
          return t();
        },
        fold: function(t, e) {
          return t(n);
        },
        map: function(t) {
          return Ro(n);
        },
        mapError: function(t) {
          return Ro(t(n));
        },
        each: _,
        bind: function(t) {
          return Ro(n);
        },
        exists: O,
        forall: D,
        toOption: F.none
      };
    },
    Fo = {
      value: Mo,
      error: Ro,
      fromOption: function(t, e) {
        return t.fold(function() {
          return Ro(e);
        }, Mo);
      }
    },
    jo = function(i) {
      return ut({}, i, {
        toCached: function() {
          return jo(i.toCached());
        },
        bindFuture: function(e) {
          return jo(
            i.bind(function(t) {
              return t.fold(
                function(t) {
                  return St.pure(Fo.error(t));
                },
                function(t) {
                  return e(t);
                }
              );
            })
          );
        },
        bindResult: function(e) {
          return jo(
            i.map(function(t) {
              return t.bind(e);
            })
          );
        },
        mapResult: function(e) {
          return jo(
            i.map(function(t) {
              return t.map(e);
            })
          );
        },
        mapError: function(e) {
          return jo(
            i.map(function(t) {
              return t.mapError(e);
            })
          );
        },
        foldResult: function(e, n) {
          return i.map(function(t) {
            return t.fold(e, n);
          });
        },
        withTimeout: function(t, o) {
          return jo(
            St.nu(function(e) {
              var n = !1,
                r = g.setTimeout(function() {
                  (n = !0), e(Fo.error(o()));
                }, t);
              i.get(function(t) {
                n || (g.clearTimeout(r), e(t));
              });
            })
          );
        }
      });
    },
    Uo = function(t) {
      return jo(St.nu(t));
    },
    Bo = function(t) {
      return jo(St.pure(Fo.value(t)));
    },
    Yo = Uo,
    Wo = Bo,
    Ho = function(t) {
      return jo(St.pure(Fo.error(t)));
    },
    qo = function(t) {
      try {
        var e = JSON.parse(t);
        return Fo.value(e);
      } catch (t) {
        return Fo.error("Response was not JSON.");
      }
    },
    $o = function(e) {
      return St.nu(function(n) {
        var t = new g.FileReader();
        (t.onload = function(t) {
          var e = t.target ? t.target.result : new g.Blob([]);
          n(e);
        }),
          t.readAsText(e);
      });
    },
    Vo = function(t) {
      return St.pure(t.response);
    },
    Xo = function(t, e) {
      switch (t) {
        case hr.JSON:
          return qo(e.response).fold(function() {
            return Vo(e);
          }, St.pure);
        case hr.Blob:
          return (
            (n = e),
            F.from(n.response)
              .map($o)
              .getOr(St.pure("no response content"))
          );
        case hr.Text:
        default:
          return Vo(e);
      }
      var n;
    },
    Go = function(t) {
      var e,
        n =
          ((e = t.body),
          F.from(e).bind(function(t) {
            switch (t.type) {
              case hr.JSON:
                return F.some("application/json");
              case hr.FormData:
                return F.some(
                  "application/x-www-form-urlencoded; charset=UTF-8"
                );
              case hr.MultipartFormData:
                return F.none();
              case hr.Text:
              default:
                return F.some("text/plain");
            }
          })),
        r = !0 === t.credentials ? F.some(!0) : F.none(),
        o =
          (function(t) {
            switch (t) {
              case hr.Blob:
                return "application/octet-stream";
              case hr.JSON:
                return "application/json, text/javascript";
              case hr.Text:
                return "text/plain";
              default:
                return "";
            }
          })(t.responseType) + ", */*; q=0.01",
        i = void 0 !== t.headers ? t.headers : {};
      return {
        contentType: n,
        responseType: (function(t) {
          switch (t) {
            case hr.JSON:
              return F.none();
            case hr.Blob:
              return F.some("blob");
            case hr.Text:
              return F.some("text");
            default:
              return F.none();
          }
        })(t.responseType),
        credentials: r,
        accept: o,
        headers: i,
        progress: H(t.progress) ? F.some(t.progress) : F.none()
      };
    },
    zo = function(t) {
      var n = new g.FormData();
      return (
        st(t, function(t, e) {
          n.append(e, t);
        }),
        n
      );
    },
    Ko = function(c) {
      return Yo(function(r) {
        var o,
          i = new g.XMLHttpRequest();
        i.open(
          c.method,
          ((o = c.url),
          F.from(c.query)
            .map(function(t) {
              var e = dt(t, function(t, e) {
                  return encodeURIComponent(e) + "=" + encodeURIComponent(t);
                }),
                n = to(o, "?") ? "&" : "?";
              return 0 < e.length ? o + n + e.join("&") : o;
            })
            .getOr(o)),
          !0
        );
        var n,
          t,
          e = Go(c);
        (n = i),
          (t = e).contentType.each(function(t) {
            return n.setRequestHeader("Content-Type", t);
          }),
          n.setRequestHeader("Accept", t.accept),
          t.credentials.each(function(t) {
            return (n.withCredentials = t);
          }),
          t.responseType.each(function(t) {
            return (n.responseType = t);
          }),
          t.progress.each(function(e) {
            return n.upload.addEventListener("progress", function(t) {
              return e(t.loaded, t.total);
            });
          }),
          st(t.headers, function(t, e) {
            return n.setRequestHeader(e, t);
          });
        var a,
          u = function() {
            var e, t, n;
            ((e = c.url),
            (t = c.responseType),
            (n = i),
            Xo(t, n).map(function(t) {
              return {
                message:
                  0 === n.status
                    ? "Unknown HTTP error (possible cross-domain request)"
                    : "Could not load url " + e + ": " + n.statusText,
                status: n.status,
                responseText: t
              };
            })).get(function(t) {
              return r(Fo.error(t));
            });
          };
        (i.onerror = u),
          (i.onload = function() {
            0 !== i.status || eo(c.url, "file:")
              ? i.status < 100 || 400 <= i.status
                ? u()
                : (function(t, e) {
                    var n = function() {
                        return Wo(e.response);
                      },
                      r = function(t) {
                        return Ho({
                          message: t,
                          status: e.status,
                          responseText: e.responseText
                        });
                      };
                    switch (t) {
                      case hr.JSON:
                        return qo(e.response).fold(r, Wo);
                      case hr.Blob:
                      case hr.Text:
                        return n();
                      default:
                        return r("unknown data type");
                    }
                  })(c.responseType, i).get(r)
              : u();
          }),
          ((a = c.body),
          F.from(a).map(function(t) {
            return t.type === hr.JSON
              ? JSON.stringify(t.data)
              : t.type === hr.FormData
              ? zo(t.data)
              : t.type === hr.MultipartFormData
              ? zo(t.data)
              : t;
          })).fold(
            function() {
              return i.send();
            },
            function(t) {
              i.send(t);
            }
          );
      });
    },
    Jo = lr("message", "status", "contents"),
    Zo = ["jpg", "png", "gif", "jpeg"],
    Qo = {
      failureObject: Jo,
      getFilename: function(t, e) {
        return U(t.name) && !no(t.name, ".tmp")
          ? t.name
          : (function(t, e) {
              if (U(t.type) && eo(t.type, "image/")) {
                var n = t.type.substr("image/".length);
                return X(Zo, n) ? e + "." + n : e;
              }
              return e;
            })(t, e);
      },
      buildData: function(t, e, n) {
        var r = new g.FormData();
        return r.append(t, e, n), r;
      }
    },
    ti = function(t) {
      var e = "";
      return (
        "" !== t.protocol && ((e += t.protocol), (e += ":")),
        "" !== t.authority && ((e += "//"), (e += t.authority)),
        (e += t.path),
        "" !== t.query && ((e += "?"), (e += t.query)),
        "" !== t.anchor && ((e += "#"), (e += t.anchor)),
        e
      );
    },
    ei = Object.prototype.hasOwnProperty,
    ni =
      ((ko = function(t, e) {
        return e;
      }),
      function() {
        for (var t = new Array(arguments.length), e = 0; e < t.length; e++)
          t[e] = arguments[e];
        if (0 === t.length) throw new Error("Can't merge zero objects");
        for (var n = {}, r = 0; r < t.length; r++) {
          var o = t[r];
          for (var i in o) ei.call(o, i) && (n[i] = ko(n[i], o[i]));
        }
        return n;
      }),
    ri = {
      strictMode: !1,
      key: [
        "source",
        "protocol",
        "authority",
        "userInfo",
        "user",
        "password",
        "host",
        "port",
        "relative",
        "path",
        "directory",
        "file",
        "query",
        "anchor"
      ],
      q: { name: "queryKey", parser: /(?:^|&)([^&=]*)=?([^&]*)/g },
      parser: {
        strict: /^(?:([^:\/?#]+):)?(?:\/\/((?:(([^:@\/]*)(?::([^:@\/]*))?)?@)?([^:\/?#]*)(?::(\d*))?))?((((?:[^?#\/]*\/)*)([^?#]*))(?:\?([^#]*))?(?:#(.*))?)/,
        loose: /^(?:(?![^:@\/]+:[^:@\/]*@)([^:\/?#.]+):)?(?:\/\/)?((?:(([^:@\/]*)(?::([^:@\/]*))?)?@)?([^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/
      }
    },
    oi = function(t, e) {
      return (function(t, e) {
        for (
          var r = e,
            n = r.parser[r.strictMode ? "strict" : "loose"].exec(t),
            o = {},
            i = 14;
          i--;

        )
          o[r.key[i]] = n[i] || "";
        return (
          (o[r.q.name] = {}),
          o[r.key[12]].replace(r.q.parser, function(t, e, n) {
            e && (o[r.q.name][e] = n);
          }),
          o
        );
      })(t, ni(ri, e));
    },
    ii = function(t) {
      return Qr(t, ai(t));
    },
    ai = function(t) {
      return t.substring(t.lastIndexOf("/"));
    },
    ui = function(t) {
      for (var e = t, n = ""; "" !== e; )
        if (eo(e, "../")) e = Zr(e, "../");
        else if (eo(e, "./")) e = Zr(e, "./");
        else if (eo(e, "/./")) e = "/" + Zr(e, "/./");
        else if ("/." === e) e = "/";
        else if (eo(e, "/../")) (e = "/" + Zr(e, "/../")), (n = ii(n));
        else if ("/.." === e) (e = "/"), (n = ii(n));
        else if ("." === e || ".." === e) e = "";
        else {
          var r = e.match(/(^\/?.*?)(\/|$)/)[1];
          (e = Zr(e, r)), (n += r);
        }
      return n;
    },
    ci = function(t, e, n) {
      if ("" !== n && "" === t) return "/" + e;
      var r = t.substring(t.lastIndexOf("/") + 1);
      return Qr(t, r) + e;
    },
    si = function(t, e) {
      var n = { strictMode: !0 },
        r = oi(t, n),
        o = oi(e, n),
        i = {};
      return (
        "" !== o.protocol
          ? ((i.protocol = o.protocol),
            (i.authority = o.authority),
            (i.path = ui(o.path)),
            (i.query = o.query))
          : ("" !== o.authority
              ? ((i.authority = o.authority),
                (i.path = ui(o.path)),
                (i.query = o.query))
              : ("" === o.path
                  ? ((i.path = r.path),
                    "" !== o.query ? (i.query = o.query) : (i.query = r.query))
                  : (eo(o.path, "/")
                      ? (i.path = ui(o.path))
                      : ((i.path = ci(r.path, o.path, t.authority)),
                        (i.path = ui(i.path))),
                    (i.query = o.query)),
                (i.authority = r.authority)),
            (i.protocol = r.protocol)),
        (i.anchor = o.anchor),
        i
      );
    },
    fi = function(t, e) {
      var n = si(t, e);
      return ti(n);
    };
  function li(i) {
    var t,
      e,
      n,
      r,
      d =
        ((t = i.url),
        (e = t.lastIndexOf("/")),
        (n = 0 < e ? t.substr(0, e) : t),
        (r = void 0 === i.basePath ? n : i.basePath),
        no(r, "/") ? r : r + "/"),
      o = function(t, e, f) {
        var n,
          r,
          l = Qo.getFilename(t, e),
          o =
            ((n = Qo.buildData("image", t, l).get("image")),
            { type: hr.Blob, data: n });
        ((r = {
          url: i.url,
          body: o,
          responseType: hr.Text,
          credentials: !0 === i.credentials
        }),
        Ko(ut({}, r, { method: "post" }))).get(function(t) {
          t.fold(
            function(t) {
              f(
                Fo.error(Qo.failureObject(t.message, t.status, t.responseText))
              );
            },
            function(e) {
              var n, t, r, o;
              try {
                var i = JSON.parse(e);
                if (!U(i.location))
                  return (
                    (t = "JSON response did not contain a string location"),
                    (r = 500),
                    (o = e),
                    void f(Fo.error(Qo.failureObject(t, r, o)))
                  );
                n = i.location;
              } catch (t) {
                n = e;
              }
              var a,
                u,
                c,
                s =
                  ((a = l),
                  (u = n.split(/\s+/)),
                  (c = 1 === u.length && "" !== u[0] ? u[0] : a),
                  fi(d, c));
              f(Fo.value({ location: s }));
            }
          );
        });
      };
    return {
      upload: function(t, e, n) {
        var r = t.imageresult();
        Xt(r).then(function(t) {
          o(t, e, n);
        });
      }
    };
  }
  lr("id", "filename", "blob", "base64");
  var di = function(t) {
      return li(t);
    },
    mi = gt([
      { blob: ["id", "imageresult", "objurl"] },
      { url: ["id", "url", "raw"] }
    ]),
    pi = ni(mi, {
      cata: function(t, e, n) {
        return t.fold(e, n);
      }
    }),
    gi = function(t, e) {
      var n = ge(t, e);
      return void 0 === n || "" === n ? [] : n.split(" ");
    },
    vi = function(t) {
      return void 0 !== t.dom().classList;
    },
    hi = function(t) {
      return gi(t, "class");
    },
    yi = function(t, e) {
      return (
        (o = e),
        (i = gi((n = t), (r = "class")).concat([o])),
        me(n, r, i.join(" ")),
        !0
      );
      var n, r, o, i;
    },
    bi = function(t, e) {
      return (
        (o = e),
        0 <
        (i = Z(gi((n = t), (r = "class")), function(t) {
          return t !== o;
        })).length
          ? me(n, r, i.join(" "))
          : he(n, r),
        !1
      );
      var n, r, o, i;
    },
    Ti = function(t, e) {
      vi(t) ? t.dom().classList.add(e) : yi(t, e);
    },
    xi = function(t, e) {
      var n;
      vi(t) ? t.dom().classList.remove(e) : bi(t, e);
      0 === (vi((n = t)) ? n.dom().classList : hi(n)).length && he(n, "class");
    },
    Ei = function(t, e) {
      return vi(t) && t.dom().classList.contains(e);
    },
    wi = function(e, t) {
      K(t, function(t) {
        Ti(e, t);
      });
    },
    Ii = function(t) {
      return vi(t)
        ? (function(t) {
            for (
              var e = t.dom().classList, n = new Array(e.length), r = 0;
              r < e.length;
              r++
            )
              n[r] = e.item(r);
            return n;
          })(t)
        : hi(t);
    },
    Si = function(e) {
      return function(t) {
        return Ei(t, e);
      };
    };
  var Li = function(t, e, n) {
      for (var r = t.dom(), o = H(n) ? n : h(!1); r.parentNode; ) {
        r = r.parentNode;
        var i = be.fromDom(r);
        if (e(i)) return F.some(i);
        if (o(i)) break;
      }
      return F.none();
    },
    Ni = function(t, e) {
      return tt(t.dom().childNodes, function(t) {
        return e(be.fromDom(t));
      }).map(be.fromDom);
    },
    _i = function(t, o) {
      var i = function(t) {
        for (var e = 0; e < t.childNodes.length; e++) {
          var n = be.fromDom(t.childNodes[e]);
          if (o(n)) return F.some(n);
          var r = i(t.childNodes[e]);
          if (r.isSome()) return r;
        }
        return F.none();
      };
      return i(t.dom());
    },
    Ci = function(t, e, n) {
      return Li(
        t,
        function(t) {
          return po(t, e);
        },
        n
      );
    },
    Oi = function(t, e) {
      return (
        (n = e),
        (o = void 0 === (r = t) ? g.document : r.dom()),
        go(o) ? F.none() : F.from(o.querySelector(n)).map(be.fromDom)
      );
      var n, r, o;
    },
    Di = function(t, e, n) {
      return (
        (r = Ci),
        (a = n),
        po((o = t), (i = e)) ? F.some(o) : H(a) && a(o) ? F.none() : r(o, i, a)
      );
      var r, o, i, a;
    },
    Pi = lr("image", "blobInfo"),
    Ai = gt([
      { failure: ["error"] },
      { success: ["result", "images", "blob"] }
    ]),
    ki = function(t, e, n, r, o) {
      var i = zt(n),
        a = t.lookupByData(i).getOrThunk(function() {
          return t.add(e, n, r);
        });
      return me(o, _r.blobId(), a.id()), Pi(o, a);
    },
    Mi = function(e, n) {
      return e.get(n).fold(
        function() {
          return Fo.error("Internal error with blob cache");
        },
        function(t) {
          return e.remove(n), Fo.value(t);
        }
      );
    },
    Ri = function(t, e, n) {
      var r = t.isActive(e);
      return (
        t.register(n, e), Ti(n, _r.uploadInProgress()), r ? F.none() : F.some(e)
      );
    },
    Fi = function(t, n, a, r, u, e, c) {
      var s = function() {
        g.console.error("Internal error with blob cache", u),
          c(Ai.failure({ status: h(666) }));
      };
      t.upload(e, u, function(t) {
        var e,
          i = n.findById(r, u);
        K(
          i,
          ((e = _r.uploadInProgress()),
          function(t) {
            xi(t, e);
          })
        ),
          t.fold(
            function(t) {
              c(Ai.failure(t));
            },
            function(e) {
              var t, n, r, o;
              ((t = a),
              (n = i),
              (r = u),
              (o = e),
              K(n, function(t) {
                me(t, "src", o.location), he(t, _r.blobId());
              }),
              Mi(t, r)).fold(s, function(t) {
                c(Ai.success(e, i, t));
              });
            }
          ),
          n.report(u, i, t.isValue());
      });
    },
    ji = function(o, i, t) {
      return it(t, function(t) {
        return pi.cata(
          t,
          function(e, n, r) {
            return Oi(i, 'img[src="' + r + '"]').fold(
              function() {
                return [
                  Fo.error(
                    "Image that was just inserted could not be found: " + r
                  )
                ];
              },
              function(t) {
                return [Fo.value(ki(o, e, n, r, t))];
              }
            );
          },
          h([])
        );
      });
    },
    Ui = function(t, o, e) {
      var n = t.findAll(e);
      return t.inProgress()
        ? []
        : z(n, function(t) {
            return (
              (e = o),
              (r = ge((n = t), _r.blobId())),
              e.get(r).fold(
                function() {
                  return Fo.error(r);
                },
                function(t) {
                  return Fo.value(Pi(n, t));
                }
              )
            );
            var e, n, r;
          });
    },
    Bi = function(t) {
      return parseInt(t, 10);
    },
    Yi = function(t, e, n) {
      return { major: h(t), minor: h(e), patch: h(n) };
    },
    Wi = {
      getTinymceVersion: function() {
        var t,
          e,
          n = [tinymce.majorVersion, tinymce.minorVersion].join(".");
        return (
          (t = n
            .split(".")
            .slice(0, 3)
            .join(".")),
          (e = /([0-9]+)\.([0-9]+)\.([0-9]+)(?:(\-.+)?)/.exec(t))
            ? Yi(Bi(e[1]), Bi(e[2]), Bi(e[3]))
            : Yi(0, 0, 0)
        );
      }
    };
  function Hi(c) {
    var s = function(t, e) {
      return h(
        4 === (o = Wi.getTinymceVersion()).major() && o.minor() < 6
          ? t
          : t +
              "." +
              ((n = e.toLowerCase()),
              (r = {
                "image/jpeg": "jpg",
                "image/jpg": "jpg",
                "image/gif": "gif",
                "image/png": "png"
              }).hasOwnProperty(n)
                ? r[n]
                : "dat")
      );
      var n, r, o;
    };
    return {
      importImages: function(t) {
        var e = it(t, function(t) {
          return ht.cata(
            t,
            function(t, e, n) {
              var r,
                o,
                i,
                a,
                u = zt(e);
              return [
                ((r = t),
                (o = e),
                (i = u),
                (a = n),
                St.nu(function(e) {
                  Gt(o).then(function(t) {
                    c.editorUpload.blobCache.add({
                      id: h(r),
                      name: h(r),
                      filename: s(r, t.type),
                      blob: h(t),
                      base64: h(i.split(",")[1]),
                      blobUri: h(a),
                      uri: h(null)
                    }),
                      e(t);
                  });
                }))
              ];
            },
            h([])
          );
        });
        return Nt(e);
      },
      uploadImages: function() {
        c.uploadImages();
      },
      prepareImages: _,
      getLocalURL: function(t, e, n) {
        return zt(e);
      }
    };
  }
  var qi = function(t, e) {
      var n = (e || g.document).createElement("div");
      return (n.innerHTML = t), So(be.fromDom(n));
    },
    $i = function(e, n) {
      To(e).each(function(t) {
        t.dom().insertBefore(n.dom(), e.dom());
      });
    },
    Vi = function(t, e) {
      wo(t).fold(
        function() {
          To(t).each(function(t) {
            Gi(t, e);
          });
        },
        function(t) {
          $i(t, e);
        }
      );
    },
    Xi = function(e, n) {
      Lo(e).fold(
        function() {
          Gi(e, n);
        },
        function(t) {
          e.dom().insertBefore(n.dom(), t.dom());
        }
      );
    },
    Gi = function(t, e) {
      t.dom().appendChild(e.dom());
    },
    zi = function(t, e) {
      $i(t, e), Gi(e, t);
    },
    Ki = function(r, o) {
      K(o, function(t, e) {
        var n = 0 === e ? r : o[e - 1];
        Vi(n, t);
      });
    },
    Ji = function(e, t) {
      K(t, function(t) {
        Gi(e, t);
      });
    },
    Zi = function(t) {
      xi(t, _r.uploadInProgress());
    },
    Qi = function(t) {
      for (var e = 0; e < t.undoManager.data.length; e++) {
        var n = t.undoManager.data[e].content,
          r = be.fromTag("div");
        Ji(r, qi(n));
        var o = Co(r, "." + _r.uploadInProgress());
        K(o, Zi), (t.undoManager.data[e].content = r.dom().innerHTML);
      }
    },
    ta = function(t, e, n) {
      for (var r = 0; r < t.undoManager.data.length; r++)
        t.undoManager.data[r].content = t.undoManager.data[r].content
          .split(e.objurl())
          .join(n.location);
    },
    ea = {
      showDialog: function(t, e) {
        var n,
          r = {
            title: "Error",
            spacing: 10,
            padding: 10,
            items: [{ type: "container", html: e }],
            buttons: [
              {
                text: "Ok",
                onclick: function() {
                  n.close();
                }
              }
            ]
          };
        n = t.windowManager.open(r);
      }
    },
    na = function(r, t) {
      var o,
        e,
        i,
        a,
        u,
        n,
        c = vr(),
        s = Ao(),
        f =
          ((o = r),
          (e = t.url),
          (i = ea),
          (a = function() {
            return (
              xe.translate("error.code.images.not.found") +
              e +
              xe.translate("error.full.stop")
            );
          }),
          (u = function() {
            return (
              xe.translate("error.imageupload") +
              e +
              xe.translate("error.full.stop")
            );
          }),
          (n = function(t) {
            var e = t.status(),
              n = 0 === e || 400 <= e || e < 500 ? a : u;
            i.showDialog(o, n());
          }),
          {
            instance: function() {
              return (
                (t = n),
                (e = !1),
                function() {
                  e || ((e = !0), t.apply(null, arguments));
                }
              );
              var t, e;
            }
          }),
        l = di(t),
        d = function() {
          return be.fromDom(r.getBody());
        },
        m = function(e, t, n) {
          K(t, function(t) {
            me(t, "data-mce-src", e.location);
          }),
            ta(r, n, e);
        };
      s.events.complete.bind(function(t) {
        Qi(r);
      });
      var p = function(o, i) {
        Ri(s, o.blobInfo().id(), o.image()).each(function(t) {
          var e, n, r;
          (e = t),
            (n = o.blobInfo()),
            (r = i),
            Fi(l, s, c, d(), e, n, function(t) {
              t.fold(function(t) {
                r(t);
              }, m);
            });
        });
      };
      return {
        importImages: function() {
          return St.pure([]);
        },
        uploadImages: function(t) {
          var e, n, r, o, i;
          (e = f.instance()),
            (n = Ui(s, c, d())),
            K(n, function(t) {
              t.fold(
                function(t) {
                  s.report(t, F.none(), !1);
                },
                function(t) {
                  p(t, e);
                }
              );
            }),
            (r = t),
            (o = f.instance()),
            (i = ji(c, d(), r)),
            K(i, function(t) {
              t.fold(
                function(t) {
                  console.error(t);
                },
                function(t) {
                  p(t, o);
                }
              );
            });
        },
        prepareImages: _,
        getLocalURL: function(t, e, n) {
          return n;
        }
      };
    },
    ra = function(o) {
      var t = Hi(o);
      return {
        importImages: function() {
          return St.pure([]);
        },
        uploadImages: _,
        prepareImages: function(t) {
          K(t, function(t) {
            ht.cata(
              t,
              function(t, e, n) {
                var r = zt(e);
                K(o.dom.select('img[src="' + n + '"]'), function(t) {
                  o.dom.setAttrib(t, "src", r);
                });
              },
              _
            );
          });
        },
        getLocalURL: t.getLocalURL
      };
    };
  function oa(t) {
    return void 0 !== t.uploadImages
      ? Hi(t)
      : (function(t) {
          if (a(t)) {
            var e = {
              url: t.settings.images_upload_url,
              basePath: t.settings.images_upload_base_path,
              credentials: t.settings.images_upload_credentials
            };
            return na(t, e);
          }
          return ra(t);
        })(t);
  }
  var ia = function(e, r, t, n) {
      var o,
        i,
        a,
        u,
        c,
        s = e.selection,
        f = e.dom,
        l = e.getBody();
      if (
        ((c = t.isText()),
        t.reset(),
        n.clipboardData && n.clipboardData.getData("text/html"))
      ) {
        n.preventDefault();
        var d = n.clipboardData.getData("text/html"),
          m = d.match(/<html[\s\S]+<\/html>/i),
          p = null === m ? d : m[0];
        return r(p);
      }
      if (!f.get("_mcePaste")) {
        if (
          ((o = f.add(
            l,
            "div",
            { id: "_mcePaste", class: "mcePaste" },
            '\ufeff<br _mce_bogus="1">'
          )),
          (u =
            l !== e.getDoc().body
              ? f.getPos(e.selection.getStart(), l).y
              : l.scrollTop),
          f.setStyles(o, {
            position: "absolute",
            left: -1e4,
            top: u,
            width: 1,
            height: 1,
            overflow: "hidden"
          }),
          tinymce.isIE)
        )
          return (
            (a = f.doc.body.createTextRange()).moveToElementText(o),
            a.execCommand("Paste"),
            f.remove(o),
            "\ufeff" === o.innerHTML
              ? (e.execCommand("mcePasteWord"), void n.preventDefault())
              : (r(c ? o.innerText : o.innerHTML), tinymce.dom.Event.cancel(n))
          );
        var g = function(t) {
          t.preventDefault();
        };
        if (
          (f.bind(e.getDoc(), "mousedown", g),
          f.bind(e.getDoc(), "keydown", g),
          tinymce.isGecko &&
            (a = e.selection.getRng(!0)).startContainer === a.endContainer &&
            3 === a.startContainer.nodeType)
        ) {
          var v = f.select("p,h1,h2,h3,h4,h5,h6,pre", o);
          1 === v.length && f.remove(v.reverse(), !0);
        }
        (i = e.selection.getRng()),
          (o = o.firstChild),
          (a = e.getDoc().createRange()).setStart(o, 0),
          a.setEnd(o, 1),
          s.setRng(a),
          window.setTimeout(function() {
            var n = "",
              t = f.select("div.mcePaste");
            we.each(t, function(t) {
              var e = t.firstChild;
              e &&
                "DIV" === e.nodeName &&
                e.style.marginTop &&
                e.style.backgroundColor &&
                f.remove(e, 1),
                we.each(f.select("div.mcePaste", t), function(t) {
                  f.remove(t, 1);
                }),
                we.each(f.select("span.Apple-style-span", t), function(t) {
                  f.remove(t, 1);
                }),
                we.each(f.select("br[_mce_bogus]", t), function(t) {
                  f.remove(t);
                }),
                (n += t.innerHTML);
            }),
              we.each(t, function(t) {
                f.remove(t);
              }),
              i && s.setRng(i),
              r(n),
              f.unbind(e.getDoc(), "mousedown", g),
              f.unbind(e.getDoc(), "keydown", g);
          }, 0);
      }
    },
    aa = {
      getOnPasteFunction: function(e, n, r) {
        return function(t) {
          ia(e, n, r, t);
        };
      },
      getOnKeyDownFunction: function(e, n, r) {
        return function(t) {
          (tinymce.isOpera || 0 < navigator.userAgent.indexOf("Firefox/2")) &&
            (((tinymce.isMac ? t.metaKey : t.ctrlKey) && 86 === t.keyCode) ||
              (t.shiftKey && 45 === t.keyCode)) &&
            ia(e, n, r, t);
        };
      }
    };
  function ua() {
    var o = {};
    return {
      getOrSetIndexed: function(t, e) {
        return void 0 !== o[t] ? o[t] : ((n = t), (r = e()), (o[n] = r));
        var n, r;
      },
      waitForLoad: function() {
        var t = mt(o);
        return Nt(t);
      }
    };
  }
  var ca = function(u) {
      var c = y(ie, u);
      ie("callbacks", c());
      var e = function(t, e) {
          var n,
            r,
            o,
            i = c(),
            a =
              ((r = void 0 === (n = i).count ? 0 : n.count),
              (o = "callback_" + r),
              (n.count = r + 1),
              o);
          return (
            (i.callbacks[a] = function() {
              e || s(a), t.apply(null, arguments);
            }),
            u + ".callbacks." + a
          );
        },
        s = function(t) {
          var e = t.substring(t.lastIndexOf(".") + 1),
            n = c();
          void 0 !== n.callbacks[e] && delete n.callbacks[e];
        };
      return {
        ephemeral: function(t) {
          return e(t, !1);
        },
        permanent: function(t) {
          return e(t, !0);
        },
        unregister: s
      };
    },
    sa = function(m, p) {
      return function(t) {
        if (m(t)) {
          var e,
            n,
            r,
            o,
            i,
            a,
            u,
            c = be.fromDom(t.target),
            s = function() {
              t.stopPropagation();
            },
            f = function() {
              t.preventDefault();
            },
            l = v(f, s),
            d =
              ((e = c),
              (n = t.clientX),
              (r = t.clientY),
              (o = s),
              (i = f),
              (a = l),
              (u = t),
              {
                target: h(e),
                x: h(n),
                y: h(r),
                stop: o,
                prevent: i,
                kill: a,
                raw: h(u)
              });
          p(d);
        }
      };
    },
    fa = function(t, e, n, r) {
      return (
        (o = t),
        (i = e),
        (a = !1),
        (u = sa(n, r)),
        o.dom().addEventListener(i, u, a),
        { unbind: y(la, o, i, u, a) }
      );
      var o, i, a, u;
    },
    la = function(t, e, n, r) {
      t.dom().removeEventListener(e, n, r);
    },
    da = h(!0),
    ma = function(t, e, n) {
      return fa(t, e, da, n);
    },
    pa = ca("ephox.henchman.features"),
    ga = function(i) {
      return Et.nu(function(e) {
        var t = function() {
            r.unbind(), o.unbind();
          },
          n = be.fromTag("script");
        me(n, "src", i),
          me(n, "type", "text/javascript"),
          me(n, "async", "async"),
          me(
            n,
            "data-main",
            pa.ephemeral(function(t) {
              e(Fo.value(t));
            })
          );
        var r = ma(n, "error", function() {
            t(), e(Fo.error("Error loading external script tag " + i));
          }),
          o = ma(n, "load", t);
        Gi(be.fromDom(g.document.head), n);
      });
    },
    va = function(t, e) {
      var n,
        r,
        o,
        i = e || be.fromDom(g.document),
        a = be.fromTag("link", i.dom());
      return (
        pe(a, { rel: "stylesheet", type: "text/css", href: t }),
        (n = i),
        (r = a),
        (o = be.fromDom(n.dom().head)),
        Gi(o, r),
        a
      );
    },
    ha = function(o, i) {
      return Et.nu(function(e) {
        var n = function(t) {
            K(r, function(t) {
              t.unbind();
            }),
              e(
                t.fold(function(t) {
                  return Fo.error(
                    t + 'Unable to download editor stylesheets from "' + o + '"'
                  );
                }, Fo.value)
              );
          },
          t = va(o),
          r = [
            ma(t, "load", function(t) {
              !(function(t) {
                try {
                  var e = t.target().dom().sheet.cssRules;
                  return B(e) && 0 === e.length;
                } catch (t) {}
                return !1;
              })(t)
                ? i(n)
                : n(Fo.error(""));
            }),
            ma(t, "error", y(n, Fo.error("")))
          ];
      });
    };
  var ya,
    ba,
    Ta =
      ((ya = ua()),
      {
        preload: function() {
          ba().get(m);
        },
        addStylesheet: function(t, e) {
          return ya.getOrSetIndexed(t, function() {
            return ha(t, e);
          });
        },
        addScript: function(t, e) {
          return ya.getOrSetIndexed(t, function() {
            return ga(t).map(e);
          });
        },
        waitForLoad: (ba = function() {
          return ya.waitForLoad();
        })
      }),
    xa = function(t, e) {
      return Ta.addScript(t, e);
    },
    Ea = fo.detect(),
    wa = Ea.deviceType.isiOS() || Ea.deviceType.isAndroid(),
    Ia = h({ isSupported: h(!1), cleanDocument: h(Ho("not supported")) }),
    Sa = wa
      ? Ia
      : function(t) {
          var r = xa(t + "/wordimport.js", m);
          r.get(function(t) {
            t.fold(function(t) {
              g.console.error("Unable to load word import: ", t);
            }, _);
          });
          return {
            isSupported: h(!0),
            cleanDocument: function(e, n) {
              return r.map(function(t) {
                return t.map(function(t) {
                  return t.cleanDocument(e, n);
                });
              });
            }
          };
        };
  function La(t, e, n, r) {
    var o = ho(t, n) && e === r;
    return {
      startContainer: h(t),
      startOffset: h(e),
      endContainer: h(n),
      endOffset: h(r),
      collapsed: h(o)
    };
  }
  var Na = function(t) {
      (t.dom().textContent = ""),
        K(So(t), function(t) {
          _a(t);
        });
    },
    _a = function(t) {
      var e = t.dom();
      null !== e.parentNode && e.parentNode.removeChild(e);
    },
    Ca = function(t) {
      var e,
        n = So(t);
      0 < n.length &&
        ((e = t),
        K(n, function(t) {
          $i(e, t);
        })),
        _a(t);
    };
  var Oa,
    Da,
    Pa = function() {
      var t = !1;
      return {
        isBlocked: function() {
          return t;
        },
        block: function() {
          t = !0;
        },
        unblock: function() {
          t = !1;
        }
      };
    },
    Aa = function(t, e) {
      return { control: t, instance: e };
    },
    ka = {
      tap: function(n) {
        var r = Pa();
        return Aa(r, function() {
          for (var t = [], e = 0; e < arguments.length; e++)
            t[e] = arguments[e];
          r.isBlocked() || n.apply(null, t);
        });
      }
    },
    Ma = fo.detect(),
    Ra = Ma.browser.isIE() && Ma.browser.version.major <= 10,
    Fa = Ra
      ? function(t, e, n) {
          e.control.block(),
            t.dom().execCommand("paste"),
            n(),
            e.control.unblock();
        }
      : function(t, e, n) {
          setTimeout(n, 1);
        },
    ja = {
      willBlock: h(Ra),
      run: function(t, e, n) {
        return Fa(t, e, n);
      }
    },
    Ua = ["b", "i", "u", "sub", "sup", "strike"],
    Ba = function(t) {
      K(So(t), function(t) {
        var e;
        fe((e = t)) && !e.dom().hasChildNodes() && X(Ua, ae(e)) && _a(t);
      });
    },
    Ya = function(t, o) {
      var e = So(t);
      K(e, function(t) {
        var e, n, r;
        o(t) &&
          ((n = So((e = t))),
          (r = be.fromTag("div", bo(e).dom())),
          Ji(r, n),
          $i(e, r),
          _a(e));
      });
    },
    Wa = {
      consolidate: function(n, t) {
        wo(n)
          .filter(t)
          .each(function(t) {
            var e = So(t);
            Ji(n, e), _a(t);
          }),
          Ya(n, t),
          Ba(n);
      }
    },
    Ha = { resolve: wr("ephox-sloth").resolve }.resolve("bin"),
    qa = { bin: h(Ha) },
    $a = function(t) {
      return void 0 !== t.style && H(t.style.getPropertyValue);
    },
    Va = function(t, e, n) {
      if (!U(n))
        throw (g.console.error(
          "Invalid call to CSS.set. Property ",
          e,
          ":: Value ",
          n,
          ":: Element ",
          t
        ),
        new Error("CSS value must be a string: " + n));
      $a(t) && t.style.setProperty(e, n);
    },
    Xa = function(t, e, n) {
      var r = t.dom();
      Va(r, e, n);
    },
    Ga = function(t, e) {
      var n = t.dom();
      st(e, function(t, e) {
        Va(n, e, t);
      });
    },
    za = function(t, e) {
      var n = t.dom(),
        r = g.window.getComputedStyle(n).getPropertyValue(e),
        o = "" !== r || Or(t) ? r : Ka(n, e);
      return null === o ? void 0 : o;
    },
    Ka = function(t, e) {
      return $a(t) ? t.style.getPropertyValue(e) : "";
    },
    Ja = function(t, e) {
      var n = t.dom(),
        r = Ka(n, e);
      return F.from(r).filter(function(t) {
        return 0 < t.length;
      });
    },
    Za = function(t, e) {
      var n,
        r,
        o = t.dom();
      (r = e),
        $a((n = o)) && n.style.removeProperty(r),
        ve(t, "style") && "" === ro(ge(t, "style")) && he(t, "style");
    },
    Qa = function(t) {
      return "rtl" === za(t, "direction") ? "rtl" : "ltr";
    },
    tu = function(t) {
      return t.dom().innerHTML;
    },
    eu = function(t, e) {
      var n = bo(t).dom(),
        r = be.fromDom(n.createDocumentFragment()),
        o = qi(e, n);
      Ji(r, o), Na(t), Gi(t, r);
    },
    nu = qa.bin(),
    ru = nu + Ot(""),
    ou =
      ((Oa = "-100000px"),
      (Da = "100000px"),
      function(t) {
        return "rtl" === Qa(t) ? Da : Oa;
      });
  function iu(e, t, n) {
    var r = (function(e, t) {
        var n = be.fromTag("div");
        pe(n, t),
          pe(n, { contenteditable: "true", "aria-hidden": "true" }),
          Ga(n, {
            position: "fixed",
            top: "0px",
            width: "100px",
            height: "100px",
            overflow: "hidden",
            opacity: "0"
          }),
          wi(n, [nu, ru]);
        var r = function(t) {
          return Ei(t, ru);
        };
        return {
          attach: function(t) {
            Na(n), Xa(n, "left", ou(t)), Gi(t, n);
          },
          focus: function() {
            Ci(n, "body").each(function(t) {
              e.toOff(t, n);
            });
          },
          contents: function() {
            return (
              Wa.consolidate(n, r),
              lr("elements", "html", "container")(So(n), tu(n), n)
            );
          },
          container: function() {
            return n;
          },
          detach: function() {
            _a(n);
          }
        };
      })(e, n),
      o = function() {
        e.cleanup();
        var t = r.contents();
        r.detach(), a.trigger.after(t.elements(), t.html(), r.container());
      },
      i = ka.tap(function() {
        a.trigger.before(), r.attach(t), r.focus(), ja.run(bo(t), i, o);
      }),
      a = Tr.create({
        before: br([]),
        after: br(["elements", "html", "container"])
      }),
      u = _;
    return {
      instance: h(function() {
        i.instance();
      }),
      destroy: u,
      events: a.registry
    };
  }
  var au = function(t, e, n) {
      var r,
        o,
        i = t.document.createRange();
      return (
        (r = i),
        e.fold(
          function(t) {
            r.setStartBefore(t.dom());
          },
          function(t, e) {
            r.setStart(t.dom(), e);
          },
          function(t) {
            r.setStartAfter(t.dom());
          }
        ),
        (o = i),
        n.fold(
          function(t) {
            o.setEndBefore(t.dom());
          },
          function(t, e) {
            o.setEnd(t.dom(), e);
          },
          function(t) {
            o.setEndAfter(t.dom());
          }
        ),
        i
      );
    },
    uu = function(t, e, n, r, o) {
      var i = t.document.createRange();
      return i.setStart(e.dom(), n), i.setEnd(r.dom(), o), i;
    },
    cu = gt([
      { ltr: ["start", "soffset", "finish", "foffset"] },
      { rtl: ["start", "soffset", "finish", "foffset"] }
    ]),
    su = function(t, e, n) {
      return e(
        be.fromDom(n.startContainer),
        n.startOffset,
        be.fromDom(n.endContainer),
        n.endOffset
      );
    },
    fu = function(t, e) {
      var o,
        n,
        r,
        i =
          ((o = t),
          e.match({
            domRange: function(t) {
              return { ltr: h(t), rtl: F.none };
            },
            relative: function(t, e) {
              return {
                ltr: Cr(function() {
                  return au(o, t, e);
                }),
                rtl: Cr(function() {
                  return F.some(au(o, e, t));
                })
              };
            },
            exact: function(t, e, n, r) {
              return {
                ltr: Cr(function() {
                  return uu(o, t, e, n, r);
                }),
                rtl: Cr(function() {
                  return F.some(uu(o, n, r, t, e));
                })
              };
            }
          }));
      return (r = (n = i).ltr()).collapsed
        ? n
            .rtl()
            .filter(function(t) {
              return !1 === t.collapsed;
            })
            .map(function(t) {
              return cu.rtl(
                be.fromDom(t.endContainer),
                t.endOffset,
                be.fromDom(t.startContainer),
                t.startOffset
              );
            })
            .getOrThunk(function() {
              return su(0, cu.ltr, r);
            })
        : su(0, cu.ltr, r);
    },
    lu = { create: lr("start", "soffset", "finish", "foffset") },
    du = function(t, e) {
      for (var n = 0; n < t.length; n++) {
        var r = e(t[n], n);
        if (r.isSome()) return r;
      }
      return F.none();
    },
    mu = function(t, e, n) {
      return e >= t.left && e <= t.right && n >= t.top && n <= t.bottom;
    };
  function pu(n, r) {
    var e = function(t) {
      return n(t) ? F.from(t.dom().nodeValue) : F.none();
    };
    return {
      get: function(t) {
        if (!n(t))
          throw new Error("Can only get " + r + " value of a " + r + " node");
        return e(t).getOr("");
      },
      getOption: e,
      set: function(t, e) {
        if (!n(t))
          throw new Error(
            "Can only set raw " + r + " value of a " + r + " node"
          );
        t.dom().nodeValue = e;
      }
    };
  }
  var gu = pu(le, "text"),
    vu = function(t) {
      return gu.get(t);
    },
    hu = function(t, e) {
      gu.set(t, e);
    },
    yu = function(n, r, t, e, o) {
      var i = function(t) {
          var e = n.dom().createRange();
          return e.setStart(r.dom(), t), e.collapse(!0), e;
        },
        a = vu(r).length,
        u = (function(t, e, n, r, o) {
          if (0 === o) return 0;
          if (e === r) return o - 1;
          for (var i = r, a = 1; a < o; a++) {
            var u = t(a),
              c = Math.abs(e - u.left);
            if (n <= u.bottom) {
              if (n < u.top || i < c) return a - 1;
              i = c;
            }
          }
          return 0;
        })(
          function(t) {
            return i(t).getBoundingClientRect();
          },
          t,
          e,
          o.right,
          a
        );
      return i(u);
    },
    bu = function(t, e, n, r) {
      return le(e)
        ? (function(e, n, r, o) {
            var t = e.dom().createRange();
            t.selectNode(n.dom());
            var i = t.getClientRects();
            return du(i, function(t) {
              return mu(t, r, o) ? F.some(t) : F.none();
            }).map(function(t) {
              return yu(e, n, r, o, t);
            });
          })(t, e, n, r)
        : ((i = e),
          (a = n),
          (u = r),
          (c = (o = t).dom().createRange()),
          (s = So(i)),
          du(s, function(t) {
            return (
              c.selectNode(t.dom()),
              mu(c.getBoundingClientRect(), a, u) ? bu(o, t, a, u) : F.none()
            );
          }));
      var o, i, a, u, c, s;
    },
    Tu = function(t) {
      return ((e = t), gu.getOption(e))
        .filter(function(t) {
          return 0 !== t.trim().length || -1 < t.indexOf("\xa0");
        })
        .isSome();
      var e;
    },
    xu = ["img", "br"],
    Eu = function(t) {
      return Tu(t) || X(xu, ae(t));
    },
    wu = function(t) {
      return _i(t, Eu);
    },
    Iu = function(t) {
      return Su(t, Eu);
    },
    Su = function(t, i) {
      var a = function(t) {
        for (var e = So(t), n = e.length - 1; 0 <= n; n--) {
          var r = e[n];
          if (i(r)) return F.some(r);
          var o = a(r);
          if (o.isSome()) return o;
        }
        return F.none();
      };
      return a(t);
    },
    Lu = function(t, e) {
      return e - t.left < t.right - e;
    },
    Nu = function(t, e, n) {
      var r = t.dom().createRange();
      return r.selectNode(e.dom()), r.collapse(n), r;
    },
    _u = function(e, t, n) {
      var r = e.dom().createRange();
      r.selectNode(t.dom());
      var o = r.getBoundingClientRect(),
        i = Lu(o, n);
      return (!0 === i ? wu : Iu)(t).map(function(t) {
        return Nu(e, t, i);
      });
    },
    Cu = function(t, e, n) {
      var r = e.dom().getBoundingClientRect(),
        o = Lu(r, n);
      return F.some(Nu(t, e, o));
    },
    Ou = function(t, e, n, r) {
      var o = t.dom().createRange();
      o.selectNode(e.dom());
      var i = o.getBoundingClientRect();
      return (function(t, e, n, r) {
        var o = t.dom().createRange();
        o.selectNode(e.dom());
        var i = o.getBoundingClientRect(),
          a = Math.max(i.left, Math.min(i.right, n)),
          u = Math.max(i.top, Math.min(i.bottom, r));
        return bu(t, e, a, u);
      })(
        t,
        e,
        Math.max(i.left, Math.min(i.right, n)),
        Math.max(i.top, Math.min(i.bottom, r))
      );
    },
    Du =
      (document.caretPositionFromPoint || document.caretRangeFromPoint,
      gt([
        { before: ["element"] },
        { on: ["element", "offset"] },
        { after: ["element"] }
      ])),
    Pu = {
      before: Du.before,
      on: Du.on,
      after: Du.after,
      cata: function(t, e, n, r) {
        return t.fold(e, n, r);
      },
      getStart: function(t) {
        return t.fold(m, m, m);
      }
    },
    Au = gt([
      { domRange: ["rng"] },
      { relative: ["startSitu", "finishSitu"] },
      { exact: ["start", "soffset", "finish", "foffset"] }
    ]),
    ku = {
      domRange: Au.domRange,
      relative: Au.relative,
      exact: Au.exact,
      exactFromRange: function(t) {
        return Au.exact(t.start(), t.soffset(), t.finish(), t.foffset());
      },
      getWin: function(t) {
        var e,
          n = t.match({
            domRange: function(t) {
              return be.fromDom(t.startContainer);
            },
            relative: function(t, e) {
              return Pu.getStart(t);
            },
            exact: function(t, e, n, r) {
              return t;
            }
          });
        return (e = n), be.fromDom(e.dom().ownerDocument.defaultView);
      },
      range: lu.create
    },
    Mu = function(t, e) {
      var n = ae(t);
      return "input" === n
        ? Pu.after(t)
        : X(["br", "img"], n)
        ? 0 === e
          ? Pu.before(t)
          : Pu.after(t)
        : Pu.on(t, e);
    },
    Ru = function(t, e, n, r) {
      var o = bo(t)
        .dom()
        .createRange();
      return o.setStart(t.dom(), e), o.setEnd(n.dom(), r), o;
    },
    Fu = function(t, e, n, r, o) {
      var i,
        a,
        u = uu(t, e, n, r, o);
      (i = t),
        (a = u),
        F.from(i.getSelection()).each(function(t) {
          t.removeAllRanges(), t.addRange(a);
        });
    },
    ju = function(t, e, n, r, o) {
      var i,
        a,
        u,
        c,
        f,
        s =
          ((i = r), (a = o), (u = Mu(e, n)), (c = Mu(i, a)), ku.relative(u, c));
      fu((f = t), s).match({
        ltr: function(t, e, n, r) {
          Fu(f, t, e, n, r);
        },
        rtl: function(e, n, r, o) {
          var t,
            i,
            a,
            u,
            c,
            s = f.getSelection();
          if (s.setBaseAndExtent) s.setBaseAndExtent(e.dom(), n, r.dom(), o);
          else if (s.extend)
            try {
              (i = e),
                (a = n),
                (u = r),
                (c = o),
                (t = s).collapse(i.dom(), a),
                t.extend(u.dom(), c);
            } catch (t) {
              Fu(f, r, o, e, n);
            }
          else Fu(f, r, o, e, n);
        }
      });
    },
    Uu = function(t) {
      var e,
        n,
        r,
        o,
        i,
        a,
        u = be.fromDom(t.anchorNode),
        c = be.fromDom(t.focusNode);
      return (
        (e = u),
        (n = t.anchorOffset),
        (r = c),
        (o = t.focusOffset),
        (i = Ru(e, n, r, o)),
        (a = ho(e, r) && n === o),
        i.collapsed && !a
          ? F.some(lu.create(u, t.anchorOffset, c, t.focusOffset))
          : (function(t) {
              if (0 < t.rangeCount) {
                var e = t.getRangeAt(0),
                  n = t.getRangeAt(t.rangeCount - 1);
                return F.some(
                  lu.create(
                    be.fromDom(e.startContainer),
                    e.startOffset,
                    be.fromDom(n.endContainer),
                    n.endOffset
                  )
                );
              }
              return F.none();
            })(t)
      );
    },
    Bu = function(t) {
      return F.from(t.getSelection())
        .filter(function(t) {
          return 0 < t.rangeCount;
        })
        .bind(Uu);
    },
    Yu = function(t) {
      return {
        startContainer: t.start,
        startOffset: t.soffset,
        endContainer: t.finish,
        endOffset: t.foffset
      };
    },
    Wu = {
      set: function(t, e) {
        ju(
          t,
          e.startContainer(),
          e.startOffset(),
          e.endContainer(),
          e.endOffset()
        );
      },
      get: function(t) {
        return Bu(t).map(Yu);
      }
    };
  function Hu(a) {
    return function(e) {
      var u,
        r,
        o,
        c,
        n = Tr.create({ after: br(["container"]) }),
        i =
          ((u = Wu),
          (r = be.fromTag("br")),
          (o = F.none()),
          (c = function(t) {
            return bo(t).dom().defaultView;
          }),
          {
            cleanup: function() {
              _a(r);
            },
            toOn: function(i, t) {
              var a = c(t);
              o.each(function(t) {
                var e = No(i),
                  n =
                    ho(i, t.startContainer()) && e < t.startOffset()
                      ? e
                      : t.startOffset,
                  r =
                    ho(i, t.endContainer()) && e < t.endOffset()
                      ? e
                      : t.endOffset,
                  o = La(t.startContainer(), n, t.endContainer(), r);
                u.set(a, o);
              });
            },
            toOff: function(t, e) {
              var n = c(e);
              Gi(e, r), (o = u.get(n, La)), u.set(n, La(r, 0, r, 0));
            }
          }),
        t = iu(i, e, a);
      t.events.after.bind(function(t) {
        i.toOn(e, t.container()), n.trigger.after(t.container());
      });
      return {
        run: function() {
          t.instance()();
        },
        events: n.registry
      };
    };
  }
  var qu = gt([
      { error: ["message"] },
      { paste: ["elements", "correlated"] },
      { cancel: [] },
      { incomplete: ["elements", "correlated", "message"] }
    ]),
    $u = function(t, e, n, r, o) {
      return t.fold(e, n, r, o);
    },
    Vu = {
      error: qu.error,
      paste: qu.paste,
      cancel: qu.cancel,
      incomplete: qu.incomplete,
      cata: $u,
      carry: function(t, r) {
        return $u(t, F.none, F.none, F.none, function(t, e, n) {
          return $u(
            r,
            F.none,
            function(t, e) {
              return F.some(qu.incomplete(t, e, n));
            },
            F.none,
            F.none
          );
        }).getOr(r);
      }
    },
    Xu = [
      "officeStyles",
      "htmlStyles",
      "isWord",
      "isGoogleDocs",
      "proxyBin",
      "isInternal",
      "backgroundAssets"
    ],
    Gu = function(t, n) {
      var r = {};
      return (
        K(Xu, function(e) {
          n[e]()
            .or(t[e]())
            .each(function(t) {
              r[e] = t;
            });
        }),
        zu(r)
      );
    },
    zu = pr([], Xu),
    Ku = pr(["response", "bundle"], []),
    Ju = function(e) {
      return ec(function(t) {
        t(Ku(e));
      });
    },
    Zu = function(t, e) {
      t(Ku(e));
    },
    Qu = function(t) {
      return Ju({ response: t.response(), bundle: t.bundle() });
    },
    tc = function(t) {
      return Ju({ response: Vu.error(t), bundle: zu({}) });
    },
    ec = function(e) {
      var t = function(t) {
          e(t);
        },
        o = ec;
      return {
        get: t,
        map: function(r) {
          return o(function(n) {
            t(function(t) {
              var e = r(t);
              n(e);
            });
          });
        },
        bind: function(n) {
          return o(function(e) {
            t(function(t) {
              n(t).get(e);
            });
          });
        }
      };
    },
    nc = lr("steps", "input", "label", "capture"),
    rc = function(t, e, n) {
      var r;
      return ((r = n),
      du(t, function(e) {
        return e.getAvailable(r).map(function(t) {
          return nc(e.steps(), t, e.label(), e.capture());
        });
      })).getOrThunk(function() {
        var t = e.getAvailable(n);
        return nc(e.steps(), t, e.label(), e.capture());
      });
    },
    oc = function(t, a) {
      return Q(
        t,
        function(t, i) {
          return t.bind(function(t) {
            var r, e, n, o;
            return (
              (e = function() {
                return i(a, t);
              }),
              (n = y(Qu, (r = t))),
              (o = function() {
                return e().map(function(t) {
                  var e = Gu(r.bundle(), t.bundle()),
                    n = Vu.carry(r.response(), t.response());
                  return Ku({ response: n, bundle: e });
                });
              }),
              Vu.cata(r.response(), n, o, n, o)
            );
          });
        },
        Ju({ response: Vu.paste([], []), bundle: zu({}) })
      );
    },
    ic = function(t) {
      return (e = t), (n = !1), be.fromDom(e.dom().cloneNode(n));
      var e, n;
    },
    ac = function(t) {
      return se(t)
        ? ((e = "v:shape"),
          (n = t.dom().nodeValue),
          (r = be.fromTag("div")),
          (o = n.indexOf("]>")),
          (r.dom().innerHTML = n.substr(o + "]>".length)),
          _i(r, function(t) {
            return ae(t) === e;
          }))
        : F.none();
      var e, n, r, o;
    },
    uc = function(t) {
      return Co(t, ".rtf-data-image");
    },
    cc = {
      local: function(t) {
        if (((a = "img"), fe((i = t)) && ae(i) === a)) {
          var e = ge(t, "src");
          if (null != e && eo(e, "file://")) {
            var n = ic(t),
              r = e.split(/[\/\\]/),
              o = r[r.length - 1];
            return (
              me(n, "data-image-id", o),
              he(n, "src"),
              me(n, "data-image-type", "local"),
              Ti(n, "rtf-data-image"),
              F.some(n)
            );
          }
          return F.none();
        }
        return F.none();
        var i, a;
      },
      vshape: function(t) {
        return ac(t).map(function(t) {
          var e = ge(t, "o:spid"),
            n = void 0 === e ? ge(t, "id") : e,
            r = be.fromTag("img");
          return (
            Ti(r, "rtf-data-image"),
            me(r, "data-image-id", n.substr("_x0000_".length)),
            me(r, "data-image-type", "code"),
            Ga(r, { width: za(t, "width"), height: za(t, "height") }),
            r
          );
        });
      },
      find: uc,
      exists: function(t) {
        return 0 < uc(t).length;
      },
      scour: ac
    },
    sc = gt([
      { starts: ["value", "f"] },
      { pattern: ["regex", "f"] },
      { contains: ["value", "f"] },
      { exact: ["value", "f"] },
      { all: [] },
      { not: ["stringMatch"] }
    ]),
    fc = function(t, n) {
      return t.fold(
        function(t, e) {
          return 0 === e(n).indexOf(e(t));
        },
        function(t, e) {
          return t.test(e(n));
        },
        function(t, e) {
          return 0 <= e(n).indexOf(e(t));
        },
        function(t, e) {
          return e(n) === e(t);
        },
        function() {
          return !0;
        },
        function(t) {
          return !fc(t, n);
        }
      );
    },
    lc = {
      starts: sc.starts,
      pattern: sc.pattern,
      contains: sc.contains,
      exact: sc.exact,
      all: sc.all,
      not: sc.not,
      cata: function(t, e, n, r, o, i, a) {
        return t.fold(e, n, r, o, i, a);
      },
      matches: fc,
      caseSensitive: function(t) {
        return t;
      },
      caseInsensitive: function(t) {
        return t.toLowerCase();
      }
    },
    dc = function() {
      return /^(mso-.*|tab-stops|tab-interval|language|text-underline|text-effect|text-line-through|font-color|horiz-align|list-image-[0-9]+|separator-image|table-border-color-(dark|light)|vert-align|vnd\..*)$/;
    },
    mc = function() {
      return /^(font|em|strong|samp|acronym|cite|code|dfn|kbd|tt|b|i|u|s|sub|sup|ins|del|var|span)$/;
    },
    pc = function(t, e, n, r) {
      var o = r.name,
        i = void 0 !== r.condition ? r.condition : h(!0),
        a = void 0 !== r.value ? r.value : lc.all();
      return lc.matches(o, n) && lc.matches(a, e) && i(t);
    },
    gc = function(t, e) {
      var n = ae(t),
        r = e.name,
        o = void 0 !== e.condition ? e.condition : h(!0);
      return lc.matches(r, n) && o(t);
    },
    vc = function(t, e) {
      var n = {};
      return (
        K(t.dom().attributes, function(t) {
          e(t.value, t.name) || (n[t.name] = t.value);
        }),
        n
      );
    },
    hc = function(t, e, n) {
      var r,
        o,
        i = z(t.dom().attributes, function(t) {
          return t.name;
        });
      pt(e) !== i.length &&
        ((r = t),
        (o = e),
        K(i, function(t) {
          he(r, t);
        }),
        st(o, function(t, e) {
          me(r, e, t);
        }));
    },
    yc =
      (h({}),
      function(e) {
        var t = ct(e);
        return z(t, function(t) {
          return t + ": " + e[t];
        }).join("; ");
      }),
    bc = function(r, o) {
      var t = r.dom().style,
        i = {};
      return (
        K(null == t ? [] : t, function(t) {
          var e,
            n = ((e = t), r.dom().style.getPropertyValue(e));
          o(n, t) || (i[t] = n);
        }),
        i
      );
    },
    Tc = function(n, t, e) {
      me(n, "style", "");
      var r = pt(t),
        o = pt(e);
      if (0 === r && 0 === o) he(n, "style");
      else if (0 === r) me(n, "style", yc(e));
      else {
        st(t, function(t, e) {
          Xa(n, e, t);
        });
        var i = ge(n, "style"),
          a = 0 < o ? yc(e) + "; " : "";
        me(n, "style", a + i);
      }
    },
    xc = function(t, e, n) {
      var r,
        o,
        i,
        a = t.dom().getAttribute("style"),
        u =
          ((o = {}),
          (i = null != (r = a) ? r.split(";") : []),
          K(i, function(t) {
            var e = t.split(":");
            2 === e.length && (o[ro(e[0])] = ro(e[1]));
          }),
          o),
        c = {};
      return (
        K(e, function(t) {
          var e = u[t];
          void 0 === e || n(e, t) || (c[t] = e);
        }),
        c
      );
    },
    Ec = ["mso-list"],
    wc = function(t, e) {
      var n = xc(t, Ec, e),
        r = bc(t, e);
      Tc(t, r, n);
    },
    Ic = function(t, e) {
      var n = vc(t, e);
      hc(t, n, {});
    },
    Sc = wc,
    Lc = Ic,
    Nc = function(t, e) {
      wc(be.fromDom(t), e);
    },
    _c = function(t, r, o) {
      t(o, function(e, n) {
        return G(r, function(t) {
          return pc(o, e, n, t);
        });
      });
    },
    Cc = function(t, e) {
      var r = ni({ styles: [], attributes: [], classes: [], tags: [] }, e),
        n = Co(t, "*");
      K(n, function(n) {
        _c(Sc, r.styles, n),
          _c(Lc, r.attributes, n),
          K(r.classes, function(e) {
            var t = ve(n, "class") ? Ii(n) : [];
            K(t, function(t) {
              lc.matches(e.name, t) && xi(n, t);
            });
          });
      });
      var o = Co(t, "*");
      K(o, function(t) {
        G(r.tags, y(gc, t)) && _a(t);
      });
    },
    Oc = function(t, e) {
      var n = ni({ tags: [] }, e),
        r = Co(t, "*");
      K(r, function(t) {
        G(n.tags, y(gc, t)) && Ca(t);
      });
    },
    Dc = function(t, e) {
      var n = ni({ tags: [] }, e),
        r = Co(t, "*");
      K(r, function(e) {
        tt(n.tags, y(gc, e)).each(function(t) {
          t.mutate(e);
        });
      });
    },
    Pc = "startElement",
    Ac = "endElement",
    kc = "comment",
    Mc = function(t, e, n) {
      var r,
        o,
        i,
        a = be.fromDom(t);
      switch (t.nodeType) {
        case 1:
          e ? (r = Ac) : ((r = Pc), Ga(a, n || {})),
            (o =
              "HTML" !== t.scopeName &&
              t.scopeName &&
              t.tagName &&
              t.tagName.indexOf(":") <= 0
                ? (t.scopeName + ":" + t.tagName).toUpperCase()
                : t.tagName);
          break;
        case 3:
          (r = "text"), (i = t.nodeValue);
          break;
        case 8:
          (r = kc), (i = t.nodeValue);
          break;
        default:
          g.console.log(
            "WARNING: Unsupported node type encountered: " + t.nodeType
          );
      }
      return {
        getNode: function() {
          return t;
        },
        tag: function() {
          return o;
        },
        type: function() {
          return r;
        },
        text: function() {
          return i;
        }
      };
    },
    Rc = function(t, e) {
      return Mc(e.createElement(t), !0);
    },
    Fc = Rc("HTML", g.window.document),
    jc = {
      START_ELEMENT_TYPE: Pc,
      END_ELEMENT_TYPE: Ac,
      TEXT_TYPE: "text",
      COMMENT_TYPE: kc,
      FINISHED: Fc,
      token: Mc,
      createStartElement: function(t, e, n, r) {
        var o = r.createElement(t);
        return (
          st(e, function(t, e) {
            o.setAttribute(e, t);
          }),
          Mc(o, !1, n)
        );
      },
      createEndElement: Rc,
      createComment: function(t, e) {
        return Mc(e.createComment(t), !1);
      },
      createText: function(t, e) {
        return Mc(e.createTextNode(t));
      }
    },
    Uc = function(i) {
      var a = i.createDocumentFragment(),
        u = a,
        c = function(t) {
          a.appendChild(t);
        };
      return {
        dom: u,
        receive: function(t) {
          var e, n, r, o;
          switch (t.type()) {
            case jc.START_ELEMENT_TYPE:
              (o = t.getNode().cloneNode(!1)), c((r = o)), (a = r);
              break;
            case jc.TEXT_TYPE:
              (e = t), (n = i.createTextNode(e.text())), c(n);
              break;
            case jc.END_ELEMENT_TYPE:
              null === (a = a.parentNode) && (a = u);
              break;
            case jc.COMMENT_TYPE:
              break;
            default:
              throw { message: "Unsupported token type: " + t.type() };
          }
        },
        label: "SERIALISER"
      };
    },
    Bc = function(t, o) {
      var i;
      (o = o || g.window.document),
        (i = o.createElement("div")),
        o.body.appendChild(i),
        (i.style.position = "absolute"),
        (i.style.left = "-10000px"),
        (i.innerHTML = t);
      var a = i.firstChild || jc.FINISHED,
        u = [],
        c = !1;
      return {
        hasNext: function() {
          return void 0 !== a;
        },
        next: function() {
          var t,
            e,
            n = a,
            r = c;
          return (
            !c && a.firstChild
              ? (u.push(a), (a = a.firstChild))
              : c || 1 !== a.nodeType
              ? a.nextSibling
                ? ((a = a.nextSibling), (c = !1))
                : ((a = u.pop()), (c = !0))
              : (c = !0),
            n === jc.FINISHED ||
              a ||
              (o.body.removeChild(i), (a = jc.FINISHED)),
            (e = r),
            (t = n) === jc.FINISHED ? t : t ? jc.token(t, e) : void 0
          );
        }
      };
    },
    Yc = function(t, e, n) {
      var r,
        o = n;
      for (r = e.length - 1; 0 <= r; r--) o = e[r](o, {}, t);
      return o;
    },
    Wc = function(t, e, n) {
      for (var r = Uc(t), o = Bc(e, t), i = Yc(t, n, r); o.hasNext(); ) {
        var a = o.next();
        i.receive(a);
      }
      return r.dom;
    },
    Hc = function(e) {
      return function(t) {
        Cc(t, e);
      };
    },
    qc = function(e) {
      return function(t) {
        Oc(t, e);
      };
    },
    $c = function(e) {
      return function(t) {
        Dc(t, e);
      };
    },
    Vc = function(o) {
      return function(t) {
        var e = tu(t),
          n = bo(t),
          r = Wc(n.dom(), e, o);
        Na(t), t.dom().appendChild(r);
      };
    },
    Xc = function(t, e) {
      return (
        0 <= t.indexOf("<o:p>") ||
        (e.browser.isEdge() && 0 <= t.indexOf('v:shapes="')) ||
        (e.browser.isEdge() && 0 <= t.indexOf("mso-")) ||
        0 <= t.indexOf("mso-list") ||
        0 <= t.indexOf("p.MsoNormal, li.MsoNormal, div.MsoNormal") ||
        0 <= t.indexOf("MsoListParagraphCxSpFirst") ||
        0 <= t.indexOf("<w:WordDocument>")
      );
    },
    Gc = function(t, e, n) {
      var r = be.fromTag("div", t.dom());
      return (
        (r.dom().innerHTML = e),
        K(n, function(t) {
          t(r);
        }),
        tu(r)
      );
    };
  function zc(a, u, t) {
    return function(e, t, n) {
      var r = function(t) {
          e.receive(t);
        },
        o = function(t, e, n) {
          return (
            (n = void 0 !== n ? n : t.type() === jc.END_ELEMENT_TYPE),
            jc.token(e, n, {})
          );
        },
        i = {
          emit: r,
          emitTokens: function(t) {
            K(t, r);
          },
          receive: function(t) {
            a(i, t, o);
          },
          document: g.window.document
        };
      return u(i), i;
    };
  }
  var Kc = function(t, e) {
      var n = be.fromDom(t.getNode());
      return ge(n, e);
    },
    Jc = function(t, e) {
      var n = be.fromDom(t.getNode());
      return za(n, e);
    },
    Zc = function(t) {
      return t.type() === jc.TEXT_TYPE && /^[\s\u00A0]*$/.test(t.text());
    },
    Qc = function(t, e, n) {
      return (
        t === e ||
        (t &&
          e &&
          t.tag === e.tag &&
          t.type === e.type &&
          (n || t.variant === e.variant))
      );
    },
    ts = {
      guessFrom: function(e, n) {
        return tt(e, function(t) {
          return "UL" === t.tag || (n && Qc(t, n, !0));
        }).orThunk(function() {
          return 0 === (t = e).length ? F.none() : F.some(t[0]);
          var t;
        });
      },
      eqListType: Qc
    },
    es = function(t, e) {
      if (void 0 === t || void 0 === e) throw (g.console.trace(), "brick");
      t.nextFilter.set(e);
    },
    ns = function(t, e, n) {
      e.nextFilter.get()(t, e, n);
    },
    rs = es,
    os = ns,
    is = lr("level", "token", "type"),
    as = function(t, n, e, r) {
      var o = e.getCurrentListType(),
        i = e.getCurrentLevel() == r.level() ? o : null;
      return ts.guessFrom(r.emblems(), i).filter(function(t) {
        return !(
          "OL" === t.tag &&
          (!X(["P"], (e = n).tag()) || /^MsoHeading/.test(Kc(e, "class")))
        );
        var e;
      });
    },
    us = function(t, e) {
      return ve(be.fromDom(e.getNode()), "data-list-level");
    },
    cs = function(d) {
      return function(t, e, n) {
        var r,
          o,
          i,
          a,
          u =
            ((r = be.fromDom(n.getNode())),
            (o = parseInt(ge(r, "data-list-level"), 10)),
            (i = ge(r, "data-list-emblems")),
            (a = JSON.parse(i)),
            he(r, "data-list-level"),
            he(r, "data-list-emblems"),
            { level: h(o), emblems: h(a) });
        u.level(), e.originalToken.set(n);
        var c,
          s,
          f,
          l =
            ((c = n),
            (s = u),
            as((f = e).listType.get(), c, f.emitter, s).each(f.listType.set),
            is(s.level(), f.originalToken.get(), f.listType.get()));
        e.emitter.openItem(l.level(), l.token(), l.type()), rs(e, d.inside());
      };
    };
  function ss(t, e, n) {
    return { pred: t, action: e, label: h(n) };
  }
  var fs = function(t, r) {
    return function(t, e, n) {
      return r(t, e, n);
    };
  };
  function ls(t, r, e) {
    var o = fs(0, e),
      n = function(t, e, n) {
        tt(r, function(t) {
          return t.pred(e, n);
        }).fold(h(o), function(t) {
          var e = t.label();
          return void 0 === e ? t.action : fs(0, t.action);
        })(t, e, n);
      };
    return (
      (n.toString = function() {
        return "Handlers for " + t;
      }),
      n
    );
  }
  var ds = function(r) {
      return ls(
        "Inside.List.Item",
        [
          ss(
            function(t, e) {
              return (
                e.type() === jc.END_ELEMENT_TYPE &&
                t.originalToken.get() &&
                e.tag() === t.originalToken.get().tag()
              );
            },
            function(t, e, n) {
              rs(e, r.outside());
            },
            "Closing open tag"
          )
        ],
        function(t, e, n) {
          t.emit(n);
        }
      );
    },
    ms = function(r) {
      return ls(
        "Outside.List.Item",
        [
          ss(us, cs(r), "Data List ****"),
          ss(
            function(t, e) {
              return e.type() === jc.TEXT_TYPE && Zc(e);
            },
            function(t, e, n) {
              t.emit(n);
            },
            "Whitespace"
          )
        ],
        function(t, e, n) {
          e.emitter.closeAllLists(), t.emit(n), rs(e, r.outside());
        }
      );
    },
    ps = lr("state", "result"),
    gs = lr("state", "value"),
    vs = {
      state: lr("level", "type", "types", "items"),
      value: gs,
      result: ps
    },
    hs = function(t, e) {
      var n = t.items().slice(0),
        r = void 0 !== e && "P" !== e ? F.some(e) : F.none();
      r.fold(
        function() {
          n.push("P");
        },
        function(t) {
          n.push(t);
        }
      );
      var o = vs.state(t.level(), t.type(), t.types(), n);
      return vs.value(o, r);
    },
    ys = function(t) {
      var e = t.items().slice(0);
      if (0 < e.length && "P" !== e[e.length - 1]) {
        var n = e[e.length - 1];
        e[e.length - 1] = "P";
        var r = vs.state(t.level(), t.type(), t.types(), e);
        return vs.value(r, F.some(n));
      }
      return vs.value(t, F.none());
    },
    bs = function(t, e, n) {
      for (var r = [], o = t; e(o); ) {
        var i = n(o);
        (o = i.state()), (r = r.concat(i.result()));
      }
      return vs.result(o, r);
    },
    Ts = function(t, e, n) {
      return bs(
        t,
        function(t) {
          return t.level() < e;
        },
        n
      );
    },
    xs = function(t, e, n) {
      return bs(
        t,
        function(t) {
          return t.level() > e;
        },
        n
      );
    },
    Es = function(t) {
      var e;
      return t
        ? void 0 !== (e = Jc(t, "margin-left")) && "0px" !== e
          ? { "margin-left": e }
          : {}
        : { "list-style-type": "none" };
    },
    ws = function(t, e, n) {
      var r = e.start && 1 < e.start ? { start: e.start } : {},
        o = t.level() + 1,
        i = e,
        a = t.types().concat([e]),
        u = [y(jc.createStartElement, e.tag, r, n)],
        c = vs.state(o, i, a, t.items());
      return vs.result(c, u);
    },
    Is = function(t) {
      var e = t.types().slice(0),
        n = [y(jc.createEndElement, e.pop().tag)],
        r = t.level() - 1,
        o = e[e.length - 1],
        i = vs.state(r, o, e, t.items());
      return vs.result(i, n);
    },
    Ss = ws,
    Ls = function(t, e, n) {
      var r,
        o,
        i,
        a = Es(e),
        u =
          t.type() && !ts.eqListType(t.type(), n)
            ? ((r = n),
              (o = Is(t)),
              (i = ws(
                o.state(),
                r,
                r.type ? { "list-style-type": r.type } : {}
              )),
              vs.result(i.state(), o.result().concat(i.result())))
            : vs.result(t, []),
        c = [y(jc.createStartElement, "LI", {}, a)],
        s = hs(u.state(), e && e.tag()),
        f = s
          .value()
          .map(function(t) {
            return Nc(e.getNode(), h(!0)), [h(e)];
          })
          .getOr([]);
      return vs.result(
        s.state(),
        u
          .result()
          .concat(c)
          .concat(f)
      );
    },
    Ns = Is,
    _s = function(t) {
      var e = y(jc.createEndElement, "LI"),
        n = ys(t),
        r = n.value().fold(
          function() {
            return [e];
          },
          function(t) {
            return [y(jc.createEndElement, t), e];
          }
        );
      return vs.result(n.state(), r);
    },
    Cs = function(t) {
      if (0 === t.length)
        throw "Compose must have at least one element in the list";
      var e = t[t.length - 1],
        n = it(t, function(t) {
          return t.result();
        });
      return vs.result(e.state(), n);
    },
    Os = function(t) {
      var e = _s(t),
        n = Ns(e.state());
      return Cs([e, n]);
    },
    Ds = function(t, c, s, f) {
      return Ts(t, s, function(t) {
        return (
          (n = c),
          (r = s),
          (o = f),
          (i =
            (e = t).level() === r - 1 && n.type
              ? { "list-style-type": n.type }
              : {}),
          (a = Ss(e, n, i)),
          (u = Ls(a.state(), a.state().level() == r ? o : void 0, n)),
          Cs([a, u])
        );
        var e, n, r, o, i, a, u;
      });
    },
    Ps = function(t, e) {
      return xs(t, e, Os);
    },
    As = {
      openItem: function(t, e, n, r) {
        var o,
          i,
          a,
          u,
          c,
          s,
          f,
          l,
          d,
          m,
          p,
          g,
          v = t.level() > e ? Ps(t, e) : vs.result(t, []),
          h =
            v.state().level() === e
              ? ((l = v.state()),
                (d = r),
                (m = n),
                (p = 0 < l.level() ? _s(l) : vs.result(l, [])),
                (g = Ls(p.state(), m, d)),
                Cs([p, g]))
              : ((o = v.state()),
                (i = r),
                (u = n),
                (c = 1 < (a = e) ? ys(o) : vs.value(o, F.none())),
                (s = c
                  .value()
                  .map(function(t) {
                    return [y(jc.createEndElement, t)];
                  })
                  .getOr([])),
                c.state().level(),
                (f = Ds(c.state(), i, a, u)),
                vs.result(f.state(), s.concat(f.result())));
        return Cs([v, h]);
      },
      closeAllLists: Ps
    },
    ks = ["disc", "circle", "square"],
    Ms = function(t, e) {
      return "UL" === t.tag && ks[e - 1] === t.type && (t = { tag: "UL" }), t;
    };
  var Rs = function(t) {
      var e = t,
        n = function() {
          return e;
        };
      return {
        get: n,
        set: function(t) {
          e = t;
        },
        clone: function() {
          return Rs(n());
        }
      };
    },
    Fs = {
      getCurrentListType: function() {
        return js().getCurrentListType();
      },
      getCurrentLevel: function() {
        return js().getCurrentLevel();
      },
      closeAllLists: function() {
        return js().closeAllLists.apply(void 0, arguments);
      },
      openItem: function() {
        return js().openItem.apply(void 0, arguments);
      }
    },
    js = function() {
      return {
        getCurrentListType: h({}),
        getCurrentLevel: h(1),
        closeAllLists: m,
        openItem: m
      };
    };
  var Us,
    Bs,
    Ys,
    Ws,
    Hs,
    qs,
    $s,
    Vs,
    Xs,
    Gs,
    zs,
    Ks,
    Js = {
      inside: function() {
        return Qs;
      },
      outside: function() {
        return tf;
      }
    },
    Zs =
      ((Us = !1),
      {
        check: function(t) {
          return Us && t.type() === jc.TEXT_TYPE
            ? (t.text(), !0)
            : t.type() === jc.START_ELEMENT_TYPE && "STYLE" === t.tag()
            ? (Us = !0)
            : t.type() === jc.END_ELEMENT_TYPE &&
              "STYLE" === t.tag() &&
              !(Us = !1);
        }
      }),
    Qs = ds(Js),
    tf = ms(Js),
    ef =
      ((Ys = Rs((Bs = tf))),
      (Ws = Rs(null)),
      (Hs = Rs(null)),
      {
        reset: function(t) {
          Ys.set(Bs), Ws.set(null), Hs.set(null);
          var n,
            r,
            i,
            a,
            e =
              ((r = (n = t).document),
              (i = vs.state(0, void 0, [], [])),
              (a = function(t) {
                K(t.result(), function(t) {
                  var e = t(r);
                  n.emit(e);
                });
              }),
              {
                closeAllLists: function() {
                  var t = As.closeAllLists(i, 0);
                  (i = t.state()), a(t);
                },
                openItem: function(t, e, n) {
                  if (n) {
                    var r = Ms(n, t),
                      o = As.openItem(i, t, e, r);
                    (i = o.state()), a(o);
                  }
                },
                getCurrentListType: function() {
                  return i.type();
                },
                getCurrentLevel: function() {
                  return i.level();
                }
              });
          js = h(e);
        },
        nextFilter: Ys,
        originalToken: Ws,
        listType: Hs,
        emitter: Fs
      }),
    nf = zc(function(t, e, n) {
      Zs.check(e) || os(t, ef, e);
    }, ef.reset),
    rf = [
      { regex: /^\(?[dc][\.\)]$/, type: { tag: "OL", type: "lower-alpha" } },
      { regex: /^\(?[DC][\.\)]$/, type: { tag: "OL", type: "upper-alpha" } },
      {
        regex: /^\(?M*(CM|CD|D?C{0,3})(XC|XL|L?X{0,3})(IX|IV|V?I{0,3})[\.\)]$/,
        type: { tag: "OL", type: "upper-roman" }
      },
      {
        regex: /^\(?m*(cm|cd|d?c{0,3})(xc|xl|l?x{0,3})(ix|iv|v?i{0,3})[\.\)]$/,
        type: { tag: "OL", type: "lower-roman" }
      },
      { regex: /^\(?[0-9]+[\.\)]$/, type: { tag: "OL" } },
      {
        regex: /^([0-9]+\.)*[0-9]+\.?$/,
        type: { tag: "OL", variant: "outline" }
      },
      { regex: /^\(?[a-z]+[\.\)]$/, type: { tag: "OL", type: "lower-alpha" } },
      { regex: /^\(?[A-Z]+[\.\)]$/, type: { tag: "OL", type: "upper-alpha" } }
    ],
    of = {
      "\u2022": { tag: "UL", type: "disc" },
      "\xb7": { tag: "UL", type: "disc" },
      "\xa7": { tag: "UL", type: "square" }
    },
    af = {
      o: { tag: "UL", type: "circle" },
      "-": { tag: "UL", type: "disc" },
      "\u25cf": { tag: "UL", type: "disc" },
      "\ufffd": { tag: "UL", type: "circle" }
    },
    uf = function(u, t) {
      var e = af[u] ? [af[u]] : [],
        n = t && of[u] ? [of[u]] : t ? [{ tag: "UL", variant: u }] : [],
        r = it(rf, function(t) {
          return t.regex.test(u)
            ? [
                ni(
                  t.type,
                  ((r = u),
                  (o = r.split(".")),
                  (i = (function() {
                    if (0 === o.length) return r;
                    var t = o[o.length - 1];
                    return 0 === t.length && 1 < o.length ? o[o.length - 2] : t;
                  })()),
                  (a = parseInt(i, 10)),
                  isNaN(a) ? {} : { start: a }),
                  {
                    variant:
                      ((e = t.type),
                      (n = u),
                      void 0 !== e.variant
                        ? e.variant
                        : "(" === n.charAt(0)
                        ? "()"
                        : ")" === n.charAt(n.length - 1)
                        ? ")"
                        : ".")
                  }
                )
              ]
            : [];
          var e, n, r, o, i, a;
        }),
        o = e.concat(n).concat(r);
      return z(o, function(t) {
        return void 0 !== t.variant ? t : ni(t, { variant: u });
      });
    },
    cf = function(t) {
      return t.dom().textContent;
    },
    sf = function(t) {
      return xc(t, ["mso-list"], h(!1))["mso-list"];
    },
    ff = function(t) {
      return (
        fe(t) &&
        Ja(t, "font-family").exists(function(t) {
          return X(["wingdings", "symbol"], t.toLowerCase());
        })
      );
    },
    lf = {
      getMsoList: sf,
      extractLevel: function(t) {
        var e = sf(t),
          n = / level([0-9]+)/.exec(e);
        return n && n[1] ? F.some(parseInt(n[1], 10)) : F.none();
      },
      extractEmblem: function(t, e) {
        var n = cf(t).trim(),
          r = uf(n, e);
        return 0 < r.length ? F.some(r) : F.none();
      },
      extractSymSpan: function(t) {
        return Ni(t, ff);
      },
      extractMsoIgnore: function(t) {
        return _i(t, function(t) {
          return !!(fe(t) ? xc(t, ["mso-list"], h(!1)) : [])["mso-list"];
        });
      },
      extractCommentSpan: function(t) {
        return Ni(t, se)
          .bind(wo)
          .filter(function(t) {
            return "span" === ae(t);
          });
      },
      isSymbol: ff,
      deduceLevel: function(t) {
        return Ja(t, "margin-left").bind(function(t) {
          var e = parseInt(t, 10);
          return isNaN(e) ? F.none() : F.some(Math.max(1, Math.ceil(e / 18)));
        });
      }
    },
    df = function(t) {
      for (var e = []; null !== t.nextNode(); )
        e.push(be.fromDom(t.currentNode));
      return e;
    },
    mf = fo.detect().browser,
    pf =
      mf.isIE() || mf.isEdge()
        ? function(t) {
            try {
              return df(t);
            } catch (t) {
              return [];
            }
          }
        : df,
    gf = h(h(!0)),
    vf = function(t) {
      var e = (function(t, e) {
        var n = e.fold(gf, function(e) {
          return function(t) {
            return e(t.nodeValue);
          };
        });
        n.acceptNode = n;
        var r = g.document.createTreeWalker(
          t.dom(),
          g.NodeFilter.SHOW_COMMENT,
          n,
          !1
        );
        return pf(r);
      })(t, F.none());
      K(e, _a);
    },
    hf = function(t, e, n, r) {
      !(function(t, e, n) {
        me(t, "data-list-level", e);
        var r = JSON.stringify(n);
        me(t, "data-list-emblems", r);
      })(t, e, n),
        vf(t),
        K(r, _a),
        he(t, "style"),
        he(t, "class");
    },
    yf = function(t) {
      return ((r = t),
      lf.extractLevel(r).bind(function(n) {
        return lf.extractSymSpan(r).bind(function(e) {
          return lf.extractEmblem(e, !0).map(function(t) {
            return {
              mutate: function() {
                hf(r, n, t, [e]);
              }
            };
          });
        });
      }))
        .orThunk(function() {
          return (
            (r = t),
            lf.extractLevel(r).bind(function(n) {
              return lf.extractCommentSpan(r).bind(function(e) {
                return lf.extractEmblem(e, lf.isSymbol(e)).map(function(t) {
                  return {
                    mutate: function() {
                      hf(r, n, t, [e]);
                    }
                  };
                });
              });
            })
          );
          var r;
        })
        .orThunk(function() {
          return (
            (r = t),
            lf.extractLevel(r).bind(function(n) {
              return lf.extractCommentSpan(r).bind(function(e) {
                return lf.extractEmblem(e, lf.isSymbol(e)).map(function(t) {
                  return {
                    mutate: function() {
                      hf(r, n, t, [e]);
                    }
                  };
                });
              });
            })
          );
          var r;
        })
        .orThunk(function() {
          return "p" !== ae((r = t))
            ? F.none()
            : lf.extractLevel(r).bind(function(n) {
                return lf.extractMsoIgnore(r).bind(function(e) {
                  return lf.extractEmblem(e, !1).map(function(t) {
                    return {
                      mutate: function() {
                        hf(r, n, t, [To(e).getOr(e)]);
                      }
                    };
                  });
                });
              });
          var r;
        })
        .orThunk(function() {
          return "p" !== ae((r = t))
            ? F.none()
            : lf.extractMsoIgnore(r).bind(function(t) {
                var n = To(t).getOr(t),
                  e = lf.isSymbol(n);
                return lf.extractEmblem(t, e).bind(function(e) {
                  return lf.deduceLevel(r).map(function(t) {
                    return {
                      mutate: function() {
                        hf(r, t, e, [n]);
                      }
                    };
                  });
                });
              });
          var r;
        });
      var r;
    },
    bf = {
      filter: nf,
      preprocess: $c({
        tags: [
          {
            name: lc.pattern(/^(p|h\d+)$/, lc.caseInsensitive),
            mutate: function(t) {
              yf(t).each(function(t) {
                t.mutate();
              });
            }
          }
        ]
      })
    },
    Tf = function(t, e) {
      return _i(t, e).isSome();
    },
    xf = function(t) {
      return (
        void 0 === t.dom().attributes ||
        null === t.dom().attributes ||
        0 === t.dom().attributes.length ||
        (1 === t.dom().attributes.length &&
          "style" === t.dom().attributes[0].name)
      );
    },
    Ef = {
      isNotImage: function(t) {
        return "img" !== ae(t);
      },
      hasContent: function(t) {
        return (
          !xf(t) ||
          ((n = (e = t).dom().attributes),
          (r = null != n && 0 < n.length),
          ("span" !== ae(e) || r) &&
            Tf(t, function(t) {
              var e = !xf(t),
                n = !X(
                  [
                    "font",
                    "em",
                    "strong",
                    "samp",
                    "acronym",
                    "cite",
                    "code",
                    "dfn",
                    "kbd",
                    "tt",
                    "b",
                    "i",
                    "u",
                    "s",
                    "sub",
                    "sup",
                    "ins",
                    "del",
                    "var",
                    "span"
                  ],
                  ae(t)
                );
              return le(t) || e || n;
            }))
        );
        var e, n, r;
      },
      isList: function(t) {
        return "ol" === ae(t) || "ul" === ae(t);
      },
      isLocal: function(t) {
        var e = ge(t, "src");
        return /^file:/.test(e);
      },
      hasNoAttributes: xf,
      isEmpty: function(t) {
        return 0 === tu(t).length;
      }
    },
    wf = function(t, e) {
      var n = be.fromTag(t);
      $i(e, n);
      var r = e.dom().attributes;
      K(r, function(t) {
        n.dom().setAttribute(t.name, t.value);
      });
      var o = So(e);
      return Ji(n, o), _a(e), n;
    },
    If = function(t) {
      return Eo(t).bind(function(t) {
        return le(t) && 0 === vu(t).trim().length
          ? If(t)
          : "li" === ae(t)
          ? F.some(t)
          : F.none();
      });
    },
    Sf = {
      changeTag: wf,
      addBrTag: function(t) {
        0 === tu(t).length && Gi(t, be.fromTag("br"));
      },
      properlyNest: function(n) {
        To(n).each(function(t) {
          var e = ae(t);
          X(["ol", "ul"], e) &&
            If(n).fold(
              function() {
                var t = be.fromTag("li");
                Xa(t, "list-style-type", "none"), zi(n, t);
              },
              function(t) {
                Gi(t, n);
              }
            );
        });
      },
      fontToSpan: function(t) {
        var o = wf("span", t),
          i = {
            "font-size": {
              1: "8pt",
              2: "10pt",
              3: "12pt",
              4: "14pt",
              5: "18pt",
              6: "24pt",
              7: "36pt"
            }
          };
        st({ face: "font-family", size: "font-size", color: "color" }, function(
          t,
          e
        ) {
          if (ve(o, e)) {
            var n = ge(o, e),
              r = void 0 !== i[t] && void 0 !== i[t][n] ? i[t][n] : n;
            Xa(o, t, r), he(o, e);
          }
        });
      }
    },
    Lf = pu(se, "comment"),
    Nf = function(t) {
      return Lf.get(t);
    },
    _f = qc({
      tags: [
        {
          name: lc.pattern(/^([OVWXP]|U[0-9]+|ST[0-9]+):/i, lc.caseInsensitive)
        }
      ]
    }),
    Cf = Hc({
      attributes: [
        {
          name: lc.exact("id", lc.caseInsensitive),
          value: lc.starts("docs-internal-guid", lc.caseInsensitive)
        }
      ]
    }),
    Of = [Vc([bf.filter])],
    Df = Hc({
      attributes: [
        { name: lc.pattern(/^v:/, lc.caseInsensitive) },
        {
          name: lc.exact("href", lc.caseInsensitive),
          value: lc.contains("#_toc", lc.caseInsensitive)
        },
        {
          name: lc.exact("href", lc.caseInsensitive),
          value: lc.contains("#_mso", lc.caseInsensitive)
        },
        { name: lc.pattern(/^xmlns(:|$)/, lc.caseInsensitive) },
        { name: lc.exact("type", lc.caseInsensitive), condition: Ef.isList }
      ]
    }),
    Pf = Hc({
      tags: [
        { name: lc.exact("script", lc.caseInsensitive) },
        { name: lc.exact("link", lc.caseInsensitive) },
        { name: lc.exact("style", lc.caseInsensitive), condition: Ef.isEmpty }
      ],
      attributes: [
        { name: lc.starts("on", lc.caseInsensitive) },
        { name: lc.exact('"', lc.caseInsensitive) },
        { name: lc.exact("lang", lc.caseInsensitive) },
        { name: lc.exact("language", lc.caseInsensitive) }
      ],
      styles: [
        { name: lc.all(), value: lc.pattern(/OLE_LINK/i, lc.caseInsensitive) }
      ]
    }),
    Af = Hc({ tags: [{ name: lc.exact("meta", lc.caseInsensitive) }] }),
    kf = Hc({ tags: [{ name: lc.exact("style", lc.caseInsensitive) }] }),
    Mf = function(t) {
      var e = ae(t);
      return "td" === e || "tr" === e || "table" === e || "col" === e;
    },
    Rf = Hc({
      styles: [
        {
          name: lc.not(
            lc.pattern(/^(width|height|list-style-type)$/, lc.caseInsensitive)
          ),
          condition: function(t) {
            return !Ei(t, "ephox-limbo-transform");
          }
        },
        {
          name: lc.pattern(/^(width|height)$/, lc.caseInsensitive),
          condition: function(t) {
            return Ef.isNotImage(t) && !Mf(t);
          }
        }
      ]
    }),
    Ff = Hc({
      styles: [
        {
          name: lc.exact("height", lc.caseInsensitive),
          condition: function(t) {
            return "td" === ae(t);
          }
        },
        {
          name: lc.exact("width", lc.caseInsensitive),
          condition: function(t) {
            return "tr" === ae(t);
          }
        },
        {
          name: lc.exact("height", lc.caseInsensitive),
          condition: function(t) {
            return "col" === ae(t);
          }
        }
      ]
    }),
    jf = qc({
      tags: [
        { name: lc.exact("strong", lc.caseInsensitive) },
        { name: lc.exact("em", lc.caseInsensitive) },
        { name: lc.exact("b", lc.caseInsensitive) },
        { name: lc.exact("i", lc.caseInsensitive) },
        { name: lc.exact("u", lc.caseInsensitive) },
        { name: lc.exact("strike", lc.caseInsensitive) },
        { name: lc.exact("sub", lc.caseInsensitive) },
        { name: lc.exact("sup", lc.caseInsensitive) },
        { name: lc.exact("font", lc.caseInsensitive) }
      ]
    }),
    Uf = Hc({
      classes: [
        { name: lc.not(lc.exact("rtf-data-image", lc.caseInsensitive)) }
      ]
    }),
    Bf = Hc({ styles: [{ name: lc.pattern(dc(), lc.caseInsensitive) }] }),
    Yf = Hc({ classes: [{ name: lc.pattern(/mso/i, lc.caseInsensitive) }] }),
    Wf = qc({
      tags: [
        { name: lc.exact("img", lc.caseInsensitive), condition: Ef.isLocal }
      ]
    }),
    Hf = qc({
      tags: [
        {
          name: lc.exact("a", lc.caseInsensitive),
          condition: Ef.hasNoAttributes
        }
      ]
    }),
    qf = Hc({
      attributes: [
        {
          name: lc.exact("style", lc.caseInsensitive),
          value: lc.exact("", lc.caseInsensitive),
          debug: !0
        }
      ]
    }),
    $f = Hc({
      attributes: [
        {
          name: lc.exact("class", lc.caseInsensitive),
          value: lc.exact("", lc.caseInsensitive),
          debug: !0
        }
      ]
    }),
    Vf = qc({
      tags: [
        {
          name: lc.pattern(mc(), lc.caseInsensitive),
          condition:
            ((qs = Ef.hasContent),
            function() {
              for (var t = [], e = 0; e < arguments.length; e++)
                t[e] = arguments[e];
              return !qs.apply(null, t);
            })
        }
      ]
    }),
    Xf = qc({
      tags: [
        {
          name: lc.exact("p", lc.caseInsensitive),
          condition:
            (($s = "li"),
            function(t) {
              return To(t).exists(function(t) {
                return ae(t) === $s && 1 === So(t).length;
              });
            })
        }
      ]
    }),
    Gf = $c({
      tags: [{ name: lc.exact("p", lc.caseInsensitive), mutate: Sf.addBrTag }]
    }),
    zf = $c({
      tags: [
        {
          name: lc.pattern(/ol|ul/, lc.caseInsensitive),
          mutate: Sf.properlyNest
        }
      ]
    }),
    Kf = $c({
      tags: [
        {
          name: lc.exact("b", lc.caseInsensitive),
          mutate: y(Sf.changeTag, "strong")
        },
        {
          name: lc.exact("i", lc.caseInsensitive),
          mutate: y(Sf.changeTag, "em")
        },
        {
          name: lc.exact("u", lc.caseInsensitive),
          mutate: function(t) {
            var e = Sf.changeTag("span", t);
            Ti(e, "ephox-limbo-transform"),
              Xa(e, "text-decoration", "underline");
          }
        },
        {
          name: lc.exact("s", lc.caseInsensitive),
          mutate: y(Sf.changeTag, "strike")
        },
        {
          name: lc.exact("font", lc.caseInsensitive),
          mutate: Sf.fontToSpan,
          debug: !0
        }
      ]
    }),
    Jf = Hc({
      classes: [{ name: lc.exact("ephox-limbo-transform", lc.caseInsensitive) }]
    }),
    Zf = Hc({
      tags: [
        {
          name: lc.exact("br", lc.caseInsensitive),
          condition: Si("Apple-interchange-newline")
        }
      ]
    }),
    Qf = {
      unwrapWordTags: _f,
      removeWordAttributes: Df,
      removeGoogleDocsId: Cf,
      parseLists: Of,
      removeExcess: Pf,
      removeMetaTags: Af,
      removeStyleTags: kf,
      cleanStyles: Rf,
      cleanTables: Ff,
      cleanInlineStyleElements: jf,
      cleanClasses: Uf,
      cleanupBrowserCruft: Hc({
        styles: [
          { name: lc.pattern(/^-/, lc.caseInsensitive) },
          { name: lc.all(), value: lc.exact("initial", lc.caseInsensitive) },
          {
            name: lc.exact("background-color", lc.caseInsensitive),
            value: lc.exact("transparent", lc.caseInsensitive)
          },
          {
            name: lc.exact("font-style", lc.caseInsensitive),
            value: lc.exact("normal", lc.caseInsensitive)
          },
          { name: lc.pattern(/font-variant.*/, lc.caseInsensitive) },
          { name: lc.exact("letter-spacing", lc.caseInsensitive) },
          {
            name: lc.exact("font-weight", lc.caseInsensitive),
            value: lc.pattern(/400|normal/, lc.caseInsensitive)
          },
          { name: lc.exact("orphans", lc.caseInsensitive) },
          {
            name: lc.exact("text-decoration", lc.caseInsensitive),
            value: lc.exact("none", lc.caseInsensitive)
          },
          { name: lc.exact("text-size-adjust", lc.caseInsensitive) },
          {
            name: lc.exact("text-indent", lc.caseInsensitive),
            value: lc.exact("0px", lc.caseInsensitive)
          },
          {
            name: lc.exact("text-transform", lc.caseInsensitive),
            value: lc.exact("none", lc.caseInsensitive)
          },
          {
            name: lc.exact("white-space", lc.caseInsensitive),
            value: lc.exact("normal", lc.caseInsensitive)
          },
          { name: lc.exact("widows", lc.caseInsensitive) },
          {
            name: lc.exact("word-spacing", lc.caseInsensitive),
            value: lc.exact("0px", lc.caseInsensitive)
          },
          {
            name: lc.exact("text-align", lc.caseInsensitive),
            value: lc.pattern(/start|end/, lc.caseInsensitive)
          },
          {
            name: lc.exact("font-weight", lc.caseInsensitive),
            value: lc.pattern(/700|bold/, lc.caseInsensitive),
            condition: function(t) {
              return /^h\d$/.test(ae(t));
            }
          }
        ]
      }),
      cleanupBrowserTags: Zf,
      unwrapConvertedSpace:
        ((Xs = (Vs = function(t, n) {
          return function(e) {
            return t(e)
              .filter(function(t) {
                return le(e) && n(cf(t), " ");
              })
              .isSome();
          };
        })(Eo, no)),
        (Gs = Vs(wo, eo)),
        $c({
          tags: [
            {
              name: lc.exact("span", lc.caseInsensitive),
              condition: Si("Apple-converted-space"),
              mutate: function(t) {
                "\xa0" === cf(t) &&
                  (Xs(t) || Gs(t) ? Ca(t) : ($i(t, be.fromText(" ")), _a(t)));
              }
            }
          ]
        })),
      mergeStyles: Bf,
      mergeClasses: Yf,
      removeLocalImages: Wf,
      removeVacantLinks: Hf,
      removeEmptyStyle: qf,
      removeEmptyClass: $f,
      pruneInlineTags: Vf,
      unwrapSingleParagraphsInlists: Xf,
      addPlaceholders: Gf,
      nestedListFixes: zf,
      inlineTagFixes: Kf,
      cleanupFlags: Jf,
      distillAnchorsFromLocalLinks:
        ((zs = /^file:\/\/\/[^#]+(#[^#]+)$/),
        $c({
          tags: [
            {
              name: lc.exact("a", lc.caseInsensitive),
              condition: function(t) {
                var e = ge(t, "href");
                return !!e && zs.test(e);
              },
              mutate: function(t) {
                var e = ge(t, "href");
                me(t, "href", e.replace(zs, "$1"));
              }
            }
          ]
        })),
      removeLocalLinks: Hc({
        attributes: [
          {
            name: lc.exact("href", lc.caseInsensitive),
            value: lc.starts("file:///", lc.caseInsensitive),
            debug: !0
          }
        ]
      }),
      replaceClipboardChangedUrls: $c({
        tags: [
          (Ks = function(t, n, r) {
            return {
              name: lc.exact(t, lc.caseInsensitive),
              condition: function(t) {
                return ve(t, n);
              },
              mutate: function(t) {
                var e = ge(t, n);
                me(t, r, e), he(t, n);
              }
            };
          })("a", "data-ephox-href", "href"),
          Ks("img", "data-ephox-src", "src")
        ]
      }),
      removeFragmentComments: function(a) {
        var u = [
            "table",
            "thead",
            "tbody",
            "tfoot",
            "th",
            "tr",
            "td",
            "ul",
            "ol",
            "li"
          ],
          t = _o(a, se),
          e = tt(t, function(t) {
            return to(Nf(t), "StartFragment");
          }),
          n = tt(t, function(t) {
            return to(Nf(t), "EndFragment");
          });
        e.each(function(i) {
          n.each(function(t) {
            for (
              var e,
                n = i,
                r = [],
                o =
                  ((e = Ru(i, 0, t, 0)), be.fromDom(e.commonAncestorContainer));
              void 0 !== o && !ho(o, a);

            )
              X(u, ae(o)) ? (n = o) : r.push(o), (o = To(o).getOr(void 0));
            K(r, Ca), K(Io(n), _a);
          }),
            _a(i);
        }),
          n.each(_a);
      },
      removeTableStyleAttrs: Hc({
        attributes: [
          {
            name: lc.pattern(/^(width|height)$/, lc.caseInsensitive),
            condition: function(t) {
              return Mf(t);
            }
          }
        ]
      }),
      none: _
    },
    tl = function(t) {
      return t.browser.isIE() && 11 <= t.browser.version.major;
    },
    el = function(i, a) {
      return zc(function(t, e) {
        var r,
          o,
          n =
            ((r = e),
            (o = a),
            i(be.fromDom(r.getNode())).fold(
              function() {
                return [r];
              },
              function(t) {
                var e = r.type() === jc.END_ELEMENT_TYPE,
                  n = [jc.token(t.dom(), e)];
                return !e && o && n.push(jc.token(t.dom(), !0)), n;
              }
            ));
        K(n, t.emit);
      }, _);
    },
    nl = function(t, e, n) {
      var r,
        o,
        i,
        a,
        u,
        c,
        s,
        f,
        l,
        d,
        m,
        p,
        g,
        v,
        h =
          ((r = t),
          (i = (o = n).browser.isFirefox() || o.browser.isEdge()),
          (a = i ? cc.local : cc.vshape),
          (u = !i),
          (c = tl(o) ? Qf.none : Vc([el(a, u)])),
          {
            annotate: [r ? c : Qf.none],
            local: [i ? Qf.none : Qf.removeLocalImages]
          });
      return ot([
        h.local,
        ((g = t), (v = n), tl(v) || !g ? [] : [bf.preprocess]),
        h.annotate,
        [Qf.inlineTagFixes],
        (function(t, e, n) {
          if (!t) return [Qf.none];
          var r = [Qf.unwrapWordTags],
            o = tl(n) ? [] : Qf.parseLists;
          return r.concat(o).concat([Qf.removeWordAttributes]);
        })(t, 0, n),
        [Qf.removeGoogleDocsId],
        [Qf.nestedListFixes],
        [Qf.removeExcess],
        [Qf.removeMetaTags],
        ((p = e),
        p
          ? [Qf.mergeStyles, Qf.mergeClasses]
          : [Qf.cleanStyles, Qf.cleanInlineStyleElements, Qf.cleanClasses]),
        [
          Qf.distillAnchorsFromLocalLinks,
          Qf.removeLocalLinks,
          Qf.removeVacantLinks,
          Qf.replaceClipboardChangedUrls
        ],
        [Qf.removeEmptyStyle],
        [Qf.removeEmptyClass],
        [Qf.pruneInlineTags],
        [Qf.cleanupBrowserTags],
        ((d = t), (m = e), !d && m ? [Qf.cleanupBrowserCruft] : []),
        [Qf.unwrapConvertedSpace],
        [Qf.addPlaceholders],
        ((f = t),
        (l = n),
        tl(l) && f ? [Qf.unwrapSingleParagraphsInlists] : []),
        ((s = t), s ? [Qf.cleanTables, Qf.removeTableStyleAttrs] : []),
        [Qf.cleanupFlags],
        [Qf.removeStyleTags]
      ]);
    },
    rl = [
      "body",
      "p",
      "div",
      "article",
      "aside",
      "figcaption",
      "figure",
      "footer",
      "header",
      "nav",
      "section",
      "ol",
      "ul",
      "li",
      "table",
      "thead",
      "tbody",
      "tfoot",
      "caption",
      "tr",
      "td",
      "th",
      "h1",
      "h2",
      "h3",
      "h4",
      "h5",
      "h6",
      "blockquote",
      "pre",
      "address"
    ];
  var ol = function(t) {
      return (
        (e = t),
        (n = h(0)),
        (r = h(0)),
        (o = F.none()),
        {
          term: function() {
            return new RegExp(e, o.getOr("g"));
          },
          prefix: n,
          suffix: r
        }
      );
      var e, n, r, o;
    },
    il = function(t, e) {
      return et(t, function(t) {
        return t.start() === e;
      });
    },
    al = function(t, e, n) {
      var r,
        o,
        i = n(t, e);
      return (
        (r = i),
        (o = t.start()),
        z(r, function(t) {
          return ut({}, t, {
            start: h(t.start() + o),
            finish: h(t.finish() + o)
          });
        })
      );
    },
    ul = function(t, n, e) {
      return (
        void 0 === e && (e = 0),
        Q(
          t,
          function(e, t) {
            return n(t, e.len).fold(h(e), function(t) {
              return { len: t.finish(), list: e.list.concat([t]) };
            });
          },
          { len: e, list: [] }
        ).list
      );
    },
    cl = function(t, e, n) {
      return 0 === e.length
        ? t
        : it(t, function(r) {
            var t = it(e, function(t) {
              return (n = t) >= (e = r).start() && n <= e.finish()
                ? [t - r.start()]
                : [];
              var e, n;
            });
            return 0 < t.length ? al(r, t, n) : [r];
          });
    },
    sl = function(o, t, i) {
      var e = il(o, t),
        a = il(o, i);
      return e
        .bind(function(t) {
          var e,
            n,
            r = a.getOr(
              ((n = i),
              (e = o)[e.length - 1] && e[e.length - 1].finish() === n
                ? e.length + 1
                : -1)
            );
          return -1 < r ? F.some(o.slice(t, r)) : F.none();
        })
        .getOr([]);
    },
    fl = function(n, t) {
      var e,
        r,
        o = it(t, function(e) {
          var t = (function(t, e) {
            for (var n = e.term(), r = [], o = n.exec(t); o; ) {
              var i = o.index + e.prefix(o),
                a = o[0].length - e.prefix(o) - e.suffix(o);
              r.push({ start: h(i), finish: h(i + a) }),
                (n.lastIndex = i + a),
                (o = n.exec(t));
            }
            return r;
          })(n, e.pattern());
          return z(t, function(t) {
            return ut({}, e, t);
          });
        });
      return (
        (e = o),
        (r = Array.prototype.slice.call(e, 0)).sort(function(t, e) {
          return t.start() < e.start() ? -1 : e.start() < t.start() ? 1 : 0;
        }),
        r
      );
    },
    ll =
      (lr("word", "pattern"),
      lr("element", "offset"),
      lr("element", "deltaOffset"),
      lr("element", "start", "finish")),
    dl =
      (lr("begin", "end"),
      lr("element", "text"),
      gt([
        { include: ["item"] },
        { excludeWith: ["item"] },
        { excludeWithout: ["item"] }
      ])),
    ml = {
      include: dl.include,
      excludeWith: dl.excludeWith,
      excludeWithout: dl.excludeWithout,
      cata: function(t, e, n, r) {
        return t.fold(e, n, r);
      }
    },
    pl = function(t, n) {
      var r = [],
        o = [];
      return (
        K(t, function(t) {
          var e = n(t);
          ml.cata(
            e,
            function() {
              o.push(t);
            },
            function() {
              0 < o.length && r.push(o), r.push([t]), (o = []);
            },
            function() {
              0 < o.length && r.push(o), (o = []);
            }
          );
        }),
        0 < o.length && r.push(o),
        r
      );
    },
    gl = gt([
      { boundary: ["item", "universe"] },
      { empty: ["item", "universe"] },
      { text: ["item", "universe"] }
    ]),
    vl = O,
    hl = D,
    yl = h(0),
    bl = h(1),
    Tl = function(t) {
      return ut({}, t, {
        isBoundary: function() {
          return t.fold(hl, vl, vl);
        },
        toText: function() {
          return t.fold(F.none, F.none, function(t) {
            return F.some(t);
          });
        },
        is: function(n) {
          return t.fold(vl, vl, function(t, e) {
            return e.eq(t, n);
          });
        },
        len: function() {
          return t.fold(yl, bl, function(t, e) {
            return e.property().getText(t).length;
          });
        }
      });
    },
    xl = {
      text: v(Tl, gl.text),
      boundary: v(Tl, gl.boundary),
      empty: v(Tl, gl.empty),
      cata: function(t, e, n, r) {
        return t.fold(e, n, r);
      }
    },
    El = function(e, t, n) {
      if (e.property().isText(t)) return [xl.text(t, e)];
      if (e.property().isEmptyTag(t)) return [xl.empty(t, e)];
      if (e.property().isElement(t)) {
        var r = e.property().children(t),
          o = e.property().isBoundary(t) ? [xl.boundary(t, e)] : [],
          i =
            void 0 !== n && n(t)
              ? []
              : it(r, function(t) {
                  return El(e, t, n);
                });
        return o.concat(i).concat(o);
      }
      return [];
    },
    wl = El,
    Il = function(e, t, n) {
      var r = it(t, function(t) {
          return wl(e, t, n);
        }),
        o = pl(r, function(t) {
          return t.match({
            boundary: function() {
              return ml.excludeWithout(t);
            },
            empty: function() {
              return ml.excludeWith(t);
            },
            text: function() {
              return ml.include(t);
            }
          });
        });
      return Z(o, function(t) {
        return 0 < t.length;
      });
    },
    Sl = function(r, t) {
      if (0 === t.length) return [r];
      var e = Q(
          t,
          function(t, e) {
            if (0 === e) return t;
            var n = r.substring(t.prev, e);
            return { prev: e, values: t.values.concat([n]) };
          },
          { prev: 0, values: [] }
        ),
        n = t[t.length - 1];
      return n < r.length ? e.values.concat(r.substring(n)) : e.values;
    },
    Ll = function(o, t, e) {
      var n = it(e, function(t) {
          return [t.start(), t.finish()];
        }),
        i = cl(t, n, function(t, e) {
          return (function(o, t, e) {
            var n = o.property().getText(t),
              r = Z(Sl(n, e), function(t) {
                return 0 < t.length;
              });
            if (r.length <= 1) return [ll(t, 0, n.length)];
            o.property().setText(t, r[0]);
            var i = ul(
                r.slice(1),
                function(t, e) {
                  var n = o.create().text(t),
                    r = ll(n, e, e + t.length);
                  return F.some(r);
                },
                r[0].length
              ),
              a = z(i, function(t) {
                return t.element();
              });
            return o.insert().afterAll(t, a), [ll(t, 0, r[0].length)].concat(i);
          })(o, t.element(), e);
        });
      return z(e, function(t) {
        var e = sl(i, t.start(), t.finish()),
          n = z(e, function(t) {
            return t.element();
          }),
          r = z(n, o.property().getText).join("");
        return {
          elements: function() {
            return n;
          },
          word: t.word,
          exact: function() {
            return r;
          }
        };
      });
    },
    Nl = function(a, t, u, e) {
      var n = Il(a, t, e);
      return it(n, function(t) {
        var r,
          e = it(t, function(t) {
            return t.fold(h([]), h([]), function(t) {
              return [t];
            });
          }),
          n = z(e, a.property().getText).join(""),
          o = fl(n, u),
          i =
            ((r = a),
            ul(e, function(t, e) {
              var n = e + r.property().getText(t).length;
              return F.from(ll(t, e, n));
            }));
        return Ll(a, i, o);
      });
    },
    _l = {
      up: h({ selector: Ci, closest: Di, predicate: Li, all: xo }),
      down: h({ selector: Co, predicate: _o }),
      styles: h({ get: za, getRaw: Ja, set: Xa, remove: Za }),
      attrs: h({
        get: ge,
        set: me,
        remove: he,
        copyTo: function(t, e) {
          var n = Q(
            t.dom().attributes,
            function(t, e) {
              return (t[e.name] = e.value), t;
            },
            {}
          );
          pe(e, n);
        }
      }),
      insert: h({
        before: $i,
        after: Vi,
        afterAll: Ki,
        append: Gi,
        appendAll: Ji,
        prepend: Xi,
        wrap: zi
      }),
      remove: h({ unwrap: Ca, remove: _a }),
      create: h({
        nu: be.fromTag,
        clone: function(t) {
          return be.fromDom(t.dom().cloneNode(!1));
        },
        text: be.fromText
      }),
      query: h({
        comparePosition: function(t, e) {
          return t.dom().compareDocumentPosition(e.dom());
        },
        prevSibling: Eo,
        nextSibling: wo
      }),
      property: h({
        children: So,
        name: ae,
        parent: To,
        document: function(t) {
          return t.dom().ownerDocument;
        },
        isText: le,
        isComment: se,
        isElement: fe,
        getText: vu,
        setText: hu,
        isBoundary: function(t) {
          return !!fe(t) && ("body" === ae(t) || X(rl, ae(t)));
        },
        isEmptyTag: function(t) {
          return !!fe(t) && X(["br", "img", "hr", "input"], ae(t));
        }
      }),
      eq: ho,
      is: yo
    },
    Cl = /(?:(?:[A-Za-z]{3,9}:(?:\/\/))(?:[-.~*+=!&;:'%@?^${}(),\w]+@)?[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)*|(?:www\.|[-;:&=+$,.\w]+@)[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)*)(?::[0-9]+)?(?:\/[-+~=%.()\/\w]*)?(?:\?(?:[-.~*+=!&;:'%@?^${}(),\/\w]+))?(?:#(?:[-.~*+=!&;:'%@?^${}(),\/\w]+))?/g
      .source,
    Ol = function(t) {
      var e,
        n = lr("word", "pattern")("__INTERNAL__", ol(Cl));
      return Nl(_l, t, [n], e);
    },
    Dl = function(t) {
      return !Di(t, "a", e).isSome();
      var e;
    },
    Pl = function(t) {
      var e = t.indexOf("://");
      return 3 <= e && e <= 9;
    },
    Al = {
      links: function(t) {
        var e = Ol(t);
        K(e, function(t) {
          var n,
            e = t.exact();
          (e.indexOf("@") < 0 || Pl(e)) &&
            ((n = t.elements()),
            F.from(n[0])
              .filter(Dl)
              .map(function(t) {
                var e = be.fromTag("a");
                return $i(t, e), Ji(e, n), me(e, "href", cf(e)), e;
              }));
        });
      },
      position: function(t) {
        K(t, function(t) {
          fe(t) && Ja(t, "position").isSome() && Za(t, "position");
        });
      },
      list: function(t) {
        var e = Z(t, function(t) {
          return "li" === ae(t);
        });
        if (0 < e.length) {
          var n = Io(e[0]),
            r = be.fromTag("ul");
          if (($i(t[0], r), 0 < n.length)) {
            var o = be.fromTag("li");
            Gi(r, o), Ji(o, n);
          }
          Ji(r, e);
        }
      }
    },
    kl = function(t) {
      var e = So(t);
      K([Al.links, Al.position, Al.list], function(t) {
        t(e);
      });
    },
    Ml = function(t, e, n, r, o) {
      kl(n);
      var i = tu(n),
        a = nl(o, r, e);
      return Gc(t, i, a);
    },
    Rl = kl,
    Fl = function(t, e) {
      var n = tu(e);
      return Gc(t, n, [Qf.removeMetaTags, Qf.replaceClipboardChangedUrls]);
    },
    jl = function(t, e) {
      var n = tu(e);
      return Gc(t, n, [Qf.removeFragmentComments]);
    },
    Ul = {
      disabled: function() {
        return { discriminator: "disabled", data: {} };
      },
      fromClipboard: function(t) {
        return { discriminator: "fromClipboard", data: { rtf: t } };
      }
    },
    Bl = ct(Ul),
    Yl = Ul.disabled,
    Wl = Ul.fromClipboard,
    Hl = function(t, e) {
      var n = new RegExp(e, "i");
      return du(t, function(t) {
        return null !== t.match(n) ? F.some({ type: t, flavor: e }) : F.none();
      });
    },
    ql = {
      isValidData: function(t) {
        return void 0 !== t && void 0 !== t.types && null !== t.types;
      },
      getPreferredFlavor: function(t, e) {
        return du(t, function(t) {
          return Hl(e, t);
        });
      },
      getFlavor: Hl
    },
    $l = function(e) {
      return function(t) {
        return { discriminator: e, data: t };
      };
    },
    Vl = function(e) {
      return function(t) {
        return t.discriminator === e ? F.some(t.data) : F.none();
      };
    },
    Xl = $l("event"),
    Gl = $l("html"),
    zl = $l("images"),
    Kl = $l("word"),
    Jl = $l("text"),
    Zl = $l("void"),
    Ql = Vl("event"),
    td = Vl("html"),
    ed = Vl("images"),
    nd = Vl("word"),
    rd = Vl("text"),
    od = fo.detect().browser,
    id = !(od.isIE() || (od.isEdge() && od.version.major < 16)),
    ad = ["^image/", "file"],
    ud = function(t) {
      return (
        (to((e = t), "<html") &&
          (to(e, 'xmlns:o="urn:schemas-microsoft-com:office:office"') ||
            to(e, 'xmlns:x="urn:schemas-microsoft-com:office:excel"'))) ||
        to(t, 'meta name="ProgId" content="Word.Document"')
      );
      var e;
    },
    cd = function(t) {
      return to(t, "<meta") && to(t, 'id="docs-internal-guid');
    },
    sd = function(t) {
      return 0 < t.length;
    },
    fd = function(e, t) {
      return ql
        .getFlavor(e.types, t)
        .map(function(t) {
          return e.getData(t.type);
        })
        .filter(sd);
    },
    ld = function(t) {
      return fd(t, "html");
    },
    dd = function(t) {
      return ld(t).filter(cd);
    },
    md = function(t) {
      return id ? F.some(t.clipboardData).filter(ql.isValidData) : F.none();
    },
    pd = function(t) {
      var e = be.fromTag("div");
      eu(e, t);
      var n = jl(bo(e), e),
        r = be.fromTag("div");
      return eu(r, n), Gl({ container: r });
    },
    gd = function(t) {
      var e = function(r) {
          return void 0 === r.items
            ? F.none()
            : ql.getPreferredFlavor(ad, r.types).map(function(t) {
                for (var e = [], n = 0; n < r.items.length; n++)
                  e.push(r.items[n]);
                return zl({ images: e });
              });
        },
        r = function(e) {
          return du(e.types, function(t) {
            return "text/plain" === t
              ? F.some(e.getData(t)).map(function(t) {
                  return Jl({ text: t });
                })
              : F.none();
          });
        };
      return {
        getWordData: function() {
          return md(t).bind(function(n) {
            return ((t = n), ld(t).filter(ud)).map(function(t) {
              var e = fd(n, "rtf");
              return Kl({
                html: t,
                rtf: e.fold(
                  function() {
                    return Yl();
                  },
                  function(t) {
                    return Wl(t);
                  }
                )
              });
            });
            var t;
          });
        },
        getGoogleDocsData: function() {
          return md(t)
            .bind(dd)
            .map(pd);
        },
        getImage: function() {
          return md(t).bind(e);
        },
        getText: function() {
          return md(t).fold(function() {
            var t = g.window.clipboardData;
            return void 0 !== t
              ? F.some(Jl({ text: t.getData("text") }))
              : F.none();
          }, r);
        },
        getHtml: function() {
          return md(t)
            .bind(ld)
            .map(pd);
        },
        getOnlyText: function() {
          return md(t).bind(function(t) {
            return (
              (e = t.types),
              (n = "text/plain"),
              1 === e.length && e[0] === n ? r(t) : F.none()
            );
            var e, n;
          });
        },
        getNative: function() {
          return Xl({ nativeEvent: t });
        },
        getVoid: function() {
          return Zl({});
        }
      };
    },
    vd = function(t) {
      return {
        getWordData: function() {
          return F.some(Kl({ html: t, rtf: Yl() }));
        },
        getGoogleDocsData: F.none,
        getImage: F.none,
        getHtml: F.none,
        getText: F.none,
        getNative: C("There is no native event"),
        getOnlyText: F.none,
        getVoid: C("There is no paste event")
      };
    },
    hd = function(t) {
      return {
        getWordData: F.none,
        getGoogleDocsData: F.none,
        getImage: F.none,
        getHtml: F.none,
        getText: function() {
          return F.some(Jl({ text: t }));
        },
        getNative: C("There is no native event"),
        getOnlyText: F.none,
        getVoid: C("There is no paste event")
      };
    },
    yd = function(t) {
      return z(t, function(t) {
        return t.asset();
      });
    },
    bd = function(i, a) {
      var u = Tr.create({
          cancel: br([]),
          error: br(["message"]),
          insert: br(["elements", "assets", "correlated", "isInternal"])
        }),
        r = function(t, e, n) {
          var r = rc(i, a, t);
          r.capture() && n();
          var o = z(r.steps(), function(t) {
            return t(e);
          });
          oc(o, r.input()).get(function(t) {
            var r = t
              .bundle()
              .isInternal()
              .getOr(!1);
            Vu.cata(
              t.response(),
              function(t) {
                u.trigger.error(t);
              },
              function(t, e) {
                u.trigger.insert(t, yd(e), e, r);
              },
              function() {
                u.trigger.cancel();
              },
              function(t, e, n) {
                u.trigger.insert(t, yd(e), e, r), u.trigger.error(n);
              }
            );
          });
        },
        o = ka.tap(function(n) {
          Bu(n.target.ownerDocument.defaultView).each(function(t) {
            if (!Ei(t.start(), qa.bin())) {
              var e = gd(n);
              ja.willBlock() && (o.control.block(), n.preventDefault()),
                r(e, o.control, function() {
                  n.preventDefault();
                });
            }
          });
        });
      return {
        paste: o.instance,
        pasteCustom: function(t, e) {
          void 0 === e && (e = _);
          var n = ka.tap(_);
          r(t, n.control, e);
        },
        isBlocked: o.control.isBlocked,
        destroy: _,
        events: u.registry
      };
    },
    Td = function() {
      var e = F.none();
      return {
        convert: function(t) {
          e = (function(n) {
            var t,
              e = oe("window.clipboardData.files"),
              r =
                void 0 !== (t = n).convertURL
                  ? t.convertURL
                  : void 0 !== t.msConvertURL
                  ? t.msConvertURL
                  : void 0;
            if (void 0 !== e && void 0 !== r && 0 < e.length) {
              var o = _t(e, function(t) {
                var e = g.URL.createObjectURL(t);
                return r.apply(n, [t, "specified", e]), Jt(t, e);
              });
              return F.some(o);
            }
            return F.none();
          })(t);
        },
        listen: function(t) {
          return e
            .fold(
              function() {
                return St.nu(function(t) {
                  t([]);
                });
              },
              function(t) {
                return t;
              }
            )
            .get(t);
        },
        clear: function() {
          e = F.none();
        }
      };
    },
    xd = lr("asset", "image"),
    Ed = function(t, r) {
      return ht.cata(
        t,
        function(t, e, n) {
          return me(r, "src", n), !0;
        },
        O
      );
    },
    wd = function(t, r) {
      var o = [];
      return (
        K(t, function(t, e) {
          var n = r[e];
          Ed(t, n) && o.push(xd(t, n));
        }),
        o
      );
    },
    Id = function(t) {
      return _t(t, function(u) {
        return St.nu(function(i) {
          var t,
            a = u.dom();
          ((t = a), Ht(t)).then(function(o) {
            o.toBlob().then(function(t) {
              var e = eo(a.src, "blob:") ? a.src : g.URL.createObjectURL(t),
                n = Ot("image"),
                r = ht.blob(n, o, e);
              i(xd(r, u));
            });
          });
        });
      });
    },
    Sd = lr("futureAsset", "image"),
    Ld = function(e, t) {
      return ((n = t), Rt(n)).map(function(t) {
        return Sd(Kt(t), e);
      });
      var n;
    },
    Nd = function(t) {
      var e = be.fromTag("div");
      return Ji(e, t), Co(e, "img[src]");
    },
    _d = function(t) {
      return 0 === t.indexOf("data:") && -1 < t.indexOf("base64");
    },
    Cd = function(t) {
      return 0 === t.indexOf("blob:");
    },
    Od = function(t) {
      var e = ge(t, "src");
      return _d(e) || Cd(e);
    },
    Dd = function(t) {
      return it(Nd(t), function(t) {
        var n,
          e,
          r = ge(t, "src");
        return _d(r)
          ? Ld(t, r).toArray()
          : Cd(r)
          ? ((n = t),
            (e = r),
            Yt(e).map(function(t) {
              var e = St.nu(function(e) {
                t.then(function(t) {
                  Kt(t).get(e);
                });
              });
              return Sd(e, n);
            })).toArray()
          : [];
      });
    };
  function Pd(f) {
    return function(t, s) {
      return ec(function(a) {
        var u = function() {
            Zu(a, { response: s.response(), bundle: s.bundle() });
          },
          c = function(t) {
            var e,
              n,
              r = Z(Nd(t), Od);
            K(r, _a),
              Zu(a, {
                response:
                  0 < r.length
                    ? ((e = t),
                      (n = Z(e, function(t) {
                        return "img" !== ae(t) || !Od(t);
                      })),
                      Vu.incomplete(n, [], "errors.local.images.disallowed"))
                    : s.response(),
                bundle: s.bundle()
              });
          },
          t = function(t, e) {
            var n, r, o, i;
            !1 === f.allowLocalImages
              ? c(t)
              : 0 === e.length
              ? ((r = Dd((n = t))),
                (o = _t(r, function(t) {
                  return t.futureAsset();
                })),
                (i = z(r, function(t) {
                  return t.image();
                })),
                o.get(function(t) {
                  var e = wd(t, i);
                  Zu(a, { response: Vu.paste(n, e), bundle: s.bundle() });
                }))
              : u();
          };
        Vu.cata(s.response(), u, t, u, t);
      });
    };
  }
  var Ad = function(t) {
      return t.officeStyles().getOr(!0);
    },
    kd = function(t) {
      return t.htmlStyles().getOr(!1);
    },
    Md = function(t) {
      return t.isWord().getOr(!1);
    },
    Rd = {
      proxyBin: function(n) {
        return {
          handle: function(t, e) {
            return n.proxyBin().fold(function() {
              return (
                g.console.error(t),
                Ju({ response: Vu.cancel(), bundle: zu({}) })
              );
            }, e);
          }
        };
      },
      backgroundAssets: function(t) {
        return St.nu(function(e) {
          t.backgroundAssets().fold(
            function() {
              e([]);
            },
            function(t) {
              t.listen(e);
            }
          );
        });
      },
      merging: function(t) {
        var e = Md(t);
        return (e && Ad(t)) || (!e && kd(t));
      },
      mergeOffice: Ad,
      mergeNormal: kd,
      isWord: Md,
      isGoogleDocs: function(t) {
        return t.isGoogleDocs().getOr(!1);
      },
      isInternal: function(t) {
        return t.isInternal().getOr(!1);
      }
    },
    Fd = { resolve: wr("ephox-cement").resolve };
  function jd(s, r) {
    var f = r.translations,
      l = function(t, e, n) {
        n(F.some(ni(e, { officeStyles: t, htmlStyles: t })));
      };
    return {
      get: function(t, e) {
        var n = r[t ? "officeStyles" : "htmlStyles"];
        "clean" === n
          ? l(!1, r, e)
          : "merge" === n
          ? l(!0, r, e)
          : (function(t, e) {
              var n = be.fromTag("div");
              Ti(n, Fd.resolve("styles-dialog-content"));
              var r = be.fromTag("p"),
                o = qi(f("cement.dialog.paste.instructions"));
              Ji(r, o), Gi(n, r);
              var i = {
                  text: f("cement.dialog.paste.clean"),
                  tabindex: 0,
                  className: Fd.resolve("clean-styles"),
                  click: function() {
                    u(), l(!1, t, e);
                  }
                },
                a = {
                  text: f("cement.dialog.paste.merge"),
                  tabindex: 1,
                  className: Fd.resolve("merge-styles"),
                  click: function() {
                    u(), l(!0, t, e);
                  }
                },
                u = function() {
                  c.destroy();
                },
                c = s(!0);
              c.setTitle(f("cement.dialog.paste.title")),
                c.setContent(n),
                c.setButtons([i, a]),
                c.events.close.bind(function() {
                  e(F.none()), u();
                }),
                c.show();
            })(r, e);
      },
      destroy: _
    };
  }
  var Ud = function(t, e) {
      var i = jd(t, e);
      return function(t, r) {
        var e = r.bundle(),
          o = r.response();
        return ec(function(n) {
          i.get(Rd.isWord(e), function(t) {
            var e = t.fold(
              function() {
                return { response: Vu.cancel(), bundle: r.bundle() };
              },
              function(t) {
                return {
                  response: o,
                  bundle: zu({
                    officeStyles: t.officeStyles,
                    htmlStyles: t.htmlStyles
                  })
                };
              }
            );
            Zu(n, e);
          });
        });
      };
    },
    Bd = Ud,
    Yd = function(r, o) {
      return function(t, e) {
        var n = function(t) {
          return Ju({
            response: e.response(),
            bundle: zu({ officeStyles: t, htmlStyles: t })
          });
        };
        return Rd.isInternal(e.bundle())
          ? n(!0)
          : Rd.isGoogleDocs(e.bundle())
          ? n(!1)
          : Ud(r, o)(t, e);
      };
    },
    Wd = function(t) {
      return (function(t) {
        var e = t.dom();
        try {
          var n = e.contentWindow
            ? e.contentWindow.document
            : e.contentDocument;
          return null != n ? F.some(be.fromDom(n)) : F.none();
        } catch (t) {
          return (
            g.console.log("Error reading iframe: ", e),
            g.console.log("Error was: " + t),
            F.none()
          );
        }
      })(t).fold(
        function() {
          return t;
        },
        function(t) {
          return t;
        }
      );
    },
    Hd = function(t, e) {
      if (!Or(t))
        throw "Internal error: attempted to write to an iframe that is not in the DOM";
      var n = Wd(t).dom();
      n.open("text/html", "replace"), n.writeln(e), n.close();
    };
  var qd,
    $d,
    Vd,
    Xd = function(t) {
      var e = t.dom().styleSheets;
      return Array.prototype.slice.call(e);
    },
    Gd = function(t) {
      var e = t.cssRules;
      return it(e, function(t) {
        return t.type === g.CSSRule.IMPORT_RULE
          ? Gd(t.styleSheet)
          : t.type === g.CSSRule.STYLE_RULE
          ? [
              (function(t) {
                var e = t.selectorText,
                  n = t.style.cssText;
                if (void 0 === n)
                  throw new Error(
                    "WARNING: Browser does not support cssText property"
                  );
                return { selector: e, style: n, raw: t.style };
              })(t)
            ]
          : [];
      });
    },
    zd = function(t) {
      return it(t, Gd);
    },
    Kd = {},
    Jd = { exports: Kd };
  ($d = Kd),
    (Vd = Jd),
    (qd = void 0),
    (function(t) {
      "object" == typeof $d && void 0 !== Vd
        ? (Vd.exports = t())
        : "function" == typeof qd && qd.amd
        ? qd([], t)
        : (("undefined" != typeof window
            ? window
            : "undefined" != typeof global
            ? global
            : "undefined" != typeof self
            ? self
            : this
          ).EphoxContactWrapper = t());
    })(function() {
      return (function i(a, u, c) {
        function s(e, t) {
          if (!u[e]) {
            if (!a[e]) {
              var n = !1;
              if (!t && n) return n(e, !0);
              if (f) return f(e, !0);
              var r = new Error("Cannot find module '" + e + "'");
              throw ((r.code = "MODULE_NOT_FOUND"), r);
            }
            var o = (u[e] = { exports: {} });
            a[e][0].call(
              o.exports,
              function(t) {
                return s(a[e][1][t] || t);
              },
              o,
              o.exports,
              i,
              a,
              u,
              c
            );
          }
          return u[e].exports;
        }
        for (var f = !1, t = 0; t < c.length; t++) s(c[t]);
        return s;
      })(
        {
          1: [
            function(t, e, n) {
              var r,
                a,
                o =
                  ((r = function(t) {
                    var e,
                      n,
                      r,
                      o,
                      i = [];
                    for (r = 0, o = (e = t.split(",")).length; r < o; r += 1)
                      0 < (n = e[r]).length && i.push(a(n));
                    return i;
                  }),
                  (a = function(c) {
                    var t,
                      e,
                      n,
                      s = c,
                      f = { a: 0, b: 0, c: 0 },
                      l = [];
                    return (
                      (t = function(t, e) {
                        var n, r, o, i, a, u;
                        if (t.test(s))
                          for (
                            r = 0, o = (n = s.match(t)).length;
                            r < o;
                            r += 1
                          )
                            (f[e] += 1),
                              (i = n[r]),
                              (a = s.indexOf(i)),
                              (u = i.length),
                              l.push({
                                selector: c.substr(a, u),
                                type: e,
                                index: a,
                                length: u
                              }),
                              (s = s.replace(i, Array(u + 1).join(" ")));
                      }),
                      (e = function(t) {
                        var e, n, r, o;
                        if (t.test(s))
                          for (
                            n = 0, r = (e = s.match(t)).length;
                            n < r;
                            n += 1
                          )
                            (o = e[n]),
                              (s = s.replace(o, Array(o.length + 1).join("A")));
                      })(/\\[0-9A-Fa-f]{6}\s?/g),
                      e(/\\[0-9A-Fa-f]{1,5}\s/g),
                      e(/\\./g),
                      (n = /:not\(([^\)]*)\)/g).test(s) &&
                        (s = s.replace(n, "     $1 ")),
                      (function() {
                        var t,
                          e,
                          n,
                          r,
                          o = /{[^]*/gm;
                        if (o.test(s))
                          for (
                            e = 0, n = (t = s.match(o)).length;
                            e < n;
                            e += 1
                          )
                            (r = t[e]),
                              (s = s.replace(r, Array(r.length + 1).join(" ")));
                      })(),
                      t(/(\[[^\]]+\])/g, "b"),
                      t(/(#[^\#\s\+>~\.\[:]+)/g, "a"),
                      t(/(\.[^\s\+>~\.\[:]+)/g, "b"),
                      t(
                        /(::[^\s\+>~\.\[:]+|:first-line|:first-letter|:before|:after)/gi,
                        "c"
                      ),
                      t(/(:[\w-]+\([^\)]*\))/gi, "b"),
                      t(/(:[^\s\+>~\.\[:]+)/g, "b"),
                      (s = (s = s.replace(/[\*\s\+>~]/g, " ")).replace(
                        /[#\.]/g,
                        " "
                      )),
                      t(/([^\s\+>~\.\[:]+)/g, "c"),
                      l.sort(function(t, e) {
                        return t.index - e.index;
                      }),
                      {
                        selector: c,
                        specificity:
                          "0," +
                          f.a.toString() +
                          "," +
                          f.b.toString() +
                          "," +
                          f.c.toString(),
                        specificityArray: [0, f.a, f.b, f.c],
                        parts: l
                      }
                    );
                  }),
                  {
                    calculate: r,
                    compare: function(t, e) {
                      var n, r, o;
                      if ("string" == typeof t) {
                        if (-1 !== t.indexOf(",")) throw "Invalid CSS selector";
                        n = a(t).specificityArray;
                      } else {
                        if (!Array.isArray(t))
                          throw "Invalid CSS selector or specificity array";
                        if (
                          4 !==
                          t.filter(function(t) {
                            return "number" == typeof t;
                          }).length
                        )
                          throw "Invalid specificity array";
                        n = t;
                      }
                      if ("string" == typeof e) {
                        if (-1 !== e.indexOf(",")) throw "Invalid CSS selector";
                        r = a(e).specificityArray;
                      } else {
                        if (!Array.isArray(e))
                          throw "Invalid CSS selector or specificity array";
                        if (
                          4 !==
                          e.filter(function(t) {
                            return "number" == typeof t;
                          }).length
                        )
                          throw "Invalid specificity array";
                        r = e;
                      }
                      for (o = 0; o < 4; o += 1) {
                        if (n[o] < r[o]) return -1;
                        if (n[o] > r[o]) return 1;
                      }
                      return 0;
                    }
                  });
              void 0 !== n &&
                ((n.calculate = o.calculate), (n.compare = o.compare));
            },
            {}
          ],
          2: [
            function(t, e, n) {
              var r = t("specificity");
              e.exports = { boltExport: r };
            },
            { specificity: 1 }
          ]
        },
        {},
        [2]
      )(2);
    });
  var Zd = Jd.exports.boltExport,
    Qd = function(e, t) {
      var n = it(t, function(i) {
        var t = Co(e, i.selector);
        return (
          K(t, function(t) {
            var n,
              r,
              o,
              e =
                ((n = i.raw),
                (r = t),
                (o = {}),
                K(n, function(t) {
                  if (void 0 !== n[t]) {
                    var e = r.dom().style;
                    X(e, t) || (o[t] = n[t]);
                  }
                }),
                o);
            Ga(t, e);
          }),
          t
        );
      });
      K(n, function(t) {
        he(t, "class");
      });
    },
    tm = function(t, e) {
      var n = function(t) {
          return -1 !== t.selector.indexOf(",");
        },
        r = it(Z(t, n), function(e) {
          var t = e.selector.split(",");
          return z(t, function(t) {
            return { selector: t.trim(), raw: e.raw };
          });
        }),
        o = Z(t, function(t) {
          return !n(t);
        }).concat(r);
      o
        .sort(function(t, e) {
          return Zd.compare(t.selector, e.selector);
        })
        .reverse(),
        Qd(e, o);
    },
    em = {
      inlineStyles: function(t, e, n) {
        var r = Xd(t),
          o = zd(r).map(function(t) {
            var e = t.selector;
            return { selector: n.hasOwnProperty(e) ? n[e] : e, raw: t.raw };
          });
        tm(o, e);
      },
      inlinePrefixedStyles: function(t, e, n) {
        var r = Xd(t),
          o = zd(r),
          i = Z(o, function(t) {
            return eo(t.selector, n);
          });
        tm(i, e);
      }
    },
    nm = {
      inlineStyles: em.inlineStyles,
      inlinePrefixedStyles: em.inlinePrefixedStyles
    },
    rm = { p: "p, li[data-converted-paragraph]" },
    om = _,
    im = function(f, t) {
      var l = function(n) {
          he(n, "data-list-level"),
            he(n, "data-text-indent-alt"),
            he(n, "data-border-margin"),
            Za(n, "margin-left"),
            Za(n, "text-indent"),
            st(
              (function(t) {
                var e = {},
                  n = t.dom();
                if ($a(n))
                  for (var r = 0; r < n.style.length; r++) {
                    var o = n.style.item(r);
                    e[o] = n.style[o];
                  }
                return e;
              })(n),
              function(t, e) {
                !e.startsWith("border") ||
                  ("border-image" !== e &&
                    "none" !== t.trim() &&
                    "initial" !== t.trim()) ||
                  Za(n, e);
              }
            );
        },
        e = Co(f, "li[data-converted-paragraph]");
      if (
        (K(e, function(t) {
          he(t, "data-converted-paragraph");
        }),
        t)
      ) {
        var n = Co(f, "li");
        K(n, function(t) {
          var e,
            n,
            r,
            o,
            i,
            a,
            u =
              ((e = f),
              (n = be.fromTag("span")),
              Xi(e, n),
              (r = n),
              {
                convertToPx: function(t) {
                  var e;
                  return (
                    Xa(r, "margin-left", t),
                    (e = za(r, "margin-left")),
                    parseFloat(e.match(/-?\d+\.?\d*/)[0])
                  );
                },
                destroy: function() {
                  return _a(r);
                }
              }),
            c =
              ((i = u),
              (a = ve((o = f), "data-tab-interval")
                ? ge(o, "data-tab-interval")
                : "36pt"),
              i.convertToPx(a)),
            s = am(t, c, u).getOr({});
          l(t), u.destroy(), Ga(t, s);
        });
        var r = Co(f, "ol,ul");
        K(r, function(e) {
          var t = Co(e, "li");
          Ja(e, "margin-top").isNone() &&
            F.from(t[0]).each(function(t) {
              Xa(e, "margin-top", za(t, "margin-top"));
            }),
            Ja(e, "margin-bottom").isNone() &&
              F.from(t[t.length - 1]).each(function(t) {
                Xa(e, "margin-bottom", za(t, "margin-bottom"));
              });
        });
      }
      he(f, "data-tab-interval");
    },
    am = function(l, d, m) {
      var p = function(t) {
        return ve(t, "data-list-level")
          ? parseInt(ge(t, "data-list-level"), 10)
          : 1;
      };
      return Ja(l, "text-indent").bind(function(f) {
        return Ja(l, "margin-left").map(function(t) {
          var e = Ja(l, "list-style").exists(function(t) {
              return to(t, "none");
            }),
            n = ve(l, "data-border-margin")
              ? ge(l, "data-border-margin")
              : "0px",
            r = e ? p(l) + 1 : p(l),
            o = m.convertToPx(t) + m.convertToPx(n),
            i = d * r,
            a = ve(l, "data-text-indent-alt")
              ? m.convertToPx(ge(l, "data-text-indent-alt"))
              : m.convertToPx(f),
            u = {},
            c = (d / 2) * -1 - a;
          0 < c && (u["text-indent"] = c + "px");
          var s = o - i - c;
          return (u["margin-left"] = 0 < s ? s + "px" : "0px"), u;
        });
      });
    },
    um = function(t, e, n) {
      var r = n.mergeInline();
      (r ? nm.inlineStyles : om)(t, e, rm), im(e, r);
    },
    cm = function(n) {
      var t,
        r =
          ((t = be.fromDom(g.document.body)),
          {
            play: function(i, a, u) {
              var c = be.fromTag("div"),
                s = be.fromTag("iframe");
              Ga(c, { display: "none" });
              var f = ma(s, "load", function() {
                f.unbind(), Hd(s, i);
                var t = s.dom().contentWindow.document;
                if (void 0 === t)
                  throw "sandbox iframe load event did not fire correctly";
                var e = be.fromDom(t),
                  n = t.body;
                if (void 0 === n) throw "sandbox iframe does not have a body";
                var r = be.fromDom(n),
                  o = a(e, r);
                _a(c), g.setTimeout(y(u, o), 0);
              });
              Gi(c, s), Gi(t, c);
            }
          });
      return function(t, e) {
        r.play(
          t,
          function(t, e) {
            return um(t, e, { mergeInline: h(n) }), tu(e);
          },
          e
        );
      };
    },
    sm = function(t, i, e, a) {
      var n = t.html;
      return ec(function(o) {
        e.cleanDocument(n, i).get(function(t) {
          t.fold(
            function(t) {
              console.error("PowerPaste error code: WIM01"),
                Zu(o, {
                  response: Vu.error("errors.paste.process.failure"),
                  bundle: zu({})
                });
            },
            function(t) {
              var e, n, u, c, r;
              null == (r = t) || 0 === r.length
                ? Zu(o, { response: Vu.paste([], []), bundle: zu({}) })
                : ((e = o),
                  (n = t),
                  (u = a),
                  (c = function(t) {
                    Zu(e, { response: t, bundle: zu({}) });
                  }),
                  cm(i)(n, function(t) {
                    var e = qi(t),
                      n = function(t) {
                        c(Vu.paste(e, t));
                      },
                      r = be.fromTag("div");
                    Ji(r, e);
                    var o = Z(vo("img[src]", r), function(t) {
                        var e = ge(t, "src");
                        return eo(e, "blob:") || eo(e, "data:");
                      }),
                      i = vo("img[data-image-src]", r);
                    if (0 === o.length && 0 === i.length) n([]);
                    else if (u)
                      K(o, function(t) {
                        return he(t, "id");
                      }),
                        Id(o).get(n);
                    else {
                      K(o, _a), K(i, _a);
                      var a = So(r);
                      c(Vu.incomplete(a, [], "errors.local.images.disallowed"));
                    }
                  }));
            }
          );
        });
      });
    },
    fm = function(t) {
      var e = Z(t, function(t) {
          return "file" === t.kind && /image/.test(t.type);
        }),
        r = Q(
          e,
          function(t, e) {
            var n = e.getAsFile();
            return null !== n ? t.concat(n) : t;
          },
          []
        );
      return ec(function(n) {
        Zt(r).get(function(t) {
          var i,
            a,
            e =
              ((i = []),
              (a = []),
              K(t, function(o) {
                return ht.cata(
                  o,
                  function(t, e, n) {
                    var r = be.fromTag("img");
                    me(r, "src", n), i.push(r), a.push(xd(o, r));
                  },
                  function(t, e, n) {
                    g.console.error(
                      "Internal error: Paste operation produced an image URL instead of a Data URI: ",
                      e
                    );
                  }
                );
              }),
              Vu.paste(i, a));
          Zu(n, { response: e, bundle: zu({}) });
        });
      });
    },
    lm = fo.detect(),
    dm = function(t) {
      try {
        var e = t(),
          n = null != e && 0 < e.length ? qi(e) : [];
        return Fo.value(n);
      } catch (t) {
        return (
          g.console.error("PowerPaste error code: PT01. Message: ", t),
          Fo.error("errors.paste.process.failure")
        );
      }
    },
    mm = function(t) {
      return t.fold(
        function(t) {
          return tc(t);
        },
        function(t) {
          return Ju({ response: Vu.paste(t, []), bundle: zu({}) });
        }
      );
    },
    pm = function(t, e, n, r) {
      return dm(function() {
        return Ml(t, lm, e, n, r);
      });
    },
    gm = function(t, e, n) {
      var r = pm(t, e, n, !1);
      return mm(r);
    },
    vm = function(t, e) {
      var n = dm(function() {
        return Fl(t, e);
      });
      return mm(n);
    },
    hm = function(t, e, n, r, o) {
      return pm(t, e, r, n).fold(
        function(t) {
          return tc(t);
        },
        function(a) {
          return ec(function(r) {
            o.get(function(t) {
              var e,
                o,
                i,
                n =
                  ((e = t),
                  (o = []),
                  (i = it(a, function(t) {
                    return "img" === ae(t) ? [t] : Co(t, "img");
                  })),
                  K(e, function(r) {
                    ht.cata(
                      r,
                      function(t, e, n) {
                        K(i, function(t) {
                          ge(t, "src") === n && o.push(xd(r, t));
                        });
                      },
                      _
                    );
                  }),
                  o);
              Zu(r, { response: Vu.paste(a, n), bundle: zu({}) });
            });
          });
        }
      );
    },
    ym = function(t, e, n) {
      var r = e.findClipboardTags(So(n)).getOr([]);
      K(r, _a);
      var o = St.nu(function(t) {
        return t([]);
      });
      return hm(t, n, !1, !0, o);
    },
    bm = function(t, e, n, r, o) {
      return hm(t, e, r, n, o);
    },
    Tm = function(t) {
      return "\n" === t || "\r" === t;
    },
    xm = function(o) {
      return Q(
        o,
        function(t, e) {
          return -1 !== " \f\t\v".indexOf(e) || "\xa0" === e
            ? t.pcIsSpace ||
              "" === t.str ||
              t.str.length === o.length - 1 ||
              ((n = o), (r = t.str.length + 1) < n.length && 0 <= r && Tm(n[r]))
              ? { pcIsSpace: !1, str: t.str + "\xa0" }
              : { pcIsSpace: !0, str: t.str + " " }
            : { pcIsSpace: Tm(e), str: t.str + e };
          var n, r;
        },
        { pcIsSpace: !1, str: "" }
      ).str;
    },
    Em = function(t) {
      var e,
        n = be.fromTag("div");
      return (e = t), (n.dom().textContent = e), tu(n);
    },
    wm = function(t) {
      var e = xm(t)
          .replace(/^[\r\n]*|[\r\n]*$/g, "")
          .split(/\n{2,}|(?:\r\n){2,}/),
        n = z(e, function(t) {
          return t.split(/\n|\r\n/).join("<br />");
        });
      return 1 === n.length
        ? n[0]
        : z(n, function(t) {
            return "<p>" + t + "</p>";
          }).join("");
    },
    Im = function(t) {
      var a = rd(t).getOrDie("Required text input for Text Handler");
      return ec(function(t) {
        var e,
          n,
          r,
          o,
          i =
            0 < a.text.length
              ? ((e = a.text),
                (n = Em(e)),
                (r = wm(n)),
                (o = qi(r)),
                Vu.paste(o, []))
              : Vu.cancel();
        Zu(t, { response: i, bundle: zu({}) });
      });
    },
    Sm = function(t, e) {
      return Im(t);
    },
    Lm = function(t, o) {
      var e = function(t, e) {
          var n = be.fromTag("div");
          Ji(n, t), Rl(n);
          var r = So(n);
          return Ju({ response: Vu.paste(r, e), bundle: o.bundle() });
        },
        n = y(Qu, o);
      return Vu.cata(o.response(), n, e, n, e);
    },
    Nm = function() {
      return function(t, e) {
        return tc("errors.local.images.disallowed");
      };
    },
    _m = function() {
      return function(t, e) {
        var n = ed(t).getOrDie("Must have image data for images handler");
        return fm(n.images);
      };
    },
    Cm = function(i) {
      return function(t, e) {
        var n = td(t).getOrDie("Wrong input type for HTML handler"),
          r = i.findClipboardTags(So(n.container));
        r.each(function(t) {
          K(t, _a);
        });
        var o = r.isSome();
        return Ju({ response: e.response(), bundle: zu({ isInternal: o }) });
      };
    },
    Om = function(a, u) {
      return function(t, e) {
        var n = td(t).getOrDie("Wrong input type for HTML handler").container,
          r = bo(u),
          o = e.bundle();
        if (Rd.isInternal(o)) return vm(r, n);
        a(n);
        var i = Rd.merging(o);
        return gm(r, n, i);
      };
    },
    Dm = function(u, c) {
      return function(t, e) {
        var a = e.bundle();
        return Rd.proxyBin(a).handle(
          "There was no proxy bin setup. Ensure you have run proxyStep first.",
          function(t) {
            var e = Rd.merging(a),
              n = Rd.isWord(a),
              r = Rd.isInternal(a),
              o = Rd.backgroundAssets(a),
              i = bo(u);
            return r ? ym(i, c, t) : bm(i, t, e, n, o);
          }
        );
      };
    },
    Pm = function(o, i) {
      return function(t, e) {
        var n = nd(t).getOrDie("Wrong input type for Word Import handler"),
          r = Rd.mergeOffice(e.bundle());
        return sm(n, r, o, i);
      };
    },
    Am = function(r) {
      return function(t, e) {
        var n = Gu(e.bundle(), zu(r));
        return Ju({ response: e.response(), bundle: n });
      };
    },
    km = function(t, e) {
      return Ju({ response: Vu.cancel(), bundle: zu({}) });
    },
    Mm = function(t, e) {
      return Tf(t, function(t) {
        return !!ve(t, "style") && -1 < ge(t, "style").indexOf("mso-");
      });
    },
    Rm = function(t, e) {
      var n = tu(t);
      return Xc(n, e);
    },
    Fm = function(t, e) {
      var n = t.browser;
      return (n.isIE() && 11 <= n.version.major ? Mm : Rm)(e, t);
    },
    jm = Fd.resolve("smartpaste-eph-bin"),
    Um = { binStyle: h(jm) },
    Bm = fo.detect();
  function Ym(r, f, o, l, i) {
    return function(t, e) {
      var n = Ql(t).getOrDie("Must pass through event type").nativeEvent,
        c = i(),
        s = e.response();
      return ec(function(u) {
        var t = r(o);
        t.events.after.bind(function(t) {
          var e = t.container();
          if (
            Bm.browser.isSafari() &&
            Oi(e, 'img[src^="webkit-fake-url"]').isSome()
          ) {
            var n = Bm.deviceType.isWebView()
              ? "webview.imagepaste"
              : "safari.imagepaste";
            Zu(u, { response: Vu.error(n), bundle: zu({}) });
          } else {
            f(e), Ti(e, Um.binStyle());
            var r = Fm(Bm, e),
              o = So(e),
              i = l.findClipboardTags(o).isSome(),
              a = G(o, function(t) {
                return ve(t, "id") && eo(ge(t, "id"), "docs-internal-guid");
              });
            Zu(u, {
              response: s,
              bundle: zu({
                isWord: r,
                isGoogleDocs: a,
                isInternal: i,
                proxyBin: e,
                backgroundAssets: c
              })
            });
          }
        }),
          c.convert(n),
          t.run();
      });
    };
  }
  var Wm = function(t, e) {
      if (0 === t.length)
        throw new Error("Zero length content passed to Hex conversion");
      var n = (function(t) {
          for (var e = new Array(t.length / 2), n = 0; n < t.length; n += 2) {
            var r = t.substr(n, 2);
            e[Math.floor(n / 2)] = parseInt(r, 16);
          }
          return e;
        })(t),
        r = new Uint8Array(n);
      return new g.Blob([r], { type: e });
    },
    Hm = gt([
      { unsupported: ["id", "message", "isEquation", "attrs"] },
      { supported: ["id", "contentType", "blob", "isEquation", "attrs"] }
    ]),
    qm = {
      unsupported: Hm.unsupported,
      supported: Hm.supported,
      cata: function(t, e, n) {
        return t.fold(e, n);
      }
    },
    $m = function(t, e, n) {
      return e.indexOf(t, n);
    },
    Vm = function(t, e, n, r, o, i, a) {
      return -1 === t || -1 === e
        ? F.none()
        : F.some({
            start: t,
            end: e,
            bower: n,
            regex: r,
            idRef: o,
            isEquation: i,
            attrs: a
          });
    },
    Xm = function(t, e, n) {
      return t.substring(e, n);
    },
    Gm = function(t, e) {
      if (-1 === e) return e;
      var n = 0,
        r = t.length;
      do {
        var o = t.indexOf("{", e),
          i = t.indexOf("}", e);
        if (
          (o < i && -1 !== o
            ? ((e = o + 1), ++n)
            : (i < o || o < 0) && -1 !== i && ((e = i + 1), --n),
          r < e || -1 === i)
        )
          return -1;
      } while (0 < n);
      return e;
    },
    zm = function(t, e, n, r, o) {
      var i,
        a,
        u,
        c = Xm(t, n, r),
        s =
          ((a = $m("\\picscalex", (i = t), n)),
          (u = $m("\\bliptag", i, a)),
          -1 < a && a < u ? F.from(i.substring(a, u)) : F.none());
      return Vm(n, r, c, /[^a-fA-F0-9]([a-fA-F0-9]+)\}$/, "i", o, s);
    },
    Km = function(t, e, n, r, o) {
      var i = Xm(t, n, r);
      return Vm(n, r, i, /([a-fA-F0-9]{64,})(?:\}.*)/, "s", o, F.none());
    },
    Jm = function(t, e) {
      var n = $m("{\\pict{", t, e),
        r = Gm(t, n),
        o = $m("{\\shp{", t, e),
        i = Gm(t, o),
        a = $m("{\\mmathPict{", t, e),
        u = Gm(t, a),
        c = -1 !== a && ((a < n && r < u) || (a < o && i < u)),
        s = y(Km, t, e, o, i, c),
        f = y(zm, t, e, n, r, c);
      return -1 === n && -1 === o
        ? F.none()
        : -1 === n
        ? s()
        : -1 === o
        ? f()
        : o < n && r < i
        ? f()
        : n < o && i < r
        ? s()
        : n < o
        ? f()
        : o < n
        ? s()
        : F.none();
    },
    Zm = function(t, e) {
      return Jm(t, e);
    },
    Qm = function(t) {
      return 0 <= t.indexOf("\\pngblip")
        ? Fo.value("image/png")
        : 0 <= t.indexOf("\\jpegblip")
        ? Fo.value("image/jpeg")
        : Fo.error("errors.imageimport.unsupported");
    },
    tp = function(t, e) {
      var n = t.match(e);
      return n && n[1] && n[1].length % 2 == 0
        ? Fo.value(n[1])
        : Fo.error("errors.imageimport.invalid");
    },
    ep = function(t) {
      var e = t.match(/\\shplid(\d+)/);
      return null !== e ? F.some(e[1]) : F.none();
    },
    np = function(t) {
      for (
        var u = [],
          e = function() {
            return t.length;
          },
          n = function(t) {
            var e,
              r,
              o,
              i,
              a,
              n =
                ((r = (e = t).bower),
                (o = e.regex),
                (i = e.isEquation),
                (a = e.attrs),
                ep(r).map(function(t) {
                  var n = e.idRef + t;
                  return Qm(r).fold(
                    function(t) {
                      return qm.unsupported(n, t, i, a);
                    },
                    function(e) {
                      return tp(r, o).fold(
                        function(t) {
                          return qm.unsupported(n, t, i, a);
                        },
                        function(t) {
                          return qm.supported(n, e, Wm(t, e), i, a);
                        }
                      );
                    }
                  );
                }));
            return (u = u.concat(n.toArray())), t.end;
          },
          r = 0;
        r < t.length;

      )
        r = Zm(t, r).fold(e, n);
      return u;
    },
    rp = function(t) {
      var e = t.replace(/\r/g, "").replace(/\n/g, "");
      return np(e);
    },
    op = function(t) {
      return rp(t);
    },
    ip = function(t) {
      return qm.cata(
        t,
        function(t, e, n) {
          return t;
        },
        function(t, e, n, r, o) {
          return t;
        }
      );
    },
    ap = function(t) {
      return qm.cata(
        t,
        function(t, e, n) {
          return n;
        },
        function(t, e, n, r, o) {
          return r;
        }
      );
    },
    up = function(t) {
      return qm.cata(
        t,
        function(t, e, n) {
          return Fo.error(e);
        },
        function(t, e, n, r, o) {
          return Fo.value(n);
        }
      );
    };
  function cp(u, c, s, f, l) {
    return u.toCanvas().then(function(t) {
      return (
        (e = t),
        (n = u.getType()),
        (r = c),
        (o = s),
        At((i = Dt(f, l))).drawImage(e, -r, -o),
        jt((a = i), n).then(function(t) {
          return Wt(kt.resolve(a), t, a.toDataURL());
        })
      );
      var e, n, r, o, i, a;
    });
  }
  var sp = function(t, e) {
      var n = new RegExp("\\\\pic" + e + "(\\-?\\d+)\\\\"),
        r = t.match(n)[1];
      return parseInt(r, 10);
    },
    fp = function(t, e, n) {
      var r = y(sp, t),
        o = r("wgoal"),
        i = r("hgoal"),
        a = o / e,
        u = i / n,
        c = r("cropl"),
        s = r("cropt");
      return {
        cropl: c / a,
        cropt: s / u,
        cropw: (o - c - r("cropr")) / a,
        croph: (i - s - r("cropb")) / u
      };
    },
    lp = function(m, t) {
      return t.fold(
        function() {
          return new Tt(function(t) {
            return t(m);
          });
        },
        function(d) {
          return ht.cata(
            m,
            function(s, f, l) {
              return f.toCanvas().then(function(t) {
                var e,
                  n,
                  r,
                  o,
                  i,
                  a = parseInt(ge(be.fromDom(t), "width"), 10) || 1,
                  u = parseInt(ge(be.fromDom(t), "height"), 10) || 1,
                  c = fp(d, a, u);
                return a === c.cropw &&
                  u === c.croph &&
                  0 === c.cropl &&
                  0 === c.cropt
                  ? Tt.resolve(m)
                  : ((e = f),
                    (n = c.cropl),
                    (r = c.cropt),
                    (o = c.cropw),
                    (i = c.croph),
                    cp(e, n, r, o, i)).then(function(n) {
                      return n.toBlob().then(function(t) {
                        g.URL.revokeObjectURL(l);
                        var e = g.URL.createObjectURL(t);
                        return ht.blob(s, n, e);
                      });
                    });
              });
            },
            function(t, e, n) {
              return new Tt(function(t) {
                return t(m);
              });
            }
          );
        }
      );
    },
    dp = function(t, n) {
      return t.length === n.length
        ? Tt.all(
            z(t, function(t, e) {
              return lp(t, n[e]);
            })
          )
        : Tt.resolve(t);
    },
    mp = function(t, e, i, a, u) {
      var c = [],
        s = [],
        f = !1;
      return {
        blobs: it(t, function(r, n) {
          var o = ge(r, "data-image-id");
          return (
            he(r, "rtf-data-image"),
            he(r, "data-image-id"),
            he(r, "data-ms-equation"),
            u || he(r, "data-image-src"),
            "unsupported" === o
              ? ((f = !0),
                me(r, "alt", i("errors.imageimport.unsupported")),
                [])
              : tt(e, function(t, e) {
                  return a(t, e, o, n);
                }).fold(
                  function() {
                    return (
                      g.console.log(
                        "WARNING: unable to find data for image ",
                        r.dom()
                      ),
                      (f = !0),
                      me(r, "alt", i("errors.imageimport.unsupported")),
                      []
                    );
                  },
                  function(n) {
                    return up(n).fold(
                      function(t) {
                        return (
                          (f = !0),
                          g.console.error("PowerPaste error code: RTF04"),
                          me(r, "alt", i(t)),
                          []
                        );
                      },
                      function(t) {
                        var e;
                        return (
                          c.push(r),
                          s.push(
                            ((e = n),
                            qm.cata(
                              e,
                              function(t, e, n) {
                                return F.none();
                              },
                              function(t, e, n, r, o) {
                                return o;
                              }
                            ))
                          ),
                          u && he(r, "data-image-src"),
                          [t]
                        );
                      }
                    );
                  }
                )
          );
        }),
        filteredImages: c,
        imageAttrs: s,
        failedImage: f
      };
    },
    pp = {
      convert: function(t, e, n, r, o) {
        var i = Q(
            e,
            function(e, n) {
              var r = ip(n),
                o = ap(n);
              return et(e, function(t) {
                return !(o || ap(t)) && ip(t) === r;
              }).fold(
                function() {
                  return e.concat([n]);
                },
                function(t) {
                  return up(e[t]).isValue()
                    ? e
                    : e
                        .slice(0, t)
                        .concat(e.slice(t + 1))
                        .concat([n]);
                }
              );
            },
            []
          ),
          a = o.keepSrc || !1,
          u = J(i, function(t) {
            return !ap(t);
          }),
          c = u.pass,
          s = u.fail,
          f = J(t, function(t) {
            return !("true" === ge(t, "data-ms-equation"));
          }),
          l = f.pass,
          d = f.fail,
          m = mp(
            l,
            c,
            r,
            function(t, e, n, r) {
              return ip(t) === n;
            },
            a
          ),
          p = mp(
            d,
            s,
            r,
            function(t, e, n, r) {
              return e === r;
            },
            a
          ),
          g = m.filteredImages.concat(p.filteredImages),
          v = m.imageAttrs.concat(p.imageAttrs),
          h = m.blobs.concat(p.blobs),
          y = m.failedImage || p.failedImage;
        Zt(h).get(function(t) {
          dp(t, v).then(function(t) {
            var e = wd(t, g);
            n(e, y);
          });
        });
      }
    },
    gp = function(t) {
      return Co(t, "[rtf-data-image]");
    },
    vp = {
      exists: function(t) {
        return 0 < gp(t).length;
      },
      find: gp
    };
  function hp(i) {
    var a,
      u,
      c =
        ((a = i.translations),
        {
          events: (u = Tr.create({
            insert: br(["elements", "correlated"]),
            incomplete: br(["elements", "correlated", "message"])
          })).registry,
          processRtf: function(o, i, t, e) {
            var n = op(t),
              r = vp.find(o);
            pp.convert(
              r,
              n,
              function(t, e) {
                var n = So(o),
                  r = t.concat(i);
                e
                  ? (console.error("PowerPaste error code: RTF01"),
                    u.trigger.incomplete(n, r, "errors.imageimport.failed"))
                  : u.trigger.insert(n, r);
              },
              a,
              e
            );
          }
        }),
      s = Rs(F.none()),
      f = function(e) {
        s.get().each(function(t) {
          Zu(t, { response: e, bundle: zu({}) });
        });
      };
    return (
      c.events.insert.bind(function(t) {
        f(Vu.paste(t.elements(), t.correlated()));
      }),
      c.events.incomplete.bind(function(t) {
        console.error("PowerPaste error code: RTF02"),
          f(Vu.incomplete(t.elements(), t.correlated(), t.message()));
      }),
      function(t, r) {
        var e = nd(t).getOrDie("Word input required for rtf data"),
          n = function(o) {
            return ec(function(e) {
              var t = function() {
                  Zu(e, { response: r.response(), bundle: r.bundle() });
                },
                n = function(t, n) {
                  s.set(F.some(e));
                  var r = be.fromTag("div");
                  Ji(r, t),
                    o.fold(
                      function() {
                        var t,
                          e = vp.find(r);
                        return 0 < e.length
                          ? (function(t) {
                              K(t, _a);
                              var e = So(r);
                              console.error("PowerPaste error code: RTF03"),
                                f(
                                  Vu.incomplete(
                                    e,
                                    n,
                                    "errors.imageimport.failed"
                                  )
                                );
                            })(e)
                          : ((t = So(r)), void f(Vu.paste(t, n)));
                      },
                      function(t) {
                        c.processRtf(r, n, t, i);
                      }
                    );
                };
              Vu.cata(r.response(), t, n, t, n);
            });
          };
        return (function(e, n) {
          var t = ct(n);
          if (t.length !== Bl.length) throw new Error("Partial match");
          return du(t, function(t) {
            return e.discriminator === t ? F.some(n[t]) : F.none();
          }).getOrDie("Must find branch for constructor: " + e.discriminator)(
            e.data
          );
        })(e.rtf, {
          disabled: function() {
            return n(F.none());
          },
          fromClipboard: function(t) {
            return n(!0 === i.allowLocalImages ? F.some(t.rtf) : F.none());
          }
        });
      }
    );
  }
  var yp = function(o) {
    var i = function() {
      return St.pure(o);
    };
    return ht.cata(
      o.asset(),
      function(t, e, n) {
        return /tiff$/.test(e.getType())
          ? ((r = e),
            St.nu(function(e) {
              var t = Xt(r, "image/png").then(function(t) {
                Kt(t)
                  .map(F.some)
                  .get(e);
              });
              return t.catch.call(t, function(t) {
                return g.console.warn(t), e(F.none()), t;
              });
            })).map(function(t) {
              return t
                .map(function(t) {
                  var e = o.image();
                  return g.URL.revokeObjectURL(n), Ed(t, e), xd(t, e);
                })
                .getOr(o);
            })
          : i();
        var r;
      },
      i
    );
  };
  function bp() {
    return function(t, o) {
      return ec(function(n) {
        var t = function() {
            Zu(n, { response: o.response(), bundle: o.bundle() });
          },
          r = function(t, e) {
            _t(t, yp).get(function(t) {
              Zu(n, { response: e(t), bundle: o.bundle() });
            });
          };
        Vu.cata(
          o.response(),
          t,
          function(e, t) {
            r(t, function(t) {
              return Vu.paste(e, t);
            });
          },
          t,
          function(e, t, n) {
            r(t, function(t) {
              return (
                g.console.error("PowerPaste error code:  IMG01"),
                Vu.incomplete(e, t, n)
              );
            });
          }
        );
      });
    };
  }
  var Tp = function(t) {
      return h(t);
    },
    xp = function(t, e) {
      return t.isSupported() ? e.getWordData() : F.none();
    },
    Ep = function(t) {
      return t.getNative();
    },
    wp = function(t) {
      return t.getImage();
    },
    Ip = function(t) {
      return t.getHtml();
    },
    Sp = function(t) {
      return t.getText();
    },
    Lp = function(t) {
      return t.getOnlyText();
    },
    Np = function(t) {
      return t.getGoogleDocsData();
    },
    _p = function(t) {
      return t.getVoid();
    },
    Cp = function(t, e, n, r) {
      return {
        _label: t,
        label: h(t),
        getAvailable: e,
        steps: h(n),
        capture: h(r)
      };
    },
    Op = function(t, e, n, r) {
      return {
        _label: t,
        label: h(t),
        getAvailable: e,
        steps: h(n),
        capture: h(r)
      };
    },
    Dp = function(t, e, n, r) {
      return Cp(
        "Outside of Textbox.io pasting HTML5 API (could be internal)",
        Ip,
        [Tp(Cm(e.intraFlag)), Tp(Yd(t, e)), Tp(Om(n, r)), Tp(Pd(e)), Tp(bp())],
        !0
      );
    },
    Pp = function(t, e, n, r, o) {
      return Op(
        "Outside of Textbox.io pasting offscreen (could be internal)",
        Ep,
        [
          Tp(Ym(r, n, o, e.intraFlag, Td)),
          Tp(Yd(t, e)),
          Tp(Dm(o, e.intraFlag)),
          Tp(Pd(e)),
          Tp(bp())
        ],
        !1
      );
    },
    Ap = function(t, e, n) {
      return Cp(
        "Word Import pasting",
        y(xp, t),
        [
          Tp(Am({ isWord: !0 })),
          Tp(Bd(e, n)),
          Tp(Pm(t, n.allowLocalImages)),
          ((r = hp(n)),
          function(n) {
            return function(t, e) {
              return (
                n.block(),
                r(t, e).map(function(t) {
                  return n.unblock(), t;
                })
              );
            };
          }),
          Tp(bp())
        ],
        !0
      );
      var r;
    },
    kp = function(t, e, n) {
      return Cp(
        " pasting",
        Np,
        [
          Tp(Am({ officeStyles: !1, htmlStyles: !1 })),
          Tp(Om(e, n)),
          Tp(Pd(t)),
          Tp(bp())
        ],
        !0
      );
    },
    Mp = function(t) {
      return Cp(
        "Image pasting",
        wp,
        [Tp(!1 === t.allowLocalImages ? Nm() : _m()), Tp(bp())],
        !0
      );
    },
    Rp = function() {
      return Cp(
        "Only plain text is available to paste",
        Lp,
        [Tp(Sm), Tp(Lm)],
        !0
      );
    },
    Fp = function() {
      return Cp("Plain text pasting", Sp, [Tp(Sm), Tp(Lm)], !0);
    },
    jp = function() {
      return Op(
        "There is no valid way to paste, discarding content",
        _p,
        [Tp(km)],
        !0
      );
    };
  var Up = "x-tinymce/html",
    Bp = "\x3c!-- " + Up + " --\x3e",
    Yp = {
      mark: function(t) {
        return Bp + t;
      },
      unmark: function(t) {
        return t.replace(Bp, "");
      },
      isMarked: function(t) {
        return -1 !== t.indexOf(Bp);
      },
      retainContentEditable: function(t) {
        return t.replace(
          / contenteditable="([^"]+)"/g,
          ' data-mce-contenteditable="$1"'
        );
      },
      restoreContentEditable: function(t) {
        return t.replace(
          / data-mce-contenteditable="([^"]+)"/g,
          ' contenteditable="$1"'
        );
      },
      internalHtmlMime: h(Up)
    },
    Wp = function() {},
    Hp = function(t, e, n) {
      if (
        ((r = t),
        !1 !== tinymce.Env.iOS ||
          void 0 === r ||
          "function" != typeof r.setData)
      )
        return !1;
      try {
        return (
          t.clearData(),
          t.setData("text/html", e),
          t.setData("text/plain", n),
          t.setData(Yp.internalHtmlMime(), e),
          !0
        );
      } catch (t) {
        return !1;
      }
      var r;
    },
    qp = function(t, e, n, r) {
      Hp(t.clipboardData, e.html, e.text)
        ? (t.preventDefault(), r())
        : n(e.html, r);
    },
    $p = function(a) {
      return function(t, e) {
        var n = a.dom.create("div", {
            contenteditable: "false",
            "data-mce-bogus": "all"
          }),
          r = a.dom.create(
            "div",
            { contenteditable: "true", "data-mce-bogus": "all" },
            t
          );
        a.dom.setStyles(n, {
          position: "fixed",
          top: "50%",
          left: "-3000px",
          width: "1000px",
          overflow: "hidden"
        }),
          n.appendChild(r),
          a.dom.add(a.getBody(), n);
        var o = a.selection.getRng();
        r.focus();
        var i = a.dom.createRng();
        i.selectNodeContents(r),
          a.selection.setRng(i),
          setTimeout(function() {
            a.selection.setRng(o), n.parentNode.removeChild(n), e();
          }, 0);
      };
    },
    Vp = function(t) {
      var e = Yp.retainContentEditable(
        t.selection.getContent({ contextual: !0 })
      );
      return {
        html: Yp.mark(e),
        text: t.selection.getContent({ format: "text" })
      };
    },
    Xp = {
      register: function(t) {
        var e, n;
        t.on(
          "cut",
          ((e = t),
          function(t) {
            !1 === e.selection.isCollapsed() &&
              qp(t, Vp(e), $p(e), function() {
                setTimeout(function() {
                  e.execCommand("Delete");
                }, 0);
              });
          })
        ),
          t.on(
            "copy",
            ((n = t),
            function(t) {
              !1 === n.selection.isCollapsed() && qp(t, Vp(n), $p(n), Wp);
            })
          );
      }
    },
    Gp = {
      nodeToString: function(t) {
        var e = document.createElement("div");
        e.appendChild(t.cloneNode(!0));
        var n = e.innerHTML;
        return (e = t = null), n;
      },
      restoreStyleAttrs: function(t) {
        K(z(t.getElementsByTagName("*"), be.fromDom), function(t) {
          ve(t, "data-mce-style") &&
            !ve(t, "style") &&
            me(t, "style", ge(t, "data-mce-style"));
        });
      }
    };
  var zp = {
      showDialog: function(t, e) {
        var n = {
          title: "Error",
          body: {
            type: "panel",
            items: [{ type: "htmlpanel", name: "errorpanel", html: e }]
          },
          initialData: {},
          buttons: [{ text: "OK", type: "cancel", name: "ok", primary: !0 }]
        };
        t.windowManager.open(n);
      }
    },
    Kp = {
      init: function() {
        var r = Rs([
            { text: "Close", name: "close", type: "custom", primary: !0 }
          ]),
          o = Rs({});
        return {
          setButtons: function(t) {
            var n = {},
              e = z(t, function(t) {
                var e = t.text;
                return (
                  (n[e.toLowerCase()] = t.click),
                  { text: e, name: e.toLowerCase(), type: "custom" }
                );
              });
            o.set(n), r.set(e);
          },
          getButtons: r.get,
          getAction: function(t) {
            var e = o.get();
            return e.hasOwnProperty(t) ? F.some(e[t]) : F.none();
          }
        };
      }
    };
  var Jp = lr("url", "html"),
    Zp = function(t) {
      return /^https?:\/\/[\w\?\-\/+=.&%@~#]+$/i.test(t);
    },
    Qp = Zp,
    tg = function(t) {
      return Zp(t) && /.(gif|jpe?g|png)$/.test(t);
    },
    eg = function(n) {
      var t = /^<a href="([^"]+)">([^<]+)<\/a>$/.exec(n);
      return F.from(t).bind(function(t) {
        var e = Jp(t[1], n);
        return t[1] === t[2] ? F.some(e) : F.none();
      });
    },
    ng = function(t, e, n) {
      return "extra" in t.undoManager
        ? (t.undoManager.extra(function() {
            rg(t, e);
          }, n),
          F.some(!0))
        : F.none();
    },
    rg = function(t, e) {
      return (
        t.insertContent(e, {
          merge: !1 !== t.settings.paste_merge_formats,
          paste: !0
        }),
        F.some(!0)
      );
    },
    og = {
      until: function(e, n, t) {
        return du(t, function(t) {
          return t(e, n);
        });
      },
      linkSelection: function(r, t) {
        return eg(t).bind(function(t) {
          var e, n;
          return !1 === r.selection.isCollapsed() && Qp(t.url())
            ? ng((e = r), (n = t).html(), function() {
                e.execCommand("mceInsertLink", !1, n.url());
              })
            : F.none();
        });
      },
      insertImage: function(r, t) {
        return eg(t).bind(function(t) {
          return tg(t.url())
            ? ng((e = r), (n = t).html(), function() {
                e.insertContent('<img src="' + n.url() + '">');
              })
            : F.none();
          var e, n;
        });
      },
      insertContent: rg
    },
    ig = function(t, e) {
      return t.hasEventListeners(e);
    },
    ag = function(t) {
      return t.plugins.powerpaste;
    },
    ug = {
      process: function(t, e, n) {
        var r,
          o,
          i,
          a,
          u,
          c,
          s,
          f,
          l,
          d,
          m,
          p,
          g,
          v = Yp.unmark(e);
        return (
          (d = v),
          (m = n),
          (o = ig((l = r = t), "PastePreProcess")
            ? ((p = d),
              (g = m),
              l.fire("PastePreProcess", { internal: g, content: p }).content)
            : d),
          (i = n),
          ig(r, "PastePostProcess")
            ? ((u = o),
              (c = i),
              (s = (a = r).dom.add(
                a.getBody(),
                "div",
                { style: "display:none" },
                u
              )),
              (f = a.fire("PastePostProcess", { internal: c, node: s }).node
                .innerHTML),
              a.dom.remove(s),
              f)
            : o
        );
      },
      registerEvents: function(e) {
        var n = e.settings;
        n.paste_preprocess &&
          e.on("PastePreProcess", function(t) {
            n.paste_preprocess.call(e, ag(e), t);
          }),
          n.paste_postprocess &&
            e.on("PastePostProcess", function(t) {
              n.paste_postprocess.call(e, ag(e), t);
            });
      }
    };
  function cg(h, y, t, e, b, T) {
    var x,
      E,
      n,
      r,
      w = Rs(F.none());
    (n = e ? e.jsUrl : t),
      (r = "/js"),
      (E = n.replace(/\/$/, "") + "/" + r.replace(/^\//, ""));
    var I = function(t, e, n) {
        var r,
          o =
            !1 !== t.settings.smart_paste
              ? [og.linkSelection, og.insertImage]
              : [];
        og.until(
          t,
          e,
          o.concat([
            ((r = n),
            function(t, e) {
              return (
                t.undoManager.transact(function() {
                  og.insertContent(t, e),
                    Gp.restoreStyleAttrs(t.getBody()),
                    b.prepareImages(r);
                }),
                F.some(!0)
              );
            })
          ])
        );
      },
      S = function() {
        x && h.selection.moveToBookmark(x), (x = null);
      };
    h.on("init", function(t) {
      var s,
        a,
        e,
        n,
        r,
        o,
        i,
        u,
        c,
        f,
        l = {
          baseUrl: E,
          officeStyles: h.settings.powerpaste_word_import || ar.officeStyles,
          htmlStyles: h.settings.powerpaste_html_import || ar.htmlStyles,
          translations: xe.translate,
          allowLocalImages: !1 !== h.settings.powerpaste_allow_local_images,
          pasteBinAttrs: { "data-mce-bogus": "all" },
          intraFlag: {
            clipboardType: Yp.internalHtmlMime,
            findClipboardTags: function(t) {
              var e = Z(t, function(t) {
                return se(t) && to(Nf(t), Yp.internalHtmlMime());
              });
              return e.length ? F.some(e) : F.none();
            }
          },
          preprocessor: function(t) {
            return St.pure(t);
          },
          keepSrc: N(h)
        },
        d = T
          ? ((a = h),
            {
              createDialog: function() {
                var n = "",
                  r = null,
                  o = Kp.init(),
                  e = Tr.create({ close: br([]) }),
                  i = function(t) {
                    e.trigger.close();
                  };
                return {
                  events: e.registry,
                  setTitle: function(t) {
                    return (n = t);
                  },
                  setContent: function(t) {
                    return (r = t);
                  },
                  setButtons: function(t) {
                    o.setButtons(t);
                  },
                  show: function() {
                    var t = Gp.nodeToString(r.dom()),
                      e = {
                        title: n,
                        body: {
                          type: "panel",
                          items: [
                            { type: "htmlpanel", name: "contentPanel", html: t }
                          ]
                        },
                        initialData: {},
                        buttons: o.getButtons(),
                        onCancel: i,
                        onAction: function(e, t) {
                          o.getAction(t.name).each(function(t) {
                            return t(e);
                          }),
                            e.close();
                        }
                      };
                    a.windowManager.open(e);
                  },
                  destroy: _,
                  reflow: function() {}
                };
              }
            })
          : ((s = h),
            {
              createDialog: function() {
                var r,
                  o = "",
                  i = "",
                  a = [],
                  u = null,
                  e = Tr.create({ close: br([]) }),
                  c = function(t) {
                    e.trigger.close();
                  },
                  t = function() {
                    r.off("close", c), r.close("close");
                  };
                return {
                  events: e.registry,
                  setTitle: function(t) {
                    o = t;
                  },
                  setContent: function(t) {
                    var e = Gp.nodeToString(t.dom());
                    (i = [{ type: "container", html: e }]), (u = t);
                  },
                  setButtons: function(t) {
                    var r = [];
                    t.forEach(function(t, e, n) {
                      r.push({
                        text: t.text,
                        ariaLabel: t.text,
                        onclick: t.click
                      });
                    }),
                      (a = r);
                  },
                  show: function() {
                    0 === a.length &&
                      (a = [
                        {
                          text: "Close",
                          onclick: function() {
                            r.close();
                          }
                        }
                      ]);
                    var t = {
                      title: o,
                      spacing: 10,
                      padding: 10,
                      minWidth: 300,
                      minHeight: 100,
                      layout: "flex",
                      items: i,
                      buttons: a
                    };
                    r = s.windowManager.open(t);
                    var e = be.fromDom(r.getEl()),
                      n = Oi(e, "." + ge(u, "class")).getOrDie(
                        "We must find this element or we cannot continue"
                      );
                    $i(n, u), _a(n), r.on("close", c);
                  },
                  hide: function() {
                    t();
                  },
                  destroy: function() {
                    t();
                  },
                  reflow: function() {}
                };
              }
            }),
        m = be.fromDom(h.getBody()),
        p =
          ((e = m),
          (n = d.createDialog),
          (r = _),
          (i = Sa((o = l).baseUrl)),
          (u = Hu(void 0 !== o.pasteBinAttrs ? o.pasteBinAttrs : {})),
          (c = [Rp(), Ap(i, n, o), kp(o, r, e), Dp(n, o, r, e), Mp(o)]),
          (f = Pp(n, o, r, u, e)),
          bd(c, f)),
        g = bd([Fp()], jp());
      K([p, g], function(t) {
        t.events.cancel.bind(function() {
          S();
        }),
          t.events.error.bind(function(t) {
            S(),
              h.notificationManager
                ? h.notificationManager.open({
                    text: xe.translate(t.message()),
                    type: "error"
                  })
                : (T ? zp : ea).showDialog(h, xe.translate(t.message()));
          }),
          t.events.insert.bind(function(t) {
            var e = z(t.elements(), function(t) {
                return Gp.nodeToString(t.dom());
              }).join(""),
              n = Yp.restoreContentEditable(e);
            h.focus(),
              b.importImages(t.assets()).get(function() {
                S(),
                  I(h, ug.process(h, n, t.isInternal()), t.assets()),
                  L(h) && b.uploadImages(t.assets());
              });
          });
      }),
        h.addCommand("mceInsertClipboardContent", function(t, e) {
          void 0 !== e.content
            ? p.pasteCustom(vd(e.content))
            : void 0 !== e.text && g.pasteCustom(hd(e.text));
        });
      var v = ma(m, "paste", function(t) {
        x || (x = h.selection.getBookmark(1)),
          (y.isText() ? g : p).paste(t.raw()),
          y.reset();
      });
      w.set(F.some(v)), Xp.register(h);
    }),
      h.on("remove", function(t) {
        w.get().each(function(t) {
          return t.unbind();
        });
      });
  }
  var sg,
    fg = function(t) {
      return (
        tinymce.util.VK.metaKeyPressed(t) && 86 === t.keyCode && t.shiftKey
      );
    };
  function lg(u) {
    return c(tinymce, "4.0.28")
      ? (e.error(
          'The "powerpaste" plugin requires at least 4.0.28 version of TinyMCE.'
        ),
        function() {})
      : function(n, t) {
          var e,
            r = !c(tinymce, "5.0.0"),
            o = (function(e, n) {
              var r = Rs(l(e)),
                o = Rs(!1);
              e.on("keydown", function(t) {
                fg(t) &&
                  (o.set(!0),
                  tinymce.Env.ie &&
                    tinymce.Env.ie < 10 &&
                    (t.preventDefault(), e.fire("paste", {})));
              });
              var i = function() {
                var t = !r.get();
                r.set(t),
                  e.fire("PastePlainTextToggle", { state: t }),
                  e.focus();
              };
              return {
                buttonToggle: function(t) {
                  var e = !r.get();
                  n ? t.setActive(e) : this.active(e), i();
                },
                toggle: i,
                reset: function() {
                  o.set(!1);
                },
                isText: function() {
                  return o.get() || r.get();
                }
              };
            })(n, r),
            i = function(e) {
              e.setActive(o.isText());
              var t = function(t) {
                e.setActive(t.state);
              };
              return (
                n.on("PastePlainTextToggle", t),
                function() {
                  return n.off("PastePlainTextToggle", t);
                }
              );
            },
            a = function() {
              var e = this;
              e.active(o.isText()),
                n.on("PastePlainTextToggle", function(t) {
                  e.active(t.state);
                });
            };
          tinymce.Env.ie && tinymce.Env.ie < 10
            ? (function(e, t, n) {
                var r,
                  o,
                  i = this,
                  a = sr(e, xe.translate, !1),
                  u = function(e) {
                    return function(t) {
                      e(t);
                    };
                  };
                (r = aa.getOnPasteFunction(e, a.showDialog, t)),
                  e.on("paste", u(r)),
                  (o = aa.getOnKeyDownFunction(e, a.showDialog, t)),
                  e.on("keydown", u(o)),
                  e.addCommand("mceInsertClipboardContent", function(t, e) {
                    a.showDialog(e.content || e);
                  }),
                  e.settings.paste_preprocess &&
                    e.on("PastePreProcess", function(t) {
                      e.settings.paste_preprocess.call(i, i, t);
                    });
              })(n, o)
            : ((e = oa(n)),
              cg(n, o, t, u, e, r),
              f(n) ? d(n) : fr(n, 0, 0, e, r)),
            ug.registerEvents(n),
            r
              ? (n.ui.registry.addToggleButton("pastetext", {
                  icon: "paste-text",
                  tooltip: "Paste as text",
                  onAction: o.buttonToggle,
                  onSetup: i
                }),
                n.ui.registry.addToggleMenuItem("pastetext", {
                  icon: "paste-text",
                  text: "Paste as text",
                  selectable: !0,
                  onAction: o.buttonToggle,
                  onSetup: i
                }))
              : (n.addButton("pastetext", {
                  icon: "pastetext",
                  tooltip: "Paste as text",
                  onclick: o.buttonToggle,
                  onPostRender: a
                }),
                n.addMenuItem("pastetext", {
                  text: "Paste as text",
                  selectable: !0,
                  onclick: o.buttonToggle,
                  onPostRender: a
                })),
            s.register(n, o);
        };
  }
  tinymce.PluginManager.requireLangPack(
    "powerpaste",
    "ar,ca,cs,da,de,el,es,fa,fi,fr_FR,he_IL,hr,hu_HU,it,ja,kk,ko_KR,nb_NO,nl,pl,pt_BR,pt_PT,ro,ru,sk,sl_SI,sv_SE,th_TH,tr,uk,zh_CN,zh_TW"
  ),
    tinymce.PluginManager.add("powerpaste", lg(sg));
})(window);
