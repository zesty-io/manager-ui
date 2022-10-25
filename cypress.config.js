const { defineConfig } = require("cypress");

module.exports = defineConfig({
  projectId: "manager-ui",
  viewportWidth: 1920,
  viewportHeight: 1080,
  video: false,
  env: {
    API_AUTH: "https://auth.api.dev.zesty.io",
    COOKIE_NAME: "DEV_APP_SID",
  },
  e2e: {
    // We've imported your old cypress plugins here.
    // You may want to clean this up later by importing these.
    setupNodeEvents(on, config) {
      return require("./cypress/plugins/index.js")(on, config);
    },
    baseUrl: "https://8-f48cf3a682-7fthvk.manager.dev.zesty.io:8080/",
    specPattern: "cypress/e2e/**/*.{js,jsx,ts,tsx}",
  },
});
