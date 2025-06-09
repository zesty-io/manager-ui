import { useEffect, useMemo, useState, useCallback } from "react";
import { ContentItem } from "../services/types";
import {
  useGetContentModelsQuery,
  useGetLangsQuery,
  useLazyGetContentModelItemsQuery,
  useSearchContentQuery,
} from "../services/instance";
import { useGetUsersQuery } from "../services/accounts";
import { BlockModel } from "../../shell/views/SearchPage/List/Block";

const BLOCK_KEYWORDS = new Set([
  "block models",
  "block model",
  "blocks model",
  "blocks models",
]);

type UsersMap = Record<string, string>;
type ModelsMap = Record<string, BlockModel>;
type LanguageMap = Record<string, { code: string }>;

type SearchResult = {
  blocks: BlockModel[];
  setSearchTerm: (term: string) => void;
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

const parseBlockVariant = (
  content: ContentItem,
  model: BlockModel | undefined,
  usersMap: UsersMap,
  languageMap: LanguageMap
): BlockModel => {
  const langValue = languageMap[content?.meta?.langID]?.code || null;
  const titlePrefix = !!langValue ? `(${langValue}) ` : "";
  const blockLabel =
    content?.web?.metaTitle || content?.web?.metaLinkText || "";
  return {
    ...content?.meta,
    ZUID: content?.meta?.ZUID || "",
    label: blockLabel,
    contentModelZUID: content?.meta?.contentModelZUID || "",
    contentModelLabel: model?.label || model?.metaTitle || "",
    createdByUserZUID:
      content?.web?.createdByUserZUID || content?.meta?.createdByUserZUID || "",
    createdByUserName: toProperCase(
      usersMap[content?.web?.createdByUserZUID] ||
        usersMap[content?.meta?.createdByUserZUID]
    ),
    updatedAt: content?.meta?.updatedAt || content?.web?.updatedAt || "",
    langID: content?.meta?.langID || null,
    lang: languageMap[content?.meta?.langID]?.code || null,
    type: "block",
    isVariant: true,
    title: `${titlePrefix}${blockLabel}`,
  };
};

export const useSearchBlocksByKeyword = (): SearchResult => {
  const [searchTerm, setSearchTerm] = useState("");

  const [isLoadingVariants, setIsLoadingVariants] = useState(false);
  const [blockModels, setBlockModels] = useState<BlockModel[]>([]);
  const [blockVariants, setBlockVariants] = useState<BlockModel[]>([]);

  const { data: models = [], isLoading: isLoadingModels } =
    useGetContentModelsQuery();
  const { data: users = [], isLoading: isLoadingUsers } = useGetUsersQuery();
  const { data: languages = [], isLoading: isLoadingLanguages } =
    useGetLangsQuery({});

  const [getBlockItem] = useLazyGetContentModelItemsQuery();

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

  const modelsMap = useMemo<ModelsMap>(
    () => Object.fromEntries(models.map((model) => [model.ZUID, model])),
    [models]
  );

  const languageMap = useMemo<LanguageMap>(
    () => Object.fromEntries(languages.map((lang) => [lang.ID, lang])),
    [languages]
  );

  const normalizedSearch = searchTerm.toLowerCase()?.trim();
  const matchedUserZUID = allUsers[normalizedSearch];

  const { data: contents, isFetching: isFetchingContent } =
    useSearchContentQuery(
      { query: matchedUserZUID || normalizedSearch },
      { skip: !matchedUserZUID && !normalizedSearch }
    );

  const fetchAndProcessVariants = useCallback(
    async (blocks: BlockModel[]) => {
      let isMounted = true;
      setIsLoadingVariants(true);

      try {
        const variants = await Promise.all(
          blocks.map((block) =>
            getBlockItem({ modelZUID: block.ZUID }).then(
              (res) =>
                res.data?.map((item) =>
                  parseBlockVariant(item, block, usersMap, languageMap)
                ) || []
            )
          )
        );

        if (isMounted) {
          setBlockVariants(variants.flat());
        }
      } finally {
        if (isMounted) {
          setIsLoadingVariants(false);
        }
      }

      return () => {
        isMounted = false;
      };
    },
    [getBlockItem, usersMap, languageMap]
  );

  const isLoading =
    isLoadingModels ||
    isLoadingUsers ||
    isLoadingLanguages ||
    isLoadingVariants ||
    isFetchingContent;

  useEffect(() => {
    let isMounted = true;
    if (!normalizedSearch) {
      if (isMounted) {
        setBlockModels([]);
        setBlockVariants([]);
      }
      return;
    }

    if (isLoadingModels || isLoadingUsers || isLoadingLanguages) return;

    const matchedUserZUID = allUsers[normalizedSearch];
    const isBlockKeyword = BLOCK_KEYWORDS.has(normalizedSearch);

    const filteredBlocks: BlockModel[] = models
      .filter((item) => item?.type === "block")
      .map((model: BlockModel) => ({
        ...model,
        createdByUserName: `${toProperCase(usersMap[model.createdByUserZUID])}`,
        isVariant: false,
      }))
      ?.filter(
        (model: BlockModel) =>
          (model?.type === "block" &&
            model.label?.toLowerCase().includes(normalizedSearch)) ||
          model.ZUID === normalizedSearch ||
          (isBlockKeyword && model.type === "block") ||
          model.createdByUserZUID === normalizedSearch ||
          model.createdByUserZUID === matchedUserZUID ||
          usersMap[model.createdByUserZUID]?.includes(normalizedSearch)
      );

    if (isMounted) {
      setBlockModels(filteredBlocks);
    }
    if (contents?.length) {
      const variantsFromSearch = contents?.map((item) => ({
        ...parseBlockVariant(
          item,
          modelsMap[item.meta?.contentModelZUID],
          usersMap,
          languageMap
        ),
        createdByUserName: `${toProperCase(
          usersMap[item?.meta?.createdByUserZUID]
        )}`,
      }));
      if (isMounted) {
        setBlockVariants(variantsFromSearch);
      }
    } else if (filteredBlocks.length) {
      fetchAndProcessVariants(filteredBlocks);
    } else if (isMounted) {
      setBlockVariants([]);
    }

    return () => {
      isMounted = false;
    };
  }, [
    normalizedSearch,
    models,
    contents,
    modelsMap,
    usersMap,
    languageMap,
    allUsers,
    isLoading,
    fetchAndProcessVariants,
  ]);

  return {
    blocks: [...blockModels, ...blockVariants],
    setSearchTerm,
    isLoading,
  };
};
