import { useHistory, useParams as useRouterParams } from "react-router";
import moment from "moment";
import { ContentBreadcrumbs } from "../../components/ContentBreadcrumbs";
import {
  Box,
  Button,
  CircularProgress,
  Chip,
  ThemeProvider,
  Typography,
  Stack,
  Menu,
  MenuItem,
  Link,
  ToggleButtonGroup,
  ToggleButton,
  Tooltip,
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
  GRID_CHECKBOX_SELECTION_COL_DEF,
  useGridApiRef,
  GridInitialState,
} from "@mui/x-data-grid-pro";
import { useCallback, useLayoutEffect, useMemo, useRef, useState } from "react";
import {
  KeyboardArrowDownRounded,
  SearchRounded,
  RestartAltRounded,
} from "@mui/icons-material";
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
import { ContentItem } from "../../../../../../shell/services/types";
import { useStagedChanges } from "./StagedChangesContext";
import { FieldTypeSort } from "../../../../../../shell/components/FieldTypeSort";
import { useGetUsersQuery } from "../../../../../../shell/services/accounts";
import { UpdateListActions } from "./UpdateListActions";
import { getDateFilterFnByValues } from "../../../../../../shell/components/Filters/DateFilter/getDateFilter";
import { OneToManyColumn } from "./OneToManyColumn";
import { UserCell } from "./UserCell";

const formatDate = (rawDate: string) =>
  moment(rawDate).format("MMM D, YYYY h:mm a");

