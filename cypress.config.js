const { defineConfig } = require("cypress");
const { execSync } = require("child_process");

const instanceZUID = "8-f48cf3a682-7fthvk";

module.exports = defineConfig({
  projectId: "manager-ui",
  viewportWidth: 1920,
  viewportHeight: 1080,
  video: false,
  defaultCommandTimeout: 15000,
  env: {
    API_AUTH: "https://auth.api.dev.zesty.io",
    COOKIE_NAME: "DEV_APP_SID",
    INSTANCE_ZUID: instanceZUID,
    API_INSTANCE_URL: `https://${instanceZUID}.api.dev.zesty.io/v1`,
    MEDIA_MANAGER_URL: "https://media-manager.api.dev.zesty.io",
    API_ACCOUNTS: "https://accounts.api.dev.zesty.io/v1",
    COMMIT_ID: execSync("git rev-parse --short HEAD").toString().trim(),
  },
  e2e: {
    // We've imported your old cypress plugins here.
    // You may want to clean this up later by importing these.
    setupNodeEvents(on, config) {
      on("before:browser:launch", (browser, launchOptions) => {
        if (browser.name === "chrome" && browser.isHeadless) {
          launchOptions.args.push("--headless=old");
        }

        return launchOptions;
      });

      return require("./cypress/plugins/index.js")(on, config);
    },
    baseUrl: `http://${instanceZUID}.manager.dev.zesty.io:8080/`,
    specPattern: "cypress/e2e/**/*.{js,jsx,ts,tsx}",
    testIsolation: false,
  },
});
