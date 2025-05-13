import { useCallback, useLayoutEffect, useMemo, useState } from "react";
import {
  DataGridPro,
  GRID_CHECKBOX_SELECTION_COL_DEF,
  useGridApiRef,
  GridActionsCellItem,
} from "@mui/x-data-grid-pro";
import { Box, Typography, MenuItem, ListItemText } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import OpenInNewRoundedIcon from "@mui/icons-material/OpenInNewRounded";
import DescriptionRoundedIcon from "@mui/icons-material/DescriptionRounded";
import { RedirectTargetCell } from "./RedirectTargetCell";
import HiveIcon from "@mui/icons-material/Hive";
import AutoSizer from "react-virtualized-auto-sizer";
import ListItemIcon from "@mui/material/ListItemIcon";
import ModeEditIcon from "@mui/icons-material/ModeEdit";
import Menu from "@mui/material/Menu";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import { useRedirectsDialog } from "../../../app/components/RedirectsDialogProvider";
import { SortFilters } from "./SortFilters";
import { useRedirectsTableFilters } from "./TableSortFilterProvider";
import { SearchRounded } from "@mui/icons-material";

const RedirectTable = (props) => {
  const { redirects, redirectsFilter, isLoading } = props;
  const apiRef = useGridApiRef();
  const [selectedRow, setSelectedRow] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const { sortBy, httpCodeFilter, typeFilter } = useRedirectsTableFilters();
  const [initialState, setInitialState] = useState();
  const [pinnedColumns, setPinnedColumns] = useState({});

  const columns = useMemo(
    () => [
      {
        field: "path",
        minWidth: 206,
        flex: 1,
        headerName: "Incoming Path",
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
        headerName: "HTTP Code",
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
        headerName: "Type",
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
        headerName: "Target",
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
            showInMenu
            icon={<MoreHorizIcon />}
            color="action.secondary"
            label="More options"
            onClick={(event) => {
              setSelectedRow(row);
              setAnchorEl(event.currentTarget);
            }}
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
        const normalizedFilter = redirectsFilter?.toLowerCase() || "";
        const matchesSearch =
          redirect.path.toLowerCase().includes(normalizedFilter) ||
          String(redirect.code).toLowerCase().includes(normalizedFilter) ||
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
  }, [
    redirects,
    redirectsFilter,
    isLoading,
    sortBy,
    httpCodeFilter,
    typeFilter,
  ]);

  const saveSnapshot = useCallback(() => {
    if (apiRef?.current && localStorage) {
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
        <SortFilters />
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
            {({ width, height }) => (
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
                initialState={initialState}
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
        <MoreOptions
          anchorEl={anchorEl}
          onClose={() => setAnchorEl(null)}
          data={selectedRow}
        />
      </Box>
    </>
  );
};

function MoreOptions({ anchorEl, onClose, data }) {
  const open = Boolean(anchorEl);

  const { openDeleteDialog, openCreateForm } = useRedirectsDialog();

  const handleDelete = () => {
    onClose();
    openDeleteDialog({
      ...data,
      type: data?.targetType,
    });
    onClose();
  };

  const handleEdit = () => {
    onClose();
    openCreateForm({
      ZUID: data?.ZUID,
      targetType: data?.targetType,
      code: data?.code,
      target: data?.target,
      path: data?.path,
    });
  };

  return (
    <Menu
      data-cy="RedirectsItemOptions"
      anchorEl={anchorEl}
      open={open}
      onClose={onClose}
      anchorOrigin={{
        vertical: "top",
        horizontal: "left",
      }}
      transformOrigin={{
        vertical: "top",
        horizontal: "right",
      }}
    >
      <MenuItem onClick={handleEdit} data-cy="RedirectsItemOptionsEdit">
        <ListItemIcon>
          <ModeEditIcon fontSize="small" />
        </ListItemIcon>
        <ListItemText>Edit Redirect</ListItemText>
      </MenuItem>
      <MenuItem onClick={handleDelete} data-cy="RedirectsItemOptionsDelete">
        <ListItemIcon>
          <DeleteIcon fontSize="small" />
        </ListItemIcon>
        <ListItemText>Delete Redirect</ListItemText>
      </MenuItem>
    </Menu>
  );
}

export default RedirectTable;
