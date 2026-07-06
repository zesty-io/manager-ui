export const isObj = (v: unknown): v is object =>
  typeof v === "object" && v !== null;

export const getObjectKeyPaths = (obj: object): string[] => {
  const acc: string[] = [];
  const walk = (node: object, prefix: string): void => {
    const arr = Array.isArray(node);
    for (const key in node) {
      if (!Object.prototype.hasOwnProperty.call(node, key)) continue;
      const value = (node as Record<string, unknown>)[key];
      const path = prefix
        ? arr
          ? `${prefix}[${key}]`
          : `${prefix}.${key}`
        : key;
      if (isObj(value)) walk(value, path);
      else acc.push(path);
    }
  };
  walk(obj, "");
  return acc;
};

export const getAllArrayKeyPaths = (obj: object): string[] => {
  const acc: string[] = [];
  const walk = (node: object, prefix: string): void => {
    const arr = Array.isArray(node);
    for (const key in node) {
      if (!Object.prototype.hasOwnProperty.call(node, key)) continue;
      const value = (node as Record<string, unknown>)[key];
      const path = prefix
        ? arr
          ? `${prefix}[${key}]`
          : `${prefix}.${key}`
        : key;
      if (Array.isArray(value)) {
        if (value.some(isObj)) acc.push(path);
        walk(value, path);
      } else if (isObj(value)) {
        walk(value, path);
      }
    }
  };
  walk(obj, "");
  return acc;
};
