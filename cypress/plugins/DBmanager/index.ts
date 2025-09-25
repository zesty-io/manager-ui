import { BeforeRunScripts, CypressConfig, CypressENV } from "./types";

module.exports = (
  on: Cypress.PluginEvents,
  config: CypressConfig,
  beforeRun: (fn: BeforeRunScripts, wait?: boolean) => void
) => {
  const store = {
    eco_id: null,
    site_id: null,
    bin_id: null,
    common: {},
    current: {},
    media: [],
  };

  async function init() {
    store.eco_id = config.env.ECO_ID;
    store.site_id = config.env.SITE_ID;
  }

  beforeRun(async () => {
    await init();
  });

  require("./media")(on, config, beforeRun, store);
  require("./content")(on, config, beforeRun, store);
  return config;
};
