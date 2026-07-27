import { useEffect, useMemo, useState, useCallback } from "react";
import { ContentItem, ContentModel, Language, User } from "../services/types";
import { BlockModel } from "../../shell/views/SearchPage/List/Block";
import { AppState } from "shell/store/types";
import { useDispatch, useSelector } from "react-redux";
import { fetchItems } from "shell/store/content";

type UsersMap = Record<string, string>;

type LanguageMap = Record<string, { code: string }>;

type SearchBlocksByKeywordProps = {
  isLoading: boolean;
};

type SearchResult = {
  blocks: BlockModel[];
  setBlockKeyword: (term: string) => void;
};

const toProperCase = (str?: string): string => {
  if (!str) return "";
  return str
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")
    .trim();
};

const blockKeywords: string[] = [
  "block",
  "blocks",
  "block model",
  "block models",
  "blocks models",
];

export const useSearchBlocksByKeyword = ({
  isLoading,
}: SearchBlocksByKeywordProps): SearchResult => {
  const dispatch = useDispatch();
  const [searchTerm, setSearchTerm] = useState("");
  const [isFetchingVariants, setIsFetchingVariants] = useState(false);

  const users: User[] = useSelector((state: AppState) => state?.users);
  const languages: Language[] = useSelector(
    (state: AppState) => state?.languages
  );
  const defaultLanguage = Array.isArray(languages)
    ? languages.find((lang: Language) => lang?.default && lang?.active)
    : undefined;

  const models = useSelector((state: AppState) => state?.models);
  const contents = useSelector((state: AppState) => state?.content);

  const usersMap = useMemo<UsersMap>(
    () =>
      !!users?.length &&
      Object.fromEntries(
        users?.map((user) => [
          user?.ZUID,
          `${user?.firstName} ${user?.lastName}`.toLowerCase(),
        ]) || []
      ),
    [users]
  );

  const languageMap = useMemo<LanguageMap>(
    () =>
      Array.isArray(languages) && languages.length
        ? Object.fromEntries(languages.map((lang) => [lang?.ID, lang]))
        : {},
    [languages]
  );

  const normalizedSearchTerm = searchTerm.toLowerCase()?.trim();
  const showAll = blockKeywords.includes(normalizedSearchTerm);

  const blocks = useMemo<BlockModel[]>(() => {
    const modelsArray = models ? Object.values(models) : [];
    if (!modelsArray?.length) {
      return [];
    }

    return (
      modelsArray
        .filter((model: ContentModel) => model?.type === "block")
        .map((model) => model as unknown as BlockModel) || []
    );
  }, [models]);

  const variants = useMemo<ContentItem[] | []>(() => {
    const contentItems = contents ? Object.values(contents) : [];
    if (!contentItems?.length || !blocks?.length || isFetchingVariants) {
      return [];
    }

    const blockModelZUIDs = new Set(blocks.map((block) => block?.ZUID));
    const validLangIDs = new Set(
      Array.isArray(languages) ? languages.map((lang) => lang?.ID) : []
    );

    return contentItems.filter(
      (content: ContentItem) =>
        blockModelZUIDs.has(content?.meta?.contentModelZUID) &&
        validLangIDs.has(content?.meta?.langID)
    );
  }, [contents, blocks, languages, isFetchingVariants]);

  const parsedBlocks: BlockModel[] = useMemo(() => {
    if (isLoading) return [];

    const processedBlocks: BlockModel[] = !blocks
      ? []
      : blocks.map((model: BlockModel) => {
          return {
            ZUID: model?.ZUID,
            label: model?.label,
            title: model?.label,
            chipText: "Blocks",
            type: model?.type,
            contentModelLabel: "",
            contentModelZUID: "",
            updatedAt: model?.updatedAt,
            createdAt: model?.createdAt,
            createdByUserZUID: model?.createdByUserZUID,
            langID: defaultLanguage?.ID,
            url: `/blocks/${model?.ZUID}`,
          };
        });

    const processedVariants = variants.map((item) => {
      const blockModelsMap = blocks.length
        ? Object.fromEntries(blocks.map((model) => [model?.ZUID, model]))
        : {};
      const parentModel =
        blockModelsMap?.[item?.meta?.contentModelZUID] || null;
      const titlePrefix = !item?.meta?.langID
        ? ""
        : `(${languageMap?.[item?.meta?.langID]?.code}) `;
      const chipText = parentModel?.label || parentModel?.metaTitle || null;
      return {
        ZUID: item?.meta?.ZUID,
        label: item?.web?.metaTitle || item?.web?.metaLinkText,
        title: `${titlePrefix}${
          item?.web?.metaTitle || item?.web?.metaLinkText
        }`,
        chipText: !chipText ? "Blocks" : `${chipText} • Blocks`,
        type: parentModel?.type || null,
        contentModelZUID: item?.meta?.contentModelZUID,
        contentModelLabel: parentModel?.label || parentModel?.metaTitle || null,
        updatedAt: item?.meta?.updatedAt || item?.web?.updatedAt,
        createdAt: item?.meta?.createdAt || item?.web?.createdAt,
        createdByUserZUID:
          item?.meta?.createdByUserZUID || item?.web?.createdByUserZUID,
        langID: item?.meta?.langID,
        url: `/blocks/${item?.meta?.contentModelZUID}/${item?.meta?.ZUID}`,
      };
    });

    const allBlocks = [...processedBlocks, ...processedVariants].map((item) => {
      return {
        ...item,
        createdByUserName: toProperCase(usersMap[item.createdByUserZUID] || ""),
      };
    });

    // If search is empty or it's a block keyword, return all items
    if (!normalizedSearchTerm || showAll) {
      return allBlocks;
    }

    // Filter based on search term
    return allBlocks?.filter((block) => {
      const searchFields = [
        block?.ZUID,
        block?.label,
        block?.createdByUserName,
        block?.title,
        block?.contentModelZUID,
        block?.type,
        block?.contentModelLabel,
      ]
        .join("\n")
        .toLowerCase();

      return searchFields.includes(normalizedSearchTerm);
    });
  }, [
    isLoading,
    variants,
    blocks,
    normalizedSearchTerm,
    showAll,
    languageMap,
    usersMap,
  ]);

  const setBlockKeyword = useCallback((term: string) => {
    setSearchTerm(term);
  }, []);

  useEffect(() => {
    // Fetch all block models and variants if user searches for "blockKeywords"
    if (showAll && !!blocks?.length) {
      setIsFetchingVariants(true);
      Promise.all(
        blocks?.map((block) =>
          dispatch(fetchItems(block?.ZUID, { limit: 1000 }))
        )
      ).finally(() => {
        setIsFetchingVariants(false);
      });
    }
  }, [showAll, blocks]);

  return {
    blocks: parsedBlocks,
    setBlockKeyword,
  };
};
