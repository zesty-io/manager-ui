import { readFileSync } from "fs";
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

  let COMMON: ContentSeed;

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
    const labelSuffix = ` : e2e-${config.env.COMMIT_ID}-${timeStamp}`;
    const modelLabel = `${
      modelOverrides?.label || json.model.label
    }${labelSuffix}`;

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

    // 2) Create Fields
    const jsonFields = !fieldsOverrides?.length
      ? json?.fields
      : json?.fields.map((field) => {
          const override = fieldsOverrides.find((ov) => ov.name === field.name);
          return {
            ...field,
            ...override,
            settings: {
              ...field?.settings,
              ...override?.settings,
            },
          };
        });
    let fields = await Promise.all(
      jsonFields?.map((field) => {
        return sdk.instance.createField(model?.ZUID, field).then((res) => ({
          ...field,
          ZUID: res?.data?.ZUID || null,
        }));
      })
    );

    const jsonItems = !itemsOverrides?.length
      ? json.items
      : json.items.map((item) => {
          const override = itemsOverrides.find(
            (ov) => ov?.meta?.sort === item?.meta?.sort
          );
          return {
            meta: {
              ...item?.meta,
              ...override?.meta,
            },
            web: {
              ...item?.web,
              ...override?.web,
            },
            data: {
              ...item?.data,
              ...override?.data,
            },
          };
        });
    let items = await Promise.all(
      jsonItems?.map((item) => {
        const itemLabel = !item?.web?.metaTitle
          ? modelLabel
          : `${item?.web?.metaTitle}${labelSuffix}`;
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

    return {
      model,
      fields,
      items,
    };
  }

  async function getCommon() {
    if (!COMMON?.model || !COMMON?.fields?.length || !COMMON?.items?.length) {
      const commonData = await seedContent("content/common.json");
      COMMON = commonData;
    }
    return COMMON;
  }

  return {
    "seed:content": ({
      fixturePath,
      overrides,
    }: {
      fixturePath: string;
      overrides?: ContentSeed;
    }) => seedContent(fixturePath, overrides),
    "get:common": getCommon,
  };
};
