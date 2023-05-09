import { isEmpty } from "lodash";
import { ContentItem } from "../../services/types";

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
