// Smoke test: for each sub-app, confirm its landing route actually renders
// translated (non-English) text for a representative sample of locales,
// rather than a hardcoded English string or a broken/blank render caused by
// a missing translation key.
//
// Locale is driven entirely client-side (navigator.language + the
// "app_locale" localStorage key i18next-browser-languagedetector reads) so
// no shared server-side state is touched. This intentionally does NOT use
// a locale switcher UI -- locale selection is done in accounts-ui, not
// manager-ui.
//
// The shared Cypress test account has a persisted `prefs.locale`, and
// LoadInstance's boot logic (src/shell/components/load-instance/index.js)
// prefers that over navigator.language on every full page load:
//   targetLocale = userLocale || toSupportedLocale(navigator.language)
// so the navigator.language override alone would get silently overridden
// after the GET .../users/:zuid fetchUser call resolves. Rather than mutate
// the real account's prefs (shared, would race other specs/CI runners), we
// intercept that response and strip `locale` from it so userLocale is falsy
// and the app falls through to navigator.language -- the real request still
// hits the backend, only what the app receives is edited. See
// src/shell/store/user.js (fetchUser) and src/shell/i18n/index.ts.
//
// Expected strings are read from the actual locale JSON at test time
// (instead of being duplicated as literals here), so this spec doesn't need
// to be updated when copy changes -- only when a key is renamed or removed.

const LOCALES = ["es-ES", "zh-CN", "hi-IN"];

// One statically-rendered (seed-data-independent), data-cy'd, translated
// element per sub-app's landing route.
const SUB_APPS = [
  {
    app: "blocks",
    path: "/blocks",
    ns: "blocks",
    selector: "allBlocksTitle",
    key: "allBlocksTitle",
  },
  {
    app: "schema",
    path: "/schema",
    ns: "schema",
    selector: "create-model-button-all-models",
    key: "createModel",
  },
  // marketplace, content-editor, code-editor, and settings all render their sidebar
  // header title through the shared AppSideBar component, hence the shared selector.
  {
    app: "marketplace",
    path: "/apps",
    ns: "marketplace",
    selector: "appSidebarHeaderTitle",
    key: "headerTitleApps",
  },
  {
    app: "content-editor",
    path: "/content",
    ns: "content",
    selector: "appSidebarHeaderTitle",
    key: "navContentTitle",
  },
  {
    app: "code-editor",
    path: "/code",
    ns: "code",
    selector: "appSidebarHeaderTitle",
    key: "headerTitle",
  },
  {
    app: "settings",
    path: "/settings",
    ns: "shell",
    selector: "appSidebarHeaderTitle",
    key: "navSettings",
  },
  {
    app: "media",
    path: "/media",
    ns: "common",
    selector: "fileUploadButton",
    key: "upload",
  },
  {
    app: "release",
    path: "/release",
    ns: "release",
    selector: "release-createBtn",
    key: "createRelease",
  },
  {
    app: "seo",
    path: "/redirects",
    ns: "common",
    selector: "RedirectActionCreateButton",
    key: "create",
  },
  {
    app: "home",
    path: "/launchpad",
    ns: "dashboard",
    selector: "dashboardInstanceSummary",
    key: "instanceSummary",
  },
  // Assumes the dev instance has no lead submissions yet, which renders the
  // GetStarted empty state instead of the leads table.
  {
    app: "leads",
    path: "/leads",
    ns: "leads",
    selector: "leadsGetStartedHeading",
    key: "captureLeadsOnYourInstance",
  },
];

function visitWithLocale(path, locale) {
  // Strip the account's persisted locale pref from the fetchUser response so
  // LoadInstance's boot logic falls through to navigator.language instead.
  cy.intercept("GET", "**/users/*", (req) => {
    req.continue((res) => {
      const prefs = res.body?.data?.prefs;
      if (typeof prefs !== "string") return;
      try {
        const parsed = JSON.parse(prefs);
        delete parsed.locale;
        res.body.data.prefs = JSON.stringify(parsed);
      } catch {
        // prefs wasn't valid JSON -- leave the response untouched.
      }
    });
  });

  cy.visit(path, {
    onBeforeLoad(win) {
      Object.defineProperty(win.navigator, "language", { value: locale });
      Object.defineProperty(win.navigator, "languages", { value: [locale] });
      win.localStorage.setItem("app_locale", locale);
    },
  });
}

