/* Ephox Media Embed
 *
 * Copyright 2010-2017 Ephox Corporation. All rights reserved.
 *
 * Version: 2.2.3-91
 */

!(function(f) {
  "use strict";
  var n,
    e,
    r,
    t,
    o,
    i,
    u,
    c,
    a,
    s,
    l,
    d,
    m,
    p,
    h = function(n) {
      return parseInt(n, 10);
    },
    v = function(n, e, r) {
      return { major: n, minor: e, patch: r };
    },
    g = function(n) {
      var e = /([0-9]+)\.([0-9]+)\.([0-9]+)(?:(\-.+)?)/.exec(n);
      return e ? v(h(e[1]), h(e[2]), h(e[3])) : v(0, 0, 0);
    },
    y = function(n, e) {
      var r = n - e;
      return 0 === r ? 0 : 0 < r ? 1 : -1;
    },
    w = function(n, e) {
      return (
        !!n &&
        -1 ===
          (function(n, e) {
            var r = y(n.major, e.major);
            if (0 !== r) return r;
            var t = y(n.minor, e.minor);
            if (0 !== t) return t;
            var o = y(n.patch, e.patch);
            return 0 !== o ? o : 0;
          })(
            g(
              [(r = n).majorVersion, r.minorVersion]
                .join(".")
                .split(".")
                .slice(0, 3)
                .join(".")
            ),
            g(e)
          )
      );
      var r;
    },
    b = function() {},
    T = function(r, t) {
      return function() {
        for (var n = [], e = 0; e < arguments.length; e++) n[e] = arguments[e];
        return r(t.apply(null, n));
      };
    },
    x = function(n) {
      return function() {
        return n;
      };
    },
    E = function(n) {
      return n;
    },
    O = x(!1),
    S = x(!0),
    _ = O,
    N = S,
    A = function() {
      return D;
    },
    D =
      ((t = {
        fold: function(n, e) {
          return n();
        },
        is: _,
        isSome: _,
        isNone: N,
        getOr: (r = function(n) {
          return n;
        }),
        getOrThunk: (e = function(n) {
          return n();
        }),
        getOrDie: function(n) {
          throw new Error(n || "error: getOrDie called on none.");
        },
        getOrNull: function() {
          return null;
        },
        getOrUndefined: function() {},
        or: r,
        orThunk: e,
        map: A,
        ap: A,
        each: function() {},
        bind: A,
        flatten: A,
        exists: _,
        forall: N,
        filter: A,
        equals: (n = function(n) {
          return n.isNone();
        }),
        equals_: n,
        toArray: function() {
          return [];
        },
        toString: x("none()")
      }),
      Object.freeze && Object.freeze(t),
      t),
    k = function(r) {
      var n = function() {
          return r;
        },
        e = function() {
          return o;
        },
        t = function(n) {
          return n(r);
        },
        o = {
          fold: function(n, e) {
            return e(r);
          },
          is: function(n) {
            return r === n;
          },
          isSome: N,
          isNone: _,
          getOr: n,
          getOrThunk: n,
          getOrDie: n,
          getOrNull: n,
          getOrUndefined: n,
          or: e,
          orThunk: e,
          map: function(n) {
            return k(n(r));
          },
          ap: function(n) {
            return n.fold(A, function(n) {
              return k(n(r));
            });
          },
          each: function(n) {
            n(r);
          },
          bind: t,
          flatten: n,
          exists: t,
          forall: t,
          filter: function(n) {
            return n(r) ? o : D;
          },
          equals: function(n) {
            return n.is(r);
          },
          equals_: function(n, e) {
            return n.fold(_, function(n) {
              return e(r, n);
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
    C = {
      some: k,
      none: A,
      from: function(n) {
        return null == n ? D : k(n);
      }
    },
    R = function(e) {
      return function(n) {
        return (
          (function(n) {
            if (null === n) return "null";
            var e = typeof n;
            return "object" === e &&
              (Array.prototype.isPrototypeOf(n) ||
                (n.constructor && "Array" === n.constructor.name))
              ? "array"
              : "object" === e &&
                (String.prototype.isPrototypeOf(n) ||
                  (n.constructor && "String" === n.constructor.name))
              ? "string"
              : e;
          })(n) === e
        );
      };
    },
    j = R("string"),
    I = R("object"),
    F = R("array"),
    P = R("boolean"),
    M = R("function"),
    L = R("number"),
    U = Array.prototype.slice,
    B =
      void 0 === (o = Array.prototype.indexOf)
        ? function(n, e) {
            return X(n, e);
          }
        : function(n, e) {
            return o.call(n, e);
          },
    V = function(n, e) {
      return -1 < B(n, e);
    },
    q = function(n, e) {
      for (var r = n.length, t = new Array(r), o = 0; o < r; o++) {
        var i = n[o];
        t[o] = e(i, o, n);
      }
      return t;
    },
    W = function(n, e) {
      for (var r = 0, t = n.length; r < t; r++) {
        e(n[r], r, n);
      }
    },
    H = function(n, e) {
      for (var r = [], t = 0, o = n.length; t < o; t++) {
        var i = n[t];
        e(i, t, n) && r.push(i);
      }
      return r;
    },
    J = function(n, e, r) {
      return (
        W(n, function(n) {
          r = e(r, n);
        }),
        r
      );
    },
    z = function(n, e) {
      for (var r = 0, t = n.length; r < t; r++) {
        var o = n[r];
        if (e(o, r, n)) return C.some(o);
      }
      return C.none();
    },
    $ = function(n, e) {
      for (var r = 0, t = n.length; r < t; r++) {
        if (e(n[r], r, n)) return C.some(r);
      }
      return C.none();
    },
    X = function(n, e) {
      for (var r = 0, t = n.length; r < t; ++r) if (n[r] === e) return r;
      return -1;
    },
    Y = Array.prototype.push,
    G = function(n) {
      for (var e = [], r = 0, t = n.length; r < t; ++r) {
        if (!F(n[r]))
          throw new Error(
            "Arr.flatten item " + r + " was not an array, input: " + n
          );
        Y.apply(e, n[r]);
      }
      return e;
    },
    K = function(n, e) {
      var r = q(n, e);
      return G(r);
    },
    Q = M(Array.from)
      ? Array.from
      : function(n) {
          return U.call(n);
        },
    Z = function(n, e) {
      for (var r = [], t = 0; t < n.length; t++) {
        var o = n[t];
        if (!o.isSome()) return C.none();
        r.push(o.getOrDie());
      }
      return C.some(e.apply(null, r));
    },
    nn = function() {
      for (var e = [], n = 0; n < arguments.length; n++) e[n] = arguments[n];
      return function() {
        for (var r = [], n = 0; n < arguments.length; n++) r[n] = arguments[n];
        if (e.length !== r.length)
          throw new Error(
            'Wrong number of arguments to struct. Expected "[' +
              e.length +
              ']", got ' +
              r.length +
              " arguments"
          );
        var t = {};
        return (
          W(e, function(n, e) {
            t[n] = x(r[e]);
          }),
          t
        );
      };
    },
    en = Object.keys,
    rn = Object.hasOwnProperty,
    tn = function(n, e) {
      for (var r = en(n), t = 0, o = r.length; t < o; t++) {
        var i = r[t];
        e(n[i], i, n);
      }
    },
    on = function(n, t) {
      return un(n, function(n, e, r) {
        return { k: e, v: t(n, e, r) };
      });
    },
    un = function(t, o) {
      var i = {};
      return (
        tn(t, function(n, e) {
          var r = o(n, e, t);
          i[r.k] = r.v;
        }),
        i
      );
    },
    cn = function(n, e, r) {
      return 0 != (n.compareDocumentPosition(e) & r);
    },
    an = function(n, e) {
      return cn(n, e, f.Node.DOCUMENT_POSITION_CONTAINED_BY);
    },
    fn = function() {
      return sn(0, 0);
    },
    sn = function(n, e) {
      return { major: n, minor: e };
    },
    ln = {
      nu: sn,
      detect: function(n, e) {
        var r = String(e).toLowerCase();
        return 0 === n.length
          ? fn()
          : (function(n, e) {
              var r = (function(n, e) {
                for (var r = 0; r < n.length; r++) {
                  var t = n[r];
                  if (t.test(e)) return t;
                }
              })(n, e);
              if (!r) return { major: 0, minor: 0 };
              var t = function(n) {
                return Number(e.replace(r, "$" + n));
              };
              return sn(t(1), t(2));
            })(n, r);
      },
      unknown: fn
    },
    dn = "Firefox",
    mn = function(n, e) {
      return function() {
        return e === n;
      };
    },
    pn = function(n) {
      var e = n.current;
      return {
        current: e,
        version: n.version,
        isEdge: mn("Edge", e),
        isChrome: mn("Chrome", e),
        isIE: mn("IE", e),
        isOpera: mn("Opera", e),
        isFirefox: mn(dn, e),
        isSafari: mn("Safari", e)
      };
    },
    hn = {
      unknown: function() {
        return pn({ current: void 0, version: ln.unknown() });
      },
      nu: pn,
      edge: x("Edge"),
      chrome: x("Chrome"),
      ie: x("IE"),
      opera: x("Opera"),
      firefox: x(dn),
      safari: x("Safari")
    },
    vn = "Windows",
    gn = "Android",
    yn = "Solaris",
    wn = "FreeBSD",
    bn = function(n, e) {
      return function() {
        return e === n;
      };
    },
    Tn = function(n) {
      var e = n.current;
      return {
        current: e,
        version: n.version,
        isWindows: bn(vn, e),
        isiOS: bn("iOS", e),
        isAndroid: bn(gn, e),
        isOSX: bn("OSX", e),
        isLinux: bn("Linux", e),
        isSolaris: bn(yn, e),
        isFreeBSD: bn(wn, e)
      };
    },
    xn = {
      unknown: function() {
        return Tn({ current: void 0, version: ln.unknown() });
      },
      nu: Tn,
      windows: x(vn),
      ios: x("iOS"),
      android: x(gn),
      linux: x("Linux"),
      osx: x("OSX"),
      solaris: x(yn),
      freebsd: x(wn)
    },
    En = function(n, e) {
      var r = String(e).toLowerCase();
      return z(n, function(n) {
        return n.search(r);
      });
    },
    On = function(n, r) {
      return En(n, r).map(function(n) {
        var e = ln.detect(n.versionRegexes, r);
        return { current: n.name, version: e };
      });
    },
    Sn = function(n, r) {
      return En(n, r).map(function(n) {
        var e = ln.detect(n.versionRegexes, r);
        return { current: n.name, version: e };
      });
    },
    _n = function(n, e) {
      return -1 !== n.indexOf(e);
    },
    Nn = function(n, e) {
      return (
        (r = n),
        (o = 0),
        "" === (t = e) ||
          (!(r.length < t.length) && r.substr(o, o + t.length) === t)
      );
      var r, t, o;
    },
    An = /.*?version\/\ ?([0-9]+)\.([0-9]+).*/,
    Dn = function(e) {
      return function(n) {
        return _n(n, e);
      };
    },
    kn = [
      {
        name: "Edge",
        versionRegexes: [/.*?edge\/ ?([0-9]+)\.([0-9]+)$/],
        search: function(n) {
          return (
            _n(n, "edge/") &&
            _n(n, "chrome") &&
            _n(n, "safari") &&
            _n(n, "applewebkit")
          );
        }
      },
      {
        name: "Chrome",
        versionRegexes: [/.*?chrome\/([0-9]+)\.([0-9]+).*/, An],
        search: function(n) {
          return _n(n, "chrome") && !_n(n, "chromeframe");
        }
      },
      {
        name: "IE",
        versionRegexes: [
          /.*?msie\ ?([0-9]+)\.([0-9]+).*/,
          /.*?rv:([0-9]+)\.([0-9]+).*/
        ],
        search: function(n) {
          return _n(n, "msie") || _n(n, "trident");
        }
      },
      {
        name: "Opera",
        versionRegexes: [An, /.*?opera\/([0-9]+)\.([0-9]+).*/],
        search: Dn("opera")
      },
      {
        name: "Firefox",
        versionRegexes: [/.*?firefox\/\ ?([0-9]+)\.([0-9]+).*/],
        search: Dn("firefox")
      },
      {
        name: "Safari",
        versionRegexes: [An, /.*?cpu os ([0-9]+)_([0-9]+).*/],
        search: function(n) {
          return (_n(n, "safari") || _n(n, "mobile/")) && _n(n, "applewebkit");
        }
      }
    ],
    Cn = [
      {
        name: "Windows",
        search: Dn("win"),
        versionRegexes: [/.*?windows\ nt\ ?([0-9]+)\.([0-9]+).*/]
      },
      {
        name: "iOS",
        search: function(n) {
          return _n(n, "iphone") || _n(n, "ipad");
        },
        versionRegexes: [
          /.*?version\/\ ?([0-9]+)\.([0-9]+).*/,
          /.*cpu os ([0-9]+)_([0-9]+).*/,
          /.*cpu iphone os ([0-9]+)_([0-9]+).*/
        ]
      },
      {
        name: "Android",
        search: Dn("android"),
        versionRegexes: [/.*?android\ ?([0-9]+)\.([0-9]+).*/]
      },
      {
        name: "OSX",
        search: Dn("os x"),
        versionRegexes: [/.*?os\ x\ ?([0-9]+)_([0-9]+).*/]
      },
      { name: "Linux", search: Dn("linux"), versionRegexes: [] },
      { name: "Solaris", search: Dn("sunos"), versionRegexes: [] },
      { name: "FreeBSD", search: Dn("freebsd"), versionRegexes: [] }
    ],
    Rn = { browsers: x(kn), oses: x(Cn) },
    jn = function(n) {
      var e,
        r,
        t,
        o,
        i,
        u,
        c,
        a,
        f,
        s,
        l,
        d = Rn.browsers(),
        m = Rn.oses(),
        p = On(d, n).fold(hn.unknown, hn.nu),
        h = Sn(m, n).fold(xn.unknown, xn.nu);
      return {
        browser: p,
        os: h,
        deviceType:
          ((r = p),
          (t = n),
          (o = (e = h).isiOS() && !0 === /ipad/i.test(t)),
          (i = e.isiOS() && !o),
          (u = e.isAndroid() && 3 === e.version.major),
          (c = e.isAndroid() && 4 === e.version.major),
          (a = o || u || (c && !0 === /mobile/i.test(t))),
          (f = e.isiOS() || e.isAndroid()),
          (s = f && !a),
          (l = r.isSafari() && e.isiOS() && !1 === /safari/i.test(t)),
          {
            isiPad: x(o),
            isiPhone: x(i),
            isTablet: x(a),
            isPhone: x(s),
            isTouch: x(f),
            isAndroid: e.isAndroid,
            isiOS: e.isiOS,
            isWebView: x(l)
          })
      };
    },
    In = {
      detect:
        ((c = !(i = function() {
          var n = f.navigator.userAgent;
          return jn(n);
        })),
        function() {
          for (var n = [], e = 0; e < arguments.length; e++)
            n[e] = arguments[e];
          return c || ((c = !0), (u = i.apply(null, n))), u;
        })
    },
    Fn = function(n) {
      if (null == n) throw new Error("Node cannot be null or undefined");
      return { dom: x(n) };
    },
    Pn = {
      fromHtml: function(n, e) {
        var r = (e || f.document).createElement("div");
        if (((r.innerHTML = n), !r.hasChildNodes() || 1 < r.childNodes.length))
          throw (f.console.error("HTML does not have a single root node", n),
          new Error("HTML must have a single root node"));
        return Fn(r.childNodes[0]);
      },
      fromTag: function(n, e) {
        var r = (e || f.document).createElement(n);
        return Fn(r);
      },
      fromText: function(n, e) {
        var r = (e || f.document).createTextNode(n);
        return Fn(r);
      },
      fromDom: Fn,
      fromPoint: function(n, e, r) {
        var t = n.dom();
        return C.from(t.elementFromPoint(e, r)).map(Fn);
      }
    },
    Mn =
      (f.Node.ATTRIBUTE_NODE,
      f.Node.CDATA_SECTION_NODE,
      f.Node.COMMENT_NODE,
      f.Node.DOCUMENT_NODE),
    Ln =
      (f.Node.DOCUMENT_TYPE_NODE,
      f.Node.DOCUMENT_FRAGMENT_NODE,
      f.Node.ELEMENT_NODE),
    Un = f.Node.TEXT_NODE,
    Bn =
      (f.Node.PROCESSING_INSTRUCTION_NODE,
      f.Node.ENTITY_REFERENCE_NODE,
      f.Node.ENTITY_NODE,
      f.Node.NOTATION_NODE,
      Ln),
    Vn = Mn,
    qn = function(n) {
      return (
        (n.nodeType !== Bn && n.nodeType !== Vn) || 0 === n.childElementCount
      );
    },
    Wn =
      (In.detect().browser.isIE(),
      function(n) {
        return n.dom().nodeName.toLowerCase();
      }),
    Hn = function(n) {
      return n.dom().nodeType;
    },
    Jn =
      ((a = Un),
      function(n) {
        return Hn(n) === a;
      }),
    zn = function(n, e) {
      for (
        var r = [],
          t = function(n) {
            return r.push(n), e(n);
          },
          o = e(n);
        (o = o.bind(t)).isSome();

      );
      return r;
    },
    $n = function(n) {
      return C.from(n.dom().parentNode).map(Pn.fromDom);
    },
    Xn = function(n) {
      return C.from(n.dom().previousSibling).map(Pn.fromDom);
    },
    Yn = function(n) {
      return C.from(n.dom().nextSibling).map(Pn.fromDom);
    },
    Gn = function(n) {
      return (e = zn(n, Xn)), (r = U.call(e, 0)).reverse(), r;
      var e, r;
    },
    Kn = function(n) {
      return q(n.dom().childNodes, Pn.fromDom);
    },
    Qn = function(n) {
      return (e = 0), (r = n.dom().childNodes), C.from(r[e]).map(Pn.fromDom);
      var e, r;
    },
    Zn =
      (nn("element", "offset"),
      function(n, e) {
        return (
          (r = function(n) {
            return (function(n, e) {
              var r = n.dom();
              if (r.nodeType !== Bn) return !1;
              var t = r;
              if (void 0 !== t.matches) return t.matches(e);
              if (void 0 !== t.msMatchesSelector) return t.msMatchesSelector(e);
              if (void 0 !== t.webkitMatchesSelector)
                return t.webkitMatchesSelector(e);
              if (void 0 !== t.mozMatchesSelector)
                return t.mozMatchesSelector(e);
              throw new Error("Browser lacks native selectors");
            })(n, e);
          }),
          H(Kn(n), r)
        );
        var r;
      }),
    ne = function(n, e) {
      return (
        (r = e),
        (o = void 0 === (t = n) ? f.document : t.dom()),
        qn(o) ? [] : q(o.querySelectorAll(r), Pn.fromDom)
      );
      var r, t, o;
    },
    ee = function(n) {
      return n.dom().textContent;
    },
    re = {
      isBlock:
        ((s = [
          "article",
          "aside",
          "details",
          "div",
          "dt",
          "figcaption",
          "footer",
          "form",
          "fieldset",
          "header",
          "hgroup",
          "html",
          "main",
          "nav",
          "section",
          "summary",
          "body",
          "p",
          "dl",
          "multicol",
          "dd",
          "figure",
          "address",
          "center",
          "blockquote",
          "h1",
          "h2",
          "h3",
          "h4",
          "h5",
          "h6",
          "listing",
          "xmp",
          "pre",
          "plaintext",
          "menu",
          "dir",
          "ul",
          "ol",
          "li",
          "hr",
          "table",
          "tbody",
          "thead",
          "tfoot",
          "th",
          "tr",
          "td",
          "caption"
        ]),
        function(n) {
          return (l =
            l ||
            (function(n, e) {
              for (var r = {}, t = 0, o = n.length; t < o; t++) {
                var i = n[t];
                r[String(i)] = e(i, t);
              }
              return r;
            })(s, x(!0))).hasOwnProperty(Wn(n));
        })
    },
    te = function(e, r) {
      return function(n) {
        return e(n) || r(n);
      };
    },
    oe = nn("start", "end", "caret"),
    ie = function(n) {
      return "br" === Wn(n);
    },
    ue = function(e) {
      return Z([$n(e.start()), $n(e.end())], function() {
        var n = f.document.createRange();
        return (
          n.setStartBefore(e.start().dom()), n.setEndAfter(e.end().dom()), n
        );
      });
    },
    ce = function(n, e) {
      var r = e[e.length - 1];
      return $(n, function(n) {
        return (e = r), n.dom() === e.dom();
        var e;
      }).getOrDie("how is it possible you can't find a br you just found?");
    },
    ae = function(n) {
      return H(Zn(n, "br"), function(n) {
        return Yn(n).isSome();
      });
    },
    fe = function(n) {
      return J(
        n,
        function(n, e) {
          return n + ee(e);
        },
        ""
      );
    },
    se = ae,
    le = ce,
    de = function(n) {
      if (!1 === n.collapsed) return C.none();
      var e,
        r,
        t,
        o =
          ((r = (e = n).startContainer),
          (t = e.startOffset),
          void 0 === r
            ? C.none()
            : 3 === r.nodeType
            ? 0 === t
              ? C.some(r).map(Pn.fromDom)
              : C.none()
            : C.from(r.childNodes[t]).map(Pn.fromDom)),
        i = o.bind(Xn).filter(ie),
        u = i.map(Gn).bind(function(n) {
          return z(n.reverse(), te(ie, re.isBlock)).fold(function() {
            return C.from(n[n.length - 1]);
          }, Yn);
        });
      return Z([u, i, o], oe);
    },
    me = ue,
    pe = function(n) {
      return ue(n).fold(x(""), function(n) {
        return n.toString();
      });
    },
    he = fe,
    ve = function(n) {
      var e = ae(n);
      if (0 < e.length) {
        var r = Kn(n),
          t = ce(r, e),
          o = r.slice(t + 1);
        return fe(o);
      }
      return ee(n);
    },
    ge = function(n) {
      return j(n.mediaembed_service_url);
    },
    ye = function(n) {
      return L(n.mediaembed_max_width) ? n.mediaembed_max_width : 650;
    },
    we = function(n) {
      var e = n.api_key;
      return e || n.mediaembed_api_key;
    },
    be = function(n, e) {
      return j(n.mediaembed_content_css) ? n.mediaembed_content_css : e;
    },
    Te = function(n) {
      return n.getParam("mediaembed_inline_styles", !1, "boolean");
    },
    xe = function(n, e, r) {
      !(function(n, e, r) {
        if (!(j(r) || P(r) || L(r)))
          throw (f.console.error(
            "Invalid call to Attr.set. Key ",
            e,
            ":: Value ",
            r,
            ":: Element ",
            n
          ),
          new Error("Attribute value was not simple"));
        n.setAttribute(e, r + "");
      })(n.dom(), e, r);
    },
    Ee = function(n, t) {
      Yn(n).fold(
        function() {
          $n(n).each(function(n) {
            Oe(n, t);
          });
        },
        function(n) {
          var e, r;
          (r = t),
            $n((e = n)).each(function(n) {
              n.dom().insertBefore(r.dom(), e.dom());
            });
        }
      );
    },
    Oe = function(n, e) {
      n.dom().appendChild(e.dom());
    },
    Se = function(n) {
      var e = n.dom();
      null !== e.parentNode && e.parentNode.removeChild(e);
    },
    _e = function(n) {
      return (e = n), (r = !0), Pn.fromDom(e.dom().cloneNode(r));
      var e, r;
    },
    Ne = function(n) {
      return void 0 !== n.style && M(n.style.getPropertyValue);
    },
    Ae = function(n, e, r) {
      if (!j(r))
        throw (f.console.error(
          "Invalid call to CSS.set. Property ",
          e,
          ":: Value ",
          r,
          ":: Element ",
          n
        ),
        new Error("CSS value must be a string: " + r));
      Ne(n) && n.style.setProperty(e, r);
    },
    De = function(n, e, r) {
      var t = n.dom();
      Ae(t, e, r);
    },
    ke = function(n, e) {
      var r,
        t,
        o = n.dom(),
        i = f.window.getComputedStyle(o).getPropertyValue(e),
        u =
          "" !== i ||
          (null != (t = Jn((r = n)) ? r.dom().parentNode : r.dom()) &&
            t.ownerDocument.body.contains(t))
            ? i
            : Ce(o, e);
      return null === u ? void 0 : u;
    },
    Ce = function(n, e) {
      return Ne(n) ? n.style.getPropertyValue(e) : "";
    },
    Re = function(n) {
      var e = Pn.fromTag("div"),
        r = Pn.fromDom(n.dom().cloneNode(!0));
      return Oe(e, r), e.dom().innerHTML;
    },
    je = function(n) {
      var e = n.dom().styleSheets;
      return Array.prototype.slice.call(e);
    },
    Ie = function(n) {
      var e = n.cssRules;
      return K(e, function(n) {
        return n.type === f.CSSRule.IMPORT_RULE
          ? Ie(n.styleSheet)
          : n.type === f.CSSRule.STYLE_RULE
          ? [
              (function(n) {
                var e = n.selectorText,
                  r = n.style.cssText;
                if (void 0 === r)
                  throw new Error(
                    "WARNING: Browser does not support cssText property"
                  );
                return { selector: e, style: r, raw: n.style };
              })(n)
            ]
          : [];
      });
    },
    Fe = function(n) {
      return K(n, Ie);
    },
    Pe = {},
    Me = { exports: Pe };
  (m = Pe),
    (p = Me),
    (d = void 0),
    (function(n) {
      "object" == typeof m && void 0 !== p
        ? (p.exports = n())
        : "function" == typeof d && d.amd
        ? d([], n)
        : (("undefined" != typeof window
            ? window
            : "undefined" != typeof global
            ? global
            : "undefined" != typeof self
            ? self
            : this
          ).EphoxContactWrapper = n());
    })(function() {
      return (function i(u, c, a) {
        function f(e, n) {
          if (!c[e]) {
            if (!u[e]) {
              var r = !1;
              if (!n && r) return r(e, !0);
              if (s) return s(e, !0);
              var t = new Error("Cannot find module '" + e + "'");
              throw ((t.code = "MODULE_NOT_FOUND"), t);
            }
            var o = (c[e] = { exports: {} });
            u[e][0].call(
              o.exports,
              function(n) {
                return f(u[e][1][n] || n);
              },
              o,
              o.exports,
              i,
              u,
              c,
              a
            );
          }
          return c[e].exports;
        }
        for (var s = !1, n = 0; n < a.length; n++) f(a[n]);
        return f;
      })(
        {
          1: [
            function(n, e, r) {
              var t,
                u,
                o =
                  ((t = function(n) {
                    var e,
                      r,
                      t,
                      o,
                      i = [];
                    for (t = 0, o = (e = n.split(",")).length; t < o; t += 1)
                      0 < (r = e[t]).length && i.push(u(r));
                    return i;
                  }),
                  (u = function(a) {
                    var n,
                      e,
                      r,
                      f = a,
                      s = { a: 0, b: 0, c: 0 },
                      l = [];
                    return (
                      (n = function(n, e) {
                        var r, t, o, i, u, c;
                        if (n.test(f))
                          for (
                            t = 0, o = (r = f.match(n)).length;
                            t < o;
                            t += 1
                          )
                            (s[e] += 1),
                              (i = r[t]),
                              (u = f.indexOf(i)),
                              (c = i.length),
                              l.push({
                                selector: a.substr(u, c),
                                type: e,
                                index: u,
                                length: c
                              }),
                              (f = f.replace(i, Array(c + 1).join(" ")));
                      }),
                      (e = function(n) {
                        var e, r, t, o;
                        if (n.test(f))
                          for (
                            r = 0, t = (e = f.match(n)).length;
                            r < t;
                            r += 1
                          )
                            (o = e[r]),
                              (f = f.replace(o, Array(o.length + 1).join("A")));
                      })(/\\[0-9A-Fa-f]{6}\s?/g),
                      e(/\\[0-9A-Fa-f]{1,5}\s/g),
                      e(/\\./g),
                      (r = /:not\(([^\)]*)\)/g).test(f) &&
                        (f = f.replace(r, "     $1 ")),
                      (function() {
                        var n,
                          e,
                          r,
                          t,
                          o = /{[^]*/gm;
                        if (o.test(f))
                          for (
                            e = 0, r = (n = f.match(o)).length;
                            e < r;
                            e += 1
                          )
                            (t = n[e]),
                              (f = f.replace(t, Array(t.length + 1).join(" ")));
                      })(),
                      n(/(\[[^\]]+\])/g, "b"),
                      n(/(#[^\#\s\+>~\.\[:]+)/g, "a"),
                      n(/(\.[^\s\+>~\.\[:]+)/g, "b"),
                      n(
                        /(::[^\s\+>~\.\[:]+|:first-line|:first-letter|:before|:after)/gi,
                        "c"
                      ),
                      n(/(:[\w-]+\([^\)]*\))/gi, "b"),
                      n(/(:[^\s\+>~\.\[:]+)/g, "b"),
                      (f = (f = f.replace(/[\*\s\+>~]/g, " ")).replace(
                        /[#\.]/g,
                        " "
                      )),
                      n(/([^\s\+>~\.\[:]+)/g, "c"),
                      l.sort(function(n, e) {
                        return n.index - e.index;
                      }),
                      {
                        selector: a,
                        specificity:
                          "0," +
                          s.a.toString() +
                          "," +
                          s.b.toString() +
                          "," +
                          s.c.toString(),
                        specificityArray: [0, s.a, s.b, s.c],
                        parts: l
                      }
                    );
                  }),
                  {
                    calculate: t,
                    compare: function(n, e) {
                      var r, t, o;
                      if ("string" == typeof n) {
                        if (-1 !== n.indexOf(",")) throw "Invalid CSS selector";
                        r = u(n).specificityArray;
                      } else {
                        if (!Array.isArray(n))
                          throw "Invalid CSS selector or specificity array";
                        if (
                          4 !==
                          n.filter(function(n) {
                            return "number" == typeof n;
                          }).length
                        )
                          throw "Invalid specificity array";
                        r = n;
                      }
                      if ("string" == typeof e) {
                        if (-1 !== e.indexOf(",")) throw "Invalid CSS selector";
                        t = u(e).specificityArray;
                      } else {
                        if (!Array.isArray(e))
                          throw "Invalid CSS selector or specificity array";
                        if (
                          4 !==
                          e.filter(function(n) {
                            return "number" == typeof n;
                          }).length
                        )
                          throw "Invalid specificity array";
                        t = e;
                      }
                      for (o = 0; o < 4; o += 1) {
                        if (r[o] < t[o]) return -1;
                        if (r[o] > t[o]) return 1;
                      }
                      return 0;
                    }
                  });
              void 0 !== r &&
                ((r.calculate = o.calculate), (r.compare = o.compare));
            },
            {}
          ],
          2: [
            function(n, e, r) {
              var t = n("specificity");
              e.exports = { boltExport: t };
            },
            { specificity: 1 }
          ]
        },
        {},
        [2]
      )(2);
    });
  var Le,
    Ue,
    Be,
    Ve = Me.exports.boltExport,
    qe = function(e, n) {
      var r = K(n, function(c) {
        var n = ne(e, c.selector);
        return (
          W(n, function(n) {
            var r,
              t,
              o,
              e,
              i,
              u =
                ((r = c.raw),
                (t = n),
                (o = {}),
                W(r, function(n) {
                  if (void 0 !== r[n]) {
                    var e = t.dom().style;
                    V(e, n) || (o[n] = r[n]);
                  }
                }),
                o);
            (e = u),
              (i = n.dom()),
              tn(e, function(n, e) {
                Ae(i, e, n);
              });
          }),
          n
        );
      });
      W(r, function(n) {
        var e;
        (e = "class"), n.dom().removeAttribute(e);
      });
    },
    We = function(n, e) {
      var r = function(n) {
          return -1 !== n.selector.indexOf(",");
        },
        t = K(H(n, r), function(e) {
          var n = e.selector.split(",");
          return q(n, function(n) {
            return { selector: n.trim(), raw: e.raw };
          });
        }),
        o = H(n, function(n) {
          return !r(n);
        }).concat(t);
      o
        .sort(function(n, e) {
          return Ve.compare(n.selector, e.selector);
        })
        .reverse(),
        qe(e, o);
    },
    He = {
      inlineStyles: function(n, e, r) {
        var t = je(n),
          o = Fe(t).map(function(n) {
            var e = n.selector;
            return { selector: r.hasOwnProperty(e) ? r[e] : e, raw: n.raw };
          });
        We(o, e);
      },
      inlinePrefixedStyles: function(n, e, r) {
        var t = je(n),
          o = Fe(t),
          i = H(o, function(n) {
            return Nn(n.selector, r);
          });
        We(i, e);
      }
    },
    Je = {
      inlineStyles: He.inlineStyles,
      inlinePrefixedStyles: He.inlinePrefixedStyles
    },
    ze = function(n) {
      return 1 === Hn(n)
        ? n
        : Yn(n).fold(function() {
            return n;
          }, ze);
    },
    $e = function(n, e) {
      var r = n.parser.parse(e, { isRootContent: !0, forced_root_block: !1 }),
        t = new tinymce.html.Serializer({ validate: !0 }, n.schema).serialize(
          r
        ),
        o = Pn.fromDom(n.dom.createFragment(t));
      return Ge(n, o);
    },
    Xe = function(n, e) {
      return Wn(e).toLowerCase() === n.toLowerCase();
    },
    Ye = function(n, e) {
      var r = n.dom.createFragment(e);
      return ze(Pn.fromDom(r.firstChild));
    },
    Ge = function(n, e) {
      if (Te(n)) {
        var r = Pn.fromTag("div");
        Oe(r, e);
        var t = n.getDoc(),
          o = Pn.fromDom(t);
        Je.inlinePrefixedStyles(o, r, ".ephox-summary-card");
        var i = ne(r, "*[style]");
        return (
          W(i, function(n) {
            var e,
              r,
              t =
                ((e = "style"),
                null === (r = n.dom().getAttribute(e)) ? void 0 : r);
            xe(n, "data-mce-style", t);
          }),
          (u = Kn(r)),
          (a = (c || f.document).createDocumentFragment()),
          W(u, function(n) {
            a.appendChild(n.dom());
          }),
          Pn.fromDom(a)
        );
      }
      return e;
      var u, c, a;
    },
    Ke = function(n, e, r) {
      var t = $e(n, Re(r));
      n.undoManager.transact(function() {
        var n;
        ((n = e).dom().textContent = ""),
          W(Kn(n), function(n) {
            Se(n);
          }),
          Oe(e, t);
      });
    },
    Qe = function(n, e, r) {
      var t = _e(r);
      return (
        ke(t, "max-width") || De(t, "max-width", e + "px"),
        xe(t, "data-ephox-embed-iri", n),
        xe(t, "contentEditable", !1),
        t
      );
    },
    Ze = function(n, e, r) {
      return Xe("DIV", e)
        ? Qe(n, r, e)
        : Qe(
            n,
            r,
            ((Xe("VIDEO", (i = e)) || Xe("AUDIO", i)) && De(i, "width", "100%"),
            (t = i),
            (o = Pn.fromTag("div")),
            Oe(o, _e(t)),
            o)
          );
      var t, o, i;
    },
    nr = function(n, e, r) {
      return Xe("A", e) ? e : Ze(n, e, r);
    },
    er = function(n, e, r, t, o) {
      var i,
        u,
        c,
        a,
        f,
        s,
        l,
        d,
        m = Kn(e),
        p = le(m, r),
        h = m.slice(p),
        v = m.slice(p + 1);
      if (he(v) === t) {
        var g = nr(t, Ye(n, o), ye(n.settings));
        Xe("DIV", g)
          ? ((s = e),
            (l = h),
            (d = $e((f = n), Re(g))),
            Qn(d).each(function(n) {
              f.undoManager.transact(function() {
                Ee(s, n), W(l, Se);
              });
            }))
          : ((u = e),
            (c = v),
            (a = $e((i = n), Re(g))),
            i.undoManager.transact(function() {
              W(c, Se), Oe(u, a);
            }));
      }
    },
    rr = function(n, e, r, t) {
      var o,
        i,
        u,
        c = nr(r, Ye(n, t), ye(n.settings));
      Xe("DIV", c)
        ? ((i = e),
          (u = $e((o = n), Re(c))),
          Qn(u).each(function(n) {
            o.undoManager.transact(function() {
              Ee(i, n), Se(i);
            });
          }))
        : Ke(n, e, c);
    },
    tr = function(r, n, t, o) {
      n.filter(function(n) {
        return $n(n).isSome();
      }).each(function(n) {
        var e = se(n);
        0 < e.length ? er(r, n, e, t, o) : rr(r, n, t, o);
      });
    },
    or = function(n, e, r) {
      var t = Ye(n, r);
      return Re(nr(e, t, ye(n.settings)));
    },
    ir = function(u, n, e, r) {
      n.map(function(i) {
        me(i).each(function(t) {
          var n = nr(e, Ye(u, r), ye(u.settings)),
            o = $e(u, Re(n));
          u.undoManager.transact(function() {
            var n, e, r;
            t.deleteContents(),
              t.insertNode(o.dom()),
              t.collapse(!1),
              (n = u),
              (e = i.caret().dom()),
              (r = n.dom.createRng()),
              3 === e.nodeType
                ? (r.setStart(e, 0), r.setEnd(e, 0))
                : (r.setStartBefore(e), r.setEndAfter(e)),
              n.selection.setRng(r);
          });
        });
      });
    },
    ur = function(n) {
      var e,
        r,
        t =
          ((e = n.split(" ")),
          (r = {}),
          W(e, function(n) {
            r[n.toLowerCase()] = !0;
          }),
          r);
      return function(n) {
        return !!n && n.nodeName.toLowerCase() in t;
      };
    },
    cr = ur("h1 h2 h3 h4 h5 h6 p span"),
    ar = ur("strong em b span a br"),
    fr = function(n) {
      return z(
        ((e = n), e ? Q(e.querySelectorAll("*")) : []),
        ((r = ar),
        function() {
          for (var n = [], e = 0; e < arguments.length; e++)
            n[e] = arguments[e];
          return !r.apply(null, n);
        })
      ).isNone();
      var r, e;
    },
    sr = function(n) {
      return cr(n.dom()) && fr(n.dom());
    },
    lr = function(n) {
      return /^https?:\/\/\S+$/i.test(n.trim());
    },
    dr = function(n) {
      return C.from(n)
        .filter(sr)
        .map(ve)
        .filter(lr);
    },
    mr = function(c, a, f) {
      c.on("newBlock", function(n) {
        var e, t, o, i, u;
        (e = n),
          (t = c),
          (o = a),
          (i = f),
          (u = Xn(Pn.fromDom(e.newBlock))).bind(dr).map(function(r) {
            o.getAndHandleResponse(
              r,
              function(n) {
                var e = n.recommended().html();
                tr(t, u, r, e);
              },
              i.logError
            );
          });
      }),
        c.settings.forced_root_block ||
          c.on("keydown", function(n) {
            var t, e, o, r, i;
            13 === n.keyCode &&
              ((e = a),
              (o = f),
              (r = (t = c).selection.getRng()),
              (i = de(r))
                .map(pe)
                .filter(lr)
                .map(function(r) {
                  e.getAndHandleResponse(
                    r,
                    function(n) {
                      var e = n.recommended().html();
                      ir(t, i, r, e);
                    },
                    o.logError
                  );
                }));
          });
    },
    pr = function(n) {
      W(n, function(n) {
        var e;
        (e = new tinymce.html.Node("span", 1)).attr("class", "mce-shim"),
          e.attr("data-mce-bogus", "1"),
          n.append(e),
          n.attr("contenteditable", "false");
      });
    },
    hr = function(n) {
      W(n, function(n) {
        n.attr("contenteditable", null);
      });
    },
    vr = function(e) {
      e.on("click keyup", function() {
        var n = e.selection.getNode();
        n &&
          e.dom.getAttrib(n, "data-ephox-embed-iri") &&
          e.dom.getAttrib(n, "data-mce-selected") &&
          n.setAttribute("data-mce-selected", "2");
      }),
        tinymce.Env.ceFalse &&
          e.on("PreInit", function() {
            e.parser.addAttributeFilter("data-ephox-embed-iri", pr),
              e.serializer.addAttributeFilter("data-ephox-embed-iri", hr);
          });
    },
    gr = function(n, e, r) {
      var o, i, u;
      "media_url_resolver" in n.settings == 0 &&
        (n.settings.media_url_resolver =
          ((o = n),
          (i = e),
          (u = r),
          function(r, t, e) {
            !1 !== lr(r.url)
              ? i.getAndHandleResponse(
                  r.url,
                  function(n) {
                    var e = n.recommended().html();
                    t({ html: or(o, r.url, e) });
                  },
                  function(n) {
                    u.logDialogError(n),
                      e({ msg: u.formatMessage(n.msg(), n.code()) });
                  }
                )
              : t({ html: "" });
          }));
    },
    yr = function(t, o) {
      return function() {
        for (var n = [], e = 0; e < arguments.length; e++) n[e] = arguments[e];
        var r = t.console;
        r && o in r && r[o].apply(r, arguments);
      };
    },
    wr = {
      log: yr(window, "log"),
      error: yr(window, "error"),
      warn: yr(window, "warm")
    },
    br = [
      { code: 404, message: "The specified url was not found." },
      {
        code: 600,
        message: "The specified service did not respond correctly."
      },
      { code: 601, message: "The specified service did not respond correctly." }
    ],
    Tr = function(n, e) {
      return z(br, function(n) {
        return n.code === e;
      }).fold(
        function() {
          return "Server didn't produce a valid result. (" + e + ")";
        },
        function(n) {
          return n.message;
        }
      );
    },
    xr = function(t) {
      var r,
        o = function(n) {
          var e,
            r = (function(n) {
              if ("string" == typeof n) return { message: n };
              var e = n.code();
              return { message: Tr(n.msg(), e), code: e };
            })(n);
          (e = r),
            t.fire("MediaEmbedError", e),
            wr.error("Media embed error: " + r.message);
        };
      return {
        formatMessage: Tr,
        logDialogError: function(n) {
          var e = n.msg();
          e !== r && o(n), (r = e);
        },
        logError: o
      };
    },
    Er = {},
    Or = { exports: Er };
  (Ue = Er),
    (Be = Or),
    (Le = void 0),
    (function(n) {
      "object" == typeof Ue && void 0 !== Be
        ? (Be.exports = n())
        : "function" == typeof Le && Le.amd
        ? Le([], n)
        : (("undefined" != typeof window
            ? window
            : "undefined" != typeof global
            ? global
            : "undefined" != typeof self
            ? self
            : this
          ).EphoxContactWrapper = n());
    })(function() {
      return (function i(u, c, a) {
        function f(e, n) {
          if (!c[e]) {
            if (!u[e]) {
              var r = !1;
              if (!n && r) return r(e, !0);
              if (s) return s(e, !0);
              var t = new Error("Cannot find module '" + e + "'");
              throw ((t.code = "MODULE_NOT_FOUND"), t);
            }
            var o = (c[e] = { exports: {} });
            u[e][0].call(
              o.exports,
              function(n) {
                return f(u[e][1][n] || n);
              },
              o,
              o.exports,
              i,
              u,
              c,
              a
            );
          }
          return c[e].exports;
        }
        for (var s = !1, n = 0; n < a.length; n++) f(a[n]);
        return f;
      })(
        {
          1: [
            function(n, e, r) {
              var t,
                o,
                i = (e.exports = {});
              function u() {
                throw new Error("setTimeout has not been defined");
              }
              function c() {
                throw new Error("clearTimeout has not been defined");
              }
              function a(e) {
                if (t === setTimeout) return setTimeout(e, 0);
                if ((t === u || !t) && setTimeout)
                  return (t = setTimeout), setTimeout(e, 0);
                try {
                  return t(e, 0);
                } catch (n) {
                  try {
                    return t.call(null, e, 0);
                  } catch (n) {
                    return t.call(this, e, 0);
                  }
                }
              }
              !(function() {
                try {
                  t = "function" == typeof setTimeout ? setTimeout : u;
                } catch (n) {
                  t = u;
                }
                try {
                  o = "function" == typeof clearTimeout ? clearTimeout : c;
                } catch (n) {
                  o = c;
                }
              })();
              var f,
                s = [],
                l = !1,
                d = -1;
              function m() {
                l &&
                  f &&
                  ((l = !1),
                  f.length ? (s = f.concat(s)) : (d = -1),
                  s.length && p());
              }
              function p() {
                if (!l) {
                  var n = a(m);
                  l = !0;
                  for (var e = s.length; e; ) {
                    for (f = s, s = []; ++d < e; ) f && f[d].run();
                    (d = -1), (e = s.length);
                  }
                  (f = null),
                    (l = !1),
                    (function(e) {
                      if (o === clearTimeout) return clearTimeout(e);
                      if ((o === c || !o) && clearTimeout)
                        return (o = clearTimeout), clearTimeout(e);
                      try {
                        o(e);
                      } catch (n) {
                        try {
                          return o.call(null, e);
                        } catch (n) {
                          return o.call(this, e);
                        }
                      }
                    })(n);
                }
              }
              function h(n, e) {
                (this.fun = n), (this.array = e);
              }
              function v() {}
              (i.nextTick = function(n) {
                var e = new Array(arguments.length - 1);
                if (1 < arguments.length)
                  for (var r = 1; r < arguments.length; r++)
                    e[r - 1] = arguments[r];
                s.push(new h(n, e)), 1 !== s.length || l || a(p);
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
                (i.on = v),
                (i.addListener = v),
                (i.once = v),
                (i.off = v),
                (i.removeListener = v),
                (i.removeAllListeners = v),
                (i.emit = v),
                (i.prependListener = v),
                (i.prependOnceListener = v),
                (i.listeners = function(n) {
                  return [];
                }),
                (i.binding = function(n) {
                  throw new Error("process.binding is not supported");
                }),
                (i.cwd = function() {
                  return "/";
                }),
                (i.chdir = function(n) {
                  throw new Error("process.chdir is not supported");
                }),
                (i.umask = function() {
                  return 0;
                });
            },
            {}
          ],
          2: [
            function(n, l, e) {
              (function(r) {
                !(function(n) {
                  var e = setTimeout;
                  function t() {}
                  function i(n) {
                    if ("object" != typeof this)
                      throw new TypeError(
                        "Promises must be constructed via new"
                      );
                    if ("function" != typeof n)
                      throw new TypeError("not a function");
                    (this._state = 0),
                      (this._handled = !1),
                      (this._value = void 0),
                      (this._deferreds = []),
                      s(n, this);
                  }
                  function o(r, t) {
                    for (; 3 === r._state; ) r = r._value;
                    0 !== r._state
                      ? ((r._handled = !0),
                        i._immediateFn(function() {
                          var n = 1 === r._state ? t.onFulfilled : t.onRejected;
                          if (null !== n) {
                            var e;
                            try {
                              e = n(r._value);
                            } catch (n) {
                              return void c(t.promise, n);
                            }
                            u(t.promise, e);
                          } else (1 === r._state ? u : c)(t.promise, r._value);
                        }))
                      : r._deferreds.push(t);
                  }
                  function u(e, n) {
                    try {
                      if (n === e)
                        throw new TypeError(
                          "A promise cannot be resolved with itself."
                        );
                      if (
                        n &&
                        ("object" == typeof n || "function" == typeof n)
                      ) {
                        var r = n.then;
                        if (n instanceof i)
                          return (e._state = 3), (e._value = n), void a(e);
                        if ("function" == typeof r)
                          return void s(
                            ((t = r),
                            (o = n),
                            function() {
                              t.apply(o, arguments);
                            }),
                            e
                          );
                      }
                      (e._state = 1), (e._value = n), a(e);
                    } catch (n) {
                      c(e, n);
                    }
                    var t, o;
                  }
                  function c(n, e) {
                    (n._state = 2), (n._value = e), a(n);
                  }
                  function a(n) {
                    2 === n._state &&
                      0 === n._deferreds.length &&
                      i._immediateFn(function() {
                        n._handled || i._unhandledRejectionFn(n._value);
                      });
                    for (var e = 0, r = n._deferreds.length; e < r; e++)
                      o(n, n._deferreds[e]);
                    n._deferreds = null;
                  }
                  function f(n, e, r) {
                    (this.onFulfilled = "function" == typeof n ? n : null),
                      (this.onRejected = "function" == typeof e ? e : null),
                      (this.promise = r);
                  }
                  function s(n, e) {
                    var r = !1;
                    try {
                      n(
                        function(n) {
                          r || ((r = !0), u(e, n));
                        },
                        function(n) {
                          r || ((r = !0), c(e, n));
                        }
                      );
                    } catch (n) {
                      if (r) return;
                      (r = !0), c(e, n);
                    }
                  }
                  (i.prototype.catch = function(n) {
                    return this.then(null, n);
                  }),
                    (i.prototype.then = function(n, e) {
                      var r = new this.constructor(t);
                      return o(this, new f(n, e, r)), r;
                    }),
                    (i.all = function(n) {
                      var c = Array.prototype.slice.call(n);
                      return new i(function(t, o) {
                        if (0 === c.length) return t([]);
                        var i = c.length;
                        function u(e, n) {
                          try {
                            if (
                              n &&
                              ("object" == typeof n || "function" == typeof n)
                            ) {
                              var r = n.then;
                              if ("function" == typeof r)
                                return void r.call(
                                  n,
                                  function(n) {
                                    u(e, n);
                                  },
                                  o
                                );
                            }
                            (c[e] = n), 0 == --i && t(c);
                          } catch (n) {
                            o(n);
                          }
                        }
                        for (var n = 0; n < c.length; n++) u(n, c[n]);
                      });
                    }),
                    (i.resolve = function(e) {
                      return e && "object" == typeof e && e.constructor === i
                        ? e
                        : new i(function(n) {
                            n(e);
                          });
                    }),
                    (i.reject = function(r) {
                      return new i(function(n, e) {
                        e(r);
                      });
                    }),
                    (i.race = function(o) {
                      return new i(function(n, e) {
                        for (var r = 0, t = o.length; r < t; r++)
                          o[r].then(n, e);
                      });
                    }),
                    (i._immediateFn =
                      "function" == typeof r
                        ? function(n) {
                            r(n);
                          }
                        : function(n) {
                            e(n, 0);
                          }),
                    (i._unhandledRejectionFn = function(n) {
                      "undefined" != typeof console &&
                        console &&
                        console.warn(
                          "Possible Unhandled Promise Rejection:",
                          n
                        );
                    }),
                    (i._setImmediateFn = function(n) {
                      i._immediateFn = n;
                    }),
                    (i._setUnhandledRejectionFn = function(n) {
                      i._unhandledRejectionFn = n;
                    }),
                    void 0 !== l && l.exports
                      ? (l.exports = i)
                      : n.Promise || (n.Promise = i);
                })(this);
              }.call(this, n("timers").setImmediate));
            },
            { timers: 3 }
          ],
          3: [
            function(a, n, f) {
              (function(n, e) {
                var t = a("process/browser.js").nextTick,
                  r = Function.prototype.apply,
                  o = Array.prototype.slice,
                  i = {},
                  u = 0;
                function c(n, e) {
                  (this._id = n), (this._clearFn = e);
                }
                (f.setTimeout = function() {
                  return new c(
                    r.call(setTimeout, window, arguments),
                    clearTimeout
                  );
                }),
                  (f.setInterval = function() {
                    return new c(
                      r.call(setInterval, window, arguments),
                      clearInterval
                    );
                  }),
                  (f.clearTimeout = f.clearInterval = function(n) {
                    n.close();
                  }),
                  (c.prototype.unref = c.prototype.ref = function() {}),
                  (c.prototype.close = function() {
                    this._clearFn.call(window, this._id);
                  }),
                  (f.enroll = function(n, e) {
                    clearTimeout(n._idleTimeoutId), (n._idleTimeout = e);
                  }),
                  (f.unenroll = function(n) {
                    clearTimeout(n._idleTimeoutId), (n._idleTimeout = -1);
                  }),
                  (f._unrefActive = f.active = function(n) {
                    clearTimeout(n._idleTimeoutId);
                    var e = n._idleTimeout;
                    0 <= e &&
                      (n._idleTimeoutId = setTimeout(function() {
                        n._onTimeout && n._onTimeout();
                      }, e));
                  }),
                  (f.setImmediate =
                    "function" == typeof n
                      ? n
                      : function(n) {
                          var e = u++,
                            r = !(arguments.length < 2) && o.call(arguments, 1);
                          return (
                            (i[e] = !0),
                            t(function() {
                              i[e] &&
                                (r ? n.apply(null, r) : n.call(null),
                                f.clearImmediate(e));
                            }),
                            e
                          );
                        }),
                  (f.clearImmediate =
                    "function" == typeof e
                      ? e
                      : function(n) {
                          delete i[n];
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
            function(n, e, r) {
              var t = n("promise-polyfill"),
                o =
                  "undefined" != typeof window
                    ? window
                    : Function("return this;")();
              e.exports = { boltExport: o.Promise || t };
            },
            { "promise-polyfill": 2 }
          ]
        },
        {},
        [4]
      )(4);
    });
  var Sr,
    _r,
    Nr = Or.exports.boltExport,
    Ar = function(n) {
      var r = C.none(),
        e = [],
        t = function(n) {
          o() ? u(n) : e.push(n);
        },
        o = function() {
          return r.isSome();
        },
        i = function(n) {
          W(n, u);
        },
        u = function(e) {
          r.each(function(n) {
            f.setTimeout(function() {
              e(n);
            }, 0);
          });
        };
      return (
        n(function(n) {
          (r = C.some(n)), i(e), (e = []);
        }),
        {
          get: t,
          map: function(r) {
            return Ar(function(e) {
              t(function(n) {
                e(r(n));
              });
            });
          },
          isReady: o
        }
      );
    },
    Dr = {
      nu: Ar,
      pure: function(e) {
        return Ar(function(n) {
          n(e);
        });
      }
    },
    kr = function(n) {
      f.setTimeout(function() {
        throw n;
      }, 0);
    },
    Cr = function(r) {
      var n = function(n) {
        r().then(n, kr);
      };
      return {
        map: function(n) {
          return Cr(function() {
            return r().then(n);
          });
        },
        bind: function(e) {
          return Cr(function() {
            return r().then(function(n) {
              return e(n).toPromise();
            });
          });
        },
        anonBind: function(n) {
          return Cr(function() {
            return r().then(function() {
              return n.toPromise();
            });
          });
        },
        toLazy: function() {
          return Dr.nu(n);
        },
        toCached: function() {
          var n = null;
          return Cr(function() {
            return null === n && (n = r()), n;
          });
        },
        toPromise: r,
        get: n
      };
    },
    Rr = function(n) {
      return Cr(function() {
        return new Nr(n);
      });
    },
    jr = function(n) {
      return Cr(function() {
        return Nr.resolve(n);
      });
    },
    Ir = function(r) {
      return {
        is: function(n) {
          return r === n;
        },
        isValue: S,
        isError: O,
        getOr: x(r),
        getOrThunk: x(r),
        getOrDie: x(r),
        or: function(n) {
          return Ir(r);
        },
        orThunk: function(n) {
          return Ir(r);
        },
        fold: function(n, e) {
          return e(r);
        },
        map: function(n) {
          return Ir(n(r));
        },
        mapError: function(n) {
          return Ir(r);
        },
        each: function(n) {
          n(r);
        },
        bind: function(n) {
          return n(r);
        },
        exists: function(n) {
          return n(r);
        },
        forall: function(n) {
          return n(r);
        },
        toOption: function() {
          return C.some(r);
        }
      };
    },
    Fr = function(r) {
      return {
        is: O,
        isValue: O,
        isError: S,
        getOr: E,
        getOrThunk: function(n) {
          return n();
        },
        getOrDie: function() {
          return (
            (n = String(r)),
            (function() {
              throw new Error(n);
            })()
          );
          var n;
        },
        or: function(n) {
          return n;
        },
        orThunk: function(n) {
          return n();
        },
        fold: function(n, e) {
          return n(r);
        },
        map: function(n) {
          return Fr(r);
        },
        mapError: function(n) {
          return Fr(n(r));
        },
        each: b,
        bind: function(n) {
          return Fr(r);
        },
        exists: O,
        forall: S,
        toOption: C.none
      };
    },
    Pr = {
      value: Ir,
      error: Fr,
      fromOption: function(n, e) {
        return n.fold(function() {
          return Fr(e);
        }, Ir);
      }
    },
    Mr = {
      pure: T(jr, Pr.value),
      failed: T(jr, Pr.error),
      foldSync: function(n, e, r) {
        return n.map(function(n) {
          return n.fold(e, r);
        });
      },
      bindSync: function(n, e) {
        return n.map(function(n) {
          return n.bind(e);
        });
      },
      bindAsync: function(n, e) {
        return n.bind(function(n) {
          return n.bind(e);
        });
      },
      mapSync: function(n, e) {
        return n.map(function(n) {
          return n.map(e);
        });
      },
      handle: function(n, e, r) {
        return n.get(function(n) {
          return n.fold(e, r);
        });
      }
    },
    Lr = {
      now: function() {
        return new Date().getTime();
      }
    },
    Ur = 36e5;
  ((_r = Sr || (Sr = {}))[(_r.Error = 0)] = "Error"),
    (_r[(_r.Value = 1)] = "Value");
  var Br,
    Vr,
    qr = function(n, e, r) {
      return n.stype === Sr.Error ? e(n.serror) : r(n.svalue);
    },
    Wr = function(n) {
      return { stype: Sr.Value, svalue: n };
    },
    Hr = function(n) {
      return { stype: Sr.Error, serror: n };
    },
    Jr = function(n) {
      return qr(n, Pr.error, Pr.value);
    },
    zr = Wr,
    $r = function(n) {
      var e = [],
        r = [];
      return (
        W(n, function(n) {
          qr(
            n,
            function(n) {
              return r.push(n);
            },
            function(n) {
              return e.push(n);
            }
          );
        }),
        { values: e, errors: r }
      );
    },
    Xr = Hr,
    Yr = function(n, e) {
      return n.stype === Sr.Value ? e(n.svalue) : n;
    },
    Gr = function(n, e) {
      return n.stype === Sr.Error ? e(n.serror) : n;
    },
    Kr = function(n, e) {
      return n.stype === Sr.Value
        ? { stype: Sr.Value, svalue: e(n.svalue) }
        : n;
    },
    Qr = function(n, e) {
      return n.stype === Sr.Error
        ? { stype: Sr.Error, serror: e(n.serror) }
        : n;
    },
    Zr = function(t) {
      return function(n) {
        return (e = n), (r = t), rn.call(e, r) ? C.from(n[t]) : C.none();
        var e, r;
      };
    },
    nt = function(n, e) {
      return Zr(e)(n);
    },
    et = function(n, e) {
      var r = {};
      return (r[n] = e), r;
    },
    rt = function(u) {
      if (!F(u)) throw new Error("cases must be an array");
      if (0 === u.length) throw new Error("there must be at least one case");
      var c = [],
        r = {};
      return (
        W(u, function(n, t) {
          var e = en(n);
          if (1 !== e.length) throw new Error("one and only one name per case");
          var o = e[0],
            i = n[o];
          if (void 0 !== r[o]) throw new Error("duplicate key detected:" + o);
          if ("cata" === o)
            throw new Error("cannot have a case named cata (sorry)");
          if (!F(i)) throw new Error("case arguments must be an array");
          c.push(o),
            (r[o] = function() {
              var n = arguments.length;
              if (n !== i.length)
                throw new Error(
                  "Wrong number of arguments to case " +
                    o +
                    ". Expected " +
                    i.length +
                    " (" +
                    i +
                    "), got " +
                    n
                );
              for (var r = new Array(n), e = 0; e < r.length; e++)
                r[e] = arguments[e];
              return {
                fold: function() {
                  if (arguments.length !== u.length)
                    throw new Error(
                      "Wrong number of arguments to fold. Expected " +
                        u.length +
                        ", got " +
                        arguments.length
                    );
                  return arguments[t].apply(null, r);
                },
                match: function(n) {
                  var e = en(n);
                  if (c.length !== e.length)
                    throw new Error(
                      "Wrong number of arguments to match. Expected: " +
                        c.join(",") +
                        "\nActual: " +
                        e.join(",")
                    );
                  if (
                    !(function(n, e) {
                      for (var r = 0, t = n.length; r < t; ++r)
                        if (!0 !== e(n[r], r, n)) return !1;
                      return !0;
                    })(c, function(n) {
                      return V(e, n);
                    })
                  )
                    throw new Error(
                      "Not all branches were specified when using match. Specified: " +
                        e.join(", ") +
                        "\nRequired: " +
                        c.join(", ")
                    );
                  return n[o].apply(null, r);
                },
                log: function(n) {
                  f.console.log(n, {
                    constructors: c,
                    constructor: o,
                    params: r
                  });
                }
              };
            });
        }),
        r
      );
    },
    tt =
      (rt([
        { bothErrors: ["error1", "error2"] },
        { firstError: ["error1", "value2"] },
        { secondError: ["value1", "error2"] },
        { bothValues: ["value1", "value2"] }
      ]),
      Object.prototype.hasOwnProperty),
    ot = function(u) {
      return function() {
        for (var n = new Array(arguments.length), e = 0; e < n.length; e++)
          n[e] = arguments[e];
        if (0 === n.length) throw new Error("Can't merge zero objects");
        for (var r = {}, t = 0; t < n.length; t++) {
          var o = n[t];
          for (var i in o) tt.call(o, i) && (r[i] = u(r[i], o[i]));
        }
        return r;
      };
    },
    it = ot(function(n, e) {
      return I(n) && I(e) ? it(n, e) : e;
    }),
    ut = ot(function(n, e) {
      return e;
    }),
    ct = rt([
      { setOf: ["validator", "valueType"] },
      { arrOf: ["valueType"] },
      { objOf: ["fields"] },
      { itemOf: ["validator"] },
      { choiceOf: ["key", "branches"] },
      { thunk: ["description"] },
      { func: ["args", "outputSchema"] }
    ]),
    at = rt([{ field: ["name", "presence", "type"] }, { state: ["name"] }]),
    ft = function(n) {
      return I(n) && 100 < en(n).length
        ? " removed due to size"
        : JSON.stringify(n, null, 2);
    },
    st = function(n, e) {
      return Xr([{ path: n, getErrorInfo: e }]);
    },
    lt = rt([
      { strict: [] },
      { defaultedThunk: ["fallbackThunk"] },
      { asOption: [] },
      { asDefaultedOptionThunk: ["fallbackThunk"] },
      { mergeWithThunk: ["baseThunk"] }
    ]),
    dt = lt.strict,
    mt = function(n) {
      return T(Xr, G)(n);
    },
    pt = function(n, e) {
      var r,
        t,
        o = $r(n);
      return 0 < o.errors.length
        ? mt(o.errors)
        : ((r = o.values),
          (t = e),
          0 < r.length ? zr(it(t, ut.apply(void 0, r))) : zr(t));
    },
    ht = rt([
      { field: ["key", "okey", "presence", "prop"] },
      { state: ["okey", "instantiator"] }
    ]),
    vt = function(r, t, o) {
      return nt(t, o).fold(function() {
        return (
          (n = o),
          (e = t),
          st(r, function() {
            return (
              'Could not find valid *strict* value for "' + n + '" in ' + ft(e)
            );
          })
        );
        var n, e;
      }, zr);
    },
    gt = function(n, e, r) {
      var t = nt(n, e).fold(function() {
        return r(n);
      }, E);
      return zr(t);
    },
    yt = function(c, a, n, f) {
      return n.fold(
        function(o, r, n, t) {
          var i = function(n) {
              var e = t.extract(c.concat([o]), f, n);
              return Kr(e, function(n) {
                return et(r, f(n));
              });
            },
            u = function(n) {
              return n.fold(
                function() {
                  var n = et(r, f(C.none()));
                  return zr(n);
                },
                function(n) {
                  var e = t.extract(c.concat([o]), f, n);
                  return Kr(e, function(n) {
                    return et(r, f(C.some(n)));
                  });
                }
              );
            };
          return n.fold(
            function() {
              return Yr(vt(c, a, o), i);
            },
            function(n) {
              return Yr(gt(a, o, n), i);
            },
            function() {
              return Yr(zr(nt(a, o)), u);
            },
            function(n) {
              return Yr(
                ((r = n),
                (t = nt((e = a), o).map(function(n) {
                  return !0 === n ? r(e) : n;
                })),
                zr(t)),
                u
              );
              var e, r, t;
            },
            function(n) {
              var e = n(a),
                r = Kr(gt(a, o, x({})), function(n) {
                  return it(e, n);
                });
              return Yr(r, i);
            }
          );
        },
        function(n, e) {
          var r = e(a);
          return zr(et(n, f(r)));
        }
      );
    },
    wt = function(t) {
      return {
        extract: function(r, n, e) {
          return Gr(t(e, n), function(n) {
            return (
              (e = n),
              st(r, function() {
                return e;
              })
            );
            var e;
          });
        },
        toString: function() {
          return "val";
        },
        toDsl: function() {
          return ct.itemOf(t);
        }
      };
    },
    bt = function(c) {
      return {
        extract: function(n, e, r) {
          return (
            (t = n),
            (o = r),
            (i = e),
            (u = q(c, function(n) {
              return yt(t, o, n, i);
            })),
            pt(u, {})
          );
          var t, o, i, u;
        },
        toString: function() {
          return (
            "obj{\n" +
            q(c, function(n) {
              return n.fold(
                function(n, e, r, t) {
                  return n + " -> " + t.toString();
                },
                function(n, e) {
                  return "state(" + n + ")";
                }
              );
            }).join("\n") +
            "}"
          );
        },
        toDsl: function() {
          return ct.objOf(
            q(c, function(n) {
              return n.fold(
                function(n, e, r, t) {
                  return at.field(n, r, t);
                },
                function(n, e) {
                  return at.state(n);
                }
              );
            })
          );
        }
      };
    },
    Tt = x(wt(zr)),
    xt = ht.field,
    Et = function(n, e, r, t) {
      var o = e.extract([n], r, t);
      return Qr(o, function(n) {
        return { input: t, errors: n };
      });
    },
    Ot = function(n, e, r) {
      return Jr(Et(n, e, x, r));
    },
    St = function(n, e, r) {
      return Jr(Et(n, e, E, r)).fold(function(n) {
        throw new Error(_t(n));
      }, E);
    },
    _t = function(n) {
      return (
        "Errors: \n" +
        ((e = n.errors),
        (r =
          10 < e.length
            ? e.slice(0, 10).concat([
                {
                  path: [],
                  getErrorInfo: function() {
                    return "... (only showing first ten failures)";
                  }
                }
              ])
            : e),
        q(r, function(n) {
          return (
            "Failed path: (" + n.path.join(" > ") + ")\n" + n.getErrorInfo()
          );
        })) +
        "\n\nInput object: " +
        ft(n.input)
      );
      var e, r;
    },
    Nt = function() {
      return (Nt =
        Object.assign ||
        function(n) {
          for (var e, r = 1, t = arguments.length; r < t; r++)
            for (var o in (e = arguments[r]))
              Object.prototype.hasOwnProperty.call(e, o) && (n[o] = e[o]);
          return n;
        }).apply(this, arguments);
    },
    At = function(i) {
      return Nt({}, i, {
        toCached: function() {
          return At(i.toCached());
        },
        bindFuture: function(e) {
          return At(
            i.bind(function(n) {
              return n.fold(
                function(n) {
                  return jr(Pr.error(n));
                },
                function(n) {
                  return e(n);
                }
              );
            })
          );
        },
        bindResult: function(e) {
          return At(
            i.map(function(n) {
              return n.bind(e);
            })
          );
        },
        mapResult: function(e) {
          return At(
            i.map(function(n) {
              return n.map(e);
            })
          );
        },
        mapError: function(e) {
          return At(
            i.map(function(n) {
              return n.mapError(e);
            })
          );
        },
        foldResult: function(e, r) {
          return i.map(function(n) {
            return n.fold(e, r);
          });
        },
        withTimeout: function(n, o) {
          return At(
            Rr(function(e) {
              var r = !1,
                t = f.setTimeout(function() {
                  (r = !0), e(Pr.error(o()));
                }, n);
              i.get(function(n) {
                r || (f.clearTimeout(t), e(n));
              });
            })
          );
        }
      });
    },
    Dt = function(n) {
      return At(Rr(n));
    },
    kt = function(n) {
      return At(jr(Pr.value(n)));
    },
    Ct = Dt,
    Rt = kt,
    jt = function(n) {
      return At(jr(Pr.error(n)));
    },
    It =
      (void 0 !== f.window ? f.window : Function("return this;")(),
      function(n) {
        try {
          var e = JSON.parse(n);
          return Pr.value(e);
        } catch (n) {
          return Pr.error("Response was not JSON.");
        }
      });
  ((Vr = Br || (Br = {})).JSON = "json"),
    (Vr.Blob = "blob"),
    (Vr.Text = "text"),
    (Vr.FormData = "formdata"),
    (Vr.MultipartFormData = "multipart/form-data");
  var Ft,
    Pt,
    Mt,
    Lt,
    Ut,
    Bt,
    Vt = function(e) {
      return Rr(function(r) {
        var n = new f.FileReader();
        (n.onload = function(n) {
          var e = n.target ? n.target.result : new f.Blob([]);
          r(e);
        }),
          n.readAsText(e);
      });
    },
    qt = function(n) {
      return jr(n.response);
    },
    Wt = function(n, e) {
      switch (n) {
        case Br.JSON:
          return It(e.response).fold(function() {
            return qt(e);
          }, jr);
        case Br.Blob:
          return (
            (r = e),
            C.from(r.response)
              .map(Vt)
              .getOr(jr("no response content"))
          );
        case Br.Text:
        default:
          return qt(e);
      }
      var r;
    },
    Ht = function(i, n) {
      return n
        .map(function(n) {
          var r,
            t,
            e =
              ((r = function(n, e) {
                return encodeURIComponent(e) + "=" + encodeURIComponent(n);
              }),
              (t = []),
              tn(n, function(n, e) {
                t.push(r(n, e));
              }),
              t),
            o = _n(i, "?") ? "&" : "?";
          return 0 < e.length ? i + o + e.join("&") : i;
        })
        .getOr(i);
    },
    Jt = function(n) {
      var e,
        r =
          ((e = n.body),
          C.from(e).bind(function(n) {
            switch (n.type) {
              case Br.JSON:
                return C.some("application/json");
              case Br.FormData:
                return C.some(
                  "application/x-www-form-urlencoded; charset=UTF-8"
                );
              case Br.MultipartFormData:
                return C.none();
              case Br.Text:
              default:
                return C.some("text/plain");
            }
          })),
        t = !0 === n.credentials ? C.some(!0) : C.none(),
        o =
          (function(n) {
            switch (n) {
              case Br.Blob:
                return "application/octet-stream";
              case Br.JSON:
                return "application/json, text/javascript";
              case Br.Text:
                return "text/plain";
              default:
                return "";
            }
          })(n.responseType) + ", */*; q=0.01",
        i = void 0 !== n.headers ? n.headers : {};
      return {
        contentType: r,
        responseType: (function(n) {
          switch (n) {
            case Br.JSON:
              return C.none();
            case Br.Blob:
              return C.some("blob");
            case Br.Text:
              return C.some("text");
            default:
              return C.none();
          }
        })(n.responseType),
        credentials: t,
        accept: o,
        headers: i,
        progress: M(n.progress) ? C.some(n.progress) : C.none()
      };
    },
    zt = function(n) {
      var r = new f.FormData();
      return (
        tn(n, function(n, e) {
          r.append(e, n);
        }),
        r
      );
    },
    $t = function(c) {
      return Ct(function(t) {
        var o = new f.XMLHttpRequest();
        o.open(c.method, Ht(c.url, C.from(c.query)), !0);
        var r,
          n,
          e = Jt(c);
        (r = o),
          (n = e).contentType.each(function(n) {
            return r.setRequestHeader("Content-Type", n);
          }),
          r.setRequestHeader("Accept", n.accept),
          n.credentials.each(function(n) {
            return (r.withCredentials = n);
          }),
          n.responseType.each(function(n) {
            return (r.responseType = n);
          }),
          n.progress.each(function(e) {
            return r.upload.addEventListener("progress", function(n) {
              return e(n.loaded, n.total);
            });
          }),
          tn(n.headers, function(n, e) {
            return r.setRequestHeader(e, n);
          });
        var i,
          u = function() {
            var e, n, r;
            ((e = c.url),
            (n = c.responseType),
            (r = o),
            Wt(n, r).map(function(n) {
              return {
                message:
                  0 === r.status
                    ? "Unknown HTTP error (possible cross-domain request)"
                    : "Could not load url " + e + ": " + r.statusText,
                status: r.status,
                responseText: n
              };
            })).get(function(n) {
              return t(Pr.error(n));
            });
          };
        (o.onerror = u),
          (o.onload = function() {
            0 !== o.status || Nn(c.url, "file:")
              ? o.status < 100 || 400 <= o.status
                ? u()
                : (function(n, e) {
                    var r = function() {
                        return Rt(e.response);
                      },
                      t = function(n) {
                        return jt({
                          message: n,
                          status: e.status,
                          responseText: e.responseText
                        });
                      };
                    switch (n) {
                      case Br.JSON:
                        return It(e.response).fold(t, Rt);
                      case Br.Blob:
                      case Br.Text:
                        return r();
                      default:
                        return t("unknown data type");
                    }
                  })(c.responseType, o).get(t)
              : u();
          }),
          ((i = c.body),
          C.from(i).map(function(n) {
            return n.type === Br.JSON
              ? JSON.stringify(n.data)
              : n.type === Br.FormData
              ? zt(n.data)
              : n.type === Br.MultipartFormData
              ? zt(n.data)
              : n;
          })).fold(
            function() {
              return o.send();
            },
            function(n) {
              o.send(n);
            }
          );
      });
    },
    Xt = function() {
      return (n = ""), { type: Br.Text, data: n };
      var n;
    },
    Yt = function(n, e) {
      var r = -1 === n.indexOf("?") ? "?" : "&";
      return e ? n + r + "apiKey=" + encodeURIComponent(e) : n;
    },
    Gt = function(n) {
      return n.hasOwnProperty("tiny-api-key")
        ? n["tiny-api-key"]
        : n.hasOwnProperty("tinymce-api-key")
        ? n["tinymce-api-key"]
        : n["textbox-api-key"];
    },
    Kt = function(n) {
      return n.fold(function(n) {
        var e = n.responseText,
          r = I(e) ? e : n.message;
        return Pr.error(r);
      }, Pr.value);
    },
    Qt = function(u, c, a, f) {
      var s = Gt(f);
      return {
        execute: function(n) {
          var o,
            e,
            r = St(u + ".ajax.service.get", c, n),
            t = on(r, function(n) {
              return P(n) ? String(n) : n;
            }),
            i = Yt(
              ((o = t),
              a.replace(/\$\{([^{}]*)\}/g, function(n, e) {
                var r,
                  t = o[e];
                return "string" == (r = typeof t) || "number" === r
                  ? t.toString()
                  : n;
              })),
              s
            );
          return ((e = {
            url: i,
            responseType: Br.JSON,
            credentials: !0,
            headers: f
          }),
          $t(Nt({}, e, { method: "get", body: Xt() }))).map(Kt);
        }
      };
    },
    Zt = function(n, e, r, t, o) {
      return (!0 === o ? C.none() : e.get(t, r)).fold(
        function() {
          return n(r, o).map(function(n) {
            return n.map(function(n) {
              return e.set(r, n, t), n;
            });
          });
        },
        function(n) {
          return Mr.pure(n);
        }
      );
    },
    no = function(n) {
      return xt(n, n, dt(), Tt());
    },
    eo = "iframely",
    ro = "oembed",
    to = "fallback",
    oo = "wikipedia",
    io = function(n) {
      return "[" + n.join(", ") + "]";
    },
    uo = [eo, ro, to],
    co = function(e, n, r) {
      return $(n, function(n) {
        return V(e, n);
      }).isSome()
        ? Pr.error(
            "Embed response source: " +
              io(e) +
              " contains more than one of " +
              io(uo)
          )
        : Pr.value(r);
    },
    ao =
      (x(eo),
      x(ro),
      x(to),
      function(n) {
        return V(n, eo)
          ? co(n, [ro, to, oo], eo)
          : V(n, ro)
          ? co(n, [eo, to, oo], ro)
          : V(n, to)
          ? co(n, [eo, ro, oo], to)
          : V(n, oo)
          ? co(n, [eo, ro, to], oo)
          : Pr.error(
              "Embed response source: " +
                io(n) +
                " did not contain any of: " +
                io(uo)
            );
      }),
    fo = bt([
      no("url"),
      no("maxWidth"),
      ((Ft = "fresh"),
      (Pt = !1),
      xt(Ft, Ft, ((Mt = Pt), lt.defaultedThunk(x(Mt))), Tt()))
    ]),
    so = bt([no("status_code"), no("sub_code"), no("msg")]),
    lo = bt([
      no("html"),
      ((Lt = "rels"),
      (Ut = [
        xt(
          "source",
          "source",
          dt(),
          ((Bt = function(n) {
            return F(n) ? ao(n) : Pr.error("Sources was not an array: " + n);
          }),
          wt(function(n) {
            return Bt(n).fold(Xr, zr);
          }))
        )
      ]),
      xt(Lt, Lt, dt(), bt(Ut)))
    ]),
    mo = { requestOne: x(fo), responseFailed: x(so), responseSucceeded: x(lo) },
    po = function(n) {
      return Ot("EmbedResponse.failure", mo.responseFailed(), n).fold(
        function(n) {
          return Pr.error({ code: x(600), subcode: x(0), msg: x(_t(n)) });
        },
        function(n) {
          return Pr.error({
            code: n.status_code,
            subcode: n.sub_code,
            msg: n.msg
          });
        }
      );
    },
    ho = function(n) {
      return Ot("EmbedResponse.success", mo.responseSucceeded(), n).fold(
        function(n) {
          return Pr.error({ code: x(601), subcode: x(0), msg: x(_t(n)) });
        },
        function(n) {
          return Pr.value({
            recommended: x({ html: n.html, source: n.rels().source })
          });
        }
      );
    };
  function vo(n, e, r) {
    var t,
      o,
      i,
      u,
      c,
      a,
      f,
      s,
      l =
        ((t = r),
        (c = void 0 !== o ? o : Ur),
        (a = nn("result", "timestamp")),
        (f = {}),
        (s = function(n, e, r) {
          f[n] = a(e, r);
        }),
        I(t) &&
          ((i = t),
          (u = Lr.now()),
          on(i, function(n, e) {
            u - n.timestamp < c && s(e, n.result, n.timestamp);
          })),
        {
          set: s,
          get: function(e, n) {
            return C.from(f[n])
              .filter(function(n) {
                return e - n.timestamp() < c;
              })
              .map(function(n) {
                return n.result();
              });
          },
          dump: function() {
            return on(f, function(n) {
              return { result: n.result(), timestamp: n.timestamp() };
            });
          }
        }),
      d = Qt(
        "ephox.media.service.one",
        mo.requestOne(),
        n + "/1/embed?url=${url}&maxWidth=${maxWidth}",
        e
      );
    return {
      checkOne: function(r, t, n) {
        var e = Lr.now(),
          o = Zt(
            function(n, e) {
              return d.execute({
                url: encodeURIComponent(r),
                maxWidth: t,
                fresh: e
              });
            },
            l,
            t + "&" + r,
            e,
            void 0 !== n && n
          );
        return Mr.foldSync(o, po, ho);
      },
      dumpCache: l.dump
    };
  }
  var go = function(t) {
      var n,
        e,
        o =
          ((n = t.mediaembed_service_url),
          (e = we(t)),
          vo(n, e ? { "tinymce-api-key": e } : {})),
        i = function(n, e, r) {
          return o.checkOne(n, e, r);
        },
        u = {};
      return {
        getOne: i,
        dumpCache: function() {
          o.dumpCache();
        },
        getAndHandleResponse: function(r, n, e) {
          void 0 !== u[r]
            ? (u[r] = u[r].concat(n))
            : ((u[r] = [n]),
              Mr.handle(
                i(r.trim(), ye(t)),
                function(n) {
                  e(n), delete u[r];
                },
                function(e) {
                  W(u[r], function(n) {
                    n(e);
                  }),
                    delete u[r];
                }
              ));
        }
      };
    },
    yo = function(t, o) {
      var n = xr(t),
        e = go(t.settings);
      return (
        vr(t),
        t.on("Init", function() {
          var n, e, r;
          (e = o + "/content.min.css"),
            (r = be((n = t).settings, e)),
            n.dom.loadCSS(r);
        }),
        t.on("SkinLoaded", function() {
          ge(t.settings)
            ? (mr(t, e, n), gr(t, e, n))
            : n.logError(
                "You need to specify the mediaembed_service_url setting"
              );
        }),
        {}
      );
    },
    wo = function(n, e) {
      return tinymce.Env.ceFalse
        ? w(tinymce, "4.5.2")
          ? (wr.error(
              "The mediaembed plugin requires at least 4.5.2 version of TinyMCE."
            ),
            {})
          : yo(n, e)
        : {};
    };
  tinymce.PluginManager.add("mediaembed", wo);
})(window);
