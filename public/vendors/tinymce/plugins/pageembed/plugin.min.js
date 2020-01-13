/* Tiny Page Embed plugin
 *
 * Copyright 2010-2019 Tiny Technologies Inc. All rights reserved.
 *
 * Version: 1.0.0-20
 */
!(function(t) {
  "use strict";
  var e,
    n,
    r,
    o,
    i,
    c,
    f,
    a = function(e) {
      return parseInt(e, 10);
    },
    u = function(e, n, r) {
      return { major: e, minor: n, patch: r };
    },
    s = function(e) {
      var n = /([0-9]+)\.([0-9]+)\.([0-9]+)(?:(\-.+)?)/.exec(e);
      return n ? u(a(n[1]), a(n[2]), a(n[3])) : u(0, 0, 0);
    },
    l = function(e, n) {
      var r = e - n;
      return 0 === r ? 0 : 0 < r ? 1 : -1;
    },
    d = function(e, n) {
      return (
        -1 ===
        (function(e, n) {
          var r = l(e.major, n.major);
          if (0 !== r) return r;
          var t = l(e.minor, n.minor);
          if (0 !== t) return t;
          var o = l(e.patch, n.patch);
          return 0 !== o ? o : 0;
        })(
          (r = e)
            ? s(
                [(t = r).majorVersion, t.minorVersion]
                  .join(".")
                  .split(".")
                  .slice(0, 3)
                  .join(".")
              )
            : null,
          s(n)
        )
      );
      var r, t;
    },
    g = function(e) {
      return function() {
        return e;
      };
    },
    m = g(!1),
    p = g(!0),
    v = m,
    h = p,
    b = function() {
      return y;
    },
    y =
      ((o = {
        fold: function(e, n) {
          return e();
        },
        is: v,
        isSome: v,
        isNone: h,
        getOr: (r = function(e) {
          return e;
        }),
        getOrThunk: (n = function(e) {
          return e();
        }),
        getOrDie: function(e) {
          throw new Error(e || "error: getOrDie called on none.");
        },
        getOrNull: function() {
          return null;
        },
        getOrUndefined: function() {},
        or: r,
        orThunk: n,
        map: b,
        ap: b,
        each: function() {},
        bind: b,
        flatten: b,
        exists: v,
        forall: h,
        filter: b,
        equals: (e = function(e) {
          return e.isNone();
        }),
        equals_: e,
        toArray: function() {
          return [];
        },
        toString: g("none()")
      }),
      Object.freeze && Object.freeze(o),
      o),
    w = function(r) {
      var e = function() {
          return r;
        },
        n = function() {
          return o;
        },
        t = function(e) {
          return e(r);
        },
        o = {
          fold: function(e, n) {
            return n(r);
          },
          is: function(e) {
            return r === e;
          },
          isSome: h,
          isNone: v,
          getOr: e,
          getOrThunk: e,
          getOrDie: e,
          getOrNull: e,
          getOrUndefined: e,
          or: n,
          orThunk: n,
          map: function(e) {
            return w(e(r));
          },
          ap: function(e) {
            return e.fold(b, function(e) {
              return w(e(r));
            });
          },
          each: function(e) {
            e(r);
          },
          bind: t,
          flatten: e,
          exists: t,
          forall: t,
          filter: function(e) {
            return e(r) ? o : y;
          },
          equals: function(e) {
            return e.is(r);
          },
          equals_: function(e, n) {
            return e.fold(v, function(e) {
              return n(r, e);
            });
          },
          toArray: function() {
            return [r];
          },
          toString: function() {
            return "some(" + r + ")";
          }
        };
      return o;
    },
    O = {
      some: w,
      none: b,
      from: function(e) {
        return null == e ? y : w(e);
      }
    },
    N = function(e) {
      if (null == e) throw new Error("Node cannot be null or undefined");
      return { dom: g(e) };
    },
    E = {
      fromHtml: function(e, n) {
        var r = (n || t.document).createElement("div");
        if (((r.innerHTML = e), !r.hasChildNodes() || 1 < r.childNodes.length))
          throw (t.console.error("HTML does not have a single root node", e),
          new Error("HTML must have a single root node"));
        return N(r.childNodes[0]);
      },
      fromTag: function(e, n) {
        var r = (n || t.document).createElement(e);
        return N(r);
      },
      fromText: function(e, n) {
        var r = (n || t.document).createTextNode(e);
        return N(r);
      },
      fromDom: N,
      fromPoint: function(e, n, r) {
        var t = e.dom();
        return O.from(t.elementFromPoint(n, r)).map(N);
      }
    },
    x = function(n) {
      return function(e) {
        return (
          (function(e) {
            if (null === e) return "null";
            var n = typeof e;
            return "object" === n && Array.prototype.isPrototypeOf(e)
              ? "array"
              : "object" === n && String.prototype.isPrototypeOf(e)
              ? "string"
              : n;
          })(e) === n
        );
      };
    },
    S = x("string"),
    T = x("boolean"),
    A = x("function"),
    D = x("number"),
    _ = function(e, n) {
      for (var r = 0, t = e.length; r < t; r++) n(e[r], r, e);
    },
    C = Array.prototype.push,
    R =
      (Array.prototype.slice,
      A(Array.from) && Array.from,
      Object.hasOwnProperty),
    I = function(e, n) {
      return R.call(e, n);
    },
    L =
      (t.Node.ATTRIBUTE_NODE,
      t.Node.CDATA_SECTION_NODE,
      t.Node.COMMENT_NODE,
      t.Node.DOCUMENT_NODE,
      t.Node.DOCUMENT_TYPE_NODE,
      t.Node.DOCUMENT_FRAGMENT_NODE,
      t.Node.ELEMENT_NODE,
      t.Node.TEXT_NODE,
      t.Node.PROCESSING_INSTRUCTION_NODE,
      t.Node.ENTITY_REFERENCE_NODE,
      t.Node.ENTITY_NODE,
      t.Node.NOTATION_NODE,
      function(e, n, r) {
        !(function(e, n, r) {
          if (!(S(r) || T(r) || D(r)))
            throw (t.console.error(
              "Invalid call to Attr.set. Key ",
              n,
              ":: Value ",
              r,
              ":: Element ",
              e
            ),
            new Error("Attribute value was not simple"));
          e.setAttribute(n, r + "");
        })(e.dom(), n, r);
      }),
    k = function(e, n) {
      var r = e.dom().getAttribute(n);
      return null === r ? void 0 : r;
    },
    j = function(e, n) {
      return O.from(k(e, n));
    },
    M =
      ("undefined" != typeof window ? window : Function("return this;")(),
      function() {
        return z(0, 0);
      }),
    z = function(e, n) {
      return { major: e, minor: n };
    },
    P = {
      nu: z,
      detect: function(e, n) {
        var r = String(n).toLowerCase();
        return 0 === e.length
          ? M()
          : (function(e, n) {
              var r = (function(e, n) {
                for (var r = 0; r < e.length; r++) {
                  var t = e[r];
                  if (t.test(n)) return t;
                }
              })(e, n);
              if (!r) return { major: 0, minor: 0 };
              var t = function(e) {
                return Number(n.replace(r, "$" + e));
              };
              return z(t(1), t(2));
            })(e, r);
      },
      unknown: M
    },
    U = "Firefox",
    F = function(e, n) {
      return function() {
        return n === e;
      };
    },
    B = function(e) {
      var n = e.current;
      return {
        current: n,
        version: e.version,
        isEdge: F("Edge", n),
        isChrome: F("Chrome", n),
        isIE: F("IE", n),
        isOpera: F("Opera", n),
        isFirefox: F(U, n),
        isSafari: F("Safari", n)
      };
    },
    q = {
      unknown: function() {
        return B({ current: void 0, version: P.unknown() });
      },
      nu: B,
      edge: g("Edge"),
      chrome: g("Chrome"),
      ie: g("IE"),
      opera: g("Opera"),
      firefox: g(U),
      safari: g("Safari")
    },
    H = "Windows",
    V = "Android",
    X = "Solaris",
    W = "FreeBSD",
    G = function(e, n) {
      return function() {
        return n === e;
      };
    },
    Y = function(e) {
      var n = e.current;
      return {
        current: n,
        version: e.version,
        isWindows: G(H, n),
        isiOS: G("iOS", n),
        isAndroid: G(V, n),
        isOSX: G("OSX", n),
        isLinux: G("Linux", n),
        isSolaris: G(X, n),
        isFreeBSD: G(W, n)
      };
    },
    $ = {
      unknown: function() {
        return Y({ current: void 0, version: P.unknown() });
      },
      nu: Y,
      windows: g(H),
      ios: g("iOS"),
      android: g(V),
      linux: g("Linux"),
      osx: g("OSX"),
      solaris: g(X),
      freebsd: g(W)
    },
    K = function(e, n) {
      var r = String(n).toLowerCase();
      return (function(e, n) {
        for (var r = 0, t = e.length; r < t; r++) {
          var o = e[r];
          if (n(o, r, e)) return O.some(o);
        }
        return O.none();
      })(e, function(e) {
        return e.search(r);
      });
    },
    J = function(e, r) {
      return K(e, r).map(function(e) {
        var n = P.detect(e.versionRegexes, r);
        return { current: e.name, version: n };
      });
    },
    Q = function(e, r) {
      return K(e, r).map(function(e) {
        var n = P.detect(e.versionRegexes, r);
        return { current: e.name, version: n };
      });
    },
    Z = function(e, n) {
      return -1 !== e.indexOf(n);
    },
    ee = /.*?version\/\ ?([0-9]+)\.([0-9]+).*/,
    ne = function(n) {
      return function(e) {
        return Z(e, n);
      };
    },
    re = [
      {
        name: "Edge",
        versionRegexes: [/.*?edge\/ ?([0-9]+)\.([0-9]+)$/],
        search: function(e) {
          return (
            Z(e, "edge/") &&
            Z(e, "chrome") &&
            Z(e, "safari") &&
            Z(e, "applewebkit")
          );
        }
      },
      {
        name: "Chrome",
        versionRegexes: [/.*?chrome\/([0-9]+)\.([0-9]+).*/, ee],
        search: function(e) {
          return Z(e, "chrome") && !Z(e, "chromeframe");
        }
      },
      {
        name: "IE",
        versionRegexes: [
          /.*?msie\ ?([0-9]+)\.([0-9]+).*/,
          /.*?rv:([0-9]+)\.([0-9]+).*/
        ],
        search: function(e) {
          return Z(e, "msie") || Z(e, "trident");
        }
      },
      {
        name: "Opera",
        versionRegexes: [ee, /.*?opera\/([0-9]+)\.([0-9]+).*/],
        search: ne("opera")
      },
      {
        name: "Firefox",
        versionRegexes: [/.*?firefox\/\ ?([0-9]+)\.([0-9]+).*/],
        search: ne("firefox")
      },
      {
        name: "Safari",
        versionRegexes: [ee, /.*?cpu os ([0-9]+)_([0-9]+).*/],
        search: function(e) {
          return (Z(e, "safari") || Z(e, "mobile/")) && Z(e, "applewebkit");
        }
      }
    ],
    te = [
      {
        name: "Windows",
        search: ne("win"),
        versionRegexes: [/.*?windows\ nt\ ?([0-9]+)\.([0-9]+).*/]
      },
      {
        name: "iOS",
        search: function(e) {
          return Z(e, "iphone") || Z(e, "ipad");
        },
        versionRegexes: [
          /.*?version\/\ ?([0-9]+)\.([0-9]+).*/,
          /.*cpu os ([0-9]+)_([0-9]+).*/,
          /.*cpu iphone os ([0-9]+)_([0-9]+).*/
        ]
      },
      {
        name: "Android",
        search: ne("android"),
        versionRegexes: [/.*?android\ ?([0-9]+)\.([0-9]+).*/]
      },
      {
        name: "OSX",
        search: ne("os x"),
        versionRegexes: [/.*?os\ x\ ?([0-9]+)_([0-9]+).*/]
      },
      { name: "Linux", search: ne("linux"), versionRegexes: [] },
      { name: "Solaris", search: ne("sunos"), versionRegexes: [] },
      { name: "FreeBSD", search: ne("freebsd"), versionRegexes: [] }
    ],
    oe = { browsers: g(re), oses: g(te) },
    ie = function(e) {
      var n,
        r,
        t,
        o,
        i,
        a,
        u,
        s,
        c,
        f,
        l,
        d = oe.browsers(),
        m = oe.oses(),
        p = J(d, e).fold(q.unknown, q.nu),
        v = Q(m, e).fold($.unknown, $.nu);
      return {
        browser: p,
        os: v,
        deviceType:
          ((r = p),
          (t = e),
          (o = (n = v).isiOS() && !0 === /ipad/i.test(t)),
          (i = n.isiOS() && !o),
          (a = n.isAndroid() && 3 === n.version.major),
          (u = n.isAndroid() && 4 === n.version.major),
          (s = o || a || (u && !0 === /mobile/i.test(t))),
          (c = n.isiOS() || n.isAndroid()),
          (f = c && !s),
          (l = r.isSafari() && n.isiOS() && !1 === /safari/i.test(t)),
          {
            isiPad: g(o),
            isiPhone: g(i),
            isTablet: g(s),
            isPhone: g(f),
            isTouch: g(c),
            isAndroid: n.isAndroid,
            isiOS: n.isiOS,
            isWebView: g(l)
          })
      };
    },
    ae =
      (((i = function() {
        var e = t.navigator.userAgent;
        return ie(e);
      }),
      (f = !1),
      (function() {
        for (var e = [], n = 0; n < arguments.length; n++) e[n] = arguments[n];
        return f || ((f = !0), (c = i.apply(null, e))), c;
      })()).browser.isIE(),
      (function() {
        for (var e = [], n = 0; n < arguments.length; n++) e[n] = arguments[n];
      })("element", "offset"),
      function(e) {
        return void 0 !== e.dom().classList;
      }),
    ue = function(e, n) {
      var r, t, o, i, a;
      ae(e)
        ? e.dom().classList.add(n)
        : ((function() {
            for (var e = [], n = 0; n < arguments.length; n++)
              e[n] = arguments[n];
          })("element", "offset"),
          (o = n),
          (a = (void 0 === (i = k((r = e), (t = "class"))) || "" === i
            ? []
            : i.split(" ")
          ).concat([o])),
          L(r, t, a.join(" ")));
    },
    se = function(e, n) {
      return ae(e) && e.dom().classList.contains(n);
    },
    ce = "tiny-pageembed",
    fe = function(e) {
      return se(e, ce);
    },
    le = function(e) {
      var n = e.attr("class");
      return n && Z(" " + n + " ", " " + ce + " ");
    },
    de = function(a, u, s) {
      return O.from(a)
        .map(E.fromDom)
        .filter(fe)
        .bind(
          (((i = function() {
            var e = t.navigator.userAgent;
            return ie(e);
          }),
          (f = !1),
          (function() {
            for (var e = [], n = 0; n < arguments.length; n++)
              e[n] = arguments[n];
            return f || ((f = !0), (c = i.apply(null, e))), c;
          })()).browser.isIE(),
          function(e) {
            return (
              (n = 0), (r = e.dom().childNodes), O.from(r[n]).map(E.fromDom)
            );
            var n, r;
          })
        )
        .filter(function(e) {
          return "iframe" === e.dom().nodeName.toLowerCase();
        })
        .fold(
          function() {
            return u;
          },
          function(e) {
            var n,
              r,
              t,
              o,
              i = function(e, n, r) {
                return O.from(k(e, n)).getOr(r);
              };
            return {
              source: { value: i(e, "src", u.source.value) },
              size:
                ((n = a),
                (o = E.fromDom(n)),
                (r = function(e, n) {
                  return se(o, n.value) ? n.value : e;
                }),
                (t = "inline"),
                _(s, function(e) {
                  t = r(t, e);
                }),
                t),
              dimensions: {
                width: i(e, "width", u.dimensions.width),
                height: i(e, "height", u.dimensions.height)
              },
              name: i(e, "name", u.name),
              title: i(e, "title", u.title),
              descriptionUrl: {
                value: i(e, "longdesc", u.descriptionUrl.value)
              },
              showBorder: j(e, "frameborder")
                .map(function(e) {
                  return "0" !== e.toLowerCase();
                })
                .getOr(u.showBorder),
              scrollbar: j(e, "scrolling")
                .map(function(e) {
                  return "yes" === e.toLowerCase();
                })
                .getOr(u.scrollbar)
            };
          }
        );
    },
    me = function(e, n) {
      e.dom().appendChild(n.dom());
    },
    pe = function(e, n, r) {
      0 < r.trim().length && L(e, n, r);
    },
    ve = function(e) {
      var n,
        r,
        t,
        o,
        i,
        a,
        u,
        s =
          ((n = e),
          (r = E.fromTag("div")),
          L(r, "contentEditable", "false"),
          ue(r, ce),
          "inline" !== n.size && ue(r, n.size),
          r),
        c = E.fromTag("iframe");
      return (
        pe(c, "src", e.source.value),
        pe(c, "title", e.title),
        pe(c, "name", e.name),
        pe(c, "longdesc", e.descriptionUrl.value),
        ((t = e), (o = "dimensions"), I(t, o) ? O.some(t[o]) : O.none()).each(
          function(e) {
            pe(c, "width", e.width), pe(c, "height", e.height);
          }
        ),
        e.showBorder || L(c, "frameborder", "0"),
        L(c, "scrolling", e.scrollbar ? "yes" : "no"),
        me(s, c),
        (i = s),
        (a = E.fromTag("div")),
        (u = E.fromDom(i.dom().cloneNode(!0))),
        me(a, u),
        a.dom().innerHTML
      );
    },
    ge = [
      { text: "Responsive - 21x9", value: "tiny-pageembed--21by9" },
      { text: "Responsive - 16x9", value: "tiny-pageembed--16by9" },
      { text: "Responsive - 4x3", value: "tiny-pageembed--4by3" },
      { text: "Responsive - 1x1", value: "tiny-pageembed--1by1" }
    ],
    he = function(t) {
      var n = [{ text: "Inline Value", value: "inline" }].concat(
          void 0 !== t.settings.tiny_pageembed_classes
            ? t.settings.tiny_pageembed_classes
            : ge
        ),
        r = function(e) {
          return {
            title: "Insert/Edit Iframe",
            body: {
              type: "tabpanel",
              tabs: [
                {
                  title: "General",
                  items: (function(e) {
                    for (var n = [], r = 0, t = e.length; r < t; ++r) {
                      if (!Array.prototype.isPrototypeOf(e[r]))
                        throw new Error(
                          "Arr.flatten item " +
                            r +
                            " was not an array, input: " +
                            e
                        );
                      C.apply(n, e[r]);
                    }
                    return n;
                  })([
                    [
                      {
                        name: "source",
                        type: "urlinput",
                        filetype: "media",
                        label: "Source"
                      }
                    ],
                    1 < n.length
                      ? [
                          {
                            label: "Size",
                            type: "selectbox",
                            name: "size",
                            items: n
                          }
                        ]
                      : [],
                    "inline" === e.size
                      ? [
                          {
                            type: "sizeinput",
                            name: "dimensions",
                            label: "Constrain proportions",
                            constrain: !0
                          }
                        ]
                      : []
                  ])
                },
                {
                  title: "Advanced",
                  items: [
                    { name: "name", type: "input", label: "Name" },
                    { name: "title", type: "input", label: "Title" },
                    {
                      name: "descriptionUrl",
                      type: "urlinput",
                      label: "Long description URL"
                    },
                    {
                      type: "label",
                      label: "Border",
                      items: [
                        {
                          type: "checkbox",
                          name: "showBorder",
                          label: "Show iframe border"
                        }
                      ]
                    },
                    {
                      type: "label",
                      label: "Scrollbar",
                      items: [
                        {
                          type: "checkbox",
                          name: "scrollbar",
                          label: "Enable scrollbar"
                        }
                      ]
                    }
                  ]
                }
              ]
            },
            buttons: [
              { type: "cancel", name: "cancel", text: "Cancel" },
              { type: "submit", name: "submit", text: "Save", primary: !0 }
            ],
            onChange: function(e, n) {
              "size" === n.name && (e.redial(r(e.getData())), e.focus("size"));
            },
            onSubmit: function(e) {
              var n = e.getData();
              if (0 < n.source.value.length) {
                var r = ve(n);
                t.insertContent(r), t.nodeChanged();
              }
              e.close();
            },
            initialData: e
          };
        },
        e = t.selection.getNode(),
        o = de(
          e,
          {
            source: { value: "" },
            size: "inline",
            dimensions: { width: "350px", height: "260px" },
            name: "",
            title: "",
            descriptionUrl: { value: "" },
            showBorder: !0,
            scrollbar: !1
          },
          n
        );
      t.windowManager.open(r(o));
    },
    be = function(e) {
      _(e, function(e) {
        if (le(e)) {
          var n = new tinymce.html.Node("span", 1);
          n.attr("class", "mce-shim"),
            n.attr("data-mce-bogus", "1"),
            e.append(n),
            e.attr("contenteditable", "false");
        }
      });
    },
    ye = function(e) {
      _(e, function(e) {
        le(e) && e.attr("contenteditable", null);
      });
    };
  return (
    tinymce.PluginManager.add("pageembed", function(e) {
      return (
        d(tinymce, "5.0.0")
          ? console.error(
              "The pageembed plugin requires at least 5.0.0 of TinyMCE"
            )
          : ((n = e).on("click keyup", function() {
              O.from(n.selection.getNode())
                .map(E.fromDom)
                .each(function(e) {
                  var n, r;
                  fe(e) &&
                    ((n = "data-mce-selected"),
                    (r = e.dom()) &&
                      r.hasAttribute &&
                      r.hasAttribute(n) &&
                      L(e, "data-mce-selected", "2"));
                });
            }),
            n.on("PreInit", function() {
              n.parser.addNodeFilter("div", be),
                n.serializer.addNodeFilter("div", ye);
            }),
            (r = e).ui.registry.addToggleButton("pageembed", {
              icon: "embed-page",
              tooltip: "Embed iframe",
              onAction: function(e) {
                he(r);
              },
              onSetup: function(n) {
                var e = function(e) {
                  return n.setActive(
                    !r.readonly && e.element.classList.contains(ce)
                  );
                };
                return (
                  r.on("nodechange", e),
                  function() {
                    return r.off("nodechange", e);
                  }
                );
              }
            }),
            r.ui.registry.addMenuItem("pageembed", {
              text: "Insert/edit iframe",
              icon: "embed-page",
              onAction: function(e) {
                he(r);
              }
            })),
        {}
      );
      var n, r;
    }),
    function() {}
  );
})(window)();
