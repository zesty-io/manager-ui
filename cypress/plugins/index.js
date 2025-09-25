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

const path = require("path");
const dotenv = require("dotenv");
const os = require("os");
const child_process = require("child_process");

module.exports = (on, config) => {
  const { getInstance } = require("./DBmanager/services")(on, config);
  const beforeRunScripts = [];

  on("before:run", async () => {
    await getInstance(config.env.INSTANCE_ZUID).then((instance) => {
      config.env.SITE_ID = instance?.ID;
      config.env.ECO_ID = instance?.ecoID;
    });
    await Promise.all(beforeRunScripts?.map((fn) => fn()));
  });

  on("task", {
    log(message) {
      console.log(message);
      return null;
    },
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

  const beforeRun = (fn) => {
    beforeRunScripts.push(fn);
  };

  require("./DBmanager/index.js")(on, config, beforeRun);
  return config;
};
