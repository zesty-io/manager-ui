import { useEffect, useMemo, useState } from "react";
import { ContentItem, ContentModel, Language, User } from "../services/types";
import { BlockModel } from "../../shell/views/SearchPage/List/Block";
import { AppState } from "shell/store/types";
import { useSelector } from "react-redux";

type UsersMap = Record<string, string>;
type LanguageMap = Record<string, { code: string }>;

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

export const useSearchBlocksByKeyword = (
  contents?: ContentItem[],
  isLoading?: boolean
): SearchResult => {
  const [searchTerm, setSearchTerm] = useState("");
  const [blockVariants, setBlockVariants] = useState([]);

  const modelsRaw: ContentModel[] = useSelector(
    (state: AppState) => state?.models
  );
  const users: User[] = useSelector((state: AppState) => state?.users);
  const languages: Language[] = useSelector(
    (state: AppState) => state?.languages
  );

  const normalizedSearch = searchTerm.toLowerCase()?.trim();

  const blockModels = useMemo<BlockModel[]>(() => {
    if (!Object.values(modelsRaw)?.length) return [];
    return Object.values(modelsRaw)
      ?.filter((block: ContentModel) => block?.type === "block")
      .map((block) => block as unknown as BlockModel);
  }, [modelsRaw]);

  const blockModelsMap = useMemo(
    () =>
      !!blockModels?.length &&
      Object.fromEntries(blockModels?.map((model) => [model?.ZUID, model])),
    [blockModels]
  );

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
      !!languages?.length &&
      Object.fromEntries(languages?.map((lang) => [lang?.ID, lang])),
    [languages]
  );

  useEffect(() => {
    if (!normalizedSearch) return;
    const blockModelZUIDs = blockModels?.map((block) => block?.ZUID);
    const langIDs = Object.keys(languageMap);
    const variants = !contents?.length
      ? []
      : contents?.filter(
          (content: ContentItem) =>
            blockModelZUIDs?.includes(content?.meta?.contentModelZUID) &&
            langIDs?.includes(String(content?.meta?.langID))
        );
    setBlockVariants(variants);
  }, [normalizedSearch, blockModels, languageMap, contents]);

  const parsedBlocks: BlockModel[] = useMemo(() => {
    if (isLoading) return [];

    const processedModels: BlockModel[] = !blockModels?.length
      ? []
      : blockModels?.map((model: BlockModel) => ({
          ZUID: model?.ZUID,
          label: model?.label,
          type: model?.type,
          contentModelLabel: "",
          contentModelZUID: "",
          updatedAt: model?.updatedAt,
          createdAt: model?.createdAt,
          createdByUserZUID: model?.createdByUserZUID,
          langID: null,
          url: `/blocks/${model?.ZUID}`,
        }));

    const processedContent = !blockVariants?.length
      ? []
      : blockVariants?.map((item) => {
          const parentModel =
            blockModelsMap?.[item?.meta?.contentModelZUID] || null;
          return {
            ZUID: item?.meta?.ZUID,
            label: item?.web?.metaTitle || item?.web?.metaLinkText,
            type: !parentModel ? null : parentModel?.type,
            contentModelZUID: item?.meta?.contentModelZUID,
            contentModelLabel: !parentModel
              ? null
              : parentModel?.label || parentModel?.metaTitle,
            updatedAt: item?.meta?.updatedAt || item?.web?.updatedAt,
            createdAt: item?.meta?.createdAt || item?.web?.createdAt,
            createdByUserZUID:
              item?.meta?.createdByUserZUID || item?.web?.createdByUserZUID,
            langID: item?.meta?.langID,
            url: `/blocks/${item?.meta?.contentModelZUID}/${item?.meta?.ZUID}`,
          };
        });

    return [...processedModels, ...processedContent]
      .map((item) => ({
        ...item,
        lang: languageMap[item.langID]?.code,
        createdByUserName: toProperCase(usersMap[item.createdByUserZUID] || ""),
        title: item.label,
      }))
      .filter((item) => {
        if (!normalizedSearch) return true;

        const searchFields = [
          item.ZUID,
          item.label,
          item.createdByUserName,
          item.title,
          item.contentModelZUID,
          item.type,
          item.contentModelLabel,
        ]
          .join("\n")
          .toLowerCase();

        return searchFields.includes(normalizedSearch);
      });
  }, [
    isLoading,
    blockVariants,
    blockModels,
    languageMap,
    usersMap,
    blockModelsMap,
    normalizedSearch,
  ]);

  return {
    blocks: parsedBlocks,
    setBlockKeyword: setSearchTerm,
  };
};
