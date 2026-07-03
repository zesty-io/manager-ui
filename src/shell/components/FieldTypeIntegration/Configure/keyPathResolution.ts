import { get } from "lodash";
import { IntegrationKeyPaths } from "../../../services/types";

const isObj = (v: unknown): v is object => typeof v === "object" && v !== null;

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

/**
 * Checks whether a saved IntegrationKeyPaths config still resolves against a
 * (possibly new) API response shape. Used when a user changes an integration
 * field's endpoint during an update — the old keyPaths may point at fields
 * that no longer exist in the new response.
 */
export const doKeyPathsResolve = (
  apiData: unknown,
  keyPaths: IntegrationKeyPaths | null
): boolean => {
  if (!keyPaths || !isObj(apiData)) return true;

  // An empty/unset rootPath means the response array itself is the root,
  // matching the convention used when rendering saved items (see Select).
  const rootData = keyPaths.rootPath
    ? get(apiData, keyPaths.rootPath)
    : apiData;
  if (!Array.isArray(rootData) || !rootData.length) return false;

  const sample = rootData[0];
  const fieldsToCheck = [
    keyPaths.heading,
    keyPaths.subHeading,
    keyPaths.thumbnail,
    keyPaths.detail,
    ...(keyPaths.details || []),
  ].filter((path): path is string => !!path);

  if (!fieldsToCheck.length) return true;

  return fieldsToCheck.every((path) => get(sample, path) !== undefined);
};
