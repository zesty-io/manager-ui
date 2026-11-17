import {
  forwardRef,
  useEffect,
  useMemo,
  useState,
  useCallback,
  useRef,
  useReducer,
} from "react";
import {
  Dialog,
  DialogContent,
  TextField,
  InputAdornment,
  Box,
} from "@mui/material";
import { Search } from "@mui/icons-material";
import {
  DataGridPro,
  GridLogicOperator,
  GridRenderCellParams,
} from "@mui/x-data-grid-pro";
import { debounce } from "lodash";
import { Trans, useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import AutoSizer, { Size } from "react-virtualized-auto-sizer";

import { FieldSelectorFilters, STATUS_FILTER } from "./FieldSelectorFilters";
import {
  useGetLangsQuery,
  useGetContentModelFieldsQuery,
} from "../../../services/instance";
import { ImageCell } from "./ImageCell";
import { TitleCell } from "./TitleCell";
import { VersionCell } from "./VersionCell";
import { ItemsLoading } from "./ItemsLoading";
import { useGetUsersQuery } from "../../../services/accounts";
import { EmptyResults } from "../../EmptyResults";
import { DialogHeader } from "./DialogHeader";
import { fetchItems } from "../../../store/content";
import { AppState } from "../../../store/types";
import { ContentItem } from "../../../services/types";
import { getDateFilterFnByValues } from "../../Filters/DateFilter/getDateFilter";
import { statusFilterOperator } from "./statusFilter";
import { userFilterOperator } from "./userFilter";
import { keywordSearchFilterOperator } from "./keywordSearchFilter";
import { dateFilterOperator } from "./dateFilter";

// The grid passes a ref to its columnHeaders slot, so it must accept one
const NoColumnHeaders = forwardRef<HTMLDivElement>(() => null);

const selectFilteredItems = (
  state: AppState,
  modelZUID: string,
  activeLangId: number | null,
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

export type FieldFilters = {
  sortOrder: string;
  user: string | null;
  date: {
    preset: string | null;
    from: string | null;
    to: string | null;
  };
  lang: number | null;
  status: keyof typeof STATUS_FILTER | null;
};
type FieldSelectorDialogProps = {
  onClose: () => void;
  modelZUID: string;
  relatedFieldName: string;
  selectedZUIDs: string[];
  onUpdateSelectedZUIDs: (selectedZUIDs: string[]) => void;
  fieldLabel: string;
  multiselect?: boolean;
  replace?: string | null;
};
export const FieldSelectorDialog = ({
  onClose,
  modelZUID,
  relatedFieldName,
  selectedZUIDs,
  onUpdateSelectedZUIDs,
  fieldLabel,
  multiselect,
  replace = null,
}: FieldSelectorDialogProps) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { data: langs } = useGetLangsQuery({});
  const userSelectedLangCode = useSelector(
    (state: AppState) => state?.user?.selected_lang
  );
  const [noResults, setNoResults] = useState<boolean>(false);
  const searchField = useRef<HTMLInputElement>(null);
  const [filterKeyword, setFilterKeyword] = useState<string>("");
  const [filters, updateFilters] = useReducer(
    (state: FieldFilters, newValue: Partial<FieldFilters>): FieldFilters => {
      return {
        ...state,
        ...newValue,
      };
    },
    {
      sortOrder: "lastSaved",
      user: null,
      date: {
        preset: null,
        from: null,
        to: null,
      },
      lang: null,
      status: null,
    }
  );
  const [selectionModel, setSelectionModel] = useState<any>(
    !!replace ? [] : selectedZUIDs
  );
  const [isFetchingContentItems, setIsFetchingContentItems] = useState(false);

  const langCode = langs?.find((lang) => lang.ID === filters.lang)?.code;
  const contentItems = useSelector((state: AppState) =>
    selectFilteredItems(state, modelZUID, filters.lang, isFetchingContentItems)
  );
  const { data: relatedModelFields, isLoading: isLoadingRelatedModel } =
    useGetContentModelFieldsQuery(
      { modelZUID },
      {
        skip: !modelZUID,
      }
    );
  const { data: users, isLoading: isLoadingUsers } = useGetUsersQuery();

  useEffect(() => {
    if (!!langs?.length && userSelectedLangCode) {
      updateFilters({
        lang: langs.find((lang) => lang.code === userSelectedLangCode)?.ID,
      });
    }
  }, [langs, userSelectedLangCode]);

  useEffect(() => {
    if (!!modelZUID) {
      setIsFetchingContentItems(true);
      dispatch(
        fetchItems(modelZUID, {
          lang: langCode,
          limit: 5000,
        })
        // @ts-ignore
      ).then(() => {
        setIsFetchingContentItems(false);
      });
    }
  }, [modelZUID, langCode]);

  const imageFieldName = useMemo(() => {
    if (!relatedModelFields?.length) return null;

    const imageFields = relatedModelFields.filter(
      (field) => !field.deletedAt && field.datatype === "images"
    );

    return imageFields?.[0]?.name || null;
  }, [relatedModelFields]);

  const columns = useMemo(() => {
    let defaultCols: any = [
      // Column is only used for keyword search purposes
      {
        field: "keywordSearch",
        filterOperators: [keywordSearchFilterOperator],
      },
      {
        field: "title",
        flex: 1,
        renderCell: (params: GridRenderCellParams) => (
          <TitleCell
            primaryText={params.formattedValue?.primary}
            secondaryText={params.formattedValue?.secondary}
          />
        ),
      },
      {
        field: "version",
        width: 60,
        filterOperators: [
          userFilterOperator,
          statusFilterOperator,
          dateFilterOperator,
        ],
        renderCell: (params: GridRenderCellParams) => (
          <VersionCell
            itemData={params.value?.itemData}
            publishData={params.value?.publishData}
            scheduleData={params.value?.scheduleData}
          />
        ),
      },
    ];

    if (imageFieldName) {
      defaultCols = [
        {
          field: "image",
          width: 40,
          minWidth: 40,
          renderCell: (params: GridRenderCellParams) => (
            <ImageCell
              imageFieldName={params.formattedValue?.imageFieldName}
              itemZUID={params.formattedValue?.itemZUID}
            />
          ),
        },
        ...defaultCols,
      ];
    }

    return defaultCols;
  }, [imageFieldName]);

  const resolveUserZUID = (userZUID: string) => {
    const user = users?.find((user) => user.ZUID === userZUID);

    if (!!user) {
      return `${user?.firstName} ${user.lastName}`;
    }

    return userZUID;
  };

  const mappedRows = useMemo(() => {
    if (!contentItems?.length || !users?.length) return [];

    let _rows = [...contentItems];

    return _rows
      ?.filter((item) => !item.meta?.ZUID?.startsWith("new"))
      ?.map((item) => ({
        id: item.meta?.ZUID,
        // Column is only used for keyword search purposes
        keywordSearch: {
          title: {
            primary:
              item.data?.[relatedFieldName] ||
              item.web?.metaTitle ||
              item.web?.metaLinkText,
            secondary: item.web?.metaDescription,
          },
          version: {
            itemData: {
              ...item,
              createdByName: resolveUserZUID(item.meta?.createdByUserZUID),
            },
            publishData: item?.publishing?.version
              ? {
                  ...item.publishing,
                  publishedByName: resolveUserZUID(
                    item.publishing?.publishedByUserZUID
                  ),
                }
              : null,
            scheduleData: item?.scheduling?.version
              ? {
                  ...item.scheduling,
                  scheduledByName: resolveUserZUID(
                    item.scheduling?.publishedByUserZUID
                  ),
                }
              : null,
          },
        },
        image: {
          imageFieldName,
          itemZUID: item.meta?.ZUID,
        },
        title: {
          primary:
            item.data?.[relatedFieldName] ||
            item.web?.metaTitle ||
            item.web?.metaLinkText,
          secondary: item.web?.metaDescription,
        },
        version: {
          itemData: {
            ...item,
            createdByName: resolveUserZUID(item.meta?.createdByUserZUID),
          },
          publishData: item?.publishing?.version
            ? {
                ...item.publishing,
                publishedByName: resolveUserZUID(
                  item.publishing?.publishedByUserZUID
                ),
              }
            : null,
          scheduleData: item?.scheduling?.version
            ? {
                ...item.scheduling,
                scheduledByName: resolveUserZUID(
                  item.scheduling?.publishedByUserZUID
                ),
              }
            : null,
        },
        item,
      }));
  }, [contentItems, users, relatedFieldName, imageFieldName]);

  const rows = useMemo(() => {
    if (!mappedRows?.length) return [];

    let _rows = [...mappedRows];

    // Sorting
    _rows?.sort((a: any, b: any) => {
      if (filters.sortOrder === "lastSaved") {
        const dateA = new Date(a.item?.web?.createdAt).getTime();
        const dateB = new Date(b.item?.web?.createdAt).getTime();

        if (!a.item?.web?.createdAt) {
          return -1;
        } else if (!b.item?.web?.createdAt) {
          return 1;
        } else {
          return dateB - dateA;
        }
      } else if (filters.sortOrder === "lastPublished") {
        // Handle undefined publishAt by setting a default far-future date for sorting purposes

        let dateA =
          a?.item?.scheduling?.publishAt || a?.item?.publishing?.publishAt;
        dateA = dateA ? new Date(dateA).getTime() : Number.NEGATIVE_INFINITY;

        let dateB =
          b?.item?.scheduling?.publishAt || b?.item?.publishing?.publishAt;
        dateB = dateB ? new Date(dateB).getTime() : Number.NEGATIVE_INFINITY;

        return dateB - dateA;
      } else if (filters.sortOrder === "createdOn") {
        const aDate = a?.item?.meta?.createdAt
          ? new Date(a.item.meta.createdAt).getTime()
          : null;
        const bDate = b?.item?.meta?.createdAt
          ? new Date(b.item.meta.createdAt).getTime()
          : null;

        if (aDate == null && bDate == null) return 0;
        if (aDate == null) return 1;
        if (bDate == null) return -1;

        return bDate - aDate; // newest first
      } else if (filters.sortOrder === "version") {
        const aIsPublished = a?.item?.publishing?.publishAt;
        const bIsPublished = b?.item?.publishing?.publishAt;

        const aIsScheduled = a?.item?.scheduling?.publishAt;
        const bIsScheduled = b?.item?.scheduling?.publishAt;

        // Check if meta.version exists
        const aHasVersion = a?.item?.meta?.version !== null;
        const bHasVersion = b?.item?.meta?.version !== null;

        // Place items without meta.version at the bottom
        if (!aHasVersion && bHasVersion) {
          return 1;
        } else if (aHasVersion && !bHasVersion) {
          return -1;
        }

        // Items with only publish date
        if (aIsPublished && !aIsScheduled && bIsPublished && !bIsScheduled) {
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
          return (
            new Date(bIsPublished).getTime() - new Date(aIsPublished).getTime()
          ); // Both are published, sort by publish date descending
        } else if (aIsPublished) {
          return -1; // A is published, B is not
        } else if (bIsPublished) {
          return 1; // B is published, A is not
        }

        return 0; // Neither are published or scheduled
      } else if (filters.sortOrder === "createdBy") {
        const userA = a?.version?.itemData?.createdByName;
        const userB = b?.version?.itemData?.createdByName;

        const startsWithNumber = (str: string) => /^\d/.test(str);

        if (!userA || (startsWithNumber(userA) && !startsWithNumber(userB))) {
          return 1;
        } else if (
          !userB ||
          (!startsWithNumber(userA) && startsWithNumber(userB))
        ) {
          return -1;
        } else {
          return userA.localeCompare(userB);
        }
      } else if (filters.sortOrder === "zuid") {
        return a?.item?.meta?.ZUID?.localeCompare(b?.item?.meta?.ZUID);
      } else if (
        relatedModelFields?.find((field) => field.name === filters.sortOrder)
      ) {
        const fieldName = filters.sortOrder;
        const dataType = relatedModelFields?.find(
          (field) => field.name === filters.sortOrder
        )?.datatype;

        if (typeof a?.item?.data[fieldName] === "number") {
          if (a?.item?.data[fieldName] == null) return 1;
          if (b?.item?.data[fieldName] == null) return -1;

          if (dataType === "sort") {
            return b?.item?.data[fieldName] - a?.item?.data[fieldName];
          }

          return b?.item?.data[fieldName] - a?.item?.data[fieldName];
        }
        if (dataType === "date" || dataType === "datetime") {
          if (!a?.item?.data[fieldName]) {
            return 1;
          } else if (!b?.item?.data[fieldName]) {
            return -1;
          } else {
            return (
              new Date(b?.item?.data[fieldName]).getTime() -
              new Date(a?.item?.data[fieldName]).getTime()
            );
          }
        }

        if (dataType === "yes_no") {
          if (!a?.item?.data[fieldName]) {
            return 1;
          } else if (!b?.item?.data[fieldName]) {
            return -1;
          } else {
            return b - a;
          }
        }

        const aValue =
          dataType === "images"
            ? a?.item?.data[fieldName]?.filename
            : a?.item?.data[fieldName];
        const bValue =
          dataType === "images"
            ? b?.item?.data[fieldName]?.filename
            : b?.item?.data[fieldName];

        return aValue?.trim()?.localeCompare(bValue?.trim());
      } else {
        const dateA = new Date(a.item?.web?.createdAt).getTime();
        const dateB = new Date(b.item?.web?.createdAt).getTime();

        if (!a.item?.web?.createdAt) {
          return -1;
        } else if (!b.item?.web?.createdAt) {
          return 1;
        } else {
          return dateB - dateA;
        }
      }
    });

    return _rows;
  }, [mappedRows, relatedModelFields]);

  const deletedItemZUIDs = useMemo(() => {
    if (!contentItems?.length || !selectedZUIDs) return [];

    return (
      selectedZUIDs.filter(
        (ZUID) => !contentItems?.find((item) => item.meta?.ZUID === ZUID)
      ) || []
    );
  }, [contentItems, selectedZUIDs]);

  const debouncedSetFilterKeyword = useCallback(
    debounce((value) => {
      setFilterKeyword(value);
    }, 300),
    [setFilterKeyword]
  );

  const isLoading =
    isFetchingContentItems || isLoadingRelatedModel || isLoadingUsers;
  const isFilteringResults =
    !!filterKeyword ||
    !!filters.status ||
    !!filters.user ||
    !!filters.date.preset ||
    !!filters.date.from ||
    !!filters.date.to;
  const filteredSelectionModels = (selectionModel as string[])?.filter(
    (ZUID) => !deletedItemZUIDs?.includes(ZUID)
  );

  // In replace mode the already-selected items are not candidates
  const gridRows = useMemo(
    () =>
      !!replace
        ? rows?.filter((row) => !selectedZUIDs?.includes(row?.id))
        : rows,
    [rows, replace, selectedZUIDs]
  );
  const hasGridRows = !!gridRows?.length;

  // noResults only updates from the grid's onRowCountChange, which doesn't
  // fire on remount when every row passes the filters, so reset it whenever
  // the grid unmounts
  useEffect(() => {
    if (isLoading || !hasGridRows) {
      setNoResults(false);
    }
  }, [isLoading, hasGridRows]);

  const showFilterEmptyState =
    isFilteringResults && (!hasGridRows || noResults);

  const filterEmptyState = (
    <Box
      data-cy="NoSearchResults"
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: "100%",
        bgcolor: "background.paper",
      }}
    >
      <EmptyResults
        variant="search"
        size="page"
        query={filterKeyword}
        title={
          <Trans
            i18nKey="shell.filterNoResultsRich"
            values={{ query: filterKeyword }}
            components={{
              strong: (
                <Box
                  component="strong"
                  fontWeight="bold"
                  sx={{ wordBreak: "break-word" }}
                />
              ),
            }}
          />
        }
        onAction={() => {
          if (!!filterKeyword) {
            setFilterKeyword("");
            if (!!searchField.current) {
              searchField.current.value = "";
              searchField.current.focus();
            }
          }

          updateFilters({
            sortOrder: "lastSaved",
            user: null,
            date: {
              preset: null,
              from: null,
              to: null,
            },
            lang: userSelectedLangCode
              ? langs?.find((lang) => lang.code === userSelectedLangCode)?.ID
              : null,

            status: null,
          });
        }}
      />
    </Box>
  );

  return (
    <Dialog
      open
      onClose={onClose}
      fullScreen
      PaperProps={{
        sx: {
          width: 800,
          maxWidth: 800,
          minHeight: 680,
          maxHeight: "min(1240px, calc(100% - 40px))", // 40px is the top & bottom margin
        },
      }}
    >
      <DialogHeader
        fieldLabel={fieldLabel}
        multiselect={multiselect}
        selectedCount={filteredSelectionModels?.length || 0}
        onClose={onClose}
        onDeselectAll={() => setSelectionModel([])}
        onDone={() => {
          if (!!replace) {
            const newSelectionModel = selectedZUIDs?.map((zuid) =>
              zuid === replace ? (selectionModel as string[])[0] : zuid
            );
            onUpdateSelectedZUIDs(newSelectionModel as string[]);
          } else {
            onUpdateSelectedZUIDs(selectionModel as string[]);
          }
        }}
        loading={isLoading}
        replace={replace || null}
      />
      <DialogContent
        id="fieldSelectorDialogBody"
        sx={{
          pb: 2,
          px: 4,
          bgcolor: "grey.50",
          borderTop: 1,
          borderColor: "border",
          display: "flex",
          flexDirection: "column",
          gap: 2,
          height: "100%",

          "&#fieldSelectorDialogBody": {
            pt: 2,
          },
        }}
      >
        <TextField
          data-cy="relational-fields-search-input"
          inputRef={searchField}
          fullWidth
          onChange={(evt) => debouncedSetFilterKeyword(evt.currentTarget.value)}
          size="small"
          placeholder={t("shell.relationalFilterItems")}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            },
          }}
        />
        <FieldSelectorFilters
          modelZUID={modelZUID}
          filters={filters}
          onUpdateFilter={updateFilters}
        />
        {isLoading ? (
          <ItemsLoading />
        ) : (
          <Box
            height={
              showFilterEmptyState
                ? 610
                : hasGridRows
                ? gridRows.length * 64 + 2
                : "auto"
            }
            maxHeight={1024}
          >
            {!hasGridRows && isFilteringResults && filterEmptyState}
            {!hasGridRows && !isFilteringResults && (
              <EmptyResults
                variant="filter"
                size="compact"
                title={t("shell.noResultsFound")}
              />
            )}
            {hasGridRows && (
              <AutoSizer>
                {({ width, height }: Size) => (
                  <DataGridPro
                    keepNonExistentRowsSelected
                    style={{
                      width: width,
                      height: height,
                    }}
                    sortingMode="server"
                    checkboxSelection
                    columns={columns}
                    rows={gridRows}
                    slots={{
                      noResultsOverlay: () => filterEmptyState,
                      columnHeaders: NoColumnHeaders,
                    }}
                    rowHeight={64}
                    hideFooter
                    filterModel={{
                      items: [
                        {
                          field: "keywordSearch",
                          operator: "keywordContains",
                          value: filterKeyword,
                          id: "keyword",
                        },
                        ...(filters.status
                          ? [
                              {
                                field: "version",
                                operator: "statusEquals",
                                value: filters.status,
                                id: "status",
                              },
                            ]
                          : []),
                        ...(filters.user
                          ? [
                              {
                                field: "version",
                                operator: "userEquals",
                                value: filters.user,
                                id: "user",
                              },
                            ]
                          : []),
                        ...(filters.date.preset ||
                        filters.date.from ||
                        filters.date.to
                          ? [
                              {
                                field: "version",
                                operator: "dateFilter",
                                value: filters.date,
                                id: "date",
                              },
                            ]
                          : []),
                      ],
                      logicOperator: GridLogicOperator.And,
                    }}
                    onRowCountChange={(count) => {
                      setNoResults(count < 1);
                    }}
                    rowSelectionModel={filteredSelectionModels}
                    onRowSelectionModelChange={(newSelectionModel: any) => {
                      let _newSelectionModel = newSelectionModel as string[];

                      if (!multiselect && _newSelectionModel?.length > 1) {
                        _newSelectionModel = [_newSelectionModel[0]];
                      }

                      setSelectionModel([
                        ...deletedItemZUIDs,
                        ..._newSelectionModel,
                      ]);
                    }}
                    initialState={{
                      columns: {
                        columnVisibilityModel: { keywordSearch: false },
                      },
                    }}
                    sx={{
                      bgcolor: "background.paper",

                      "& .MuiDataGrid-columnHeaders": {
                        borderBottom: 0,
                      },

                      "& .MuiDataGrid-cellCheckbox": {
                        mx: "3px",
                      },

                      "& .MuiDataGrid-row.Mui-selected": {
                        borderBottom: (theme) =>
                          `1px solid ${theme.palette.primary.main}`,

                        "& .MuiDataGrid-cell": {
                          borderBottom: 0,
                        },
                      },

                      "& .MuiDataGrid-cell:focus-within": {
                        outline: "none",
                      },

                      ".MuiDataGrid-row": {
                        cursor: "pointer",
                      },

                      "& [data-field='image']": {
                        p: 0,
                      },

                      "& [data-field='title']": {
                        pl: !!imageFieldName ? 2 : 0,
                        pr: 2,
                      },

                      "& [data-field='version']": {
                        pl: 0,
                        pr: 2,
                        justifyContent: "center",
                      },

                      // Makes sure that the custom overlay is interactive
                      "& [data-cy='NoSearchResults']": {
                        pointerEvents: "all",
                      },
                    }}
                  />
                )}
              </AutoSizer>
            )}
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
};
