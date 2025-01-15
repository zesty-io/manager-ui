import { useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Typography,
  TextField,
  IconButton,
  InputAdornment,
  Stack,
  Box,
} from "@mui/material";
import { CloseRounded, Search } from "@mui/icons-material";
import { DataGridPro, GridRenderCellParams } from "@mui/x-data-grid-pro";

import { FieldSelectorFilters, STATUS_FILTER } from "./FieldSelectorFilters";
import { DateFilterValue } from "../../Filters/DateFilter";
import {
  useGetLangsQuery,
  useGetContentModelItemsQuery,
} from "../../../services/instance";

type FieldSelectorDialogProps = {
  onClose: () => void;
  modelZUID: string;
  modelName: string;
  relatedFieldName: string;
};
export const FieldSelectorDialog = ({
  onClose,
  modelZUID,
  modelName,
  relatedFieldName,
}: FieldSelectorDialogProps) => {
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

  useEffect(() => {
    if (!!langs.length) {
      setLangFilter(langs.find((lang) => lang.default)?.ID);
    }
  }, [langs]);

  const columns = useMemo(() => {
    return [
      {
        field: "image",
        width: 40,
        minWidth: 40,
        renderCell: (params: GridRenderCellParams) => (
          <Box width={40} height={40} borderRadius={1} bgcolor="grey.200" />
        ),
      },
      {
        field: "title",
        flex: 1,
        renderCell: (params: GridRenderCellParams) => (
          <Box width="100%">
            <Typography
              color="text.primary"
              fontWeight={600}
              variant="body2"
              noWrap
              sx={{
                width: "100%",
              }}
            >
              {params.formattedValue?.primary}
            </Typography>
            {params.formattedValue?.secondary && (
              <Typography
                color="text.secondary"
                variant="body2"
                noWrap
                sx={{
                  width: "100%",
                }}
              >
                {params.formattedValue.secondary}
              </Typography>
            )}
          </Box>
        ),
      },
      {
        field: "version",
        width: 60,
      },
    ];
  }, []);

  const rows = useMemo(() => {
    if (!contentItems?.length) return [];

    return contentItems.map((item) => ({
      id: item.meta.ZUID,
      image: "",
      title: {
        primary:
          item?.data[relatedFieldName] ||
          item?.web?.metaTitle ||
          item?.web?.metaLinkText,
        secondary: item?.web?.metaDescription,
      },
      version: item?.web?.version,
    }));
  }, [contentItems, relatedFieldName]);

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
          fullWidth
          value={filterKeyword}
          onChange={(evt) => setFilterKeyword(evt.currentTarget.value)}
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
        <Box height={rows?.length * 64 + 2} maxHeight={1024}>
          <DataGridPro
            checkboxSelection
            columns={columns}
            rows={rows}
            headerHeight={0}
            rowHeight={64}
            hideFooter
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
            }}
          />
        </Box>
      </DialogContent>
    </Dialog>
  );
};
