// ***********************************************************
// This example plugins/index.js can be used to load plugins
//
// You can change the location of this file or turn off loading
// the plugins file with the 'pluginsFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/plugins-guide
// ***********************************************************

// This function is called when a project is opened or re-opened (e.g. due to
// the project's config changing)

const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");
const os = require("os");
const content = require("./seeds/content");
const codeCoverageTask = require("@cypress/code-coverage/task");

module.exports = (on, config) => {
  config.env.INSTANCE_ZUID = new URL(config.baseUrl).host.split(".")[0];

  codeCoverageTask(on, config);

  on("task", {
    log(message) {
      console.log(message);
      return null;
    },
    // Records a failed test whose run coincided with backend 5xx responses, so
    // the flaky report can attribute the failure to backend instability rather
    // than test/app flakiness. Appends one JSON object per line to results/.
    "record:backend5xx"(entry) {
      try {
        fs.mkdirSync("results", { recursive: true });
        fs.appendFileSync(
          path.join("results", "backend-5xx.jsonl"),
          JSON.stringify(entry) + "\n"
        );
      } catch (e) {
        console.error("record:backend5xx failed:", e?.message);
      }
      return null;
    },
    ...content(config),
  });
  // `on` is used to hook into various events Cypress emits
  // `config` is the resolved Cypress config
  if (os.userInfo().username === "runner") {
    const ciEnvConfig = dotenv.config({
      path: path.join(__dirname, "../../", "ci/.env"),
    }).parsed;

    // source the user credentials from the ci environment config
    config.env.email = ciEnvConfig.TEST_USER_EMAIL;
    config.env.password = ciEnvConfig.TEST_USER_PASSWORD;
  }

  return config;
};
