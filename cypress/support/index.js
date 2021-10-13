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
import "cypress-fail-fast";

// @see https://docs.cypress.io/api/cypress-api/cookies.html#Set-global-default-cookies
Cypress.Cookies.defaults({
  preserve: Cypress.env("COOKIE_NAME"),
});

//Turn off fail on console errors
Cypress.on("uncaught:exception", (err, runnable) => {
  // returning false here prevents Cypress from
  // failing the test
  return false;
});

// Alternatively you can use CommonJS syntax:
// require('./commands')
