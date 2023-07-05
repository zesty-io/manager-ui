import { isEmpty } from "lodash";
import { Database } from "@zesty-io/material";
import {
  Create,
  SvgIconComponent,
  CodeRounded,
  ImageRounded,
  FolderRounded,
} from "@mui/icons-material";
import { ContentItem, ResourceType } from "../../services/types";

export const getContentTitle = (
  content: ContentItem,
  languages: any
): string => {
  if (isEmpty(content)) {
    return "";
  }

  const title = content?.web?.metaTitle || "Missing Meta Title";
  const langCode = languages.find(
    (lang: any) => lang.ID === content?.meta?.langID
  )?.code;
  const langDisplay = langCode ? `(${langCode}) ` : null;

  return langDisplay ? `${langDisplay}${title}` : title;
};

export const getItemIcon = (type: ResourceType, subType?: string) => {
  let icon;

  switch (type) {
    case "content":
      icon = Create;
      break;

    case "schema":
      icon = Database as SvgIconComponent;
      break;

    case "code":
      icon = CodeRounded;
      break;

    case "media":
      if (subType === "item") {
        icon = ImageRounded;
      }

      if (subType === "folder") {
        icon = FolderRounded;
      }

      break;

    default:
      break;
  }

  return icon;
};
