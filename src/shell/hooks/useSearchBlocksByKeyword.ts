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

const processData = (contentItems: ContentItem[], models: ContentModel[]) => {
  const modelsMap = Object.fromEntries(
    models.map((model) => [model.ZUID, model])
  );

  const processedModels = models.map((model) => ({
    ZUID: model.ZUID,
    label: model.label,
    type: model.type,
    contentModelLabel: null,
    contentModelZUID: null,
    updatedAt: model.updatedAt,
    createdAt: model.createdAt,
    createdByUserZUID: model.createdByUserZUID,
    langID: null,
  }));

  const processedContent = contentItems.map((item) => {
    const parentModel = modelsMap[item?.meta?.contentModelZUID];
    return {
      ZUID: item?.meta?.ZUID,
      label: item?.web?.metaTitle || item?.web?.metaLinkText,
      type: parentModel?.type,
      contentModelZUID: item?.meta?.contentModelZUID,
      contentModelLabel: parentModel?.label || parentModel?.metaTitle,
      updatedAt: item?.meta?.updatedAt || item?.web?.updatedAt,
      createdAt: item?.meta?.createdAt || item?.web?.createdAt,
      createdByUserZUID:
        item?.meta?.createdByUserZUID || item?.web?.createdByUserZUID,
      langID: item?.meta?.langID,
    };
  });

  return [...processedModels, ...processedContent];
};

export const useSearchBlocksByKeyword = (): SearchResult => {
  const [searchTerm, setSearchTerm] = useState("");
  const [blocks, setBlocks] = useState<BlockModel[]>([]);

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

  const allUsers = useMemo<UsersMap>(
    () =>
      Object.fromEntries(
        users.map((user) => [
          `${user.firstName} ${user.lastName}`.toLowerCase(),
          user.ZUID,
        ])
      ),
    [users]
  );

  const usersMap = useMemo<UsersMap>(
    () =>
      Object.fromEntries(
        users.map((user) => [
          user.ZUID,
          `${user.firstName} ${user.lastName}`.toLowerCase(),
        ])
      ),
    [users]
  );

  const languageMap = useMemo<LanguageMap>(
    () => Object.fromEntries(languages.map((lang) => [lang.ID, lang])),
    [languages]
  );

  const normalizedSearch = searchTerm.toLowerCase()?.trim();
  const matchedUserZUID = allUsers[normalizedSearch];

  const parsedBlocks = useMemo(() => {
    if (isLoading) return [];

    const parsedData = processData(contentsRaw, modelsRaw);

    return parsedData
      ?.filter((item) => item?.type === "block")
      ?.map((item) => {
        return {
          ...item,
          lang: languageMap?.[item?.langID]?.code,
          createdByUserName: !usersMap?.[item?.createdByUserZUID]
            ? ""
            : toProperCase(usersMap?.[item?.createdByUserZUID]),
          title: item?.label,
        };
      });
  }, [isLoading, contentsRaw, modelsRaw, languageMap, usersMap]);

  useEffect(() => {
    if (isLoading) return;
    const filteredBlocks = parsedBlocks?.filter((item) => {
      const searchString = `${item?.ZUID}\n
        ${item?.label}\n
        ${item?.createdByUserName}\n
        ${item?.title}\n
        ${item?.contentModelZUID}\n
        ${item?.type}\n${item?.contentModelLabel}}`?.toLowerCase();
      return searchString?.includes(normalizedSearch);
    });

    setBlocks(filteredBlocks);
  }, [parsedBlocks, normalizedSearch, matchedUserZUID, isLoading]);
  return {
    blocks: blocks,
    setBlockKeyword: setSearchTerm,
    isLoading,
  };
};
