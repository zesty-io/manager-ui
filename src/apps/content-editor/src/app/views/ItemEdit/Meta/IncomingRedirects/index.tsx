import { FC, useMemo } from "react";
import { Box, Typography, Button } from "@mui/material";
import {
  GridColDef,
  GridActionsCellItem,
  GridValidRowModel,
} from "@mui/x-data-grid";
import { Redirects } from "../../../../../../../../shell/services/types";
import ModeEditIcon from "@mui/icons-material/ModeEdit";
import DeleteIcon from "@mui/icons-material/Delete";
import { DataGridPro, GridRenderCellParams } from "@mui/x-data-grid-pro";
import AddIcon from "@mui/icons-material/Add";
import { useRedirectsDialog } from "../../../../../../../seo/src/app/components/RedirectsDialogProvider";
import { useRedirectsTable } from "../../../../../../../seo/src/views/RedirectsManager/RedirectsTable/RedirectsTableContextProvider";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";

type IncomingRedirectsProps = {
  targetZUID: string;
  urlPath: string;
};

const IncomingRedirects: FC<IncomingRedirectsProps> = ({
  targetZUID,
  urlPath,
}) => {
  const { openDeleteDialog, openCreateForm } = useRedirectsDialog();
  const { redirects, isLoading } = useRedirectsTable();

  const columns: GridColDef[] = [
    {
      field: "path",
      headerName: "Incoming Path",
      flex: 1,
    },
    {
      field: "code",
      headerName: "HTTP Code",
      width: 160,
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
            openCreateForm(
              {
                ZUID: row?.ZUID,
                targetType: row?.targetType,
                code: row?.code,
                target: row?.target,
                path: row?.path,
              },
              true
            );
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
      ?.filter((item) => item.target === targetZUID)
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
  }, [isLoading, redirects, targetZUID, urlPath]);

  return (
    <>
      {!!rows?.length ? (
        <Box
          width="100%"
          display="flex"
          flexDirection="column"
          justifyContent="flex-start"
          alignItems="flex-start"
        >
          <Typography
            variant="h5"
            color="text.primary"
            fontWeight={700}
            width="100%"
          >
            Incoming Redirects
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            fontWeight={400}
            width="100%"
          >
            Manage redirects that point to this content item
          </Typography>
          <Box width="100%" py="12px">
            <DataGridPro
              loading={isLoading}
              columns={columns}
              rows={rows}
              disableRowSelectionOnClick
              columnHeaderHeight={52}
              rowHeight={52}
              hideFooter
              keepColumnPositionIfDraggedOutside
              slotProps={{
                basePopper: {
                  modifiers: [
                    {
                      name: "offset",
                      options: {
                        offset: [-35, -32],
                      },
                    },
                  ],
                },
              }}
              sx={{
                bgcolor: "background.paper",
                color: "text.primary",
                "& .MuiDataGrid-cell, & .MuiDataGrid-columnHeader": {
                  outline: "none!important",
                },
                "& .MuiDataGrid-columnSeparator": {
                  visibility: "visible",
                },
                "& .MuiDataGrid-pinnedColumnHeaders": {
                  backgroundColor: "inherit",
                },
                "& .MuiDataGrid-columnHeader": {
                  "&:hover .MuiDataGrid-columnSeparator": {
                    visibility: "visible",
                  },
                },
              }}
            />
          </Box>
          <Button
            variant="outlined"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => {
              openCreateForm({ target: targetZUID }, true);
            }}
          >
            Add Incoming Path
          </Button>
        </Box>
      ) : null}
    </>
  );
};

export default IncomingRedirects;
