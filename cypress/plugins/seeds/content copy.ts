import { readFileSync, existsSync } from "fs";
import { join } from "path";
import { getSDK } from "./utils";
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
  async function setUp(): Promise<SeedContentTask> {
    const jsonString = readFileSync(
      join(__dirname, "../../fixtures/content.json"),
      "utf8"
    );
    const json = JSON.parse(jsonString);

    const sdk = await getSDK(config);
    const timeStamp = Date.now();

    // 1) Create Schema
    const modelPayload = {
      ...json.model,
      label: `${json.model.label} | ${timeStamp}`,
      metaTitle: `${json.model.metaTitle} | ${timeStamp}`,
      name: `${json.model.name}_${timeStamp}`,
    };
    const modelResponse = await sdk.instance.createModel(modelPayload);
    const model = modelResponse?.data;

    // 2) Create Fields
    let fields = await Promise.all(
      json.fields.map((field) => {
        return sdk.instance.createField(model?.ZUID, field).then((res) => ({
          ...field,
          ZUID: res?.data?.ZUID || null,
        }));
      })
    );

    // 3) Create Items
    let items = await Promise.all(
      json.items.map((item) => {
        const payload = {
          ...item,
          web: {
            ...item.web,
            metaTitle: `${item?.web?.metaTitle}-${timeStamp}`,
            metaLinkText: `${item?.web?.metaLinkText}-${timeStamp}`,
            ...(model?.type === "block"
              ? {}
              : {
                  pathPart: `${item?.web?.pathPart}-${timeStamp}`,
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

  return {
    "seed:content": setUp,
  };
};
