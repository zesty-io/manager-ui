import { readFileSync } from "fs";
import { join } from "path";
import { getSDK, lookupValue } from "./utils";

module.exports = function content(config) {
  const { formatPathPart } = require("../../../src/utility/formatPathPart");

  async function setUp(path: string, context: Record<string, any> = {}) {
    const jsonString = readFileSync(join(__dirname, path), "utf8");
    const json = JSON.parse(jsonString);
    const sdk = await getSDK(config);

    const jsonModel = json?.model;
    const jsonFields = json?.fields;
    const jsonItems = json?.items;

    const LOOKUP_CONTEXT = {
      env: config.env,
      baseUrl: config?.baseUrl,
      timeStamp: Date.now(),
      commitId: config.env.COMMIT_ID,
      model: {},
      fields: [],
      context,
    };

    // 1) Create Schema
    const modelPayload = lookupValue(jsonModel, LOOKUP_CONTEXT);
    const modelResponse = await sdk.instance.createModel(modelPayload);
    const model = !modelResponse?.data ? {} : modelResponse?.data;
    LOOKUP_CONTEXT.model = model;

    // 2) Create Fields
    const fields = !!jsonFields?.length
      ? await Promise.all(
          jsonFields.map(async (field) => {
            const fieldPayload = lookupValue(field, LOOKUP_CONTEXT);
            return await sdk.instance
              .createField(model?.ZUID, fieldPayload)
              .then((res) => {
                return {
                  ZUID: !res?.data ? null : res?.data?.ZUID,
                  ...fieldPayload,
                };
              });
          })
        )
      : [];
    LOOKUP_CONTEXT.fields = fields;

    // 3) Create Items
    const items = !!jsonItems?.length
      ? await Promise.all(
          jsonItems?.map((item) => {
            const payload = lookupValue(item, LOOKUP_CONTEXT);
            const pathPart = payload?.web?.pathPart
              ? formatPathPart(payload?.web?.pathPart)
              : null;
            const itemPayload = {
              ...payload,
              web: payload?.web && {
                ...payload.web,
                ...(model?.type === "block" ? {} : pathPart),
              },
            };
            return sdk.instance
              .createItem(model.ZUID, itemPayload)
              .then((res) => {
                return {
                  ...itemPayload,
                  meta: {
                    ...itemPayload?.meta,
                    ZUID: !res?.data ? null : res?.data?.ZUID,
                  },
                };
              });
          })
        )
      : [];

    return {
      model,
      fields,
      items,
    };
  }

  return {
    "seed:content": ({
      path,
      context = {},
    }: {
      path: string;
      context?: Record<string, any>;
    }) => setUp(path, context),
  };
};
