import { IntegrationKeyPaths } from "shell/services/types";
import { ApiDataProps } from "./configs";

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

export const keyPathValuesToString = (
  item: ApiDataProps,
  keyPaths: IntegrationKeyPaths
) => {
  const validValues = Object.values(keyPaths)
    ?.filter((value) => {
      if (Array.isArray(value)) return value?.length > 0;
      return value !== "";
    })
    ?.flat();
  const idParts = validValues?.map((key) => {
    const value = item?.[key] || "";
    return typeof value === "string" ? value?.replace(/\s+/g, "") : value;
  });

  return idParts?.join(";");
};
