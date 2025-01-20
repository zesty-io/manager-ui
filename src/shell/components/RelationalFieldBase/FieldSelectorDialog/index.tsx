import { useEffect, useMemo, useState, useCallback, useRef } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Typography,
  TextField,
  IconButton,
  InputAdornment,
  Box,
} from "@mui/material";
import { CloseRounded, Search } from "@mui/icons-material";
import {
  DataGridPro,
  GridColumns,
  GridInputSelectionModel,
  GridRenderCellParams,
} from "@mui/x-data-grid-pro";
import { debounce } from "lodash";

import { FieldSelectorFilters, STATUS_FILTER } from "./FieldSelectorFilters";
import { DateFilterValue } from "../../Filters/DateFilter";
import {
  useGetLangsQuery,
  useGetContentModelItemsQuery,
  useGetContentModelFieldsQuery,
} from "../../../services/instance";
import { ImageCell } from "./ImageCell";
import { TitleCell } from "./TitleCell";
import { VersionCell } from "./VersionCell";
import { ItemsLoading } from "./ItemsLoading";
import { useGetUsersQuery } from "../../../services/accounts";
import { NoSearchResults } from "../../NoSearchResults";

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
  const searchField = useRef(null);
  const [filterKeyword, setFilterKeyword] = useState<string>(null);
  const [sortOrder, setSortOrder] = useState<string>("lastSaved");
  const [statusFilter, setStatusFilter] =
    useState<keyof typeof STATUS_FILTER>(null);
  const [userFilter, setUserFilter] = useState<string>(null);
  const [dateFilter, setDateFilter] = useState<DateFilterValue>({
    type: "",
    value: "",
  });
  const [langFilter, setLangFilter] = useState<number>(null);
  const [selectionModel, setSelectionModel] =
    useState<GridInputSelectionModel>(selectedZUIDs);

  const { data: langs } = useGetLangsQuery({});
  const langCode = langs?.find((lang) => lang.ID === langFilter)?.code;
  const { data: contentItems, isFetching: isFetchingContentItems } =
    useGetContentModelItemsQuery(
      {
        modelZUID,
        params: {
          lang: langCode,
        },
      },
      { skip: !modelZUID || !langCode }
    );
  const { data: relatedModelFields, isLoading: isLoadingRelatedModel } =
    useGetContentModelFieldsQuery(modelZUID, {
      skip: !modelZUID,
    });
  const { data: users, isLoading: isLoadingUsers } = useGetUsersQuery();

  useEffect(() => {
    if (!!langs?.length) {
      setLangFilter(langs.find((lang) => lang.default)?.ID);
    }
  }, [langs]);

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
            modelZUID={params.value?.modelZUID}
            itemZUID={params.value?.itemZUID}
            itemData={params.value?.itemData}
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

  const rows = useMemo(() => {
    if (!contentItems?.length || !users?.length) return [];

    let mappedContentItems = [...contentItems];

    if (!!filterKeyword) {
      const search = filterKeyword.toLowerCase();

      mappedContentItems = mappedContentItems?.filter((item) => {
        const matchedUser = users.find(
          (user) => user.ZUID === item?.meta?.createdByUserZUID
        );
        const creator = matchedUser
          ? `${matchedUser.firstName} ${matchedUser.lastName}`
          : null;

        return (
          Object.values(item.data).some((value: any) => {
            if (!value) return false;

            if (value?.filename || value?.title) {
              return (
                value?.filename?.toLowerCase()?.includes(search) ||
                value?.title?.toLowerCase()?.includes(search)
              );
            }

            return value.toString().toLowerCase().includes(search);
          }) ||
          item?.meta?.createdAt?.toLowerCase().includes(search) ||
          item?.web?.updatedAt?.toLowerCase().includes(search) ||
          item?.meta?.ZUID?.toLowerCase().includes(search) ||
          creator?.toLowerCase()?.includes(search)
        );
      });
    }

    return mappedContentItems?.map((item) => ({
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
        modelZUID,
        itemZUID: item?.meta?.ZUID,
        itemData: item,
      },
    }));
  }, [contentItems, relatedFieldName, imageFieldName, filterKeyword, users]);

  const debouncedSetFilterKeyword = useCallback(
    debounce((value) => {
      setFilterKeyword(value);
    }, 300),
    [setFilterKeyword]
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
      <DialogTitle
        component="div"
        sx={{
          pt: 4,
          pb: 2,
          px: 4,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography variant="h3" fontWeight={700}>
          Select {modelName}
        </Typography>
        <IconButton size="small" onClick={onClose}>
          <CloseRounded fontSize="small" />
        </IconButton>
      </DialogTitle>
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
          sortOrder={sortOrder}
          onUpdateSortOrder={(newSortOrder) => setSortOrder(newSortOrder)}
          statusFilter={statusFilter}
          onUpdateStatusFilter={(newStatusFilter) =>
            setStatusFilter(newStatusFilter)
          }
          userFilter={userFilter}
          onUpdateUserFilter={(userZUID) => setUserFilter(userZUID)}
          dateFilter={dateFilter}
          onUpdateDateFilter={(newDateFilter) => setDateFilter(newDateFilter)}
          langFilter={langFilter}
          onUpdateLangFilter={(langID) => setLangFilter(langID)}
        />
        {isFetchingContentItems || isLoadingRelatedModel || isLoadingUsers ? (
          <ItemsLoading />
        ) : (
          <Box
            height={
              !rows?.length && !!filterKeyword ? 610 : rows?.length * 64 + 2
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
            {!rows?.length && !!filterKeyword ? (
              <NoSearchResults
                query={filterKeyword}
                onSearchAgain={() => {
                  setFilterKeyword("");
                  if (!!searchField.current) {
                    searchField.current.querySelector("input").value = "";
                    searchField.current.querySelector("input").focus();
                  }
                }}
                ignoreFilters
                hideBackButton
              />
            ) : (
              <DataGridPro
                checkboxSelection
                columns={columns}
                rows={rows}
                headerHeight={0}
                rowHeight={64}
                hideFooter
                selectionModel={selectionModel}
                onSelectionModelChange={(newSelectionModel) => {
                  if (!multiselect && newSelectionModel?.length > 1) {
                    return;
                  }

                  setSelectionModel(newSelectionModel);
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
