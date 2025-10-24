import { useMemo, useState } from "react";
import {
  useGetAllPublishingsQuery,
  useGetContentModelsQuery,
  useGetLangsQuery,
  useSearchContentQuery,
} from "../../../../../../shell/services/instance";
import {
  ContentModel,
  Language,
  Publishing,
} from "../../../../../../shell/services/types";
import { ContentItemProps } from "./constants";
import { PublishingsMap } from "./CreateRedirects/CreateForm";

const useContentItems = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const { data: contentItems, isFetching: isFetchingContentItems } =
    useSearchContentQuery({
      query: searchTerm,
      order: "created",
      dir: "desc",
      limit: 5,
    });

  const { data: publishings, isLoading: isLoadingPublishings } =
    useGetAllPublishingsQuery();
  const { data: languages, isLoading: isLoadingLanguages } = useGetLangsQuery(
    {}
  );
  const { data: models, isLoading: isLoadingModels } =
    useGetContentModelsQuery();

  const isLoading =
    !!isLoadingPublishings ||
    !!isLoadingLanguages ||
    !!isFetchingContentItems ||
    !!isLoadingModels;

  const publishingMap: PublishingsMap = useMemo(() => {
    if (isLoadingPublishings) return {};
    return [...(publishings || [])]
      .sort((a, b) => a.version - b.version)
      .reduce((acc: PublishingsMap, item: Publishing) => {
        const current = acc[item?.itemZUID];
        if (!current) {
          acc[item.itemZUID] = item;
        } else {
          if (current?.version < item?.version) {
            acc[item.itemZUID] = item;
          }
        }

        return acc;
      }, {});
  }, [publishings, isLoadingPublishings]);

  const languageMap = useMemo(() => {
    if (isLoadingLanguages) return {};
    return [...(languages || [])].reduce(
      (acc: Record<string, Language>, item: Language) => {
        acc[item.ID] = item;
        return acc;
      },
      {}
    );
  }, [languages, isLoadingLanguages]);

  const modelsMap = useMemo(() => {
    if (isLoadingModels) return {};
    return [...(models || [])].reduce(
      (acc: Record<string, ContentModel>, item: ContentModel) => {
        acc[item.ZUID] = item;
        return acc;
      },
      {}
    );
  }, [models, isLoadingModels]);

  const options = useMemo(() => {
    if (isLoading) return [];

    const parseContentItems = contentItems
      ?.filter(
        (result) =>
          result?.web?.path !== null &&
          ["templateset", "pageset"].includes(
            modelsMap?.[result?.meta?.contentModelZUID]?.type
          )
      )
      ?.map((item) => {
        const publishData = publishingMap?.[item?.meta?.ZUID];
        const langCode = languageMap?.[item?.meta?.langID]?.code;
        return {
          ZUID: item?.meta?.ZUID,
          label:
            item?.web?.metaTitle || item?.web?.metaLinkText || item?.web?.path,
          path: item?.web?.path,
          publishAt: item?.publishAt || publishData?.publishAt || null,
          langCode: langCode || "en",
          isPublished:
            !!publishData &&
            publishData?.versionZUID === item?.web?.versionZUID,
          type: modelsMap?.[item?.meta?.contentModelZUID]?.type,
        };
      })
      .sort(
        (a, b) =>
          new Date(b.publishAt).getTime() - new Date(a.publishAt).getTime()
      );
    return parseContentItems as ContentItemProps[];
  }, [contentItems, publishingMap, languageMap, modelsMap, isLoading]);

  return {
    options,
    isLoading,
    setSearchTerm,
  };
};

export { useContentItems };
