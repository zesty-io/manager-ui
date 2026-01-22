import { useState, useEffect, useCallback, useRef } from "react";
import { IntegrationRequestHeaders } from "../../services/types";

const useIntegrationField = () => {
  const [apiData, setApiData] = useState<any>(null);
  const [status, setStatus] = useState<
    "connecting" | "success" | "failed" | null
  >(null);

  const hasFetchedRef = useRef(false);
  const currentEndpointRef = useRef<string>("");

  const fetchApiData = useCallback(
    async (endpoint: string, headers?: IntegrationRequestHeaders) => {
      if (!endpoint) return;

      // Reset if endpoint has changed
      if (currentEndpointRef.current !== endpoint) {
        hasFetchedRef.current = false;
        currentEndpointRef.current = endpoint;
        setStatus(null);
        setApiData(null);
      }

      // Prevent duplicate fetches for the same endpoint
      if (hasFetchedRef.current) return;

      hasFetchedRef.current = true;
      setStatus("connecting");

      try {
        const response = await fetch(endpoint, {
          ...(headers ? { headers } : {}),
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
        setApiData(null);
        setStatus("failed");
        console.error("API fetch error:", err);
      }
    },
    []
  );

  useEffect(() => {
    return () => {
      hasFetchedRef.current = false;
      currentEndpointRef.current = "";
    };
  }, []);

  return {
    data: apiData,
    status,
    fetchApiData,
  };
};

export default useIntegrationField;
