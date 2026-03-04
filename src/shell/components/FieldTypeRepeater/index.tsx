import { useState, useMemo, useEffect } from "react";
import {
  DataGridPro,
  GRID_REORDER_COL_DEF,
  GridColDef,
  GridRenderCellParams,
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

const dummyFieldValues: Record<string, any>[] = [
  {
    text: "1709819194221",
    textarea: "1709819194221",
    markdown: "1709819194221",
    wysiwyg_basic: "<h1>Hello world!</h1>",
    images: "3-7623d24-ghfnj",
    link: "http://www.zesty.pw/1709819194221",
    currency: "10000.00",
    number: 3,
    yes_no: 0,
    yes_no_with_custom_values: null,
    color: "#ffffff",
    dropdown: "custom_option_two",
    sort: 150,
    uuid: "731a0b2f-e3f9-44bf-b142-59488c0834e9",
  },
  {
    text: "Hello world",
    textarea: "Hello world",
    markdown: "Hello world",
    wysiwyg_basic: "<h1>Hello world!</h1>",
    images:
      "https://wave-trial.getbynder.com/m/58cdfd9c3b0f1d9e/original/nattu-adnan-Ai2TRdvI6gM-unsplash-nbuul3-jpg.jpg",
    link: "http://www.zesty.pw/1709819194221",
    currency: "10000.00",
    number: 3,
    yes_no: 0,
    yes_no_with_custom_values: null,
    color: "#ffffff",
    dropdown: "custom_option_two",
    sort: 150,
    uuid: "731a0b2f-e3f9-44bf-b142-59488c0834e9",
  },
];
const dummyFields: Partial<ContentModelField>[] = [
  {
    ZUID: "12-6d41d0-n10vtc",
    contentModelZUID: "6-556370-8sh47g",
    name: "wysiwyg_basic",
    label: "WYSIWYG Basic",
    description: null,
    datatype: "wysiwyg_basic",
    sort: 0,
    required: true,
    relationship: null,
    options: null,
    fieldOptions: null,
    datatypeOptions: null,
    settings: {
      list: true,
      options: {},
    },
    relatedModelZUID: null,
    relatedFieldZUID: null,
    createdAt: "2018-09-20T20:46:51Z",
    updatedAt: "2023-01-03T03:15:29Z",
  },
  {
    ZUID: "12-13d590-9v2nr2",
    contentModelZUID: "6-556370-8sh47g",
    name: "text",
    label: "Text",
    description:
      "dasdsadsaddasdsadsaddasdsadsaddasdsadsaddasdsadsaddasdsadsaddasdsadsaddasdsadsaddasdsadsaddasdsadsaddasdsadsaddasdsadsaddasdsadsaddasdsadsaddasdsadsaddasdsadsad",
    datatype: "text",
    sort: 1,
    required: true,
    relationship: null,
    options: null,
    fieldOptions: null,
    datatypeOptions: null,
    settings: {
      list: true,
      tooltip: '<a href="test">test</a>',
    },
    relatedModelZUID: null,
    relatedFieldZUID: null,
    createdAt: "2018-09-20T20:46:38Z",
    updatedAt: "2023-12-06T01:30:35Z",
  },
  {
    ZUID: "12-796b3c-8n93rc",
    contentModelZUID: "6-556370-8sh47g",
    name: "markdown",
    label: "Markdown",
    description: null,
    datatype: "markdown",
    sort: 4,
    required: null,
    relationship: null,
    options: null,
    fieldOptions: null,
    datatypeOptions: null,
    settings: {
      list: true,
      options: {},
    },
    relatedModelZUID: null,
    relatedFieldZUID: null,
    createdAt: "2018-09-20T20:58:11Z",
    updatedAt: "2023-01-03T03:15:29Z",
  },
  {
    ZUID: "12-b5d7b4-n81s15",
    contentModelZUID: "6-556370-8sh47g",
    name: "textarea",
    label: "Textarea",
    description: "test test",
    datatype: "textarea",
    sort: 5,
    required: null,
    relationship: null,
    options: null,
    fieldOptions: null,
    datatypeOptions: null,
    settings: {
      list: true,
      options: {},
      tooltip: "test",
    },
    relatedModelZUID: null,
    relatedFieldZUID: null,
    createdAt: "2018-09-20T20:47:30Z",
    updatedAt: "2023-01-03T03:15:29Z",
  },
  {
    ZUID: "12-1c94d4-pg8dvx",
    contentModelZUID: "6-556370-8sh47g",
    name: "images",
    label: "Images",
    description: null,
    datatype: "images",
    sort: 7,
    required: null,
    relationship: null,
    options: null,
    fieldOptions: null,
    datatypeOptions: "limit:10;group_id:2-7344879-bqif7;",
    settings: {
      group_id: "0",
      limit: 10,
      list: true,
      options: {},
    },
    relatedModelZUID: null,
    relatedFieldZUID: null,
    createdAt: "2018-09-20T20:47:07Z",
    updatedAt: "2023-01-03T03:15:29Z",
  },
  {
    ZUID: "12-f3152c-kjz88l",
    contentModelZUID: "6-556370-8sh47g",
    name: "dropdown",
    label: "Dropdown",
    description: null,
    datatype: "dropdown",
    sort: 10,
    required: null,
    relationship: null,
    options:
      "custom_option_one:Custom Option One;custom_option_two:Custom Option Two",
    fieldOptions: null,
    datatypeOptions: null,
    settings: {
      list: true,
      options: {
        custom_option_one: "Custom Option One",
        custom_option_two: "Custom Option Two",
      },
    },
    relatedModelZUID: null,
    relatedFieldZUID: null,
    createdAt: "2018-09-20T20:50:14Z",
    updatedAt: "2023-01-03T03:15:29Z",
  },
  {
    ZUID: "12-8ed554-nxmbw8",
    contentModelZUID: "6-556370-8sh47g",
    name: "link",
    label: "URL / Link",
    description: null,
    datatype: "link",
    sort: 11,
    required: null,
    relationship: null,
    options: null,
    fieldOptions: null,
    datatypeOptions: null,
    settings: {
      list: true,
      options: {},
    },
    relatedModelZUID: null,
    relatedFieldZUID: null,
    createdAt: "2018-09-20T20:51:04Z",
    updatedAt: "2023-01-03T03:15:29Z",
  },
  {
    ZUID: "12-575f7c-trw1w3",
    contentModelZUID: "6-556370-8sh47g",
    name: "yes_no",
    label: "YES / NO",
    description: null,
    datatype: "yes_no",
    sort: 13,
    required: false,
    relationship: null,
    options: "1:Yes;0:No",
    fieldOptions: null,
    datatypeOptions: null,
    settings: {
      list: true,
      options: {
        "0": "No",
        "1": "Yes",
      },
    },
    relatedModelZUID: null,
    relatedFieldZUID: null,
    createdAt: "2018-09-20T20:53:12Z",
    updatedAt: "2023-11-28T20:55:28Z",
  },
  {
    ZUID: "12-8178cc-z37vq1",
    contentModelZUID: "6-556370-8sh47g",
    name: "yes_no_with_custom_values",
    label: "YES / NO with Custom Values",
    description: null,
    datatype: "yes_no",
    sort: 14,
    required: null,
    relationship: null,
    options: "1:Custom One;0:Custom Two",
    fieldOptions: null,
    datatypeOptions: null,
    settings: {
      list: true,
      options: {
        "0": "Custom Two",
        "1": "Custom One",
      },
    },
    relatedModelZUID: null,
    relatedFieldZUID: null,
    createdAt: "2018-09-20T20:54:03Z",
    updatedAt: "2023-01-03T03:15:29Z",
  },
  {
    ZUID: "12-9b96ec-tll2gn",
    contentModelZUID: "6-556370-8sh47g",
    name: "number",
    label: "Number",
    description: null,
    datatype: "number",
    sort: 16,
    required: true,
    relationship: null,
    options: null,
    fieldOptions: null,
    datatypeOptions: null,
    settings: {
      defaultValue: 0,
      list: true,
      options: {},
    },
    relatedModelZUID: null,
    relatedFieldZUID: null,
    createdAt: "2018-09-20T20:54:49Z",
    updatedAt: "2025-04-22T21:58:24Z",
  },
  {
    ZUID: "12-b35c68-jd1s8s",
    contentModelZUID: "6-556370-8sh47g",
    name: "currency",
    label: "Currency",
    description: null,
    datatype: "currency",
    sort: 17,
    required: null,
    relationship: null,
    options: null,
    fieldOptions: null,
    datatypeOptions: null,
    settings: {
      list: true,
      options: {},
    },
    relatedModelZUID: null,
    relatedFieldZUID: null,
    createdAt: "2018-09-20T20:55:10Z",
    updatedAt: "2023-01-03T03:15:29Z",
  },
  {
    ZUID: "12-eb8684-zwq6hk",
    contentModelZUID: "6-556370-8sh47g",
    name: "color",
    label: "Color",
    description: null,
    datatype: "color",
    sort: 18,
    required: null,
    relationship: null,
    options: null,
    fieldOptions: null,
    datatypeOptions: null,
    settings: {
      list: true,
      options: {},
    },
    relatedModelZUID: null,
    relatedFieldZUID: null,
    createdAt: "2018-09-20T20:56:54Z",
    updatedAt: "2023-01-03T03:15:29Z",
  },
  {
    ZUID: "12-f72938-8n8vqs",
    contentModelZUID: "6-556370-8sh47g",
    name: "uuid",
    label: "UUID",
    description: null,
    datatype: "uuid",
    sort: 19,
    required: null,
    relationship: null,
    options: null,
    fieldOptions: null,
    datatypeOptions: null,
    settings: {
      list: true,
      options: {},
    },
    relatedModelZUID: null,
    relatedFieldZUID: null,
    createdAt: "2018-09-20T20:57:22Z",
    updatedAt: "2023-01-03T03:15:29Z",
  },
  {
    ZUID: "12-4e1914-kcqznz",
    contentModelZUID: "6-556370-8sh47g",
    name: "sort",
    label: "Sort",
    description: null,
    datatype: "sort",
    sort: 20,
    required: null,
    relationship: null,
    options: null,
    fieldOptions: null,
    datatypeOptions: null,
    settings: {
      defaultValue: null,
      list: true,
      options: {},
    },
    relatedModelZUID: null,
    relatedFieldZUID: null,
    createdAt: "2018-09-20T20:57:56Z",
    updatedAt: "2025-04-22T16:50:36Z",
  },
];

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

  const handleChange = (row: Record<string, any>) => {
    const updatedRows = [...rows];

    if (row.id !== undefined) {
      updatedRows[row.id] = row;
    } else {
      updatedRows.push(row);
    }

    const cleanedValue = updatedRows.map((row) => {
      const { id, __reorder__, ...rowData } = row;
      return rowData;
    });

    onChange(cleanedValue);
  };

  const handleRemoveRow = (id: number | number[]) => {
    let updatedRows = [...rows];

    if (Array.isArray(id)) {
      updatedRows = updatedRows.filter((row) => !id.includes(row.id));
    } else {
      updatedRows.splice(id, 1);
    }

    const cleanedValue = updatedRows.map((row) => {
      const { id, __reorder__, ...rowData } = row;
      return rowData;
    });

    onChange(cleanedValue);
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
              rowReordering
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
