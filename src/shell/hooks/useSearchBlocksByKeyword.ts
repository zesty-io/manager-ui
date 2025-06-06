import { useState, useMemo } from "react";
import { isEmpty } from "lodash";

import { ContentModel, Language, User } from "../services/types";
import {
  useGetContentModelsQuery,
  useGetLangsQuery,
  useSearchContentQuery,
} from "../services/instance";
import { useGetUsersQuery } from "../services/accounts";
import { BlockModel } from "../../shell/views/SearchPage/List/Block";

type UseSearchBlocksByKeyword = [
  BlockModel[],
  (searchTerm: string) => void,
  boolean
];

const toProperCase = (str: string) => {
  if (!str) return "";
  return str
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")
    .trim();
};

export const useSearchBlocksByKeyword: () => UseSearchBlocksByKeyword = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const { data: models, isLoading: isLoadingModels } =
    useGetContentModelsQuery();

  const { data: contentItems, isLoading: isLoadingContentItems } =
    useSearchContentQuery({
      query: "",
      order: "created",
      dir: "desc",
      limit: 10000,
    });
  const { data: users, isLoading: isLoadingUsers } = useGetUsersQuery();
  const { data: languages, isLoading: isLoadingLanguages } = useGetLangsQuery(
    {}
  );

  const isLoading =
    isLoadingModels ||
    isLoadingContentItems ||
    isLoadingLanguages ||
    isLoadingUsers;

  const blockModels = useMemo(() => {
    if (isLoading) return [];

    const term = searchTerm?.toLowerCase() || "";

    if (isEmpty(models)) return [];

    const modelsMap = Object.fromEntries(
      (models || []).map((item) => [item.ZUID, item])
    );

    const usersMap = Object.fromEntries(
      (users || []).map((item) => [
        item.ZUID,
        `${item.firstName} ${item.lastName}`.toLowerCase(),
      ])
    );

    const languageMap = Object.fromEntries(
      (languages || []).map((item) => [item.ID, item])
    );

    const getCreatorName = (zuid: string) =>
      toProperCase(usersMap[zuid] || zuid) || null;

    const filteredBlockModels = (models || [])
      .filter((model) => model.type === "block")
      .map((model) => ({
        ...model,
        createdByUserName: getCreatorName(model.createdByUserZUID),
        isVariant: false,
      }));

    const blockModelZUIDs = new Set(
      filteredBlockModels.map((model) => model.ZUID)
    );
    const flattenedContentItems = (contentItems || [])
      .map((content) => ({
        ...content?.meta,
        ...content?.data,
        ...content?.web,
      }))
      .filter((item) => blockModelZUIDs.has(item?.contentModelZUID))
      .map((item) => ({
        ZUID: item.ZUID,
        label: item.metaTitle || item.metaLinkText,
        contentModelZUID: item.contentModelZUID,
        contentModelLabel:
          modelsMap[item.contentModelZUID]?.label ||
          modelsMap[item.contentModelZUID]?.metaTitle,
        masterZUID: item.masterZUID,
        parentZUID: item.parentZUID,
        createdAt: item.createdAt,
        createdByUserZUID: item.createdByUserZUID,
        createdByUserName: getCreatorName(item.createdByUserZUID),
        updatedAt: item.updatedAt,
        langID: item?.langID || null,
        isVariant: true,
      }));

    const combinedBlockModels = [
      ...filteredBlockModels,
      ...flattenedContentItems,
    ].map((block: BlockModel) => ({
      ...block,
      langID: block.langID || null,
      lang: languageMap[block.langID]?.code || null,
      isVariant: !!block.isVariant,
    }));

    if (!term) return combinedBlockModels;

    return combinedBlockModels.filter((model) =>
      [
        "label",
        "ZUID",
        "contentModelZUID",
        "contentModelLabel",
        "createdByUserZUID",
        "createdByUserName",
      ].some((prop: keyof typeof model) =>
        model[prop]?.toLowerCase().includes(term)
      )
    );
  }, [models, searchTerm, contentItems, languages, users, isLoading]);

  return [blockModels, setSearchTerm, isLoading || isLoadingModels];
};
