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

export const splitTextAndAccelerator = (
  source: string
): { text: string; resourceType: string | null } => {
  // Matches any string with the format `[in:TEXT HERE]`
  const acceleratorRegex = /\[in:.*?\]/g;
  // Matches anything in between `[in:` and `]`
  const resourceRegex = /(?<=\[in:).*?(?=\])/g;

  /**
   * Remove the accelerator.
   * Example: `[in:schema] Fancy yachts` -> output: Fancy yachts
   */
  const text = source.replace(acceleratorRegex, "").trim();

  /**
   * Get the resource type inside the accelerator.
   * Example: `[in:schema] Fancy yachts` -> output: schema
   */
  const resourceType = source.match(resourceRegex)?.length
    ? source.match(resourceRegex)[0]
    : null;

  return { text, resourceType };
};

export interface SearchResult {
  text: string;
  value: string;
}

export const sortMostRelevantSearch = (
  searchResults: SearchResult[],
  searchString: string
): SearchResult[] => {
  const normalize = (stringVal: string) => stringVal.replace(/^\/|\/$/g, "");

  return searchResults.sort((a, b) => {
    const normalizedSearch = normalize(searchString);
    const normalizedA = normalize(a.text);
    const normalizedB = normalize(b.text);

    // 1. Exact match (normalized)
    const isExactMatchA = normalizedA === normalizedSearch;
    const isExactMatchB = normalizedB === normalizedSearch;

    if (isExactMatchA && !isExactMatchB) return -1;
    if (!isExactMatchA && isExactMatchB) return 1;

    // 2. URLs starting with the search string
    const startsWithSearchA = normalizedA.startsWith(normalizedSearch);
    const startsWithSearchB = normalizedB.startsWith(normalizedSearch);

    if (startsWithSearchA && !startsWithSearchB) return -1;
    if (!startsWithSearchA && startsWithSearchB) return 1;

    // 3. URLs containing the search string
    const containsSearchA = normalizedA.includes(normalizedSearch);
    const containsSearchB = normalizedB.includes(normalizedSearch);

    if (containsSearchA && !containsSearchB) return -1;
    if (!containsSearchA && containsSearchB) return 1;

    // 4. Compare by nested levels (fewer segments come first)
    const nestedLevelA = a.text.split("/").filter(Boolean).length;
    const nestedLevelB = b.text.split("/").filter(Boolean).length;

    if (nestedLevelA !== nestedLevelB) return nestedLevelA - nestedLevelB;

    // 5. Alphabetical order
    return normalizedA.localeCompare(normalizedB);
  });
};
