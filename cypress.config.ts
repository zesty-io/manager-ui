import { defineConfig } from "cypress";
import { execSync } from "child_process";

export default defineConfig({
  projectId: "manager-ui",
  viewportWidth: 1920,
  viewportHeight: 1080,
  video: false,
  defaultCommandTimeout: 15000,
  experimentalInteractiveRunEvents: true,
  env: {
    API_AUTH: "https://auth.api.dev.zesty.io",
    COOKIE_NAME: "DEV_APP_SID",
    COMMIT_ID: execSync("git rev-parse --short HEAD").toString().trim(),
    API_INSTANCE_URL: "https://8-a6c1d4df82-6sw1rs.api.dev.zesty.io/v1",
    MEDIA_MANAGER_URL: "https://media-manager.api.dev.zesty.io",
    API_ACCOUNTS: "https://accounts.api.dev.zesty.io/v1",
    INSTANCE_ZUID: "8-a6c1d4df82-6sw1rs",
  },
  e2e: {
    setupNodeEvents(on, config) {
      on("before:browser:launch", (browser, launchOptions) => {
        if (browser.name === "chrome" && browser.isHeadless) {
          launchOptions.args.push("--headless=old");
        }
        return launchOptions;
      });

      return require("./cypress/plugins/index.js")(on, config);
    },
    baseUrl: "http://8-a6c1d4df82-6sw1rs.manager.dev.zesty.io:8080/",
    specPattern: "cypress/e2e/**/*.{js,jsx,ts,tsx}",
    testIsolation: false,
  },
});
