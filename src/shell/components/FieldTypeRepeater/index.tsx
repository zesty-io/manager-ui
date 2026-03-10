import { useState, useMemo, useEffect } from "react";
import {
  DataGridPro,
  GRID_REORDER_COL_DEF,
  GridColDef,
  GridRenderCellParams,
  GridRowOrderChangeParams,
  GridRowSelectionModel,
  useGridApiRef,
} from "@mui/x-data-grid-pro";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import DeleteIcon from "@mui/icons-material/Delete";
import DragIndicatorRoundedIcon from "@mui/icons-material/DragIndicatorRounded";

import AutoSizer, { Size } from "react-virtualized-auto-sizer";
import { AddRowFooter } from "./AddRowFooter";
import {
  CURRENCY_OBJECT,
  getHtmlText,
} from "../../../apps/content-editor/src/app/views/ItemList/ItemListTable";
import { ImageCell } from "../../../apps/content-editor/src/app/views/ItemList/TableCells/ImageCell";
import { Link, Typography } from "@mui/material";
import { ContentModelField } from "shell/services/types";
import { RowDialog } from "./RowDialog";

const HEADER_HEIGHT = 56;
const ROW_HEIGHT = 56;
const FOOTER_HEIGHT = 44;
const MAX_VISIBLE_ROWS = 10;

const fieldTypeColumnConfigMap: Record<string, Partial<GridColDef>> = {
  text: {
    width: 360,
    filterable: true,
  },
  textarea: {
    width: 360,
    filterable: true,
  },
  markdown: {
    width: 360,
    filterable: true,
  },
  wysiwyg_basic: {
    width: 360,
    valueFormatter: (value: any) => getHtmlText(value),
    filterable: true,
  },
  images: {
    width: 100,
    renderCell: (params: GridRenderCellParams) => {
      return <ImageCell params={params} />;
    },
  },
  link: {
    width: 360,
    filterable: true,
    renderCell: (params: any) => {
      return (
        <Link
          underline="hover"
          target="_blank"
          href={params.value}
          sx={{
            color: "primary.main",
            "&:hover": {
              textDecorationColor: (theme) => theme.palette.primary.main,
            },
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {params.value}
        </Link>
      );
    },
  },
  currency: {
    width: 160,
    valueFormatter: (value: any) => {
      if (value?.value === undefined || value?.value === null) return "";

      return `${
        CURRENCY_OBJECT[value?.currency]?.symbol_native
      } ${new Intl.NumberFormat("en-US", {
        minimumFractionDigits: 2,
      }).format(value.value)}`;
    },
    align: "right",
  },
  number: {
    width: 160,
    valueFormatter: (value: any) => {
      if (!value) return null;
      return new Intl.NumberFormat("en-US").format(value);
    },
    filterable: true,
    align: "right",
  },
  yes_no: {
    width: 120,
    filterable: true,
  },
  color: {
    width: 140,
    filterable: true,
    renderCell: (params: GridRenderCellParams) => {
      return (
        <Box display="flex" alignItems="center" gap={1.5} height="100%">
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: "8px",
              backgroundColor: params.value,
              border: (theme) =>
                params.value?.toLowerCase() === "#ffffff"
                  ? `1px solid ${theme.palette.border}`
                  : "none",
            }}
          />
          <Typography variant="body2">{params.value?.toUpperCase()}</Typography>
        </Box>
      );
    },
  },
  dropdown: {
    width: 240,
    filterable: true,
  },
  sort: {
    width: 112,
    filterable: true,
  },
  uuid: {
    width: 280,
    filterable: true,
  },
};

