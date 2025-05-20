import { FC, useEffect, useMemo } from "react";
import { Box, Typography } from "@mui/material";
import {
  GridColDef,
  GridActionsCellItem,
  GridValidRowModel,
} from "@mui/x-data-grid";
import { Redirects } from "../../../../../../../../shell/services/types";
import ModeEditIcon from "@mui/icons-material/ModeEdit";
import DeleteIcon from "@mui/icons-material/Delete";
import { DataGridPro, GridRenderCellParams } from "@mui/x-data-grid-pro";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import { useRedirectsDialog } from "../../../../../../../seo/src/app/components/RedirectsDialogProvider";
import { useRedirectsTable } from "../../../../../../../seo/src/views/RedirectsManager/RedirectsTable/RedirectsTableContextProvider";

type IncomingRedirectsProps = {
  modelZUID: string;
  target: string | number;
  urlPath: string;
};

const DEFAULT_COLUMN_PROPS = {
  resizable: false,
  disableReorder: true,
  filterable: false,
  hideable: false,
  hideSortIcons: true,
  disableColumnMenu: true,
  sortable: false,
};

const IncomingRedirects: FC<IncomingRedirectsProps> = ({
  modelZUID,
  target,
  urlPath,
}) => {
  const { openDeleteDialog, openCreateForm } = useRedirectsDialog();
  const { redirects, isLoading } = useRedirectsTable();

  const columns: GridColDef[] = [
    {
      field: "path",
      headerName: "Incoming Path",
      flex: 1,
      ...DEFAULT_COLUMN_PROPS,
    },
    {
      field: "code",
      headerName: "HTTP Code",
      width: 150,
      ...DEFAULT_COLUMN_PROPS,
      renderCell: ({ value }: GridRenderCellParams<GridValidRowModel>) => {
        return (
          <Typography
            variant="body2"
            color="text.primary"
            height="100%"
            sx={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "flex-start",
              alignItems: "center",
              columnGap: "12px",
              lineHeight: "100%",
            }}
          >
            {value}
            <ArrowForwardRoundedIcon fontSize="small" color="action" />
          </Typography>
        );
      },
    },
    {
      field: "actions",
      type: "actions",
      width: 54,
      minWidth: 54,
      maxWidth: 54,
      resizable: false,

      getActions: ({ row }: { row: Redirects }) => [
        <GridActionsCellItem
          showInMenu
          icon={<ModeEditIcon fontSize="small" />}
          color="action.secondary"
          label="Edit Redirect"
          onClick={() => {
            openCreateForm({
              ZUID: row?.ZUID,
              targetType: row?.targetType,
              code: row?.code,
              target: row?.target,
              path: row?.path,
            });
          }}
        />,
        <GridActionsCellItem
          showInMenu
          icon={<DeleteIcon fontSize="small" />}
          color="action.secondary"
          label="Delete Redirect"
          onClick={() => openDeleteDialog([{ ZUID: row.ZUID, path: row.path }])}
        />,
      ],
    },
  ];

  const rows = useMemo(() => {
    if (isLoading) return [];
    const filtered = redirects
      ?.filter((item) => item.target === target)
      .map((item) => ({
        id: item?.ZUID,
        ZUID: item?.ZUID,
        path: item?.path,
        code: item?.code,
        targetType: item?.targetType,
        target: item?.target,
        updatedAt: item?.updatedAt,
        urlPath,
      }));

    return filtered;
  }, [isLoading, redirects, target, urlPath]);

  return (
    <Box width="100%">
      <DataGridPro
        loading={isLoading}
        columns={columns}
        rows={rows}
        disableRowSelectionOnClick
        columnHeaderHeight={52}
        rowHeight={52}
        hideFooter
        sx={{
          bgcolor: "background.paper",
          color: "text.primary",
          "& .MuiDataGrid-cell, & .MuiDataGrid-columnHeader": {
            outline: "none!important",
          },
        }}
      />
    </Box>
  );
};

export default IncomingRedirects;
