import { readFileSync } from "fs";
import { join } from "path";

import { WebView, Stylesheet, Script } from "../../../src/shell/services/types";

export type SeedCodeTask = WebView | Stylesheet | Script | null;
const STYLESHEET_TYPES = ["text/css", "text/less", "text/scss", "text/sass"];

module.exports = function code(config) {
  const { getSDK } = require("./utils");

  async function seedCode(path: string): Promise<SeedCodeTask> {
    const jsonString = readFileSync(join(__dirname, "../../", path), "utf8");
    const json = JSON.parse(jsonString);

    const sdk = await getSDK(config);
    const timeStamp = Date.now();
    const filename = `/__e2e__/${config.env.COMMIT_ID}/${timeStamp} | ${json.filename}`;
    const payload = { ...json, filename };

    if (json.type === "text/javascript") {
      const res = await fetch(`${config.env.API_INSTANCE_URL}/web/scripts`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          authorization: `Bearer ${sdk.token}`,
        },
        body: JSON.stringify(payload),
      });
      const resJson = await res.json();
      return resJson?.data ?? null;
    }

    if (STYLESHEET_TYPES.includes(json.type)) {
      const res = await sdk.instance.createStylesheet(payload);
      return res?.data ?? null;
    }

    const res = await sdk.instance.createView(payload);
    return res?.data ?? null;
  }

  // CODE TASK MAPPING
  return {
    "seed:code": (path: string) => seedCode(path),
  };
};