// Inverse of visitWithLocale above: injects a locale into the fetchUser
// response's prefs instead of stripping it, so LoadInstance resolves to the
// DB preference (src/shell/components/load-instance/index.js:55-57 --
// `userLocale || navigator.language`) rather than navigator.language. Clears
// any cached "app_locale" first so a pass can only be explained by the DB
// value actually driving the resolved language, not a stale local cache.
function visitWithDbLocale(path, dbLocale, navigatorLocale = "en-US") {
  cy.intercept("GET", "**/users/*", (req) => {
    req.continue((res) => {
      const prefs = res.body?.data?.prefs;
      if (typeof prefs !== "string") return;
      try {
        const parsed = JSON.parse(prefs);
        parsed.locale = dbLocale;
        res.body.data.prefs = JSON.stringify(parsed);
      } catch {
        // prefs wasn't valid JSON -- leave the response untouched.
      }
    });
  });

  cy.visit(path, {
    onBeforeLoad(win) {
      Object.defineProperty(win.navigator, "language", {
        value: navigatorLocale,
      });
      Object.defineProperty(win.navigator, "languages", {
        value: [navigatorLocale],
      });
      win.localStorage.removeItem("app_locale");
    },
  });
}

describe("sub-app translations", () => {
  // cy.blockLock() and cy.blockAnnouncements() are already applied globally
  // for every test in cypress/support/e2e.js; only auth needs to happen here.
  beforeEach(() => {
    cy.login();
  });

  SUB_APPS.forEach(({ app, path, ns, selector, key }) => {
    LOCALES.forEach((locale) => {
      it(`renders ${app} in ${locale}`, () => {
        cy.readFile(`public/locales/${locale}/${ns}.json`).then((strings) => {
          const expected = strings[key];
          expect(expected, `${ns}.${key} in ${locale}`).to.be.a("string").and
            .not.be.empty;

          visitWithLocale(path, locale);

          cy.getBySelector(selector).should("contain.text", expected);
        });
      });
    });
  });

  // The matrix above always strips the DB pref so navigator.language wins,
  // to stay independent of the shared test account's real prefs. These cover
  // the DB-preference and persistence paths that strategy can't reach.
  const contentEditor = SUB_APPS.find((a) => a.app === "content-editor");
  const schema = SUB_APPS.find((a) => a.app === "schema");

  it("DB locale preference wins over navigator.language", () => {
    cy.readFile(`public/locales/es-ES/${contentEditor.ns}.json`).then(
      (strings) => {
        const expected = strings[contentEditor.key];
        expect(
          expected,
          `${contentEditor.ns}.${contentEditor.key} in es-ES`
        ).to.be.a("string").and.not.be.empty;

        visitWithDbLocale(contentEditor.path, "es-ES", "en-US");

        cy.getBySelector(contentEditor.selector).should(
          "contain.text",
          expected
        );
      }
    );
  });

  it("locale persists across in-app navigation", () => {
    cy.readFile(`public/locales/es-ES/${contentEditor.ns}.json`).then(
      (contentStrings) => {
        cy.readFile(`public/locales/es-ES/${schema.ns}.json`).then(
          (schemaStrings) => {
            visitWithDbLocale(contentEditor.path, "es-ES", "en-US");
            cy.getBySelector(contentEditor.selector).should(
              "contain.text",
              contentStrings[contentEditor.key]
            );

            // Client-side route change -- LoadInstance stays mounted, no
            // fetchUser refetch -- so this proves the resolved locale
            // carries over rather than being re-derived per route.
            cy.getBySelector("SchemaApp").click();

            cy.getBySelector(schema.selector).should(
              "contain.text",
              schemaStrings[schema.key]
            );
          }
        );
      }
    );
  });

  it("locale persists across a page refresh", () => {
    cy.readFile(`public/locales/es-ES/${contentEditor.ns}.json`).then(
      (strings) => {
        const expected = strings[contentEditor.key];

        visitWithDbLocale(contentEditor.path, "es-ES", "en-US");
        cy.getBySelector(contentEditor.selector).should(
          "contain.text",
          expected
        );

        // navigator.language reverts to its real default on reload (the
        // onBeforeLoad stub doesn't carry over) -- staying Spanish here only
        // works if the cached app_locale + intercepted DB pref persisted,
        // not because of the navigator stub.
        cy.reload();

        cy.getBySelector(contentEditor.selector).should(
          "contain.text",
          expected
        );
      }
    );
  });
});
