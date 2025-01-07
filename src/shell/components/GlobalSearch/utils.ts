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
  function customSort(
    searchResult: SearchResult
  ): [number, number, number, number, string] {
    const isExactMatch = searchResult?.text === searchString ? 1 : 0;

    const isPrefixMatch = searchResult?.text?.startsWith(searchString) ? 1 : 0;

    const depth = (searchResult?.text?.match(/\//g) || [])?.length;

    const matchingChars = getMatchingCharacterCount(
      searchResult?.text,
      searchString
    );

    return [
      -isExactMatch,
      -isPrefixMatch,
      -matchingChars,
      depth,
      searchResult.text,
    ];
  }
  function getMatchingCharacterCount(
    text: string,
    searchString: string
  ): number {
    let matchCount = 0;
    for (let i = 0; i < searchString?.length; i++) {
      if (text?.[i] === searchString?.[i]) {
        matchCount++;
      } else {
        break;
      }
    }
    return matchCount;
  }

  return searchResults.sort((a, b) => {
    const [matchA, prefixA, matchingCharsA, depthA, textA] = customSort(a);
    const [matchB, prefixB, matchingCharsB, depthB, textB] = customSort(b);

    if (matchA !== matchB) {
      return matchA - matchB;
    }

    if (prefixA !== prefixB) {
      return prefixA - prefixB;
    }

    if (matchingCharsA !== matchingCharsB) {
      return matchingCharsB - matchingCharsA;
    }
    if (depthA !== depthB) {
      return depthA - depthB;
    }

    return textB.localeCompare(textA);
  });
};
