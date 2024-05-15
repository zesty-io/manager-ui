import { useHistory, useParams as useRouterParams } from "react-router";
import { ContentBreadcrumbs } from "../../components/ContentBreadcrumbs";
import {
  Box,
  Button,
  CircularProgress,
  Chip,
  ThemeProvider,
  Typography,
  Stack,
} from "@mui/material";
import {
  useGetAllPublishingsQuery,
  useGetContentModelFieldsQuery,
  useGetContentModelItemsQuery,
  useGetContentModelQuery,
} from "../../../../../../shell/services/instance";
import { theme } from "@zesty-io/material";
import { ItemListEmpty } from "./ItemListEmpty";
import { ItemListActions } from "./ItemListActions";
import {
  DataGridPro,
  GridColumns,
  GridRenderCellParams,
} from "@mui/x-data-grid-pro";
import { useMemo, useRef, useState } from "react";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import RestartAltRounded from "@mui/icons-material/RestartAltRounded";
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

const fieldTypeColumnConfigMap = {
  text: {
    width: 360,
  },
  wysiwyg_basic: {
    width: 360,
  },
  wysiwyg_advanced: {
    width: 360,
  },
  article_writer: {
    width: 360,
  },
  markdown: {
    width: 360,
  },
  textarea: {
    width: 360,
  },
  one_to_many: {
    width: 360,
  },
  one_to_one: {
    width: 360,
  },
  uuid: {
    width: 360,
  },
  number: {
    width: 360,
  },
  images: {
    width: 100,
    renderCell: ({ row }: GridRenderCellParams) => {
      const src =
        row.data.images?.thumbnail || row.data.images?.split(",")?.[0];
      if (!src) return null;
      return (
        <img
          style={{ objectFit: "contain" }}
          width="68px"
          height="58px"
          src={src}
        />
      );
    },
  },
  yes_no: {
    width: 360,
  },
  dropdown: {
    width: 360,
  },
  date: {
    width: 160,
    valueFormatter: (params: any) =>
      new Date(params.value)?.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      }),
  },
  datetime: {
    width: 200,
    valueFormatter: (params: any) =>
      new Date(params.value)?.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "numeric",
      }),
  },
} as const;

