import * as React from "react";
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
  const apiRef = useGridApiRef();
  const [rowSelectionModel, setRowSelectionModel] =
    React.useState<GridRowSelectionModel>([]);

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

  const rows = data.map((item, index) => ({
    ...item,
    id: index,
  }));

  const columns: GridColDef[] = React.useMemo(() => {
    const hasSelectedRows = rowSelectionModel.length > 0;

    const _baseColumns: GridColDef[] = baseColumns.map((col) => ({
      ...col,
      headerName: hasSelectedRows ? "" : col.headerName,
      renderHeader: hasSelectedRows
        ? (): React.ReactNode => null
        : col.renderHeader,
    }));

    const deleteActionColumn: GridColDef = {
      field: "__delete_action_column__", // Unique field name
      headerName: "", // No header text
      sortable: false,
      filterable: false,
      disableColumnMenu: true,
      width: 60,
      renderHeader: (): React.ReactNode =>
        hasSelectedRows ? (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end", // Push icon to the right within its cell
              width: "100%",
            }}
          >
            <IconButton
              color="primary"
              onClick={() => {}}
              aria-label="Delete selected rows"
              size="small"
            >
              <DeleteIcon />
            </IconButton>
          </Box>
        ) : null,
    };

    return [..._baseColumns, deleteActionColumn];
  }, [baseColumns, rowSelectionModel]);

  return (
    <Box
      sx={{
        // display: "flex",
        // flexDirection: "column",
        // minWidth: 0, // Essential for Flex children
        // flexGrow: 1, // Occupy available space
        // overflow: "hidden", // The "Kill Switch" for horizontal overflow
        // position: "relative", // Keeps the internal DataGrid calculations local
        height: 400,
        "*": {
          scrollbarWidth: "auto",
          msOverflowStyle: "auto",
          "&::-webkit-scrollbar": {
            display: "auto",
          },
        },
      }}
    >
      <AutoSizer>
        {({ width, height }: Size) => (
          <DataGridPro
            rows={rows}
            apiRef={apiRef}
            columns={columns}
            checkboxSelection
            hideFooter
            // initialState={{
            //   pinnedColumns: {
            //     right: ["__delete_action_column__"],
            //   },
            // }}
            rowSelectionModel={rowSelectionModel}
            onRowSelectionModelChange={(newModel) =>
              setRowSelectionModel(newModel)
            }
            style={{ width, height }}
            sx={{
              width: "100%",
              "& .MuiDataGrid-columnHeaderCheckbox": {
                padding: 0,
              },
            }}
          />
        )}
      </AutoSizer>
    </Box>
  );
};
