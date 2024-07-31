import { useParams as useRouterParams } from "react-router";
import { ContentBreadcrumbs } from "../../components/ContentBreadcrumbs";
import { Box, Button, ThemeProvider, Typography } from "@mui/material";
import {
  useGetContentModelFieldsQuery,
  useGetContentModelQuery,
  useGetLangsQuery,
} from "../../../../../../shell/services/instance";
import { theme } from "@zesty-io/material";
import { ItemListEmpty } from "./ItemListEmpty";
import { ItemListActions } from "./ItemListActions";
import { useEffect, useMemo, useRef, useState, useContext } from "react";
import { SearchRounded, RestartAltRounded } from "@mui/icons-material";
import noSearchResults from "../../../../../../../public/images/noSearchResults.svg";
import { ItemListFilters } from "./ItemListFilters";
import { useParams } from "../../../../../../shell/hooks/useParams";
import {
  useGetAllBinFilesQuery,
  useGetBinsQuery,
} from "../../../../../../shell/services/mediaManager";
import { useDispatch, useSelector } from "react-redux";
import { AppState } from "../../../../../../shell/store/types";
import { useStagedChanges } from "./StagedChangesContext";
import { UpdateListActions } from "./UpdateListActions";
import { getDateFilterFnByValues } from "../../../../../../shell/components/Filters/DateFilter/getDateFilter";
import { ItemListTable } from "./ItemListTable";
import { useSelectedItems } from "./SelectedItemsContext";
import { useGetUsersQuery } from "../../../../../../shell/services/accounts";
import {
  ContentItem,
  ContentItemWithDirtyAndPublishing,
} from "../../../../../../shell/services/types";
import { fetchItems } from "../../../../../../shell/store/content";
import { TableSortContext } from "./TableSortProvider";

const formatDateTime = (source: string) => {
  const dateObj = new Date(source);
  if (!source || isNaN(dateObj.getTime())) return "";

  const date = dateObj.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
  const time = dateObj.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "numeric",
  });

  return `${date} ${time}`;
};

