// ***********************************************************
// This example support/index.js is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import "./commands";
import "cypress-iframe";
import "@cypress/code-coverage/support";

// @see https://docs.cypress.io/api/cypress-api/cookies.html#Set-global-default-cookies
// Cypress.Cookies.defaults({
//   preserve: Cypress.env("COOKIE_NAME"),
// });

// Turn off fail on console errors
Cypress.on("uncaught:exception", (err, runnable) => {
  // returning false here prevents Cypress from
  // failing the test
  return false;
});

// Before spec is ran
before(() => {
  cy.session("COOKIE_NAME", cy.login, {
    validate() {
      cy.getCookies().should("have.length", 2);
    },
  });

  // NOTE: we program the app to always select state from the store when available
  // but often on an initial load that data is not present and deeply nested values will
  // throw undefined errors. To ensure these are caught during testing we always drop
  // indexdb before starting tests
  indexedDB.deleteDatabase("zesty");

  // Blocks the api call to render the announcement popup
  cy.blockAnnouncements();
});

let backend5xx = [];
// Per-request timing so a timeout can be attributed to a specific slow/hanging
// endpoint (useful detail for the backend team).
let apiTimings = [];
const SLOW_MS = 8000;

// High-confidence backend signals only; deliberately excludes network errors and
// "no request occurred", which can be real test bugs.
const BACKEND_ERR_RE =
  /\b50[0-9]\b|bad gateway|service unavailable|gateway time-?out|no response ever occurred|response to the route|cy\.request\(\) timed out|seed:content.*timed out|failed to create model/i;

// Before each test in spec
beforeEach(() => {
  backend5xx = [];
  apiTimings = [];

  cy.intercept({ url: "**/*.api.dev.zesty.io/**", middleware: true }, (req) => {
    const startedAt = Date.now();
    const entry = {
      method: req.method,
      url: req.url.split("?")[0],
      status: null,
      ms: null,
    };
    apiTimings.push(entry);
    req.on("response", (res) => {
      entry.status = res.statusCode;
      entry.ms = Date.now() - startedAt;
      if (res.statusCode >= 500) {
        backend5xx.push({
          method: req.method,
          url: req.url,
          status: res.statusCode,
        });
      }
    });
  });

  /**
   * NOTE: Zesty is a multitennant app with a lock feature
   * that presents a modal when USER X is viewing the same
   * resource as USER Y. This modal can layover UI being tested
   * causing the default Cypress behavior of failing on
   * interaction with out of view elements. We solve this by
   * including this statement which intercepts the /door/knock
   * API request and stubs an empty response, preventing the
   * lock modal from displaying.
   */
  cy.blockLock();

  // Blocks the api call to render the announcement popup
  cy.blockAnnouncements();
});

afterEach(function () {
  if (this.currentTest?.state !== "failed") return;
  const errText = this.currentTest.err?.message || "";
  const matchedErr = BACKEND_ERR_RE.test(errText);
  if (backend5xx.length || matchedErr) {
    const reason = backend5xx.length ? "5xx" : "timeout/no-response";
    // Endpoints that hung (no response) or were slow — the likely BE culprit.
    const pendingEndpoints = apiTimings
      .filter((t) => t.status === null)
      .map((t) => `${t.method} ${t.url}`);
    const slowEndpoints = apiTimings
      .filter((t) => t.ms !== null && t.ms >= SLOW_MS)
      .sort((a, b) => b.ms - a.ms)
      .slice(0, 5)
      .map((t) => `${t.method} ${t.url} (${t.ms}ms, ${t.status})`);
    // URL mentioned directly in the error (e.g. a cy.request timeout).
    const urlInError = (errText.match(/https?:\/\/[^\s'")]+/g) || [])
      .filter((u) => /api\.dev\.zesty\.io/.test(u))
      .slice(0, 3);
    const info = {
      spec: Cypress.spec?.relative,
      test: this.currentTest.fullTitle(),
      count: backend5xx.length || 1,
      reason,
      responses: backend5xx.slice(0, 10),
      pendingEndpoints: [...new Set(pendingEndpoints)].slice(0, 10),
      slowEndpoints,
      urlInError,
      errorSnippet: errText.slice(0, 200),
    };
    Cypress.log({
      name: "backend5xx",
      message: `⚠️ likely backend-caused failure (${reason})`,
    });
    cy.task("record:backend5xx", info, { log: false });
  }
});
