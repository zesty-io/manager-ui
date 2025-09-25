import { get as getCookie } from "js-cookie";

import { formatPathPart } from "../../../src/utility/formatPathPart";
import { formatName } from "../../../src/utility/formatName";

import {
  ApiResponse,
  AuthCredentials,
  AuthResponse,
  CypressConfig,
  CypressENV,
  Field,
  Item,
  JsonData,
  MediaFile,
  Model,
} from "./types";
import { readJson, readJsonFile } from "./utils";
import { Bin, Instance } from "../../../src/shell/services/types";

module.exports = (_on: Cypress.PluginEvents, config: CypressConfig) => {
  async function getAuthToken(): Promise<string> {
    const { email, password }: AuthCredentials = readJson(
      "../../cypress.env.json"
    );
    const cookie = getCookie(config.env.COOKIE_NAME);
    const myHeaders = new Headers();
    myHeaders.append("Cookie", `${config.env.COOKIE_NAME}=${cookie}`);

    const formdata = new FormData();
    formdata.append("email", email);
    formdata.append("password", password);

    const requestOptions: RequestInit = {
      method: "POST",
      headers: myHeaders,
      body: formdata,
    };

    const response = await fetch(
      `${config.env.API_AUTH}/login`,
      requestOptions
    );
    const jsonData: AuthResponse = await response.json();
    config.env.TOKEN = jsonData?.meta?.token || "";
    return jsonData?.meta?.token || "";
  }

  async function fetchAPI(
    url: string,
    method: string = "GET",
    data: any | FormData = null,
    caller: string = ""
  ): Promise<ApiResponse> {
    const AUTH_TOKEN = config.env?.TOKEN || (await getAuthToken());
    const isFormData = data instanceof FormData;
    const payload = isFormData ? data : JSON.stringify(data);
    try {
      const resData = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${AUTH_TOKEN}`,
          // "Content-Type": "application/json",
        },
        body: !data ? null : payload,
      });
      if (!resData.ok) {
        throw new Error(`${await resData.text()}`);
      }
      const jsonData: JsonData = await resData?.json();
      return {
        status: "success",
        data: jsonData?.data || jsonData,
      };
    } catch (error: any) {
      return {
        status: "error",
        data: error?.message,
      };
    }
  }

  async function getInstance(instanceZUID = null) {
    const instaceSearchId = !!instanceZUID ? `/${instanceZUID}` : "";
    const { data: instance } = await fetchAPI(
      `${config.env.API_ACCOUNTS}/instances${instaceSearchId}`
    );
    return instance;
  }
  async function getModels(): Promise<Model[] | []> {
    try {
      const { status, data } = await fetchAPI(
        `${config.env.API_INSTANCE_URL}/content/models`
      );
      if (status === "success" && Array.isArray(data)) {
        return data;
      } else {
        return [];
      }
    } catch (error) {
      console.error("ERROR", error);
      return [];
    }
  }

  async function deleteModels(
    modelZUIDs: string[] = []
  ): Promise<{ ZUID: string }[]> {
    const fieldPromises = modelZUIDs?.map(async (modelZUID: string) => {
      const { data } = await fetchAPI(
        `${config.env.API_INSTANCE_URL}/content/models/${modelZUID}`,
        "DELETE"
      );

      return data;
    });
    return await Promise.all(fieldPromises);
  }

  async function createModel(model: Model, replace?: boolean): Promise<Model> {
    let modelName = model?.name;
    let modelLabel = model?.label;

    const models = await getModels();

    if (replace) {
      const forDelete = models?.filter(
        (modelItem: Model) =>
          modelItem?.label === modelLabel || modelItem?.name === modelName
      );
      const payload = forDelete?.map((itemDelete) => itemDelete?.ZUID);
      await deleteModels(payload);
    }

    const { data } = await fetchAPI(
      `${config.env.API_INSTANCE_URL}/content/models`,
      "POST",
      { ...model, name: modelName, label: modelLabel }
    );

    return data;
  }

  async function getFields(
    modelZUID: string,
    showDeleted: boolean = false
  ): Promise<Field[]> {
    const { data } = await fetchAPI(
      `${config.env.API_INSTANCE_URL}/content/models/${modelZUID}/fields?showDeleted=${showDeleted}`
    );
    return data;
  }

  async function updateFields(
    modelZUID: string,
    fields: Field[] = []
  ): Promise<{ ZUID: string }[]> {
    const fieldPromises = fields?.map(async (field: Field) => {
      const { data } = await fetchAPI(
        `${config.env.API_INSTANCE_URL}/content/models/${modelZUID}/fields/${field?.ZUID}`,
        "PUT",
        fields
      );
      return data;
    });
    return await Promise.all(fieldPromises);
  }

  async function deleteFields(
    modelZUID: string,
    fields: Field[] = []
  ): Promise<any[]> {
    const fieldPromises = fields?.map(async (field: Field) => {
      return await fetchAPI(
        `${config.env.API_INSTANCE_URL}/content/models/${modelZUID}/fields/${field?.ZUID}`,
        "DELETE"
      );
    });
    return await Promise.all(fieldPromises);
  }

  async function createField(modelZUID: string, field: Field): Promise<any> {
    const { data } = await fetchAPI(
      `${config.env.API_INSTANCE_URL}/content/models/${modelZUID}/fields`,
      "POST",
      field
    );
    return data;
  }

  async function createFields(
    modelZUID: string,
    fields: Field[] = []
  ): Promise<Field[]> {
    // Better array validation
    if (!Array.isArray(fields) || fields.length === 0) {
      return [];
    }

    const results = await Promise.all(
      fields.map(async (field) => {
        const { status, data } = await fetchAPI(
          `${config.env.API_INSTANCE_URL}/content/models/${modelZUID}/fields`,
          "POST",
          field
        );

        return status === "success"
          ? {
              ...field,
              ZUID: data?.ZUID,
            }
          : null;
      })
    );

    return results;
  }
  async function getItem(
    modelZUID: string,
    itemZUID: string
  ): Promise<Item | null> {
    const { data } = await fetchAPI(
      `${config.env.API_INSTANCE_URL}/content/models/${modelZUID}/items/${itemZUID}`
    );
    return data || null;
  }

  async function getItems(modelZUID: string): Promise<Item[]> {
    const { data } = await fetchAPI(
      `${config.env.API_INSTANCE_URL}/content/models/${modelZUID}/items?limit=500`
    );

    return (
      [...(data || [])].sort(
        (a: Item, b: Item) => (a?.meta?.sort || 0) - (b?.meta?.sort || 0)
      ) || []
    );
  }

  async function deleteItems(
    modelZUID: string,
    items: Item[] = []
  ): Promise<ApiResponse> {
    const { data } = await fetchAPI(
      `${config.env.API_INSTANCE_URL}/content/models/${modelZUID}/items/batch`,
      "DELETE",
      items
    );
    return data;
  }

  async function createItems(
    modelZUID: string,
    items: Item[] = []
  ): Promise<Item[]> {
    const { status, data } = await fetchAPI(
      `${config.env.API_INSTANCE_URL}/content/models/${modelZUID}/items/batch`,
      "POST",
      items
    );

    const itemsResponse: Item[] = await getItems(modelZUID);

    console.debug("itemsResponse", { status, data, itemsResponse });

    return itemsResponse;
  }

  async function publishItem(
    modelZUID: string,
    itemZUID: string
  ): Promise<Item> {
    const dataResponse = await getItem(modelZUID, itemZUID);
    const payload = {
      version: dataResponse?.meta?.version,
      publishAt: "now",
      unpublishAt: "never",
    };

    const { status, data } = await fetchAPI(
      `${config.env.API_INSTANCE_URL}/content/models/${modelZUID}/items/${itemZUID}/publishings`,
      "POST",
      payload
    );
    return data;
  }

  async function unPublishItem(
    modelZUID: string,
    itemZUID: Item[] = []
  ): Promise<Item[]> {
    const { status, data } = await fetchAPI(
      `${config.env.API_INSTANCE_URL}/content/models/${modelZUID}/items/${itemZUID}/publishings`
    );

    const activeItem = data?.find((item) => !!item?._active);
    if (!!activeItem) {
      const payload = {
        version: activeItem?.meta?.version,
        publishAt: "now",
        unpublishAt: "never",
      };

      const { status, data } = await fetchAPI(
        `${config.env.API_INSTANCE_URL}/content/models/${modelZUID}/items/${itemZUID}/publishings/${activeItem?.ZUID}`,
        "POST",
        payload
      );
      return data;
    }
    return null;
  }

  async function getSiteBins() {
    // const instaceSearchId = !!instanceZUID ? `/${instanceZUID}` : "";

    try {
      const siteId =
        config.env.SITE_ID ||
        (await getInstance(config.env.INSTANCE_ZUID).then((res) => {
          return res?.ID;
        }));

      const { status, data } = await fetchAPI(
        `${config.env.MEDIA_MANAGER_URL}/site/${siteId}/bins`
      );
      // media-manager.api.dev.zesty.io

      if (status === "error") return [];
      return data;
    } catch (error) {
      return [];
    }
  }

  async function getBinFiles_0() {
    const bins = await getSiteBins();
    const siteBinsWithFiles = {};
    const allFilesPromise = bins
      ?.map(async (bin) => {
        const { data } = await fetchAPI(
          `${config.env.MEDIA_MANAGER_URL}/bin/${config.env.BIN_ID}/files`
        );

        return {
          bin_id: bin?.id,
          files: data,
          count: data?.length,
        };
      })
      .sort((a, b) => b?.count - a?.count)
      .reduce((acc, file) => {
        acc[file?.id] = file;
        return acc;
      }, {});

    const siteFiles = await Promise.all(allFilesPromise);
    return siteFiles?.[0]?.files || [];
  }

  async function getBinFiles(bin_id: string): Promise<MediaFile[]> {
    const ecoId =
      bin_id ||
      (await getInstance(config.env.INSTANCE_ZUID).then((res) => {
        return res?.siteID;
      }));

    const { status, data } = await fetchAPI(
      `${config.env.MEDIA_MANAGER_URL}/bin/${ecoId}/files`
    );
    return data || [];
  }

  async function getAllMediaFiles(): Promise<
    Array<{ bin_id: string; count: number; files: MediaFile[] }>
  > {
    const siteBins = await getSiteBins();
    const allFilesPromise = siteBins?.map(async (bin) => {
      const data = await getBinFiles(bin?.id);
      return {
        name: bin.name,
        bin_id: bin?.id,
        eco_id: bin?.eco_id,
        storage_driver: bin?.storage_driver,
        storage_name: bin?.storage_name,
        storage_base_url: bin?.storage_base_url,
        cdn_driver: bin?.cdn_driver,
        cdn_base_url: bin?.cdn_base_url,
        count: data?.length,
        files: data,
      };
    });

    const allMediaFiles = await Promise.all(allFilesPromise);

    return allMediaFiles?.sort((a, b) => b?.count - a?.count);
  }

  async function deleteBin(bin_id: string): Promise<void> {
    const { status, data: bin } = await fetchAPI(
      `${config.env.MEDIA_MANAGER_URL}/bin/${bin_id}`,
      "DELETE"
    );
  }

  async function createBin(
    name: string,
    deleteExisting?: boolean
  ): Promise<{ id: string; name: string; storage_name: string }> {
    const siteBins = await getSiteBins();
    const binForDelete = siteBins?.find((bin) => bin?.name === name);
    let binName = name;

    if (!!binForDelete) {
      if (deleteExisting) {
        await deleteBin(binForDelete?.id);
      } else {
        binName += "(copy)";
      }
    }
    const formdata = new FormData();
    formdata.append("cdn_prefix", "");
    formdata.append("eco_id", "");
    formdata.append("site_id", config.env?.SITE_ID);
    formdata.append("name", binName);
    const { status, data: bin } = await fetchAPI(
      `${config.env.MEDIA_MANAGER_URL}/bin`,
      "POST",
      formdata
    );

    return bin;
  }

  async function uploadBinFiles(
    binId: string,
    urls: string[]
  ): Promise<Array<any>> {
    const uploadPromises = !urls?.length
      ? []
      : urls?.map(async (path: string) => {
          const fileName = path?.split("/")?.pop();

          const myHeaders = new Headers();
          myHeaders.append("Authorization", `Bearer ${config.env.TOKEN}`);
          myHeaders.append("Cookie", `DEV_APP_SID=${config.env.TOKEN}`);

          const formdata = new FormData();
          formdata.append("bin_id", binId);
          formdata.append("group_id", "");
          formdata.append("filename", fileName);
          formdata.append("createdBy", "");
          formdata.append("cdnUrl", path);
          formdata.append("title", "");

          const { status, data } = await fetchAPI(
            `${config.env.MEDIA_MANAGER_URL}/file`,
            "POST",
            formdata
          );

          return data;
        });
    const uploadedFiles = await Promise.all(uploadPromises);
    return Object.values(uploadedFiles || {}).map((file) => {
      const {
        group_id = "",
        bin_id = "",
        type = "",
        title = "",
        ...other
      } = file || {};

      return other;
    });
  }

  return {
    fetchAPI,
    createBin,
    uploadBinFiles,
    getInstance,
    getBinFiles,
    getModels,
    getFields,
    getItem,
    getItems,
    deleteModels,
    deleteFields,
    deleteItems,
    createModel,
    createField,
    createFields,
    createItems,
    publishItem,
    unPublishItem,
    getAllMediaFiles,
  };
};
