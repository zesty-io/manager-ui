const { defineConfig } = require("cypress");
const { execSync } = require("child_process");

module.exports = defineConfig({
  projectId: "manager-ui",
  viewportWidth: 1920,
  viewportHeight: 1080,
  video: false,
  numTestsKeptInMemory: 0,
  // Bumped 15s -> 30s: under a slow shared dev instance, data loads late and
  // UI elements (e.g. the publish buttons) can render past 15s, causing
  // "element not found" flakes. A fast load still resolves immediately.
  defaultCommandTimeout: 30000,
  // The shared dev instance is often slow under load — API calls that normally
  // take <1s can take several seconds. Generous request/response timeouts let
  // cy.wait('@route') tolerate that slowness instead of failing with
  // "No request ever occurred". These only matter while waiting; a fast response
  // resolves immediately, so healthy runs aren't slowed. A genuine hang (>30s)
  // still fails — and surfaces as a "no response" timeout, attributed to the backend.
  requestTimeout: 30000,
  responseTimeout: 30000,
  env: {
    API_AUTH: "https://auth.api.dev.zesty.io",
    COOKIE_NAME: "DEV_APP_SID",
    API_INSTANCE_URL: "https://8-f48cf3a682-7fthvk.api.dev.zesty.io/v1",
    MEDIA_MANAGER_URL: "https://media-manager.api.dev.zesty.io",
    API_ACCOUNTS: "https://accounts.api.dev.zesty.io/v1",
    COMMIT_ID: execSync("git rev-parse --short HEAD").toString().trim(),
  },
  e2e: {
    // We've imported your old cypress plugins here.
    // You may want to clean this up later by importing these.
    setupNodeEvents(on, config) {
      require("cypress-split")(on, config);

      on("before:browser:launch", (browser, launchOptions) => {
        if (browser.name === "chrome" && browser.isHeadless) {
          launchOptions.args.push("--headless=old");
        }

        return launchOptions;
      });

      return require("./cypress/plugins/index.js")(on, config);
    },
    baseUrl: "http://8-f48cf3a682-7fthvk.manager.dev.zesty.io:8080/",
    specPattern: "cypress/e2e/**/*.spec.{js,jsx,ts,tsx}",
    testIsolation: false,
  },
  // Some tests hit live APIs that can occasionally be slow to respond. One retry
  // keeps CI green without masking real failures
  retries: 1,
});
