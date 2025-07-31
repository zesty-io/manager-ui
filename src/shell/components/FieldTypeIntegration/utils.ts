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
  signal,
}: {
  endpoint: string;
  headers?: Record<string, string>;
  signal?: AbortSignal;
}): Promise<{ status: "success" | "error"; data: T }> => {
  try {
    const response = await fetch(endpoint, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(headers || {}),
      },
      signal,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return { status: "success", data };
  } catch (error) {
    return {
      status: "error",
      data: (error.message || "Unknown error") as T,
    };
  }
};
