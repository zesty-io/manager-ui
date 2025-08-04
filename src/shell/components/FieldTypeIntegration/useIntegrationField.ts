import { useState, useEffect, useCallback, useMemo } from "react";
import {
  IntegrationFieldConfig,
  IntegrationKeyPaths,
  IntegrationRequestHeaders,
} from "../../services/types";
import { fetchApi, getKeyValue } from "./utils";

const useIntegrationField = (initialConfig: IntegrationFieldConfig | null) => {
  const [config, setConfig] = useState(initialConfig);
  const [apiData, setApiData] = useState<any>(null);
  const [selectedItems, setSelectedItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { endpoint, headers, type, keyPaths } = config || {
    endpoint: null,
    headers: null,
    type: null,
    keyPaths: {
      heading: "",
      subHeading: "",
      thumbnail: "",
      detail: "",
      details: null,
    },
  };

  const generateItemId = useCallback(
    (item: any, keyPaths: IntegrationKeyPaths) => {
      if (!keyPaths) return "";
      const { heading, subHeading, thumbnail, detail, details } = keyPaths;

      const headingText = item[heading] || "";
      const subHeadingText = subHeading ? item[subHeading] || "" : "";
      const thumbnailText = thumbnail ? item[thumbnail] || "" : "";
      const detailText = detail ? item[detail] || "" : "";
      const detailsText = details
        ? details.map((d) => item[d] || "").join("")
        : "";

      return `${headingText}${subHeadingText}${thumbnailText}${detailText}${detailsText}`
        .replace(/[\/:;&*%$#@!?=\s+]/g, "")
        .toLowerCase()
        .trim();
    },
    []
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
          throw new Error("Failed to fetch data from API");
        }
      } catch (err) {
        setError(err.message || "Failed to fetch data");
        setApiData(null);
      }

      setIsLoading(false);
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
    if (!endpoint || !!apiData) return;
    fetchApiData({ endpoint: endpoint, headers: headers });
  }, [endpoint, headers, apiData, fetchApiData]);

  const rootData = useMemo(() => {
    if (!!isLoading || !apiData) return [];

    const extractedData = keyPaths?.rootPath
      ? getKeyValue(apiData, keyPaths?.rootPath)
      : apiData;

    const itemsWithIds = extractedData.map((item: any) => ({
      ...item,
      _itemId: generateItemId(item, keyPaths),
    }));
    return itemsWithIds;
  }, [apiData, keyPaths, isLoading]);

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
