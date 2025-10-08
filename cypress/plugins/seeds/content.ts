import { readFileSync, existsSync } from "fs";
import { join } from "path";
import { getSDK } from "./utils";
import {
  ContentItem,
  ContentModel,
  ContentModelField,
} from "../../../src/shell/services/types";

export type ContentSeed = {
  model: Partial<ContentModel>;
  fields?: Partial<ContentModelField>[];
  items?: Partial<ContentItem>[];
};

module.exports = function content(config) {
  const { formatName } = require("../../../src/utility/formatName");
  const { formatPathPart } = require("../../../src/utility/formatPathPart");

  async function seedContent(
    fixturePath: string,
    overrides: Partial<ContentSeed> = {}
  ): Promise<ContentSeed> {
    const jsonString = readFileSync(
      join(__dirname, "../../fixtures/", fixturePath),
      "utf8"
    );
    const json = JSON.parse(jsonString);
    const modelOverrides = overrides?.model || {};
    const fieldsOverrides = overrides?.fields?.length ? overrides?.fields : [];
    const itemsOverrides = overrides?.items?.length ? overrides?.items : [];

    const sdk = await getSDK(config);
    const timeStamp = Date.now();

    const labelSuffix = `${config.env.COMMIT_ID} | ${timeStamp}`;

    const modelLabel = `E2E | ${
      modelOverrides?.label || json.model.label
    } | ${labelSuffix}`;

    // 1) Create Schema
    const modelPayload = {
      ...json.model,
      ...modelOverrides,
      label: modelLabel,
      metaTitle: modelLabel,
      name: formatName(modelLabel),
    };
    const modelResponse = await sdk.instance.createModel(modelPayload);
    const model = modelResponse?.data;

    console.debug("createModel:", { modelPayload, modelResponse });

    // 2) Create Fields
    const jsonFields = !fieldsOverrides?.length
      ? json?.fields
      : json?.fields.map((field) => ({
          ...field,
          ...fieldsOverrides.find((ov) => ov.name === field.name),
        }));
    let fields = await Promise.all(
      jsonFields?.map((field) => {
        return sdk.instance.createField(model?.ZUID, field).then((res) => ({
          ...field,
          ZUID: res?.data?.ZUID || null,
        }));
      })
    );

    console.debug("createFields:", { jsonFields, fields });

    // 3) Create Items
    const jsonItems = !itemsOverrides?.length
      ? json.items
      : json.items.map((item) => ({
          ...item,
          ...itemsOverrides.find(
            (ov) => ov?.web?.metaTitle === item?.web?.metaTitle
          ),
        }));
    let items = await Promise.all(
      jsonItems?.map((item) => {
        const itemLabel = `${item?.web?.metaTitle} | ${timeStamp}`;
        const payload = {
          ...item,
          web: {
            ...item.web,
            metaTitle: itemLabel,
            metaLinkText: itemLabel,
            ...(model?.type === "block"
              ? {}
              : {
                  pathPart: formatPathPart(itemLabel),
                }),
          },
        };
        return sdk.instance.createItem(model?.ZUID, payload).then((res) => {
          return {
            ...payload,
            meta: {
              ...payload?.meta,
              ZUID: res?.data?.ZUID || null,
            },
          };
        });
      })
    );

    console.debug("createItems:", { jsonItems, items });

    return {
      model,
      fields,
      items,
    };
  }

  return {
    "seed:content": ({
      fixturePath,
      overrides,
    }: {
      fixturePath: string;
      overrides?: ContentSeed;
    }) => seedContent(fixturePath, overrides),
  };
};
