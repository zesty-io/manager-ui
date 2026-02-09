import { readFileSync } from "fs";
import { join } from "path";

import { WebView, Stylesheet, Script } from "../../../src/shell/services/types";

export type SeedCodeTask = WebView | Stylesheet | Script | null;
const STYLESHEET_TYPES = ["text/css", "text/less", "text/scss", "text/sass"];

module.exports = function code(config) {
  const { getSDK, getAuthToken } = require("./utils");

  async function seedCode(path: string): Promise<SeedCodeTask> {
    const jsonString = readFileSync(join(__dirname, "../../", path), "utf8");
    const json = JSON.parse(jsonString);

    const sdk = await getSDK(config);
    const timeStamp = Date.now();
    const filename = `/e2e/${config.env.COMMIT_ID}/${timeStamp}/${json.filename}`;

    let responseData = null;

    if (json?.type === "snippet") {
      await sdk.instance
        .createView({
          ...json,
          filename,
        })
        .then((res) => {
          responseData = res?.data;
        });
    }

    if (json.type === "text/javascript") {
      const token = await getAuthToken();
      await fetch(`${config.env.API_INSTANCE_URL}/web/scripts`, {
        method: "POST",
        headers: {
          authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ...json, filename }),
      }).then(async (res) => {
        const resJson = await res.json();
        responseData = resJson?.data;
      });
    }

    if (STYLESHEET_TYPES.includes(json.type)) {
      await sdk.instance
        .createStylesheet({
          ...json,
          filename,
        })
        .then((res) => {
          responseData = res?.data;
        });
    }

    return responseData;
  }

  // CODE TASK MAPPING
  return {
    "seed:code": (path: string) => seedCode(path),
  };
};
