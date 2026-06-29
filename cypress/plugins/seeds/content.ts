import { readFileSync } from "fs";
import { join } from "path";
import { v4 as uuidv4 } from "uuid";

import {
  ContentItem,
  ContentModel,
  ContentModelField,
  CreateStatusLabel,
  WorkflowStatusLabel,
} from "../../../src/shell/services/types";

export type SeedContentTask = {
  model: ContentModel;
  fields?: ContentModelField[];
  items: ContentItem[];
};

module.exports = function content(config) {
  const { formatPathPart } = require("../../../src/utility/formatPathPart");
  const { formatName } = require("../../../src/utility/formatName");
  const { getSDK } = require("./utils");

  async function seedContent(path: string): Promise<SeedContentTask> {
    const jsonString = readFileSync(join(__dirname, "../../", path), "utf8");
    const json = JSON.parse(jsonString);

    const sdk = await getSDK(config);
    const timeStamp = uuidv4();

    // 1) Create Schema
    // Append commit id for spec tracking
    // append timestamp to prevent naming conflicts
    const modelLabel = `E2E: ${json.model.label} | ${config.env.COMMIT_ID} | ${timeStamp}`;
    const modelPayload = {
      ...json.model,
      label: modelLabel,
      metaTitle: modelLabel,
      name: formatName(modelLabel),
    };
    // Retry up to 3 times — createModel can return null data under API load
    let model = null;
    for (let attempt = 1; attempt <= 3; attempt++) {
      const modelResponse = await sdk.instance.createModel(modelPayload);
      model = modelResponse?.data;
      if (model?.ZUID) break;
      // API can be slow under parallel runner load — wait longer each attempt
      if (attempt < 3) await new Promise((r) => setTimeout(r, 2000 * attempt));
    }
    if (!model?.ZUID) {
      throw new Error(
        `seed:content failed to create model after 3 attempts: "${modelPayload.label}"`
      );
    }

    // 2) Create Fields
    const fields = await Promise.all(
      json.fields.map((field) => {
        return sdk.instance.createField(model?.ZUID, field).then((res) => ({
          ...field,
          ZUID: res?.data?.ZUID || null,
        }));
      })
    );

    // 3) Create Items
    const items = await Promise.all(
      json.items.map((item, index) => {
        // Append commit id to item labels for spec tracking
        // append timestamp to prevent naming conflicts
        const itemLabel = `E2E: ${item.web.metaTitle} | ${config.env.COMMIT_ID} | ${timeStamp}`;
        const payload = {
          ...item,
          meta: {
            ...item.meta,
            sort: item.meta?.sort ?? index,
            contentModelZUID: model?.ZUID,
          },
          web: {
            ...item.web,
            metaTitle: itemLabel,
            metaLinkText: itemLabel,
            // only include pathpart if not a block type model
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
    // Return model, fields, and items for testing
    return {
      model,
      fields,
      items,
    };
  }

  async function deleteAllLabels(): Promise<string[]> {
    const sdk = await getSDK(config);
    const allLabels = await sdk.instance.fetchLabels();
    if (!allLabels?.data?.length) {
      return [];
    }

    const deletePromises = allLabels?.data
      .filter(
        (label) => !["Needs Review", "Draft", "Approved"]?.includes(label?.name)
      )
      .map((label) => {
        return sdk.instance.deleteLabel(label?.ZUID).then((res) => {
          return res.data;
        });
      });

    return await Promise.all(deletePromises);
  }

  async function createLabel(
    data: CreateStatusLabel
  ): Promise<WorkflowStatusLabel> {
    const sdk = await getSDK(config);
    return await sdk.instance.createLabel(data).then((res) => {
      return res.data;
    });
  }

  // CONTENT TASK MAPPING
  return {
    "seed:content": (path: string) => seedContent(path),
    "api:createLabel": (data: CreateStatusLabel) => createLabel(data),
    "cleanup:labels": () => deleteAllLabels(),
  };
};
