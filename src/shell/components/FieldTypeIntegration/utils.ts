import { IntegrationKeyPaths } from "../../services/types";

interface KeyValuePair<T = unknown> {
  key: string;
  value: T;
}

function getKeyValuePairs(obj: object, prefix: string = ""): KeyValuePair[] {
  const result: KeyValuePair[] = [];

  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const currentKey = prefix ? `${prefix}.${key}` : key;
      const value = (obj as Record<string, unknown>)[key];

      if (
        typeof value === "object" &&
        value !== null &&
        !Array.isArray(value)
      ) {
        result.push(...getKeyValuePairs(value, currentKey));
      } else {
        result.push({
          key: currentKey,
          value: value,
        });
      }
    }
  }

  return result;
}

function getKeyPaths(obj: object, prefix: string = ""): string[] {
  const result: string[] = [];

  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const currentKey = prefix ? `${prefix}.${key}` : key;
      const value = (obj as Record<string, unknown>)[key];

      if (
        typeof value === "object" &&
        value !== null &&
        !Array.isArray(value)
      ) {
        result.push(...getKeyPaths(value, currentKey));
      } else {
        result.push(currentKey);
      }
    }
  }

  return result;
}

const getKeyValue = (obj: object, path: string) => {
  if (!obj || !path) return "";
  return path?.split(".").reduce((acc, key) => {
    return acc?.[key as keyof typeof acc];
  }, obj) as any;
};

const validateUrl = (url: string) => {
  const validProtocols = ["http://", "https://"];

  const hasValidProtocol = validProtocols.some((protocol) =>
    url.startsWith(protocol)
  );
  if (!hasValidProtocol) return false;
  try {
    new URL(url);
    return true;
  } catch (_) {
    return false;
  }
};

function arrayToKeyValuePairs(arr: any[]) {
  if (!arr?.length) return {};
  return arr?.reduce((acc: any, obj: any) => {
    acc[obj.key] = obj.value;
    return acc;
  }, {});
}

function keyValuePairsToArray(
  obj: Record<string, any>
): { key: string; value: any }[] {
  if (!obj) return [];
  return Object.entries(obj).map(([key, value]) => ({
    key,
    value,
  }));
}

function createInitialValues(
  config: Array<{ name: string }>
): Record<string, string> {
  if (!config?.length) return {};
  return config.reduce((acc, item) => {
    acc[item.name] = "";
    return acc;
  }, {} as Record<string, string>);
}

function generateItemId(item: any, integrationKeyPaths: IntegrationKeyPaths) {
  const headingText = getKeyValue(item, integrationKeyPaths?.heading) || "";
  const subHeadingText =
    getKeyValue(item, integrationKeyPaths?.subHeading) || "";
  const detailText = getKeyValue(item, integrationKeyPaths?.detail) || "";
  const detailsText = !integrationKeyPaths?.details
    ? ""
    : integrationKeyPaths?.details
        ?.map((detail) => getKeyValue(item, detail))
        .join("-");

  const textId = `${headingText}${subHeadingText}${detailText}${detailsText}`;

  return textId?.replace(/\s+/g, "_")?.toLowerCase().trim();
}

export {
  getKeyValuePairs,
  getKeyPaths,
  getKeyValue,
  validateUrl,
  arrayToKeyValuePairs,
  keyValuePairsToArray,
  createInitialValues,
  generateItemId,
};
