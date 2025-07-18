import { useEffect, useMemo, useState } from "react";
import { ContentItem, ContentModel } from "../services/types";
import {
  useGetContentModelsQuery,
  useGetLangsQuery,
  useSearchContentQuery,
} from "../services/instance";
import { useGetUsersQuery } from "../services/accounts";
import { BlockModel } from "../../shell/views/SearchPage/List/Block";

type UsersMap = Record<string, string>;
type LanguageMap = Record<string, { code: string }>;

type SearchResult = {
  blocks: BlockModel[];
  setBlockKeyword: (term: string) => void;
  isLoading: boolean;
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

export const useSearchBlocksByKeyword = (): SearchResult => {
  const [searchTerm, setSearchTerm] = useState("");

  const { data: modelsRaw, isLoading: isLoadingModels } =
    useGetContentModelsQuery();
  const { data: contentsRaw, isLoading: isLoadingContents } =
    useSearchContentQuery({ query: "", limit: 10000 });

  const { data: users = [], isLoading: isLoadingUsers } = useGetUsersQuery();
  const { data: languages = [], isLoading: isLoadingLanguages } =
    useGetLangsQuery({});

  const isLoading =
    isLoadingModels ||
    isLoadingContents ||
    isLoadingUsers ||
    isLoadingLanguages;

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

  const modelsMap = useMemo(
    () =>
      !!modelsRaw?.length &&
      Object.fromEntries(modelsRaw?.map((model) => [model?.ZUID, model])),
    [modelsRaw]
  );

  const normalizedSearch = searchTerm.toLowerCase()?.trim();

  const parsedBlocks = useMemo(() => {
    if (isLoading) return [];

    const processedModels = !modelsRaw?.length
      ? []
      : modelsRaw?.map((model) => ({
          ZUID: model?.ZUID,
          label: model?.label,
          type: model?.type,
          contentModelLabel: null,
          contentModelZUID: null,
          updatedAt: model?.updatedAt,
          createdAt: model?.createdAt,
          createdByUserZUID: model?.createdByUserZUID,
          langID: null,
        }));

    const processedContent = !contentsRaw?.length
      ? []
      : contentsRaw?.map((item) => {
          const parentModel = modelsMap?.[item?.meta?.contentModelZUID] || null;
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
        if (item.type !== "block") return false;
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
    contentsRaw,
    modelsRaw,
    languageMap,
    usersMap,
    normalizedSearch,
  ]);

  return {
    blocks: parsedBlocks,
    setBlockKeyword: setSearchTerm,
    isLoading,
  };
};
