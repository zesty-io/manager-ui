import { useState, useEffect, useCallback, useRef } from "react";
import { get } from "lodash";
import { useGetExternalApiMutation } from "shell/services/cloudFunctions";
import {
  isObj,
  getObjectKeyPaths,
  getAllArrayKeyPaths,
} from "./Configure/keyPathResolution";

// Mirrors the shape-walking that ConfigureDisplayOptions does when deriving
// its key-selector options, so a response classified "ok" here is guaranteed
// to actually produce selectable options there (and vice versa).
export function classifyApiResponse(
  apiData: unknown
): { ok: true } | { ok: false; reason: string } {
  if (apiData === null || apiData === undefined) {
    return {
      ok: false,
      reason: "API returned no data. Expected a JSON array of objects.",
    };
  }

  if (Array.isArray(apiData)) {
    if (!apiData.length) {
      return {
        ok: false,
        reason:
          "API returned an empty array. Add at least one item to the response to configure display options.",
      };
    }
    if (!isObj(apiData[0])) {
      const kind = apiData[0] === null ? "null" : typeof apiData[0];
      return {
        ok: false,
        reason: `API returned an array of ${kind}s. Expected an array of objects.`,
      };
    }
    if (!getObjectKeyPaths(apiData[0]).length) {
      return {
        ok: false,
        reason:
          "API returned an array of objects with no selectable keys. Make sure each object has at least one scalar property.",
      };
    }
    return { ok: true };
  }

  if (isObj(apiData)) {
    const arrayPaths = getAllArrayKeyPaths(apiData);
    if (!arrayPaths.length) {
      return {
        ok: false,
        reason:
          "API returned a single object with no array of objects nested inside. Expected either an array root or an object containing an array of objects.",
      };
    }
    const hasUsableArray = arrayPaths.some((path) => {
      const item = get(apiData, path)?.[0];
      return isObj(item) && getObjectKeyPaths(item).length > 0;
    });
    if (!hasUsableArray) {
      return {
        ok: false,
        reason:
          "API returned an object whose nested arrays contain no selectable keys. Make sure at least one nested array item has scalar properties.",
      };
    }
    return { ok: true };
  }

  return {
    ok: false,
    reason: `API returned a ${typeof apiData}. Expected a JSON array of objects.`,
  };
}

const useIntegrationField = () => {
  const [apiData, setApiData] = useState<any>(null);
  const [status, setStatus] = useState<
    "connecting" | "success" | "failed" | "invalid" | null
  >(null);
  const [invalidReason, setInvalidReason] = useState<string>("");
  const [getExternalApi, { data }] = useGetExternalApiMutation();

  const currentEndpointRef = useRef<string>("");

  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchApiData = useCallback(
    async (endpoint: string, options: any = null) => {
      if (!endpoint) return;

      // Abort previous request if any
      abortControllerRef.current?.abort();
      abortControllerRef.current = new AbortController();

      currentEndpointRef.current = endpoint;
      setStatus("connecting");
      setApiData(null);
      setInvalidReason("");

      try {
        const response: any = await getExternalApi({
          url: endpoint,
          options,
          signal: abortControllerRef?.current?.signal,
        });

        if (!response?.error) {
          const responseData = await response.data;
          const classification = classifyApiResponse(responseData);
          if (classification.ok === false) {
            setApiData(null);
            setInvalidReason(classification.reason);
            setStatus("invalid");
            return;
          }
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
      setInvalidReason("");
    };
  }, []);

  return {
    data: apiData,
    status,
    invalidReason,
    fetchApiData,
  };
};

export default useIntegrationField;
