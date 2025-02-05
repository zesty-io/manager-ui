import {
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
  GridColumns,
  GridInputSelectionModel,
  GridRenderCellParams,
} from "@mui/x-data-grid-pro";
import { debounce } from "lodash";
import { useDispatch, useSelector } from "react-redux";

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
import { NoSearchResults } from "../../NoSearchResults";
import { DialogHeader } from "./DialogHeader";
import { fetchItems } from "../../../store/content";
import { AppState } from "../../../store/types";
import { ContentItem } from "../../../services/types";
import moment from "moment";
import { getDateFilterFnByValues } from "../../Filters/DateFilter/getDateFilter";

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

export type FieldFilters = {
  sortOrder: string;
  user: string;
  date: {
    preset: string;
    from: string;
    to: string;
  };
  lang: number;
  status: keyof typeof STATUS_FILTER;
};
type FieldSelectorDialogProps = {
  onClose: () => void;
  modelZUID: string;
  modelName: string;
  relatedFieldName: string;
  selectedZUIDs: string[];
  onUpdateSelectedZUIDs: (selectedZUIDs: string[]) => void;
  multiselect?: boolean;
};
export const FieldSelectorDialog = ({
  onClose,
  modelZUID,
  modelName,
  relatedFieldName,
  selectedZUIDs,
  onUpdateSelectedZUIDs,
  multiselect,
}: FieldSelectorDialogProps) => {
  const dispatch = useDispatch();
  const searchField = useRef(null);
  const [filterKeyword, setFilterKeyword] = useState<string>(null);
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
  const [selectionModel, setSelectionModel] =
    useState<GridInputSelectionModel>(selectedZUIDs);
  const [isFetchingContentItems, setIsFetchingContentItems] = useState(false);

  const { data: langs } = useGetLangsQuery({});
  const langCode = langs?.find((lang) => lang.ID === filters.lang)?.code;
  const contentItems = useSelector((state: AppState) =>
    selectFilteredItems(state, modelZUID, filters.lang, isFetchingContentItems)
  );
  const { data: relatedModelFields, isLoading: isLoadingRelatedModel } =
    useGetContentModelFieldsQuery(modelZUID, {
      skip: !modelZUID,
    });
  const { data: users, isLoading: isLoadingUsers } = useGetUsersQuery();

  useEffect(() => {
    if (!!langs?.length) {
      updateFilters({ lang: langs.find((lang) => lang.default)?.ID });
    }
  }, [langs]);

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
    let defaultCols: GridColumns<any> = [
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

    return _rows?.map((item) => ({
      id: item.meta?.ZUID,
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
        // return moment(dateB).diff(moment(dateA));
      } else if (filters.sortOrder === "createdOn") {
        return moment(b?.item?.meta.createdAt).diff(a?.item?.meta.createdAt);
        // new Date(b?.item?.meta.createdAt).getTime() -
        // new Date(a?.item?.meta.createdAt).getTime()
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

    // Keyword search
    if (!!filterKeyword) {
      const search = filterKeyword.toLowerCase();

      _rows = _rows?.filter((row) => {
        const matchedUser = users.find(
          (user) => user.ZUID === row?.item?.meta?.createdByUserZUID
        );
        const creator = matchedUser
          ? `${matchedUser.firstName} ${matchedUser.lastName}`
          : null;

        return (
          Object.values(row?.item.data).some((value: any) => {
            if (!value) return false;

            if (value?.filename || value?.title) {
              return (
                value?.filename?.toLowerCase()?.includes(search) ||
                value?.title?.toLowerCase()?.includes(search)
              );
            }

            return value.toString().toLowerCase().includes(search);
          }) ||
          row?.item?.meta?.createdAt?.toLowerCase().includes(search) ||
          row?.item?.web?.updatedAt?.toLowerCase().includes(search) ||
          row?.item?.meta?.ZUID?.toLowerCase().includes(search) ||
          creator?.toLowerCase()?.includes(search)
        );
      });
    }

    // Filtering
    if (filters.status) {
      _rows = _rows?.filter((item) => {
        if (filters.status === "published") {
          return (
            item.item?.publishing?.publishAt &&
            !item.item?.scheduling?.publishAt
          );
        } else if (filters.status === "scheduled") {
          return item.item?.scheduling?.publishAt;
        } else if (filters.status === "notPublished") {
          return (
            !item.item?.publishing?.publishAt &&
            !item.item?.scheduling?.publishAt
          );
        }
      });
    }

    if (filters.user) {
      _rows = _rows.filter(
        (item) => item.item?.meta?.createdByUserZUID === filters.user
      );
    }

    const dateFilterFn = getDateFilterFnByValues(filters.date);
    if (dateFilterFn) {
      _rows = _rows.filter((item) => {
        if (!!item.item?.meta?.updatedAt) {
          return dateFilterFn(item.item?.meta?.updatedAt);
        }

        return false;
      });
    }
    return _rows;
  }, [mappedRows, filterKeyword, relatedModelFields]);

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

  return (
    <Dialog
      open
      onClose={onClose}
      PaperProps={{
        sx: {
          width: 800,
          maxWidth: 800,
          maxHeight: "min(1240px, calc(100% - 64px))",
        },
      }}
    >
      <DialogHeader
        modelName={modelName}
        multiselect={multiselect}
        selectedCount={filteredSelectionModels?.length || 0}
        onClose={onClose}
        onDeselectAll={() => setSelectionModel([])}
        onDone={() => onUpdateSelectedZUIDs(selectionModel as string[])}
        loading={isLoading}
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
          ref={searchField}
          fullWidth
          onChange={(evt) => debouncedSetFilterKeyword(evt.currentTarget.value)}
          size="small"
          placeholder="Filter Items"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
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
              !rows?.length && isFilteringResults ? 610 : rows?.length * 64 + 2
            }
            maxHeight={1024}
            sx={{
              "& [data-cy='NoSearchResults']": {
                border: 1,
                borderColor: "border",
                bgcolor: "background.paper",
                borderRadius: 2,
              },
            }}
          >
            {!rows?.length && isFilteringResults ? (
              <NoSearchResults
                query={filterKeyword}
                onSearchAgain={() => {
                  if (!!filterKeyword) {
                    setFilterKeyword("");
                    if (!!searchField.current) {
                      searchField.current.querySelector("input").value = "";
                      searchField.current.querySelector("input").focus();
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
                    lang: langs.find((lang) => lang.default)?.ID,
                    status: null,
                  });
                }}
                ignoreFilters
                hideBackButton
              />
            ) : (
              <DataGridPro
                sortingMode="server"
                checkboxSelection
                columns={columns}
                rows={rows}
                headerHeight={0}
                rowHeight={64}
                hideFooter
                selectionModel={filteredSelectionModels}
                onSelectionModelChange={(newSelectionModel) => {
                  let _newSelectionModel = newSelectionModel as string[];

                  if (!multiselect && _newSelectionModel?.length > 1) {
                    _newSelectionModel = [_newSelectionModel[0]];
                  }

                  setSelectionModel([
                    ...deletedItemZUIDs,
                    ..._newSelectionModel,
                  ]);
                }}
                sx={{
                  bgcolor: "background.paper",

                  "& .MuiDataGrid-columnHeaders": {
                    borderBottom: 0,
                  },

                  "& .MuiDataGrid-cellCheckbox": {
                    mx: "3px",
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
                }}
              />
            )}
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
};
