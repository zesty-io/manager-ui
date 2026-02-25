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

  return (
    <Box
      sx={{
        height: 400,
        position: "relative",
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
            console.log("Delete rows:", rowSelectionModel);
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
            hideFooter
            pinnedColumns={{
              left: ["__check__"],
            }}
            rowSelectionModel={rowSelectionModel}
            onRowSelectionModelChange={(newModel) =>
              setRowSelectionModel(newModel)
            }
            style={{ width, height }}
            sx={{
              width: "100%",
              backgroundColor: "common.white",

              "& .MuiDataGrid-columnHeaderCheckbox": {
                padding: 0,
              },

              "& .MuiDataGrid-scrollbarFiller": {
                backgroundColor: "grey.100",
              },
            }}
          />
        )}
      </AutoSizer>
    </Box>
  );
};
