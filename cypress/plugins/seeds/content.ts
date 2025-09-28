import { readFileSync, existsSync } from "fs";
import { join } from "path";
import { getSDK, lookupValue } from "./utils";
import {
  ContentItem,
  ContentModel,
  ContentModelField,
} from "../../../src/shell/services/types";

export type SeedContentTask = {
  model: ContentModel;
  fields?: ContentModelField[];
  items: ContentItem[];
};

const initialData = {
  model: {},
  fields: [],
  items: [],
};

module.exports = function content(config) {
  const { formatPathPart } = require("../../../src/utility/formatPathPart");

  async function setUp(path: string, context: Record<string, any> = {}) {
    const [filePath, target = null] = path.split("#");
    const fullFilePath = join(__dirname, "../../fixtures/", filePath);
    if (!existsSync(fullFilePath)) throw new Error("Invalid file path");
    const jsonString = readFileSync(fullFilePath, "utf8");
    const json = JSON.parse(jsonString);
    const jsonData = !target ? json : json?.[target];

    if (!jsonData)
      throw new Error(`Target '#${target}' not found in ${fullFilePath}`);
    if (!jsonData?.model)
      throw new Error("Seed data must contain a model definition");

    const jsonModel = jsonData?.model;
    const jsonFields = jsonData?.fields;
    const jsonItems = jsonData?.items;

    const LOOKUP_CONTEXT = {
      env: config.env,
      baseUrl: config?.baseUrl,
      timeStamp: Date.now(),
      commitId: config.env.COMMIT_ID,
      model: {},
      fields: [],
      context,
    };

    const sdk = await getSDK(config);

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
    }): Promise<SeedContentTask> => setUp(path, context),
  };
};
