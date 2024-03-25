import { Audit } from "../shell/services/types";

export const resolveUrlFromAudit = (
  { resourceType, meta, affectedZUID }: Audit,
  category?: string
): string => {
  switch (resourceType) {
    case "content":
      const primaryZUID = meta.uri.split("/")[4];
      return `/content/${primaryZUID}/${affectedZUID}`;
    case "schema":
      return `/schema/${affectedZUID}`;
    case "code":
      const codeType = meta.uri.split("/")[3];
      return `/code/file/${codeType}/${affectedZUID}`;
    case "settings":
      return category ? `/settings/instance/${category}` : "/settings";
    default:
      return "/";
  }
};
