import { Dispatch } from "redux";
import { searchItems } from "../../../shell/store/content";

export const normalizePath = (path?: string) => {
  if (!path) return "/";
  const decoded = decodeURIComponent(path.trim());
  if (!decoded || decoded === "/") return "/";
  const withLeading = decoded.startsWith("/") ? decoded : `/${decoded}`;
  const trimmedTrailing = withLeading.replace(/\/+$/, "");
  if (!trimmedTrailing) return "/";
  return `${trimmedTrailing}/`;
};

export const getItemPath = (item: any) => {
  const path = item?.web?.path;
  const pathPart = item?.web?.pathPart;
  if (path) return normalizePath(path);
  if (pathPart === "zesty_home") return "/";
  if (pathPart) return normalizePath(pathPart);
  return null;
};

export const findItemByPath = (
  path: string,
  contentItems: Record<string, any>
) => {
  const normalized = normalizePath(path);
  return (
    Object.values(contentItems || {}).find((item: any) => {
      const itemPath = getItemPath(item);
      return itemPath === normalized;
    }) || null
  );
};

export const resolveItemByPath = async ({
  path,
  contentItems,
  dispatch,
}: {
  path: string;
  contentItems: Record<string, any>;
  dispatch: Dispatch<any>;
}) => {
  const normalized = normalizePath(path);
  const cached = findItemByPath(normalized, contentItems);
  if (cached) {
    // @ts-ignore
    await dispatch(searchItems(normalized, { limit: 1, field: "path" }));
    return cached;
  }

  // @ts-ignore
  await dispatch(searchItems(normalized, { limit: 1, field: "path" }));
  return findItemByPath(normalized, contentItems);
};
