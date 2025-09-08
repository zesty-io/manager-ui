const { defineConfig } = require("cypress");

module.exports = defineConfig({
  projectId: "manager-ui",
  viewportWidth: 1920,
  viewportHeight: 1080,
  video: false,
  defaultCommandTimeout: 15000,

  env: {
    API_AUTH: "https://auth.api.dev.zesty.io",
    COOKIE_NAME: "DEV_APP_SID",
  },
  e2e: {
    // We've imported your old cypress plugins here.
    // You may want to clean this up later by importing these.
    // setupNodeEvents(on, config) {
    //   on("before:browser:launch", (browser, launchOptions) => {
    //     if (browser.name === "chrome" && browser.isHeadless) {
    //       launchOptions.args.push("--headless=old");
    //     }

    //     return launchOptions;
    //   });

    //   return require("./cypress/plugins/index.js")(on, config);
    // },
    setupNodeEvents(on, config) {
      // Chrome headless mode configuration
      on("before:browser:launch", (browser, launchOptions) => {
        if (browser.name === "chrome" && browser.isHeadless) {
          launchOptions.args.push("--headless=new"); // Use new headless mode
        }
        return launchOptions;
      });

      // Load plugins if the file exists, otherwise return config
      try {
        const pluginsPath = "./cypress/plugins/index.js";
        if (require.resolve(pluginsPath)) {
          return require(pluginsPath)(on, config);
        }
      } catch (error) {
        console.log("No plugins file found, continuing without plugins");
      }

      return config;
    },
    baseUrl: "http://8-f48cf3a682-7fthvk.manager.dev.zesty.io:8080/",
    specPattern: "cypress/e2e/**/*.{js,jsx,ts,tsx}",
    testIsolation: false,

    // retries: 1,
    // supportFile: "cypress/support/init/**",
  },

  requestTimeout: 30_000,
  keystrokeDelay: 30,
  scrollBehavior: "center",

  // includeShadowDom: true,
});
