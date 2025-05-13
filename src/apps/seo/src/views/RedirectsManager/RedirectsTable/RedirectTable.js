import { useMemo, useCallback, useState } from "react";
import { DataGridPro, GridActionsCellItem } from "@mui/x-data-grid-pro";
import { Box, Typography } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import OpenInNewRoundedIcon from "@mui/icons-material/OpenInNewRounded";
import DescriptionRoundedIcon from "@mui/icons-material/DescriptionRounded";
import { RedirectCreator } from "./RedirectCreator";
import { RedirectTargetCell } from "./RedirectTargetCell";
import { DeleteDialog } from "./DeleteDialog";
import HiveIcon from "@mui/icons-material/Hive";
import AutoSizer from "react-virtualized-auto-sizer";

export default function RedirectTable(props) {
  const [deleteDialogIsOpen, setDeleteDialogIsOpen] = useState(false);
  const [deleteRedirect, setDeleteRedirect] = useState(null);

  const handleRemoveRedirect = useCallback((item) => {
    setDeleteRedirect(item);
    setDeleteDialogIsOpen(true);
  }, []);

  const columns = useMemo(
    () => [
      {
        field: "path",
        minWidth: 206,
        flex: 1,
        renderHeader: () => (
          <Typography variant="body2" fontWeight={600} color="text.primary">
            Incoming Path
          </Typography>
        ),
        renderCell: ({ value }) => (
          <Typography variant="body2" color="text.primary">
            {value}
          </Typography>
        ),
      },
      {
        field: "code",
        width: 120,
        minWidth: 120,
        renderHeader: () => (
          <Typography variant="body2" fontWeight={600} color="text.primary">
            HTTP Code
          </Typography>
        ),
        renderCell: ({ value }) => {
          return (
            <Typography
              variant="body2"
              color="text.primary"
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
        field: "targetType",
        width: 120,
        minWidth: 120,
        renderHeader: () => {
          return (
            <Typography variant="body2" fontWeight={600} color="text.primary">
              Type
            </Typography>
          );
        },
        renderCell: ({ value }) => {
          return (
            <Typography
              variant="body2"
              color="text.primary"
              sx={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "flex-start",
                alignItems: "center",
                columnGap: "12px",
                lineHeight: "100%",
              }}
            >
              {value === "external" ? (
                <>
                  <OpenInNewRoundedIcon fontSize="small" color="action" />
                  External&nbsp;
                </>
              ) : value === "path" ? (
                <>
                  <HiveIcon fontSize="small" color="action" />
                  Wildcard&nbsp;
                </>
              ) : (
                <>
                  <DescriptionRoundedIcon fontSize="small" color="action" />
                  Internal&nbsp;
                </>
              )}
            </Typography>
          );
        },
      },
      {
        field: "target",
        minWidth: 190,
        flex: 1,
        headerName: (
          <Typography variant="body2" fontWeight={600} color="text.primary">
            Target
          </Typography>
        ),

        renderCell: ({ value, row }) => (
          <RedirectTargetCell target={value} targetType={row.targetType} />
        ),
      },
      {
        field: "actions",
        type: "actions",
        width: 54,
        minWidth: 54,
        maxWidth: 54,
        resizable: false,
        getActions: ({ row }) => [
          <GridActionsCellItem
            icon={<DeleteIcon />}
            color="action.secondary"
            label="Delete"
            onClick={() => handleRemoveRedirect(row)}
          />,
        ],
      },
    ],
    []
  );

  const rows = useMemo(
    () =>
      // case insensitive search on path, code, target, and ZUID
      Object.values(props.redirects)
        .filter((redirect) => {
          const normalizedFilter = props.redirectsFilter?.toLowerCase() || "";
          return (
            redirect.path.toLowerCase().includes(normalizedFilter) ||
            String(redirect.code).toLowerCase().includes(normalizedFilter) ||
            redirect.ZUID.toLowerCase().includes(normalizedFilter) ||
            redirect.target.toLowerCase().includes(normalizedFilter)
          );
        })
        .map((redirect) => ({
          ...redirect,
          id: redirect.ZUID,
        })),
    [props.redirects, props.redirectsFilter]
  );

  return (
    <Box
      display="flex"
      flexDirection="column"
      height="100%"
      justifyContent="flex-start"
      alignItems="stretch"
      width="100%"
      position="relative"
      rowGap="24px"
    >
      <RedirectCreator
        options={props.paths}
        siteZuid={props.siteZuid}
        dispatch={props.dispatch}
      />
      <Box width="100%" height="100%">
        <AutoSizer>
          {({ width, height }) => (
            <DataGridPro
              columns={columns}
              rows={rows}
              rowHeight={60}
              style={{
                width: width,
                height: height,
              }}
              checkboxSelection
              sx={{
                bgcolor: "background.paper",
                color: "text.primary",
                fontSize: "typography.body2.fontSize",
                "& .MuiDataGrid-cell, & .MuiDataGrid-columnHeader": {
                  outline: "none!important",
                },
                "& .MuiDataGrid-pinnedColumnHeaders": {
                  bgcolor: "transparent",
                },

                "& .MuiDataGrid-columnHeader:hover": {
                  "& .MuiDataGrid-columnSeparator": {
                    visibility: "visible",
                  },
                },
                "& .MuiDataGrid-cell": {
                  display: "flex",
                  flexDirection: "row",
                  justifyContent: "flex-start",
                  alignItems: "center",
                },
                "& .MuiDataGrid-container--top [role=row]": {
                  backgroundColor: "grey.100",
                },
                "& .MuiDataGrid-columnHeaderCheckbox, & .MuiDataGrid-cellCheckbox":
                  {
                    padding: "0 0 0 6px",
                  },
                "& .MuiDataGrid-cell:has([data-cy='sortCell'])": {
                  padding: 0,
                },
                "& .MuiCheckbox-root": {
                  color: "action.active",
                },
              }}
              hideFooter
            />
          )}
        </AutoSizer>
      </Box>
      <DeleteDialog
        open={deleteDialogIsOpen}
        onClose={() => setDeleteDialogIsOpen(false)}
        ZUID={deleteRedirect?.ZUID}
        path={deleteRedirect?.path}
        type={deleteRedirect?.targetType}
        target={deleteRedirect?.target}
        code={deleteRedirect?.code}
      />
    </Box>
  );
}
