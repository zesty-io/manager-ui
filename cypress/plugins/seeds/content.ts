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

module.exports = function content(config) {
  const { formatPathPart } = require("../../../src/utility/formatPathPart");

  async function setUp(path: string, context: Record<string, any> = {}) {
    const filePath = join(__dirname, "../../fixtures/", path);

    if (!existsSync(filePath)) {
      throw new Error("Seeding Error: Invalid file path");
    }
    const jsonString = readFileSync(filePath, "utf8");
    const json = JSON.parse(jsonString);

    if (!json?.model) {
      throw new Error(
        "Seeding Error: Seed data must contain a model definition"
      );
    }

    const LOOKUP_CONTEXT = {
      env: config.env,
      baseUrl: config?.baseUrl,
      timeStamp: Date.now(),
      commitId: config.env.COMMIT_ID,
      context,
    };

    const sdk = await getSDK(config);

    // 1) Create Schema
    const modelPayload = lookupValue(json.model, LOOKUP_CONTEXT);
    const modelResponse = await sdk.instance.createModel(modelPayload);
    const model = !modelResponse?.data ? {} : modelResponse?.data;

    // 2) Create Fields
    let fields = [];
    if (!Array.isArray(json?.fields) && json?.fields) {
      throw new Error("Seeding Error: Invalid fields");
    } else {
      fields = await Promise.all(
        json.fields.map((field) => {
          const fieldPayload = lookupValue(field, { ...LOOKUP_CONTEXT, model });
          return sdk.instance
            .createField(model?.ZUID, fieldPayload)
            .then((res) => ({
              ZUID: !res?.data ? null : res?.data?.ZUID,
              ...fieldPayload,
            }));
        })
      );
    }

    // 3) Create Items
    let items = [];
    if (!Array.isArray(json?.items) && json?.items) {
      throw new Error("Seeding Error: Invalid items");
    } else {
      items = await Promise.all(
        json.items.map((item) => {
          const payload = lookupValue(item, {
            ...LOOKUP_CONTEXT,
            model,
            fields,
          });
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
            .createItem(model?.ZUID, itemPayload)
            .then((res) => ({
              ...itemPayload,
              meta: {
                ...itemPayload?.meta,
                ZUID: !res?.data ? null : res?.data?.ZUID,
              },
            }));
        })
      );
    }

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
