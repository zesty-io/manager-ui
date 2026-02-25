import { useState, useMemo } from "react";
import {
  DataGridPro,
  GridColDef,
  GridRowSelectionModel,
  useGridApiRef,
} from "@mui/x-data-grid-pro";
// import { useDemoData } from "@mui/x-data-grid-generator";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import DeleteIcon from "@mui/icons-material/Delete";
import AutoSizer, { Size } from "react-virtualized-auto-sizer";
import { AddRowFooter } from "./AddRowFooter";

const HEADER_HEIGHT = 56;
const ROW_HEIGHT = 56;
const FOOTER_HEIGHT = 44;
const MAX_VISIBLE_ROWS = 10;

const data = [
  {
    title: "Hello world",
    description: "Hello hello hello",
    randomThing: "import DeleteIcon from '@mui/icons-material/Delete';",
    randomThing2: "import DeleteIcon from '@mui/icons-material/Delete';",
    randomThing3: "import DeleteIcon from '@mui/icons-material/Delete';",
    randomThing4: "import DeleteIcon from '@mui/icons-material/Delete';",
  },
  {
    title: "Hello world",
    description: "Hello hello hello",
    randomThing: "import DeleteIcon from '@mui/icons-material/Delete';",
    randomThing2: "import DeleteIcon from '@mui/icons-material/Delete';",
    randomThing3: "import DeleteIcon from '@mui/icons-material/Delete';",
    randomThing4: "import DeleteIcon from '@mui/icons-material/Delete';",
  },
  {
    title: "Hello world",
    description: "Hello hello hello",
    randomThing: "import DeleteIcon from '@mui/icons-material/Delete';",
    randomThing2: "import DeleteIcon from '@mui/icons-material/Delete';",
    randomThing3: "import DeleteIcon from '@mui/icons-material/Delete';",
    randomThing4: "import DeleteIcon from '@mui/icons-material/Delete';",
  },
  {
    title: "Hello world",
    description: "Hello hello hello",
    randomThing: "import DeleteIcon from '@mui/icons-material/Delete';",
    randomThing2: "import DeleteIcon from '@mui/icons-material/Delete';",
    randomThing3: "import DeleteIcon from '@mui/icons-material/Delete';",
    randomThing4: "import DeleteIcon from '@mui/icons-material/Delete';",
  },
  {
    title: "Hello world",
    description: "Hello hello hello",
    randomThing: "import DeleteIcon from '@mui/icons-material/Delete';",
    randomThing2: "import DeleteIcon from '@mui/icons-material/Delete';",
    randomThing3: "import DeleteIcon from '@mui/icons-material/Delete';",
    randomThing4: "import DeleteIcon from '@mui/icons-material/Delete';",
  },
  {
    title: "Hello world",
    description: "Hello hello hello",
    randomThing: "import DeleteIcon from '@mui/icons-material/Delete';",
    randomThing2: "import DeleteIcon from '@mui/icons-material/Delete';",
    randomThing3: "import DeleteIcon from '@mui/icons-material/Delete';",
    randomThing4: "import DeleteIcon from '@mui/icons-material/Delete';",
  },
  {
    title: "Hello world",
    description: "Hello hello hello",
    randomThing: "import DeleteIcon from '@mui/icons-material/Delete';",
  },
];

export const FieldTypeRepeater = () => {
  // TODO: For testing only. Dummy data
  const [dummyRows, setDummyRows] = useState(data);
  const apiRef = useGridApiRef();
  const [rowSelectionModel, setRowSelectionModel] =
    useState<GridRowSelectionModel>([]);

  // TODO: Need to copy column config on ItemListTable
  const baseColumns: GridColDef[] = [
    {
      field: "title",
      headerName: "Title",
      width: 300,
    },
    {
      field: "description",
      headerName: "Description",
      width: 300,
    },
    {
      field: "randomThing2",
      headerName: "Random Thing",
      width: 300,
    },
    {
      field: "randomThing",
      headerName: "Random Thing",
      width: 300,
    },
    {
      field: "randomThing3",
      headerName: "Random Thing",
      width: 300,
    },
    {
      field: "randomThing4",
      headerName: "Random Thing",
      width: 300,
    },
  ];

  const rows = useMemo(
    () =>
      dummyRows.map((item, index) => ({
        ...item,
        id: index,
      })),
    [dummyRows]
  );

  const columns: GridColDef[] = useMemo(() => {
    const hasSelectedRows = rowSelectionModel.length > 0;

    return baseColumns.map((col) => ({
      ...col,
      headerName: hasSelectedRows ? "" : col.headerName,
      renderHeader: hasSelectedRows
        ? (): React.ReactNode => null
        : col.renderHeader,
      disableColumnMenu: hasSelectedRows ? true : col.disableColumnMenu,
      sortable: hasSelectedRows ? false : col.sortable,
    }));
  }, [baseColumns, rowSelectionModel]);

  const calculatedHeight = useMemo(() => {
    const visibleRows = Math.min(rows.length, MAX_VISIBLE_ROWS);
    // Add 15px for horizontal scrollbar buffer if we have rows
    const hScrollBuffer = rows.length > 0 ? 15 : 0;
    return (
      HEADER_HEIGHT + visibleRows * ROW_HEIGHT + FOOTER_HEIGHT + hScrollBuffer
    );
  }, [rows.length]);

  return (
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
            // Action for deletion can be added here
            setDummyRows((prev) =>
              prev.filter((_, index) => !rowSelectionModel.includes(index))
            );
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
            rows={rows}
            apiRef={apiRef}
            columns={columns}
            checkboxSelection
            rowHeight={ROW_HEIGHT}
            columnHeaderHeight={HEADER_HEIGHT}
            pinnedColumns={{
              left: ["__check__"],
            }}
            rowSelectionModel={rowSelectionModel}
            onRowSelectionModelChange={(newModel) =>
              setRowSelectionModel(newModel)
            }
            slots={{
              footer: () => (
                <AddRowFooter
                  fieldName="test"
                  onAddRow={() => {
                    // TODO: For testing only
                    setDummyRows((prev) => [...prev, data[0]]);
                  }}
                />
              ),
            }}
            sx={{
              width,
              height,
              backgroundColor: "common.white",

              "& .MuiDataGrid-columnHeaderCheckbox": {
                padding: 0,
              },

              "& .MuiDataGrid-scrollbarFiller": {
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
  );
};
