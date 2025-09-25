import { BeforeRunScripts, CypressConfig } from "./types";
import { readJson, mapJsonValues } from "./utils";

export type ContentTasks = {
  [key: string]: (...args: any[]) => any;
};

module.exports = async (
  on: Cypress.PluginEvents,
  config: CypressConfig,
  beforeRun: (fn: BeforeRunScripts, wait?: boolean) => void,
  store
) => {
  const {
    fetchAPI,
    getFields,
    getItems,
    createModel,
    createFields,
    createItems,
    getAllMediaFiles,
  } = require("./services.js")(on, config);

  async function init(): Promise<CypressConfig> {
    const media = await getAllMediaFiles();
    const content = await setContentWithTemplate({
      filePath: "content/common.json",
      context: { media },
      isInit: true,
    });

    store.media = media?.[0]?.files;
    store.common = {
      ...store.common,
      ...content,
    };

    return config;
  }

  async function setContentWithTemplate({
    filePath,
    context,
    isInit = false,
    replace = true,
  }: {
    filePath: string;
    context: any;
    isInit?: boolean;
    replace?: boolean;
  }) {
    if (!filePath) return null;

    const jsonData = readJson(filePath);
    const targetStore = isInit ? "common" : "current";
    const media = await getAllMediaFiles();

    const reference = {
      context,
      config,
      media,
      ...store,
    };

    const model = jsonData?.model
      ? await createModel(mapJsonValues(jsonData.model, reference), replace)
      : null;

    if (model) {
      store.model = { ...model };
    }

    const fields = await processFields(
      jsonData?.fields || [],
      model,
      reference
    );
    if (fields.length > 0) {
      store[targetStore] = {
        ...store[targetStore],
        fields: arrayToMap(fields, "name"),
      };
    }

    const items =
      jsonData?.items && model
        ? await createItems(
            model.ZUID,
            mapJsonValues(jsonData.items, {
              ...reference,
              common: store?.common,
              ...store,
            })
          )
        : [];

    if (items.length > 0) {
      store[targetStore] = {
        ...store[targetStore],
        items,
      };
    }

    return { model, fields, items, item: items?.[0] };
  }

  async function processFields(fields, model, reference) {
    if (!model || !fields.length) return [];

    const nonRelationalFields = fields.filter(
      (field) => !["one_to_one", "one_to_many"].includes(field?.datatype)
    );

    const relationalFields = fields.filter((field) =>
      ["one_to_one", "one_to_many"].includes(field?.datatype)
    );

    const nonRelationalFieldsData = await createFields(
      model.ZUID,
      mapJsonValues(nonRelationalFields, reference)
    );

    const relationalFieldsData =
      relationalFields.length > 0
        ? await createFields(
            model.ZUID,
            mapJsonValues(relationalFields, {
              ...reference,
              fields: arrayToMap(nonRelationalFieldsData, "name"),
            })
          )
        : [];

    return [...nonRelationalFieldsData, ...relationalFieldsData];
  }

  async function getCommon(): Promise<any> {
    return {
      ...store?.common,
      media: store?.media,
    };
  }

  async function setContentItemData({
    modelZUID,
    itemZUID,
    data,
  }: {
    modelZUID: string;
    itemZUID: string;
    data: any;
  }): Promise<any> {
    await fetchAPI(
      `${config.env.API_INSTANCE_URL}/content/models/${modelZUID}/items/${itemZUID}`,
      "PUT",
      data
    );

    return getItems(modelZUID, itemZUID);
  }

  function arrayToMap(array, key) {
    return (
      array?.reduce((acc, item) => {
        if (item?.[key]) {
          acc[item[key]] = item;
        }
        return acc;
      }, {}) || {}
    );
  }

  beforeRun(async () => {
    await init();
  });

  on("task", {
    "set:content:template": setContentWithTemplate,
    "set:content:item": setContentItemData,
    "get:common": getCommon,
  });

  return config;
};
