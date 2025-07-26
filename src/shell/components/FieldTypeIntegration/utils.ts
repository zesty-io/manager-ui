import { IntegrationRequestHeaders } from "../../services/types";
import { ApiResponse } from "./configs";

export function getKeyValue<T, K extends string>(obj: T, path: K): any {
  if (!obj || !path) return undefined;

  const keys = path.split(".").flatMap((part) => {
    const arrayMatch = part.match(/([^\[]+)?\[(\d+)\]/);
    if (arrayMatch) {
      const [, prop, index] = arrayMatch;
      return prop ? [prop, index] : [index];
    }
    return [part];
  });

  return keys.reduce((acc: any, key) => {
    if (acc === null || acc === undefined) return undefined;
    return acc[key];
  }, obj);
}

export const fetchApi = async <T = unknown>({
  endpoint,
  headers,
}: {
  endpoint: string;
  headers?: IntegrationRequestHeaders | null;
}): Promise<ApiResponse<T>> => {
  try {
    const reqOptions: RequestInit = {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(headers || {}),
      },
    };

    const fetchResponse = await fetch(endpoint, reqOptions);
    const response = await (() => {
      if (!fetchResponse.ok) {
        return fetchResponse
          .json()
          .then((errorData) => ({
            status: "error" as const,

            data: errorData as T,
          }))
          .catch(() => ({
            status: "error" as const,
            data: fetchResponse.statusText as T,
          }));
      }
      return fetchResponse.json().then((data) => ({
        status: "success" as const,
        data: data as T,
      }));
    })();

    return response;
  } catch (error) {
    return {
      status: "error",
      data: (error.message || "Unknown error") as T,
    };
  }
};