const formatDate = (source: string) => {
  const dateObj = new Date(source + "T00:00:00");
  if (!source || isNaN(dateObj.getTime())) return "";

  return dateObj.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const selectFilteredItems = (
  state: AppState,
  modelZUID: string,
  activeLangId: number,
  skip = false
) => {
  if (skip) {
    return [];
  }
  return Object.values(state.content).filter(
    (item: ContentItem) =>
      item.meta.contentModelZUID === modelZUID &&
      item.meta.langID === activeLangId
  );
};

export const ItemList = () => {
  const { modelZUID } = useRouterParams<{ modelZUID: string }>();
  const [params, setParams] = useParams();
  const dispatch = useDispatch();
  const activeLanguageCode = params.get("lang");
  const { data: model, isFetching: isModelFetching } =
    useGetContentModelQuery(modelZUID);
  const { data: fields, isFetching: isFieldsFetching } =
    useGetContentModelFieldsQuery(modelZUID);
  const { data: languages } = useGetLangsQuery({});
  const activeLangId =
    languages?.find((lang) => lang.code === activeLanguageCode)?.ID || 1;
  const [hasMounted, setHasMounted] = useState(false);
  const allItems = useSelector((state: AppState) => state.content);
  const items = useSelector((state: AppState) =>
    selectFilteredItems(state, modelZUID, activeLangId, !hasMounted)
  );
  const { data: users, isFetching: isUsersFetching } = useGetUsersQuery();

  const [isModelItemsFetching, setIsModelItemsFetching] = useState(true);

  const [sortModel] = useContext(TableSortContext);
  const { stagedChanges } = useStagedChanges();
  const [selectedItems] = useSelectedItems();
  const searchRef = useRef<HTMLInputElement>(null);
  const search = params.get("search");
  // const sort = params.get("sort");
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
    setTimeout(() => {
      setHasMounted(true);
    }, 0);
  }, []);

  useEffect(() => {
    if (activeLanguageCode) {
      setIsModelItemsFetching(true);
      dispatch(
        fetchItems(modelZUID, {
          limit: 5000,
          page: 1,
          lang: activeLanguageCode,
        })
        // @ts-ignore
      ).then(() => {
        setIsModelItemsFetching(false);
      });
    }
  }, [modelZUID, activeLanguageCode]);

  useEffect(() => {
    // if languages and no language param, set the first language as the active language
    if (languages && !activeLanguageCode) {
      setParams(languages[0].code, "lang");
    }
  }, [languages, activeLanguageCode]);

  const processedItems = useMemo(() => {
    if (!items || isFieldsFetching || isUsersFetching) return [];

    const fieldMap = fields?.reduce((acc, field) => {
      // @ts-ignore
      acc[field.name] = field.datatype;
      return acc;
    }, {});

    return items.map((item: ContentItemWithDirtyAndPublishing) => {
      const { meta, data, web, publishing } = item;
      const metaUser = users.find(
        (user) => user.ZUID === meta.createdByUserZUID
      );
      const webUser = users.find((user) => user.ZUID === web.createdByUserZUID);
      const publishedByUser = users.find(
        (user) => user.ZUID === item.publishing?.publishedByUserZUID
      );
      const scheduledByUser = users.find(
        (user) => user.ZUID === item.scheduling?.publishedByUserZUID
      );
      const clonedItem = {
        ...item,
        id: meta.ZUID,
        meta: {
          ...meta,
          createdAt: meta.createdAt ? formatDateTime(meta.createdAt) : null,
          createdByUserName: metaUser?.firstName
            ? `${metaUser.firstName} ${metaUser.lastName}`
            : null,
          createdByUserEmail: metaUser?.email || "",
          publishedByUserName: publishedByUser?.firstName
            ? `${publishedByUser.firstName} ${publishedByUser.lastName}`
            : null,
          scheduledByUserName: scheduledByUser?.firstName
            ? `${scheduledByUser.firstName} ${scheduledByUser.lastName}`
            : null,
        },
        web: {
          ...web,
          updatedAt: web.updatedAt ? formatDateTime(web.updatedAt) : null,
          createdByUserName: webUser?.firstName
            ? `${webUser.firstName} ${webUser.lastName}`
            : null,
        },
        data: { ...data },
        publishing: {
          ...publishing,
          publishAt: publishing?.publishAt
            ? formatDateTime(publishing.publishAt)
            : null,
        },
        fieldData: {},
      };

      Object.keys(data).forEach((key) => {
        // @ts-ignore
        const fieldType = fieldMap?.[key];
        const value = data[key] as string;
        switch (fieldType) {
          case "images":
            clonedItem.data[key] = value?.split(",")[0]?.startsWith("3-")
              ? `${
                  // @ts-ignore
                  CONFIG.SERVICE_MEDIA_RESOLVER
                }/resolve/${
                  value?.split(",")[0]
                }/getimage/?w=${68}&h=${58}&type=fit`
              : value?.split(",")?.[0];
            break;
          case "internal_link":
          case "one_to_one":
            clonedItem.data[key] = allItems?.[value]?.web?.metaTitle || value;
            break;
          case "one_to_many":
            clonedItem.data[key] = value
              ?.split(",")
              ?.map((id) => allItems?.[id]?.web?.metaTitle || id)
              ?.join(",");
            break;
          case "date":
            clonedItem.data[key] = formatDate(value);
            break;
          case "datetime":
            clonedItem.data[key] = formatDateTime(value);
            break;
          case "dropdown":
          case "yes_no":
            // @ts-ignore
            clonedItem.fieldData[key] = fields.find(
              (field) => field.name === key
            );
          default:
            break;
        }
      });

      return clonedItem;
    });
  }, [items, allItems, fields, users, isFieldsFetching, isUsersFetching]);

  const sortedAndFilteredItems = useMemo(() => {
    const sort = sortModel?.[0]?.field;
    const sortOrder = sortModel?.[0]?.sort;
    let clonedItems = [...processedItems];
    clonedItems?.sort((a: any, b: any) => {
      if (!sort || sort === "lastSaved") {
        const dateA = new Date(a.web.createdAt).getTime();
        const dateB = new Date(b.web.createdAt).getTime();

        if (!a.web.createdAt) {
          return -1;
        } else if (!b.web.createdAt) {
          return 1;
        } else {
          return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
        }
      } else if (sort === "lastPublished") {
        // Handle undefined publishAt by setting a default far-future date for sorting purposes

        let dateA = a?.scheduling?.publishAt || a?.publishing?.publishAt;
        dateA = dateA ? new Date(dateA).getTime() : Number.NEGATIVE_INFINITY;

        let dateB = b?.scheduling?.publishAt || b?.publishing?.publishAt;
        dateB = dateB ? new Date(dateB).getTime() : Number.NEGATIVE_INFINITY;

        return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
      } else if (sort === "createdOn") {
        if (sortOrder === "asc") {
          return (
            new Date(a.meta.createdAt).getTime() -
            new Date(b.meta.createdAt).getTime()
          );
        }

        return (
          new Date(b.meta.createdAt).getTime() -
          new Date(a.meta.createdAt).getTime()
        );
      } else if (sort === "version") {
        const aIsPublished = a?.publishing?.publishAt;
        const bIsPublished = b?.publishing?.publishAt;

        const aIsScheduled = a?.scheduling?.publishAt;
        const bIsScheduled = b?.scheduling?.publishAt;

        // Check if meta.version exists
        const aHasVersion = a?.meta?.version != null;
        const bHasVersion = b?.meta?.version != null;

        // Place items without meta.version at the bottom
        if (!aHasVersion && bHasVersion) {
          return 1;
        } else if (aHasVersion && !bHasVersion) {
          return -1;
        }

        // Items with only publish date
        if (aIsPublished && !aIsScheduled && bIsPublished && !bIsScheduled) {
          if (sortOrder === "asc") {
            return (
              new Date(aIsPublished).getTime() -
              new Date(bIsPublished).getTime()
            );
          }

          return (
            new Date(bIsPublished).getTime() - new Date(aIsPublished).getTime()
          ); // Both have only published date, sort by publish date descending
        } else if (aIsPublished && !aIsScheduled) {
          return -1; // A has only published date, B does not
        } else if (bIsPublished && !bIsScheduled) {
          return 1; // B has only published date, A does not
        }

        // Items with scheduled date (and also publish date)
        if (aIsScheduled && bIsScheduled) {
          if (sortOrder === "asc") {
            return (
              new Date(bIsScheduled).getTime() -
              new Date(aIsScheduled).getTime()
            );
          }

          return (
            new Date(aIsScheduled).getTime() - new Date(bIsScheduled).getTime()
          ); // Both are scheduled, sort by scheduled date ascending
        } else if (aIsScheduled) {
          return -1; // A is scheduled, B is not
        } else if (bIsScheduled) {
          return 1; // B is scheduled, A is not
        }

        // Items with neither publish nor schedule dates
        if (aIsPublished && bIsPublished) {
          if (sortOrder === "asc") {
            return (
              new Date(aIsPublished).getTime() -
              new Date(bIsPublished).getTime()
            );
          }

          return (
            new Date(bIsPublished).getTime() - new Date(aIsPublished).getTime()
          ); // Both are published, sort by publish date descending
        } else if (aIsPublished) {
          return -1; // A is published, B is not
        } else if (bIsPublished) {
          return 1; // B is published, A is not
        }

        return 0; // Neither are published or scheduled
      } else if (sort === "createdBy") {
        const userA = a?.meta?.createdByUserName;
        const userB = b?.meta?.createdByUserName;

        if (!userA) {
          return 1;
        } else if (!userB) {
          return -1;
        } else {
          return sortOrder === "asc"
            ? userB.localeCompare(userA)
            : userA.localeCompare(userB);
        }
      } else if (sort === "zuid") {
        return sortOrder === "asc"
          ? b.meta?.ZUID?.localeCompare(a.meta?.ZUID)
          : a.meta?.ZUID?.localeCompare(b.meta?.ZUID);
      } else if (fields?.find((field) => field.name === sort)) {
        const dataType = fields?.find((field) => field.name === sort)?.datatype;
        if (typeof a.data[sort] === "number") {
          if (a.data[sort] == null) return 1;
          if (b.data[sort] == null) return -1;

          if (dataType === "sort") {
            return sortOrder === "asc"
              ? a.data[sort] - b.data[sort]
              : b.data[sort] - a.data[sort];
          }

          return sortOrder === "asc"
            ? a.data[sort] - b.data[sort]
            : b.data[sort] - a.data[sort];
        }
        if (dataType === "date" || dataType === "datetime") {
          if (!a.data[sort]) {
            return 1;
          } else if (!b.data[sort]) {
            return -1;
          } else {
            return sortOrder === "asc"
              ? new Date(a.data[sort]).getTime() -
                  new Date(b.data[sort]).getTime()
              : new Date(b.data[sort]).getTime() -
                  new Date(a.data[sort]).getTime();
          }
        }

        if (dataType === "yes_no") {
          if (!a.data[sort]) {
            return 1;
          } else if (!b.data[sort]) {
            return -1;
          } else {
            return sortOrder === "asc" ? a - b : b - a;
          }
        }

        const aValue =
          dataType === "images" ? a.data[sort]?.filename : a.data[sort];
        const bValue =
          dataType === "images" ? b.data[sort]?.filename : b.data[sort];

        return sortOrder === "asc"
          ? bValue?.trim()?.localeCompare(aValue?.trim())
          : aValue?.trim()?.localeCompare(bValue?.trim());
      } else {
        return sortOrder === "asc"
          ? new Date(a.meta.updatedAt).getTime() -
              new Date(b.meta.updatedAt).getTime()
          : new Date(b.meta.updatedAt).getTime() -
              new Date(a.meta.updatedAt).getTime();
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
          item?.scheduling?.publishAt
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
          return item.publishing?.publishAt && !item.scheduling?.publishAt;
        } else if (statusFilter === "scheduled") {
          return item.scheduling?.publishAt;
        } else if (statusFilter === "notPublished") {
          return !item.publishing?.publishAt && !item?.scheduling?.publishAt;
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
  }, [processedItems, search, sortModel, statusFilter, dateFilter, userFilter]);

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
            <UpdateListActions items={items as ContentItem[]} />
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
                loading={isFieldsFetching || isUsersFetching}
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
                        Your filter <strong>"{search}"</strong> could not find
                        any results
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
                !search &&
                (!!sortModel?.length ||
                  statusFilter ||
                  dateFilter?.preset ||
                  dateFilter?.from ||
                  dateFilter?.to ||
                  userFilter) && (
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
