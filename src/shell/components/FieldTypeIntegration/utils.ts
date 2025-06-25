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

function getValuePaths(obj: object, prefix: string = ""): string[] {
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
        result.push(...getValuePaths(value, currentKey));
      } else {
        result.push(currentKey);
      }
    }
  }

  return result;
}

const getObjectValue = (obj: object, path: string) => {
  if (!obj || !path) return "";
  return path?.split(".").reduce((acc, key) => {
    return acc?.[key as keyof typeof acc];
  }, obj) as any;
};

// function validateUrl(str: string): boolean {
//   try {
//     const url = new URL(str);
//     return ["http://", "https://", "ftp://"].includes(url.protocol);
//   } catch (_) {
//     return false;
//   }
// }

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
  return arr?.reduce((acc: any, obj: any) => {
    acc[obj.key] = obj.value;
    return acc;
  }, {});
}

export {
  getKeyValuePairs,
  getValuePaths,
  getObjectValue,
  validateUrl,
  arrayToKeyValuePairs,
};
