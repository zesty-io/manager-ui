import { useParams as useRouterParams } from "react-router";
import { ContentBreadcrumbs } from "../../components/ContentBreadcrumbs";
import { Box, Button, ThemeProvider, Typography } from "@mui/material";
import {
  useGetAllPublishingsQuery,
  useGetContentModelFieldsQuery,
  useGetContentModelItemsQuery,
  useGetContentModelQuery,
  useGetLangsQuery,
} from "../../../../../../shell/services/instance";
import { theme } from "@zesty-io/material";
import { ItemListEmpty } from "./ItemListEmpty";
import { ItemListActions } from "./ItemListActions";
import { useEffect, useMemo, useRef } from "react";
import { SearchRounded, RestartAltRounded } from "@mui/icons-material";
import noSearchResults from "../../../../../../../public/images/noSearchResults.svg";
import { ItemListFilters } from "./ItemListFilters";
import { useParams } from "../../../../../../shell/hooks/useParams";
import {
  useGetAllBinFilesQuery,
  useGetBinsQuery,
} from "../../../../../../shell/services/mediaManager";
import { useSelector } from "react-redux";
import { AppState } from "../../../../../../shell/store/types";
import { cloneDeep } from "lodash";
import { useStagedChanges } from "./StagedChangesContext";
import { UpdateListActions } from "./UpdateListActions";
import { getDateFilterFnByValues } from "../../../../../../shell/components/Filters/DateFilter/getDateFilter";
import { ItemListTable } from "./ItemListTable";
import { useSelectedItems } from "./SelectedItemsContext";
import { useGetUsersQuery } from "../../../../../../shell/services/accounts";

const formatDateTime = (source: string) => {
  if (!source || isNaN(new Date(source).getTime())) return "";

  const date = new Date(source)?.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
  const time = new Date(source)?.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "numeric",
  });

  return `${date} ${time}`;
};

const now = new Date();