type FieldTypeRepeaterProps = {
  field: ContentModelField;
  value: Record<string, any>[];
  onChange: (value: Record<string, any>[]) => void;
};
export const FieldTypeRepeater = ({
  field,
  value,
  onChange,
}: FieldTypeRepeaterProps) => {
  const [rows, setRows] = useState<Record<string, any>[]>([]);
  const apiRef = useGridApiRef();
  const [rowSelectionModel, setRowSelectionModel] =
    useState<GridRowSelectionModel>([]);
  const [rowDialog, setRowDialog] = useState<"add" | "edit" | null>(null);
  const [rowToEdit, setRowToEdit] = useState<Record<string, any> | null>(null);

  useEffect(() => {
    if (!value?.length) {
      setRows([]);
      return;
    }

    const processedRows = value.map((row, index) => ({
      ...row,
      id: index,
      __reorder__: Object.values(row)[0],
    }));

    setRows(processedRows);
  }, [value]);

  const baseColumns: GridColDef[] = useMemo(() => {
    if (!field?.settings?.subFields?.length) return [];

    return field.settings.subFields
      ?.filter((field) => field.settings.list)
      ?.sort((a, b) => a.sort - b.sort)
      ?.map((field) => ({
        field: field.name,
        headerName: field.label,
        ...fieldTypeColumnConfigMap[field.datatype],
        valueGetter: (value, row) => {
          switch (field.datatype) {
            case "currency":
              return {
                value,
                currency: field.settings.currency || "USD",
              };

            case "yes_no": {
              if (value === null || value === undefined) {
                return "";
              }

              // Shows the label of the option if options are defined
              if (Object.keys(field.settings.options).length) {
                return field.settings.options[value];
              }

              return value === 0 ? "No" : "Yes";
            }

            default:
              return value;
          }
        },
      }));
  }, [field]);

  const columns: GridColDef[] = useMemo(() => {
    const hasSelectedRows = rowSelectionModel.length > 0;

    const mappedColumns = baseColumns.map((col) => ({
      ...col,
      headerName: hasSelectedRows ? "" : col.headerName,
      renderHeader: hasSelectedRows
        ? (): React.ReactNode => null
        : col.renderHeader,
      disableColumnMenu: hasSelectedRows ? true : col.disableColumnMenu,
      sortable: hasSelectedRows ? false : col.sortable,
    }));

    return [
      {
        ...GRID_REORDER_COL_DEF,
        width: 28,
        minWidth: 28,
      },
      ...mappedColumns,
    ];
  }, [baseColumns, rowSelectionModel]);

  const calculatedHeight = useMemo(() => {
    const visibleRows = Math.min(rows.length, MAX_VISIBLE_ROWS);
    // Add 15px for horizontal scrollbar buffer if we have rows
    const hScrollBuffer = rows.length > 0 ? 15 : 0;
    return (
      HEADER_HEIGHT + visibleRows * ROW_HEIGHT + FOOTER_HEIGHT + hScrollBuffer
    );
  }, [rows.length]);

  const cleanRows = (rowsToClean: Record<string, any>[]) => {
    return rowsToClean.map((row: any) => {
      const { id, __reorder__, ...rowData } = row;
      return rowData;
    });
  };

  const handleChange = (row: Record<string, any>) => {
    const updatedRows = [...rows];

    if (row.id !== undefined) {
      updatedRows[row.id] = row;
    } else {
      updatedRows.push(row);
    }

    onChange(cleanRows(updatedRows));
  };

  const handleRowOrderChange = (params: GridRowOrderChangeParams) => {
    const { oldIndex, targetIndex } = params;
    const newRows = [...rows];
    const [removed] = newRows.splice(oldIndex, 1);
    newRows.splice(targetIndex, 0, removed);

    // Re-index row IDs to maintain order and selection consistency
    const updatedRows = newRows.map((row, index) => ({
      ...row,
      id: index,
    }));

    onChange(cleanRows(updatedRows));
  };

  const handleRemoveRow = (id: number | number[]) => {
    let updatedRows = [...rows];

    if (Array.isArray(id)) {
      updatedRows = updatedRows.filter((row) => !id.includes(row.id));
    } else {
      updatedRows.splice(id, 1);
    }

    onChange(cleanRows(updatedRows));
    setRowDialog(null);
    setRowToEdit(null);
  };

  return (
    <>
      <Box
        sx={{
          height: calculatedHeight,
          position: "relative",

          // An ancestor has removed all scrollbars so we're re-enabling them here
          "*": {
            scrollbarWidth: "auto",
            msOverflowStyle: "auto",
            "&::-webkit-scrollbar": {
              display: "auto",
            },
          },
        }}
      >
        {rowSelectionModel.length > 0 && (
          <IconButton
            onClick={() => {
              handleRemoveRow(rowSelectionModel as number[]);
              setRowSelectionModel([]);
            }}
            size="small"
            sx={{
              position: "absolute",
              top: 10,
              right: 12,
              zIndex: 100,
            }}
          >
            <DeleteIcon />
          </IconButton>
        )}
        <AutoSizer>
          {({ width, height }: Size) => (
            <DataGridPro
              data-cy="RepeaterFieldGrid"
              rowReordering
              onRowOrderChange={handleRowOrderChange}
              rows={rows}
              apiRef={apiRef}
              columns={columns}
              checkboxSelection
              disableRowSelectionOnClick
              rowHeight={ROW_HEIGHT}
              columnHeaderHeight={HEADER_HEIGHT}
              pinnedColumns={{
                left: ["__reorder__", "__check__"],
              }}
              rowSelectionModel={rowSelectionModel}
              onRowSelectionModelChange={(newModel) =>
                setRowSelectionModel(newModel)
              }
              onRowClick={(params) => {
                setRowToEdit({
                  id: params.id,
                  ...params.row,
                });
                setRowDialog("edit");
              }}
              slots={{
                footer: () => (
                  <AddRowFooter
                    fieldName={field.label}
                    onAddRow={() => setRowDialog("add")}
                  />
                ),
                rowReorderIcon: () => (
                  <DragIndicatorRoundedIcon fontSize="small" color="action" />
                ),
              }}
              sx={{
                width,
                height,
                backgroundColor: "common.white",

                "& .MuiDataGrid-columnHeaderCheckbox": {
                  padding: 0,
                },

                "& .MuiDataGrid-columnHeaderReorder": {
                  padding: 0,
                },

                "& .MuiDataGrid-rowReorderCellContainer": {
                  padding: 0,
                },

                "& .MuiDataGrid-scrollbarFiller": {
                  backgroundColor: "grey.100",
                },

                "& .MuiDataGrid-filler": {
                  backgroundColor: "grey.100",
                },

                // Hide scrollbar for virtual scroller to avoid double scrollbars when a row is dynamically added
                "& .MuiDataGrid-virtualScroller": {
                  scrollbarWidth: "none",
                  msOverflowStyle: "none",
                  "&::-webkit-scrollbar": {
                    display: "none",
                  },
                },
              }}
            />
          )}
        </AutoSizer>
      </Box>
      {rowDialog && (
        <RowDialog
          ZUID={field.ZUID}
          onClose={() => {
            setRowDialog(null);
            setRowToEdit(null);
          }}
          name={field.label}
          fields={field.settings.subFields || []}
          onSubmit={handleChange}
          onRemoveRow={handleRemoveRow}
          editRowData={rowToEdit}
          isUpdate={rowDialog === "edit"}
        />
      )}
    </>
  );
};
