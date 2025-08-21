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
