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

// Backend 5xx responses (e.g. 502s) seen during the current test. We do NOT
// retry or stub these — a backend failure should still fail the test — but we
// record them so a failure can be attributed to backend instability and routed
// to the backend team instead of being mistaken for test/app flakiness.
let backend5xx = [];

// Failure error text that indicates backend instability (timeouts / no response /
// 5xx / connection failures / seed-task timeouts). A degraded instance usually
// HANGS rather than returning a 502, so the response-status middleware above
// can't see it — we also match the failure message here so the marker captures
// timeouts. This is what lets plain `ci` (no mochawesome) attribute failures.
const BACKEND_ERR_RE =
  /\b(50[0-9])\b|bad gateway|service unavailable|gateway time-?out|timed out (retrying )?.*(request to the route|for a response|waiting)|cy\.request\(\) timed out|seed:content.*timed out|failed to create model|econnrefused|esockettimedout|etimedout|socket hang up|network error|ehostunreach/i;

// Before each test in spec
beforeEach(() => {
  backend5xx = [];

  // Observe-only middleware intercept: passes every dev-API request through
  // untouched (no stubbing) and records any 5xx response. `middleware: true`
  // runs ahead of spec intercepts and auto-continues, so it can't break their
  // aliases or cy.wait() matching.
  cy.intercept(
    { url: "**/*.api.dev.zesty.io/**", middleware: true },
    (req) => {
      req.on("response", (res) => {
        if (res.statusCode >= 500) {
          backend5xx.push({
            method: req.method,
            url: req.url,
            status: res.statusCode,
          });
        }
      });
    }
  );

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

// Attribute failures to backend instability. Records a marker when a test fails
// AND either (a) a 5xx response was observed, or (b) the failure message matches
// a backend-degradation pattern (timeout / no response / connection failure).
// Routed to backend triage, not test triage. Consumed by both ci.yaml and the
// flaky-hunter aggregator.
afterEach(function () {
  if (this.currentTest?.state !== "failed") return;
  const errText = this.currentTest.err?.message || "";
  const matchedErr = BACKEND_ERR_RE.test(errText);
  if (backend5xx.length || matchedErr) {
    const reason = backend5xx.length ? "5xx" : "timeout/no-response";
    const info = {
      spec: Cypress.spec?.relative,
      test: this.currentTest.fullTitle(),
      count: backend5xx.length || 1,
      reason,
      responses: backend5xx.slice(0, 10),
      errorSnippet: errText.slice(0, 200),
    };
    Cypress.log({
      name: "backend5xx",
      message: `⚠️ likely backend-caused failure (${reason})`,
    });
    cy.task("record:backend5xx", info, { log: false });
  }
});
