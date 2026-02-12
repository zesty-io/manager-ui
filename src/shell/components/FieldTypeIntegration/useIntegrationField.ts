import { useState, useEffect, useCallback, useRef } from "react";
import { IntegrationRequestHeaders } from "../../services/types";
import { useGetExternalApiMutation } from "shell/services/cloudFunctions";

const useIntegrationField = () => {
  const [apiData, setApiData] = useState<any>(null);
  const [status, setStatus] = useState<
    "connecting" | "success" | "failed" | null
  >(null);
  const [getExternalApi, { data }] = useGetExternalApiMutation();

  const currentEndpointRef = useRef<string>("");

  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchApiData = useCallback(
    async (endpoint: string, headers: IntegrationRequestHeaders = null) => {
      if (!endpoint) return;

      // Abort previous request if any
      abortControllerRef.current?.abort();
      abortControllerRef.current = new AbortController();

      currentEndpointRef.current = endpoint;
      setStatus("connecting");
      setApiData(null);

      try {
        const response: any = await getExternalApi({
          url: endpoint,
          headers: !headers ? {} : headers,
          signal: abortControllerRef.current.signal,
        });

        if (!response?.error) {
          const responseData = await response.data;
          setApiData(responseData);
          setStatus("success");
        } else {
          throw new Error(
            `Failed to fetch data: ${response.status} ${response.data.message}`
          );
        }
      } catch (err) {
        if (err.name === "AbortError") return;
        setApiData(null);
        setStatus("failed");
        currentEndpointRef.current = "";
        console.error("API fetch error:", err);
      }
    },
    []
  );

  useEffect(() => {
    return () => {
      currentEndpointRef.current = "";
      setApiData(null);
      setStatus(null);
    };
  }, []);

  return {
    data: apiData,
    status,
    fetchApiData,
  };
};

export default useIntegrationField;
