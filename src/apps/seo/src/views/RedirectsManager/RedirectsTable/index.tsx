import { useCallback, useLayoutEffect, useMemo, useState } from "react";
import {
  DataGridPro,
  GRID_CHECKBOX_SELECTION_COL_DEF,
  useGridApiRef,
  GridActionsCellItem,
  GridApi,
  GridColDef,
  GridRenderCellParams,
  GridPinnedColumnFields,
  GridValidRowModel,
  GridRowId,
} from "@mui/x-data-grid-pro";
import { Box, Typography } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import OpenInNewRoundedIcon from "@mui/icons-material/OpenInNewRounded";
import DescriptionRoundedIcon from "@mui/icons-material/DescriptionRounded";
import { RedirectTargetCell } from "./RedirectTargetCell";
import HiveIcon from "@mui/icons-material/Hive";
import AutoSizer from "react-virtualized-auto-sizer";
import ModeEditIcon from "@mui/icons-material/ModeEdit";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import { useRedirectsDialog } from "../../../app/components/RedirectsDialogProvider";
import { TableSortFilters } from "./TableSortFilters";
import { useRedirectsTable } from "./RedirectsTableContextProvider";
import { Redirects } from "../../../../../../shell/services/types";

const TARGET_TYPES_MAP = {
  page: "internal",
  path: "wildcard",
  external: "external",
} as const;

const RedirectsTable = () => {
  const apiRef = useGridApiRef<GridApi>();
  const { openDeleteDialog, openCreateForm } = useRedirectsDialog();
  const {
    redirects,
    isLoading,
    sortBy,
    httpCodeFilter,
    typeFilter,
    selectedRedirects,
    setSelectedRedirects,
    searchFilter,
  } = useRedirectsTable();

  const [initialState, setInitialState] = useState<any>();
  const [pinnedColumns, setPinnedColumns] = useState<GridPinnedColumnFields>({
    left: [GRID_CHECKBOX_SELECTION_COL_DEF.field],
  });

  const columns: GridColDef[] = useMemo(
    () => [
      {
        field: "path",
        minWidth: 206,
        flex: 1,
        headerName: "Incoming Path",
        renderCell: ({ value }: GridRenderCellParams<GridValidRowModel>) => (
          <Typography variant="body2" color="text.primary">
            {value}
          </Typography>
        ),
      },
      {
        field: "code",
        width: 120,
        minWidth: 120,
        headerName: "HTTP Code",
        renderCell: ({ value }: GridRenderCellParams<GridValidRowModel>) => {
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
        headerName: "Type",
        renderCell: ({ value }: GridRenderCellParams<GridValidRowModel>) => {
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
        headerName: "Target",
        renderCell: ({
          value,
          row,
        }: GridRenderCellParams<GridValidRowModel>) => (
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
            onClick={() =>
              openDeleteDialog([{ ZUID: row.ZUID, path: row.path }])
            }
          />,
        ],
      },
    ],
    []
  );

  const rows = useMemo(() => {
    if (isLoading) return [];
    return Object.values(redirects)
      .filter((redirect) => {
        const normalizedFilter = searchFilter?.toLowerCase() || "";
        const matchesSearch =
          redirect.path.toLowerCase().includes(normalizedFilter) ||
          String(redirect.code).toLowerCase().includes(normalizedFilter) ||
          redirect.targetType.toLowerCase().includes(normalizedFilter) ||
          TARGET_TYPES_MAP[redirect.targetType]
            .toLowerCase()
            .includes(normalizedFilter) ||
          redirect.ZUID.toLowerCase().includes(normalizedFilter) ||
          redirect.target.toLowerCase().includes(normalizedFilter);

        const matchesHttpCode =
          httpCodeFilter === null || String(redirect.code) === httpCodeFilter;
        const matchesType =
          typeFilter === null || redirect.targetType === typeFilter;

        return matchesSearch && matchesHttpCode && matchesType;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case "createdAt":
            return (
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );
          case "path":
            return a.path.localeCompare(b.path);
          case "code":
            return a.code - b.code;
          case "targetType":
            return a.targetType.localeCompare(b.targetType);
          case "target":
            return a.target.localeCompare(b.target);
          default:
            return 0;
        }
      })
      .map((redirect) => ({
        ...redirect,
        id: redirect.ZUID,
      }));
  }, [redirects, searchFilter, isLoading, sortBy, httpCodeFilter, typeFilter]);

  const saveSnapshot = useCallback(() => {
    if (apiRef?.current?.exportState && localStorage) {
      const currentState = apiRef.current.exportState();
      const fullState = {
        ...currentState,
        pinnedColumns: apiRef.current.getPinnedColumns(),
      };
      localStorage.setItem(
        `zesty:redirects:dataGridState`,
        JSON.stringify(fullState)
      );
    }
  }, [apiRef]);

  useLayoutEffect(() => {
    if (!columns) return;
    const stateFromLocalStorage = localStorage?.getItem(
      `zesty:redirects:dataGridState`
    );

    if (stateFromLocalStorage) {
      const parsedState = JSON.parse(stateFromLocalStorage);
      setInitialState(parsedState);
      if (parsedState.pinnedColumns) {
        setPinnedColumns(parsedState.pinnedColumns);
      }
    } else {
      setInitialState({});
      setPinnedColumns({
        left: [GRID_CHECKBOX_SELECTION_COL_DEF.field],
      });
    }

    window.addEventListener("beforeunload", saveSnapshot);

    return () => {
      window.removeEventListener("beforeunload", saveSnapshot);
      saveSnapshot();
    };
  }, [saveSnapshot, columns, GRID_CHECKBOX_SELECTION_COL_DEF]);

  return (
    <>
      <Box display="flex" flexDirection="row" alignItems="center">
        <TableSortFilters />
      </Box>

      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          height: "100%",
          justifyContent: "flex-start",
          alignItems: "stretch",
          width: "100%",
          position: "relative",
          rowGap: "16px",
        }}
      >
        <Box width="100%" height="100%">
          <AutoSizer>
            {({ width, height }: { width: number; height: number }) => (
              <DataGridPro
                apiRef={apiRef}
                columns={columns}
                rows={rows}
                rowHeight={60}
                pinnedColumns={pinnedColumns}
                onPinnedColumnsChange={(newPinnedColumns) =>
                  setPinnedColumns(newPinnedColumns)
                }
                onColumnWidthChange={saveSnapshot}
                rowSelectionModel={selectedRedirects}
                onRowSelectionModelChange={(selection: GridRowId[]) => {
                  setSelectedRedirects(selection);
                }}
                initialState={initialState}
                style={{
                  width: width,
                  height: height,
                }}
                checkboxSelection
                disableRowSelectionOnClick
                slots={{
                  moreActionsIcon: MoreHorizIcon,
                }}
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
                    outline: "none!important",
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
      </Box>
    </>
  );
};

export default RedirectsTable;