export const ItemList2 = () => {
  const { modelZUID } = useRouterParams<{ modelZUID: string }>();
  const history = useHistory();
  const apiRef = useGridApiRef();
  const [initialState, setInitialState] = useState<GridInitialState>();
  const { data: model, isFetching: isModelFetching } =
    useGetContentModelQuery(modelZUID);
  const { data: items, isFetching: isModelItemsFetching } =
    useGetContentModelItemsQuery(modelZUID);
  const { data: fields, isFetching: isFieldsFetching } =
    useGetContentModelFieldsQuery(modelZUID);
  const { data: publishings, isFetching: isPublishingsFetching } =
    useGetAllPublishingsQuery();
  const allItems = useSelector((state: AppState) => state.content);
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

  const { stagedChanges, updateStagedChanges, clearStagedChanges } =
    useStagedChanges();

  const searchRef = useRef<HTMLInputElement>(null);
  const [params, setParams] = useParams();
  const search = params.get("search");
  const sort = params.get("sort");
  const statusFilter = params.get("statusFilter");
  const dateFilter = {
    preset: params.get("datePreset") || "",
    from: params.get("from") || "",
    to: params.get("to") || "",
  };
  const userFilter = params.get("user");

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
      width: 240,
      renderCell: (params: GridRenderCellParams) => {
        return <OneToManyColumn items={params.value?.split(",")} />;
      },
    },
    // one_to_many: {
    //   width: 240,
    //   renderCell: (params: GridRenderCellParams) => {
    //     return (
    //       <Box display="flex" gap={0.5} ref={oneToManyContainerRef}>
    //         {params.value?.split(",")?.map((id: string) => (
    //           <Chip
    //             key={id}
    //             label={allItems?.[id]?.web?.metaTitle || id}
    //             size="small"
    //           />
    //         ))}
    //       </Box>
    //     );
    //   },
    // },
    one_to_one: {
      width: 240,
      renderCell: (params: any) =>
        params.value && <Chip label={params.value} size="small" />,
    },
    uuid: {
      width: 280,
    },
    number: {
      width: 160,
      valueFormatter: (params: any) => {
        return new Intl.NumberFormat("en-US").format(params.value);
      },
    },
    currency: {
      width: 160,
      valueFormatter: (params: any) => {
        return new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
        }).format(params.value);
      },
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
    dropdown: {
      width: 240,
      renderCell: (params: GridRenderCellParams) => (
        <DropDownCell params={params} />
      ),
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
    link: {
      width: 360,
      renderCell: (params: any) => {
        return (
          <Link
            underline="none"
            target="_blank"
            href={params.value}
            sx={{
              color: "primary.main",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {params.value}
          </Link>
        );
      },
    },
    internal_link: {
      width: 240,
      renderCell: (params: any) =>
        params.value && <Chip label={params.value} size="small" />,
    },
    yes_no: {
      width: 120,
      renderCell: (params: GridRenderCellParams) => (
        <BooleanCell params={params} />
      ),
    },
    color: {
      width: 140,
      renderCell: (params: GridRenderCellParams) => {
        return (
          <Box display="flex" alignItems="center" gap={1.5}>
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: "8px",
                backgroundColor: params.value,
              }}
            />
            <Typography>{params.value?.toUpperCase()}</Typography>
          </Box>
        );
      },
    },
    sort: {
      width: 156,
      renderCell: (params: GridRenderCellParams) => (
        <SortCell params={params} />
      ),
    },
  } as const;

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
      });

      return clonedItem;
    });
    return clonedItems;
  }, [items, publishings, files, allItems, fields]);

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
        (item) => item?.web?.createdByUserZUID === userFilter
      );
    }

    // filter items by all fields
    return clonedItems;
  }, [processedItems, search, sort, statusFilter, dateFilter, userFilter]);

  const columns = useMemo(() => {
    let result: any[] = [
      {
        field: "version",
        headerName: "Vers.",
        width: 104,
        sortable: false,
        filterable: false,
        renderCell: (params: GridRenderCellParams) => (
          <VersionCell params={params} />
        ),
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
            filterable: false,
            // width: fieldTypeWidthMap[field.datatype] || 100,
            valueGetter: (params: any) => params.row.data[field.name],
            ...fieldTypeColumnConfigMap[field.datatype],
          })),
      ];
    }
    // Metadata
    result = [
      ...result,
      {
        field: "createdBy",
        headerName: "Created By",
        width: 240,
        sortable: false,
        filterable: false,
        renderCell: (params: GridRenderCellParams) => (
          <UserCell params={params} />
        ),
      },
      {
        field: "createdOn",
        headerName: "Created On",
        width: 200,
        sortable: false,
        filterable: false,
        valueGetter: (params: any) => formatDate(params.row?.meta?.createdAt),
      },
      {
        field: "lastSaved",
        headerName: "Last Saved",
        width: 200,
        sortable: false,
        filterable: false,
        valueGetter: (params: any) => formatDate(params.row?.web?.updatedAt),
      },
      {
        field: "lastPublished",
        headerName: "Last Published",
        width: 200,
        sortable: false,
        filterable: false,
        valueGetter: (params: any) => {
          const isScheduledPublish = moment(
            params.row?.publishing?.publishAt
          ).isAfter(moment());

          if (params.row?.publishing?.publishAt && !isScheduledPublish) {
            return formatDate(params.row?.publishing?.publishAt);
          }

          if (params.row?.priorPublishing?.publishAt) {
            return formatDate(params.row?.priorPublishing?.publishAt);
          }

          return "";
        },
      },
      {
        field: "zuid",
        headerName: "ZUID",
        width: 200,
        sortable: false,
        filterable: false,
        valueGetter: (params: any) => params.row?.meta?.ZUID,
      },
    ];
    return result;
  }, [fields]);

  const saveSnapshot = useCallback(() => {
    if (apiRef?.current?.exportState && localStorage) {
      const currentState = apiRef.current.exportState();
      localStorage.setItem(
        `${modelZUID}-dataGridState`,
        JSON.stringify(currentState)
      );
    }
  }, [apiRef]);

  useLayoutEffect(() => {
    if (isFieldsFetching) return;
    const stateFromLocalStorage = localStorage?.getItem(
      `${modelZUID}-dataGridState`
    );
    setInitialState(
      stateFromLocalStorage
        ? JSON.parse(stateFromLocalStorage)
        : {
            pinnedColumns: {
              left: [
                GRID_CHECKBOX_SELECTION_COL_DEF.field,
                "version",
                fields?.[0]?.name,
              ],
            },
          }
    );

    window.addEventListener("beforeunload", saveSnapshot);

    return () => {
      window.removeEventListener("beforeunload", saveSnapshot);
      saveSnapshot();
    };
  }, [saveSnapshot, isFieldsFetching, fields]);

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
          {stagedChanges && Object.keys(stagedChanges)?.length ? (
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
            overflowY: "auto",
          }}
        >
          {!items?.length && !isModelItemsFetching ? (
            <ItemListEmpty />
          ) : (
            <>
              <ItemListFilters />
              {!sortedAndFilteredItems?.length &&
              search &&
              !isModelItemsFetching ? (
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
                    Try adjusting your search. We suggest check all words are
                    spelled correctly or try using different keywords.
                  </Typography>
                  <Button
                    onClick={() => searchRef.current?.focus()}
                    variant="contained"
                    startIcon={<SearchRounded />}
                  >
                    Search Again
                  </Button>
                </Box>
              ) : !sortedAndFilteredItems?.length && !isModelItemsFetching ? (
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
                    Try adjusting your filters to find what you're looking for
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
              ) : !initialState ? (
                <Box
                  display="flex"
                  justifyContent="center"
                  alignItems="center"
                  height="100%"
                >
                  <CircularProgress />
                </Box>
              ) : (
                <DataGridPro
                  apiRef={apiRef}
                  loading={
                    isModelFetching ||
                    isModelItemsFetching ||
                    isFieldsFetching ||
                    isPublishingsFetching ||
                    isFilesFetching
                  }
                  rows={sortedAndFilteredItems}
                  columns={columns}
                  rowHeight={54}
                  onRowClick={(row) => {
                    history.push(`/content/${modelZUID}/${row.id}`);
                  }}
                  checkboxSelection={
                    !(stagedChanges && Object.keys(stagedChanges)?.length)
                  }
                  disableSelectionOnClick
                  initialState={initialState}
                  sx={{
                    backgroundColor: "common.white",
                    ".MuiDataGrid-row": {
                      cursor: "pointer",
                    },
                    border: "none",
                    "& .MuiDataGrid-columnHeaderCheckbox": {
                      padding: 0,
                    },
                    " & .MuiDataGrid-columnSeparator": {
                      visibility: "visible",
                    },
                    "& .MuiDataGrid-pinnedColumnHeaders": {
                      backgroundColor: "inherit",
                    },
                  }}
                />
              )}
            </>
          )}
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export const DropDownCell = ({ params }: { params: GridRenderCellParams }) => {
  const { stagedChanges, updateStagedChanges } = useStagedChanges();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const { modelZUID } = useRouterParams<{ modelZUID: string }>();
  const { data: fields, isFetching: isFieldsFetching } =
    useGetContentModelFieldsQuery(modelZUID);
  const field = fields?.find((field) => field.name === params.field);
  const handleChange = (value: any) => {
    setAnchorEl(null);
    updateStagedChanges(params.row.id, params.field, value);
  };

  return (
    <>
      <Button
        sx={{
          color: "text.disabled",
          height: "24px",
          minWidth: "unset",
          padding: "2px",
          " .MuiButton-endIcon": {
            marginLeft: "4px",
          },
        }}
        color="inherit"
        endIcon={<KeyboardArrowDownRounded color="action" />}
        onClick={(e) => {
          e.stopPropagation();
          setAnchorEl(e.currentTarget);
        }}
      >
        {stagedChanges?.[params.row.id]?.[params.field] === null
          ? "Select"
          : field?.settings?.options[
              stagedChanges?.[params.row.id]?.[params.field]
            ] ||
            field?.settings?.options[params?.value] ||
            "Select"}
      </Button>
      <Menu
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "left",
        }}
        anchorEl={anchorEl}
        open={!!anchorEl}
      >
        <MenuItem
          onClick={() => {
            handleChange(null);
          }}
        >
          Select
        </MenuItem>
        {Object.entries(field?.settings?.options)?.map(([key, value]) => (
          <MenuItem
            key={key}
            onClick={() => {
              handleChange(key);
            }}
          >
            {value}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};

export const BooleanCell = ({ params }: { params: GridRenderCellParams }) => {
  const { stagedChanges, updateStagedChanges } = useStagedChanges();
  const { modelZUID } = useRouterParams<{ modelZUID: string }>();
  const { data: fields, isFetching: isFieldsFetching } =
    useGetContentModelFieldsQuery(modelZUID);
  const field = fields?.find((field) => field.name === params.field);
  const handleChange = (value: any) => {
    updateStagedChanges(params.row.id, params.field, value);
  };

  return (
    <ToggleButtonGroup
      size="small"
      color="primary"
      value={stagedChanges?.[params.row.id]?.[params.field] ?? params.value}
      exclusive
      onChange={(e, value) => {
        e.stopPropagation();
        if (value === null) {
          return;
        }
        handleChange(Number(value));
      }}
    >
      {Object.entries(field?.settings?.options)?.map(([key, value]) => (
        <ToggleButton key={key} value={Number(key)}>
          {value}
        </ToggleButton>
      ))}
    </ToggleButtonGroup>
  );
};

export const SortCell = ({ params }: { params: GridRenderCellParams }) => {
  const { stagedChanges, updateStagedChanges } = useStagedChanges();
  const handleChange = (value: any) => {
    updateStagedChanges(params.row.id, params.field, value);
  };

  return (
    <FieldTypeSort
      value={
        stagedChanges?.[params.row.id]?.[params.field]?.toString() ??
        (params.value?.toString() || "0")
      }
      onChange={(evt) => {
        handleChange(parseInt(evt.target.value));
      }}
      height={40}
    />
  );
};

export const VersionCell = ({ params }: { params: GridRenderCellParams }) => {
  const { data: users } = useGetUsersQuery();

  const createdByUser = users?.find(
    (user) => user.ZUID === params.row?.meta?.createdByUserZUID
  );
  const publishedByUser =
    users?.find(
      (user) => user.ZUID === params.row?.publishing?.publishedByUserZUID
    ) ||
    users?.find(
      (user) => user.ZUID === params.row?.priorPublishing?.publishedByUserZUID
    );
  const isScheduledPublish =
    new Date(
      params.row?.publishing?.publishAt ||
        params.row?.priorPublishing?.publishAt
    )?.getTime() > new Date()?.getTime();

  return (
    <Stack spacing={0.25}>
      {params.row?.meta?.version !== params.row?.publishing?.version && (
        <Tooltip
          enterDelay={1000}
          enterNextDelay={1000}
          title={`v${params.row?.meta?.version} saved on ${new Date(
            params.row?.meta?.updatedAt
          ).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "numeric",
            minute: "numeric",
            timeZoneName: "short",
          })} by ${createdByUser?.firstName} ${createdByUser?.lastName}`}
          slotProps={{
            popper: {
              style: {
                width: 116,
              },
            },
          }}
          placement="bottom"
        >
          <Chip
            label={`v${params.row?.meta?.version}`}
            size="small"
            color="info"
          />
        </Tooltip>
      )}
      {(params.row?.publishing?.version ||
        params.row?.priorPublishing?.version) && (
        <Tooltip
          enterDelay={1000}
          enterNextDelay={1000}
          title={`v${
            params.row?.publishing?.version ||
            params.row?.priorPublishing?.version
          } ${
            isScheduledPublish ? "scheduled to publish" : "published"
          } on ${new Date(
            params.row?.publishing?.publishAt ||
              params.row?.priorPublishing?.publishAt
          ).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "numeric",
            minute: "numeric",
            timeZoneName: "short",
          })} by ${publishedByUser?.firstName} ${publishedByUser?.lastName}`}
          slotProps={{
            popper: {
              style: {
                width: isScheduledPublish ? 116 : 146,
              },
            },
          }}
          placement="bottom"
        >
          <Chip
            label={`v${
              params.row?.publishing?.version ||
              params.row?.priorPublishing?.version
            }`}
            size="small"
            color={isScheduledPublish ? "warning" : "success"}
          />
        </Tooltip>
      )}
    </Stack>
  );
};
