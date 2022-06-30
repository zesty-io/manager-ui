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

// @see https://docs.cypress.io/api/cypress-api/cookies.html#Set-global-default-cookies
Cypress.Cookies.defaults({
  preserve: Cypress.env("COOKIE_NAME"),
});

// Turn off fail on console errors
Cypress.on("uncaught:exception", (err, runnable) => {
  // returning false here prevents Cypress from
  // failing the test
  return false;
});

// Before spec is ran
before(() => {
  cy.login();

  // NOTE: we program the app to always select state from the store when available
  // but often on an initial load that data is not present and deeply nested values will
  // throw undefined errors. To ensure these are caught during testing we always drop
  // indexdb before starting tests
  indexedDB.deleteDatabase("zesty");
});

// Before each test in spec
beforeEach(() => {
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
});