export const ItemList2 = () => {
  const { modelZUID } = useRouterParams<{ modelZUID: string }>();
  const history = useHistory();

  const { data: model, isFetching: isModelFetching } =
    useGetContentModelQuery(modelZUID);
  const { data: items, isFetching: isModelItemsFetching } =
    useGetContentModelItemsQuery(modelZUID);
  const { data: fields, isFetching: isFieldsFetching } =
    useGetContentModelFieldsQuery(modelZUID);
  const { data: publishings, isFetching: isPublishingsFetching } =
    useGetAllPublishingsQuery();
  const instanceId = useSelector((state: AppState) => state.instance.ID);
  const ecoId = useSelector((state: AppState) => state.instance.ecoID);
  const { data: bins, isFetching: isBinsFetching } = useGetBinsQuery({
    instanceId,
    ecoId,
  });
  const { data: files, isFetching: isFilesFetching } = useGetAllBinFilesQuery(
    bins?.map((bin) => bin.id),
    { skip: !bins?.length }
  );

  const searchRef = useRef<HTMLInputElement>(null);
  const [params, setParams] = useParams();
  const search = params.get("search");
  const sort = params.get("sort");
  const statusFilter = params.get("statusFilter");

  const processedItems = useMemo(() => {
    if (!items) return [];
    let clonedItems = items.map((item: any) => {
      const clonedItem = cloneDeep(item);
      clonedItem.id = item.meta.ZUID;
      clonedItem.publishing = publishings?.find(
        (publishing) =>
          publishing.itemZUID === item.meta.ZUID &&
          publishing.version === item.meta.version
      );
      clonedItem.priorPublishing = publishings?.find(
        (publishing) =>
          publishing.itemZUID === item.meta.ZUID &&
          publishing.version !== item.meta.version
      );

      Object.keys(clonedItem.data).forEach((key) => {
        // @ts-ignore
        if (
          typeof clonedItem.data[key] === "string" &&
          clonedItem.data[key]?.split(",")?.[0]?.startsWith("3-")
        ) {
          clonedItem.data[key] = files?.find(
            (file) => file.id === clonedItem.data[key]?.split(",")?.[0]
          );
        }
      });

      return clonedItem;
    });
    return clonedItems;
  }, [items, publishings, files]);

  const sortedAndFilteredItems = useMemo(() => {
    let clonedItems = [...processedItems];
    clonedItems?.sort((a: any, b: any) => {
      if (sort === "datePublished") {
        // Handle undefined publishAt by setting a default far-future date for sorting purposes
        const dateA = a?.publishing?.publishAt
          ? new Date(a.publishing.publishAt).getTime()
          : Number.NEGATIVE_INFINITY;
        const dateB = b?.publishing?.publishAt
          ? new Date(b.publishing.publishAt).getTime()
          : Number.NEGATIVE_INFINITY;

        return dateB - dateA;
      } else if (sort === "dateCreated") {
        return (
          new Date(b.meta.createdAt).getTime() -
          new Date(a.meta.createdAt).getTime()
        );
      } else if (sort === "status") {
        const now = new Date(); // Current date and time
        const aPublishing = a?.publishing;
        const bPublishing = b?.publishing;

        const aDate = aPublishing?.publishAt
          ? new Date(aPublishing.publishAt)
          : null;
        const bDate = bPublishing?.publishAt
          ? new Date(bPublishing.publishAt)
          : null;

        // Check if A or B is scheduled or not
        const aIsScheduled = aDate ? aDate > now : false;
        const bIsScheduled = bDate ? bDate > now : false;

        // Check if A or B has a date
        const aHasDate = aDate !== null;
        const bHasDate = bDate !== null;

        // Handle sorting based on scheduled status and presence of publishAt date
        if (aIsScheduled && !bIsScheduled) {
          // A is scheduled, B is live or has no date
          if (!bHasDate) {
            // B has no date, A should still come first
            return -1;
          }
          // B is live, A should come after B
          return 1;
        } else if (!aIsScheduled && bIsScheduled) {
          // A is live or has no date, B is scheduled
          if (!aHasDate) {
            // A has no date, B should still come first
            return 1;
          }
          // A is live, A should come before B
          return -1;
        } else if (!aHasDate && bHasDate) {
          // A has no date, B has a date (either scheduled or live)
          return 1; // B should come before A
        } else if (aHasDate && !bHasDate) {
          // A has a date (either scheduled or live), B has no date
          return -1; // A should come before B
        } else {
          // Both have dates, or both have no dates, sort by publish date
          if (aDate && bDate) {
            // Both are scheduled, sort by publish date ascending
            if (aIsScheduled && bIsScheduled) {
              return aDate.getTime() - bDate.getTime();
            }
            // Both are live, sort by publish date descending
            return bDate.getTime() - aDate.getTime();
          }
          return 0; // Neither have a date, consider them equal
        }
      } else {
        return (
          new Date(b.meta.updatedAt).getTime() -
          new Date(a.meta.updatedAt).getTime()
        );
      }
    });
    if (search) {
      clonedItems = clonedItems?.filter((item) => {
        return Object.values(item.data).some((value: any) => {
          if (!value) return false;
          if (value?.filename || value?.title) {
            return (
              value?.filename?.toLowerCase()?.includes(search.toLowerCase()) ||
              value?.title?.toLowerCase()?.includes(search.toLowerCase())
            );
          }
          return value.toString().toLowerCase().includes(search.toLowerCase());
        });
      });
    }
    if (statusFilter) {
      clonedItems = clonedItems?.filter((item) => {
        if (statusFilter === "published") {
          return (
            item.publishing?.publishAt &&
            new Date(item.publishing.publishAt) < new Date()
          );
        } else if (statusFilter === "scheduled") {
          return (
            item.publishing?.publishAt &&
            new Date(item.publishing.publishAt) > new Date()
          );
        } else if (statusFilter === "notPublished") {
          return !item.publishing?.publishAt;
        }
      });
    }
    // filter items by all fields
    return clonedItems;
  }, [processedItems, search, sort, statusFilter]);

  const columns = useMemo(() => {
    let result: any[] = [
      {
        field: "version",
        headerName: "Vers.",
        width: 104,
        sortable: false,
        renderCell: ({ row }: GridRenderCellParams) => {
          return (
            <Stack spacing={0.25}>
              {row?.meta?.version !== row?.publishing?.version && (
                <Chip
                  label={`v${row?.meta?.version}`}
                  size="small"
                  color="info"
                />
              )}
              {(row?.publishing?.version || row?.priorPublishing?.version) && (
                <Chip
                  label={`v${
                    row?.publishing?.version || row?.priorPublishing?.version
                  }`}
                  size="small"
                  color="success"
                />
              )}
            </Stack>
          );
        },
      },
    ];
    if (fields) {
      result = [
        ...result,
        ...fields
          ?.filter((field) => !field.deletedAt)
          ?.map((field) => ({
            field: field.name,
            headerName: field.label,
            sortable: false,
            // width: fieldTypeWidthMap[field.datatype] || 100,
            valueGetter: (params: any) => params.row.data[field.name],
            ...fieldTypeColumnConfigMap[field.datatype],
          })),
      ];
    }
    return result;
  }, [fields]);

  return (
    <ThemeProvider theme={theme}>
      <Box
        sx={{
          color: "text.primary",
          height: "100%",
          "*": {
            boxSizing: "border-box",
          },
        }}
      >
        {isModelFetching ||
        isModelItemsFetching ||
        isFieldsFetching ||
        isPublishingsFetching ||
        isFilesFetching ? (
          <Box
            display="flex"
            height="100%"
            justifyContent="center"
            alignItems="center"
          >
            <CircularProgress />
          </Box>
        ) : (
          <>
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
            </Box>
            <Box
              height="100%"
              bgcolor="grey.50"
              px={4}
              sx={{
                overflowY: "auto",
              }}
            >
              {!items?.length ? (
                <ItemListEmpty />
              ) : (
                <>
                  <ItemListFilters />
                  {!sortedAndFilteredItems?.length && search ? (
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
                        Your filter {search} could not find any results
                      </Typography>
                      <Typography variant="body2" pb={3} color="text.secondary">
                        Try adjusting your search. We suggest check all words
                        are spelled correctly or try using different keywords.
                      </Typography>
                      <Button
                        onClick={() => searchRef.current?.focus()}
                        variant="contained"
                        startIcon={<SearchRoundedIcon />}
                      >
                        Search Again
                      </Button>
                    </Box>
                  ) : !sortedAndFilteredItems?.length && !search ? (
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
                  ) : (
                    <DataGridPro
                      rows={sortedAndFilteredItems}
                      columns={columns}
                      onRowClick={(row) => {
                        history.push(`/content/${modelZUID}/${row.id}`);
                      }}
                      checkboxSelection
                      disableSelectionOnClick
                      sx={{
                        "& .MuiDataGrid-columnHeaderCheckbox": {
                          padding: 0,
                        },
                      }}
                    />
                  )}
                </>
              )}
            </Box>
          </>
        )}
      </Box>
    </ThemeProvider>
  );
};
