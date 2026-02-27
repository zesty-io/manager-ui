export function getKeyValue<T, K extends string>(obj: T, path: K): any {
  if (!obj || !path) return undefined;

  const keys = path?.split(".").flatMap((part) => {
    const arrayMatch = part?.match(/([^\[]+)?\[(\d+)\]/);
    if (arrayMatch) {
      const [, prop, index] = arrayMatch;
      return prop ? [prop, index] : [index];
    }
    return [part];
  });

  return keys?.reduce((acc: any, key) => {
    if (acc === null || acc === undefined) return undefined;
    return acc[key];
  }, obj);
}

export function findUniqueIdKey(data: any[]) {
  if (!Array.isArray(data) || data.length === 0) return null;

  const firstItem = data[0];
  const keys = Object.keys(firstItem);

  for (const key of keys) {
    const seen = new Set();
    let isValid = true;

    for (let i = 0; i < data.length; i++) {
      const item = data[i];

      // Must be own top-level property
      if (!Object.prototype.hasOwnProperty.call(item, key)) {
        isValid = false;
        break;
      }

      const value = item[key];

      // Must be string or number
      if (
        (typeof value !== "string" && typeof value !== "number") ||
        value === "" ||
        value === null ||
        value === undefined
      ) {
        isValid = false;
        break;
      }

      // Must be unique
      if (seen.has(value)) {
        isValid = false;
        break;
      }

      seen.add(value);
    }

    if (isValid) {
      return key; // Return immediately once found
    }
  }

  return null;
}