export const ItemList = () => {
  const { modelZUID } = useRouterParams<{ modelZUID: string }>();
  const [params, setParams] = useParams();
  const langCode = params.get("lang");
  const draftItems = useSelector((state: AppState) =>
    Object.keys(state.content)
      .filter(
        (item) =>
          state.content[item].meta?.contentModelZUID === modelZUID &&
          state.content[item].meta.ZUID.slice(0, 3) === "new"
      )
      .map((item) => state.content[item])
  );
  const { data: model, isFetching: isModelFetching } =
    useGetContentModelQuery(modelZUID);
  const { data: items, isFetching: isModelItemsFetching } =
    useGetContentModelItemsQuery(
      {
        modelZUID,
        params: {
          lang: langCode,
        },
      },
      {
        skip: !langCode,
      }
    );
  const { data: fields, isFetching: isFieldsFetching } =
    useGetContentModelFieldsQuery(modelZUID);
  const { data: publishings, isFetching: isPublishingsFetching } =
    useGetAllPublishingsQuery();
  const allItems = useSelector((state: AppState) => state.content);
  const instanceId = useSelector((state: AppState) => state.instance.ID);
  const ecoId = useSelector((state: AppState) => state.instance.ecoID);
  const { data: bins } = useGetBinsQuery({
    instanceId,
    ecoId,
  });
  const { data: files, isFetching: isFilesFetching } = useGetAllBinFilesQuery(
    bins?.map((bin) => bin.id),
    { skip: !bins?.length }
  );
  const { data: users } = useGetUsersQuery();
  const { data: languages } = useGetLangsQuery({});
  const activeLanguageCode = params.get("lang");

  const { stagedChanges } = useStagedChanges();
  const [selectedItems] = useSelectedItems();
  const searchRef = useRef<HTMLInputElement>(null);
  const search = params.get("search");
  const sort = params.get("sort");
  const statusFilter = params.get("statusFilter");
  const dateFilter = useMemo(() => {
    return {
      preset: params.get("datePreset") || "",
      from: params.get("from") || "",
      to: params.get("to") || "",
    };
  }, [params]);
  const userFilter = params.get("user");

  useEffect(() => {
    // if languages and no language param, set the first language as the active language
    if (languages && !activeLanguageCode) {
      setParams(languages[0].code, "lang");
    }
  }, [languages, activeLanguageCode]);

  const processedItems = useMemo(() => {
    if (!items) return [];
    let clonedItems = [...draftItems, ...items].map((item: any) => {
      const clonedItem = cloneDeep(item);
      clonedItem.id = item.meta.ZUID;
      clonedItem.publishing = publishings?.find(
        (publishing) =>
          publishing.itemZUID === item.meta.ZUID &&
          publishing.version === item.meta.version
      );
      if (clonedItem.publishing) {
        clonedItem.publishing = {
          ...clonedItem.publishing,
          publishAt: clonedItem?.publishing?.publishAt
            ? formatDateTime(clonedItem?.publishing?.publishAt)
            : null,
        };
      }
      clonedItem.priorPublishing = publishings?.find(
        (publishing) =>
          publishing.itemZUID === item.meta.ZUID &&
          publishing.version !== item.meta.version
      );
      if (clonedItem.priorPublishing) {
        clonedItem.priorPublishing = {
          ...clonedItem.priorPublishing,
          publishAt: clonedItem?.priorPublishing?.publishAt
            ? formatDateTime(clonedItem.priorPublishing.publishAt)
            : null,
        };
      }
      clonedItem.meta.createdAt = clonedItem?.meta?.createdAt
        ? formatDateTime(clonedItem.meta.createdAt)
        : null;
      clonedItem.web.updatedAt = clonedItem?.web?.updatedAt
        ? formatDateTime(clonedItem.web.updatedAt)
        : null;
      const creatorData = users.find(
        (user) => user.ZUID === clonedItem?.meta?.createdByUserZUID
      );
      clonedItem.meta.createdByUserName = creatorData
        ? `${creatorData?.firstName} ${creatorData?.lastName}`
        : null;

      Object.keys(clonedItem.data).forEach((key) => {
        const fieldType = fields?.find((field) => field.name === key)?.datatype;
        // @ts-ignore
        if (
          fieldType === "images" &&
          clonedItem.data[key]?.split(",")?.[0]?.startsWith("3-")
        ) {
          clonedItem.data[key] = files?.find(
            (file) => file.id === clonedItem.data[key]?.split(",")?.[0]
          );
        }

        if (fieldType === "internal_link" || fieldType === "one_to_one") {
          clonedItem.data[key] =
            allItems?.[clonedItem.data[key]]?.web?.metaTitle ||
            clonedItem.data[key];
        }

        if (fieldType === "one_to_many") {
          clonedItem.data[key] = clonedItem.data[key]
            ?.split(",")
            .map((id: string) => allItems?.[id]?.web?.metaTitle || id)
            ?.join(",");
        }

        if (fieldType === "date") {
          if (!clonedItem.data[key]) return;

          clonedItem.data[key] = new Date(
            clonedItem.data[key]
          )?.toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          });
        }

        if (fieldType === "datetime") {
          if (!clonedItem.data[key]) return;

          clonedItem.data[key] = formatDateTime(clonedItem.data[key]);
        }
      });

      return clonedItem;
    });
    return clonedItems;
  }, [items, publishings, files, allItems, fields, users]);

  const sortedAndFilteredItems = useMemo(() => {
    let clonedItems = [...processedItems];
    clonedItems?.sort((a: any, b: any) => {
      if (sort === "datePublished") {
        // Handle undefined publishAt by setting a default far-future date for sorting purposes

        let dateA = a?.publishing?.publishAt || a?.priorPublishing?.publishAt;
        dateA = dateA ? new Date(dateA).getTime() : Number.NEGATIVE_INFINITY;

        let dateB = b?.publishing?.publishAt || b?.priorPublishing?.publishAt;
        dateB = dateB ? new Date(dateB).getTime() : Number.NEGATIVE_INFINITY;

        return dateB - dateA;
      } else if (sort === "dateCreated") {
        return (
          new Date(b.meta.createdAt).getTime() -
          new Date(a.meta.createdAt).getTime()
        );
      } else if (sort === "status") {
        const aPublishing = a?.publishing || a?.priorPublishing;
        const bPublishing = b?.publishing || b?.priorPublishing;

        const aDate = aPublishing?.publishAt
          ? new Date(aPublishing.publishAt)
          : null;
        const bDate = bPublishing?.publishAt
          ? new Date(bPublishing.publishAt)
          : null;

        // Determine the status of each item
        const aIsPublished = aDate && aDate <= now;
        const bIsPublished = bDate && bDate <= now;

        const aIsScheduled = aDate && aDate > now;
        const bIsScheduled = bDate && bDate > now;

        // Check if meta.version exists
        const aHasVersion = a?.meta?.version != null;
        const bHasVersion = b?.meta?.version != null;

        // Place items without meta.version at the bottom
        if (!aHasVersion && bHasVersion) {
          return 1;
        } else if (aHasVersion && !bHasVersion) {
          return -1;
        }

        // Continue with the original sorting logic
        if (aIsPublished && !bIsPublished) {
          return -1; // A is published, B is not
        } else if (!aIsPublished && bIsPublished) {
          return 1; // B is published, A is not
        } else if (aIsPublished && bIsPublished) {
          return bDate.getTime() - aDate.getTime(); // Both are published, sort by publish date descending
        }

        if (aIsScheduled && !bIsScheduled) {
          return -1; // A is scheduled, B is not
        } else if (!aIsScheduled && bIsScheduled) {
          return 1; // B is scheduled, A is not
        } else if (aIsScheduled && bIsScheduled) {
          return aDate.getTime() - bDate.getTime(); // Both are scheduled, sort by publish date ascending
        }

        return 0; // Neither is published nor scheduled, consider them equal
      } else {
        return (
          new Date(b.meta.updatedAt).getTime() -
          new Date(a.meta.updatedAt).getTime()
        );
      }
    });
    if (search) {
      clonedItems = clonedItems?.filter((item) => {
        return (
          Object.values(item.data).some((value: any) => {
            if (!value) return false;
            if (value?.filename || value?.title) {
              return (
                value?.filename
                  ?.toLowerCase()
                  ?.includes(search.toLowerCase()) ||
                value?.title?.toLowerCase()?.includes(search.toLowerCase())
              );
            }
            return value
              .toString()
              .toLowerCase()
              .includes(search.toLowerCase());
          }) ||
          item?.meta?.createdAt?.toLowerCase().includes(search.toLowerCase()) ||
          item?.web?.updatedAt?.toLowerCase().includes(search.toLowerCase()) ||
          item?.publishing?.publishAt
            ?.toLowerCase()
            .includes(search.toLowerCase()) ||
          item?.priorPublishing?.publishAt
            ?.toLowerCase()
            .includes(search.toLowerCase()) ||
          item?.meta?.ZUID?.toLowerCase().includes(search.toLowerCase()) ||
          item?.meta?.createdByUserName
            ?.toLowerCase()
            .includes(search.toLowerCase())
        );
      });
    }
    if (statusFilter) {
      clonedItems = clonedItems?.filter((item) => {
        if (statusFilter === "published") {
          return (
            (item.publishing?.publishAt &&
              new Date(item.publishing.publishAt) < new Date()) ||
            item?.priorPublishing?.publishAt
          );
        } else if (statusFilter === "scheduled") {
          return (
            item.publishing?.publishAt &&
            new Date(item.publishing.publishAt) > new Date()
          );
        } else if (statusFilter === "notPublished") {
          return (
            !item.publishing?.publishAt && !item?.priorPublishing?.publishAt
          );
        }
      });
    }

    const dateFilterFn = getDateFilterFnByValues(dateFilter);

    if (dateFilterFn) {
      clonedItems = clonedItems.filter((item) => {
        if (item?.meta?.updatedAt) {
          return dateFilterFn(item?.meta?.updatedAt);
        }

        return false;
      });
    }

    if (userFilter) {
      clonedItems = clonedItems.filter(
        (item) => item?.meta?.createdByUserZUID === userFilter
      );
    }

    // filter items by all fields
    return clonedItems;
  }, [processedItems, search, sort, statusFilter, dateFilter, userFilter]);

  return (
    <ThemeProvider theme={theme}>
      <Box
        sx={{
          color: "text.primary",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          "*": {
            boxSizing: "border-box",
          },
        }}
      >
        <Box
          sx={{
            px: 4,
            pt: 4,
            pb: 2,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "start",
            gap: 4,
          }}
        >
          {(stagedChanges && Object.keys(stagedChanges)?.length) ||
          selectedItems?.length ? (
            <UpdateListActions />
          ) : (
            <>
              <Box flex={1}>
                <ContentBreadcrumbs />
                <Typography
                  variant="h3"
                  mt={0.25}
                  fontWeight={700}
                  sx={{
                    display: "-webkit-box",
                    "-webkit-line-clamp": "2",
                    "-webkit-box-orient": "vertical",
                    wordBreak: "break-word",
                    wordWrap: "break-word",
                    hyphens: "auto",
                    overflow: "hidden",
                  }}
                >
                  {model?.label}
                </Typography>
              </Box>
              <ItemListActions ref={searchRef} />
            </>
          )}
        </Box>
        <Box
          height="100%"
          bgcolor="grey.50"
          px={4}
          sx={{
            display: "flex",
            flexDirection: "column",
          }}
        >
          {!items?.length && !isModelItemsFetching ? (
            <ItemListEmpty />
          ) : (
            <>
              <ItemListFilters />
              <ItemListTable
                key={modelZUID}
                loading={
                  isModelItemsFetching ||
                  isFieldsFetching ||
                  isPublishingsFetching ||
                  isFilesFetching
                }
                rows={sortedAndFilteredItems}
              />
              {!sortedAndFilteredItems?.length &&
                search &&
                !isModelItemsFetching && (
                  <Box
                    bgcolor="common.white"
                    flex={1}
                    display="flex"
                    alignItems="center"
                  >
                    <Box
                      data-cy="NoResults"
                      textAlign="center"
                      sx={{
                        maxWidth: 387,
                        mx: "auto",
                      }}
                    >
                      <img src={noSearchResults} alt="No search results" />
                      <Typography pt={4} pb={1} variant="h4" fontWeight={600}>
                        Your filter "{search}" could not find any results
                      </Typography>
                      <Typography variant="body2" pb={3} color="text.secondary">
                        Try adjusting your search. We suggest check all words
                        are spelled correctly or try using different keywords.
                      </Typography>
                      <Button
                        onClick={() => searchRef.current?.focus()}
                        variant="contained"
                        startIcon={<SearchRounded />}
                      >
                        Search Again
                      </Button>
                    </Box>
                  </Box>
                )}
              {!sortedAndFilteredItems?.length &&
                !isModelItemsFetching &&
                !search && (
                  <Box
                    bgcolor="common.white"
                    flex={1}
                    display="flex"
                    alignItems="center"
                  >
                    <Box
                      data-cy="NoResults"
                      textAlign="center"
                      sx={{
                        maxWidth: 387,
                        mx: "auto",
                      }}
                    >
                      <img src={noSearchResults} alt="No search results" />
                      <Typography pt={4} pb={1} variant="h4" fontWeight={600}>
                        No results that matched your filters could be found
                      </Typography>
                      <Typography variant="body2" pb={3} color="text.secondary">
                        Try adjusting your filters to find what you're looking
                        for
                      </Typography>
                      <Button
                        onClick={() => {
                          setParams(null, "statusFilter");
                        }}
                        variant="contained"
                        startIcon={<RestartAltRounded />}
                      >
                        Reset Filters
                      </Button>
                    </Box>
                  </Box>
                )}
            </>
          )}
        </Box>
      </Box>
    </ThemeProvider>
  );
};
