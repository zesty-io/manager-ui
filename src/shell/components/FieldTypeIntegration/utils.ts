import { IntegrationKeyPaths } from "../../services/types";

interface KeyValuePair<T = unknown> {
  key: string;
  value: T;
}

function getObjectKeyPaths<T extends object>(
  obj: T,
  prefix: string = ""
): string[] {
  const result: string[] = [];

  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const currentKey = prefix ? `${prefix}.${key}` : key;
      const value = (obj as Record<string, unknown>)[key];

      if (typeof value === "object" && value !== null) {
        if (Array.isArray(value)) {
          value.forEach((arrayElement, index) => {
            const arrayKey = `${currentKey}[${index}]`;
            if (typeof arrayElement === "object" && arrayElement !== null) {
              result.push(...getObjectKeyPaths(arrayElement, arrayKey));
            } else {
              result.push(arrayKey);
            }
          });
        } else {
          result.push(...getObjectKeyPaths(value, currentKey));
        }
      } else {
        result.push(currentKey);
      }
    }
  }

  return result;
}

function getAllArrayKeyPaths<T extends object>(
  obj: T,
  prefix: string = ""
): string[] {
  const result: string[] = [];

  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const currentKey = prefix ? `${prefix}.${key}` : key;
      const value = (obj as Record<string, unknown>)[key];

      if (Array.isArray(value)) {
        if (value.length > 0 && typeof value[0] === "object") {
          result.push(currentKey);
        }

        value.forEach((item, index) => {
          if (typeof item === "object" && item !== null) {
            result.push(
              ...getAllArrayKeyPaths(item, `${currentKey}[${index}]`)
            );
          }
        });
      } else if (typeof value === "object" && value !== null) {
        result.push(...getAllArrayKeyPaths(value, currentKey));
      }
    }
  }

  return result;
}

function getKeyValue<T, K extends string>(obj: T, path: K): any {
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

function generateItemId(item: any, keyPaths: IntegrationKeyPaths) {
  const headingText = getKeyValue(item, keyPaths?.heading) || "";
  const subHeadingText = getKeyValue(item, keyPaths?.subHeading) || "";
  const thumbnailText = getKeyValue(item, keyPaths?.thumbnail) || "";
  const detailText = getKeyValue(item, keyPaths?.detail) || "";
  const detailsText = !keyPaths?.details
    ? ""
    : keyPaths?.details?.map((detail) => getKeyValue(item, detail)).join("");

  const textId = `${headingText}${subHeadingText}${thumbnailText}${detailText}${detailsText}`;

  return textId
    ?.replace(/[\/:;&*%$#@!?=\s+]/g, "")
    ?.toLowerCase()
    .trim();
}

export {
  getKeyValue,
  validateUrl,
  arrayToKeyValuePairs,
  keyValuePairsToArray,
  createInitialValues,
  generateItemId,
  getObjectKeyPaths,
  getAllArrayKeyPaths,
};
