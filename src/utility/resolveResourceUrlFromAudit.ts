import { Audit } from "../shell/services/types";

export const resolveUrlFromAudit = ({ resourceType, meta }: Audit): string => {
  const primaryZUID = meta.uri.split("/")[4];
  const secondaryZUID = meta.uri.split("/")[6];
  switch (resourceType) {
    case "content":
      return `/content/${primaryZUID}/${secondaryZUID}`;
    case "schema":
      return `/schema/${primaryZUID}`;
    case "code":
      const codeType = meta.uri.split("/")[3];
      return `/code/file/${codeType}/${primaryZUID}`;
    default:
      return "/";
  }
};
