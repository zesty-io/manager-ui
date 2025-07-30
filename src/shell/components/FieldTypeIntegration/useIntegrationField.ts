import { useState, useEffect, useCallback } from "react";
import {
  IntegrationFieldConfig,
  IntegrationRequestHeaders,
} from "../../services/types";
import { fetchApi, getKeyValue } from "./utils";

const useIntegrationField = (initialConfig: IntegrationFieldConfig | null) => {
  const [config, setConfig] = useState(initialConfig);
  const [apiData, setApiData] = useState<any>(null);
  const [rootData, setRootData] = useState<any[]>([]);
  const [selectedItems, setSelectedItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateItemId = useCallback(
    (item: any) => {
      if (!config?.keyPaths) return "";

      const headingText = item[config.keyPaths.heading] || "";
      const subHeadingText = config.keyPaths.subHeading
        ? item[config.keyPaths.subHeading] || ""
        : "";
      const thumbnailText = config.keyPaths.thumbnail
        ? item[config.keyPaths.thumbnail] || ""
        : "";
      const detailText = config.keyPaths.detail
        ? item[config.keyPaths.detail] || ""
        : "";
      const detailsText = config.keyPaths.details
        ? config.keyPaths.details.map((d) => item[d] || "").join("")
        : "";

      return `${headingText}${subHeadingText}${thumbnailText}${detailText}${detailsText}`
        .replace(/[\/:;&*%$#@!?=\s+]/g, "")
        .toLowerCase()
        .trim();
    },
    [config]
  );

  const fetchApiData = useCallback(
    async ({
      endpoint,
      headers,
    }: {
      endpoint: string;
      headers?: IntegrationRequestHeaders;
    }) => {
      if (!endpoint) return;

      setIsLoading(true);
      setError(null);

      try {
        const { status, data } = await fetchApi({
          endpoint: endpoint,
          headers: headers,
        });

        if (status === "success") {
          setApiData(data);
        } else {
          setError("Failed to fetch data from API");
        }
      } catch (err) {
        setError(err.message || "Failed to fetch data");
      } finally {
        setIsLoading(false);
      }
    },
    [setApiData, setIsLoading, setError]
  );

  const selectItems = useCallback((items: any[]) => {
    setSelectedItems(items);
  }, []);

  const updateConfig = useCallback((newConfig: IntegrationFieldConfig) => {
    setConfig(newConfig);
  }, []);

  useEffect(() => {
    if (!config?.endpoint || !!apiData) return;
    fetchApiData({ endpoint: config.endpoint, headers: config.headers });
  }, [config?.endpoint, config?.headers, apiData, fetchApiData]);

  useEffect(() => {
    if (isLoading) return;
    if (!!apiData) {
      const extractedData = config.keyPaths.rootPath
        ? getKeyValue(apiData, config.keyPaths.rootPath)
        : apiData;

      const itemsWithIds = extractedData.map((item: any) => ({
        ...item,
        _itemId: generateItemId(item),
      }));

      setRootData(itemsWithIds);
    }
  }, [apiData, config, isLoading]);

  return {
    config,
    apiData,
    rootData,
    selectedItems,
    isLoading,
    error,
    fetchApiData,
    selectItems,
    updateConfig,
    generateItemId,
  };
};

export default useIntegrationField;
