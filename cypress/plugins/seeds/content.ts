import { readFileSync } from "fs";
import { join } from "path";
import { v4 as uuidv4 } from "uuid";

import {
  ContentItem,
  ContentModel,
  ContentModelField,
  CreateStatusLabel,
  RedirectRequest,
  WorkflowStatusLabel,
} from "../../../src/shell/services/types";

export type SeedContentTask = {
  model: ContentModel;
  fields?: ContentModelField[];
  items: ContentItem[];
  // Present only when the fixture declares a `view`. `ZUID` is what the page
  // renders as `data-code-id`, so a spec can address the seeded code region
  // instead of hardcoding one.
  view?: { ZUID: string; fileName: string; version: number } | null;
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
    // 4) Give the model a real view, when the fixture ships one.
    //
    // Creating a pageset model auto-creates a view whose code is
    // `{{this.autolayout()}}`. On this instance that view answers 504 after
    // 60s, so a seeded page renders NOTHING, the studio bridge never loads,
    // and every studio spec ends up driving a bridge it fabricated itself.
    // Replacing the code with an explicit template renders in well under a
    // second and produces real markers, a real bridge, and a real canvas.
    let view = null;
    if (json.view) {
      const code = readFileSync(join(__dirname, "../../", json.view), "utf8");

      // The auto-created view can lag the model by a moment under API load.
      let target = null;
      for (let attempt = 1; attempt <= 3; attempt++) {
        const all = (await sdk.instance.getViews())?.data || [];
        target = all.find((v) => v.contentModelZUID === model.ZUID) || null;
        if (target) break;
        await new Promise((r) => setTimeout(r, 1500 * attempt));
      }
      if (!target?.ZUID) {
        throw new Error(
          `seed:content created no view for model "${modelPayload.label}" (${model.ZUID})`
        );
      }

      await sdk.instance.updateView(target.ZUID, {
        code,
        fileName: target.fileName,
        filename: target.fileName,
        type: target.type,
        contentModelZUID: target.contentModelZUID,
      });

      // Publish the version that the update just produced, not the one read
      // before it — updateView increments, so the pre-read number is stale.
      const saved = (await sdk.instance.getView(target.ZUID))?.data;
      await sdk.instance.publishView(target.ZUID, saved?.version);

      view = {
        ZUID: target.ZUID,
        fileName: saved?.fileName || target.fileName,
        version: saved?.version,
      };
    }

    // Return model, fields, items, and the seeded view for testing
    return {
      model,
      fields,
      items,
      view,
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

  async function publishItem(modelZUID: string, itemZUID: string) {
    const sdk = await getSDK(config);
    // Version 1: safe because callers only pass items just created by seedContent.
    const res = await sdk.instance.publishItem(modelZUID, itemZUID, 1);
    return res.data;
  }

  async function createRedirect(payload: RedirectRequest) {
    const sdk = await getSDK(config);
    const res = await sdk.instance.createRedirect(payload);
    return res.data;
  }

  // CONTENT TASK MAPPING
  return {
    "seed:content": (path: string) => seedContent(path),
    "api:createLabel": (data: CreateStatusLabel) => createLabel(data),
    "cleanup:labels": () => deleteAllLabels(),
    "api:publishItem": (data: { modelZUID: string; itemZUID: string }) =>
      publishItem(data.modelZUID, data.itemZUID),
    "api:createRedirect": (payload: RedirectRequest) => createRedirect(payload),
  };
};
