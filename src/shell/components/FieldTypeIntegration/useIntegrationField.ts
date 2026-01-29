import { useState, useEffect, useCallback, useRef } from "react";
import { IntegrationRequestHeaders } from "../../services/types";

const useIntegrationField = () => {
  const [apiData, setApiData] = useState<any>(null);
  const [status, setStatus] = useState<
    "connecting" | "success" | "failed" | null
  >(null);

  const currentEndpointRef = useRef<string>("");

  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchApiData = useCallback(
    async (endpoint: string, headers?: IntegrationRequestHeaders) => {
      if (!endpoint) return;

      // Abort previous request if any
      abortControllerRef.current?.abort();
      abortControllerRef.current = new AbortController();

      currentEndpointRef.current = endpoint;
      setStatus("connecting");
      setApiData(null);

      try {
        const response = await fetch(endpoint, {
          ...(headers ? { headers } : {}),
          signal: abortControllerRef.current.signal,
        });

        if (response.ok) {
          const responseData = await response.json();
          setApiData(responseData);
          setStatus("success");
        } else {
          throw new Error(
            `Failed to fetch data: ${response.status} ${response.statusText}`
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
