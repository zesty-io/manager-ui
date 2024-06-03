import { useHistory, useParams as useRouterParams } from "react-router";
import { Box, CircularProgress, Chip, Typography, Link } from "@mui/material";
import { useGetContentModelFieldsQuery } from "../../../../../../shell/services/instance";
import {
  DataGridPro,
  GridRenderCellParams,
  GRID_CHECKBOX_SELECTION_COL_DEF,
  useGridApiRef,
  GridInitialState,
} from "@mui/x-data-grid-pro";
import { useCallback, useLayoutEffect, useMemo, useRef, useState } from "react";
import { ContentItem } from "../../../../../../shell/services/types";
import { useStagedChanges } from "./StagedChangesContext";
import { OneToManyCell } from "./TableCells/OneToManyCell";
import { UserCell } from "./TableCells/UserCell";
import { useSelectedItems } from "./SelectedItemsContext";
import { VersionCell } from "./TableCells/VersionCell";
import { DropDownCell } from "./TableCells/DropdownCell";
import { SortCell } from "./TableCells/SortCell";
import { BooleanCell } from "./TableCells/BooleanCell";

type ItemListTableProps = {
  loading: boolean;
  rows: ContentItem[];
};

const METADATA_COLUMNS = [
  {
    field: "createdBy",
    headerName: "Created By",
    width: 240,
    sortable: false,
    filterable: false,
    renderCell: (params: GridRenderCellParams) => <UserCell params={params} />,
  },
  {
    field: "createdOn",
    headerName: "Created On",
    width: 200,
    sortable: false,
    filterable: false,
    valueGetter: (params: any) => params.row?.meta?.createdAt,
  },

  {
    field: "lastSaved",
    headerName: "Last Saved",
    width: 200,
    sortable: false,
    filterable: false,
    valueGetter: (params: any) => params.row?.web?.updatedAt,
  },
  {
    field: "lastPublished",
    headerName: "Last Published",
    width: 200,
    sortable: false,
    filterable: false,
    valueGetter: (params: any) =>
      params.row?.publishing?.publishAt ||
      params.row?.priorPublishing?.publishAt,
  },
  {
    field: "zuid",
    headerName: "ZUID",
    width: 200,
    sortable: false,
    filterable: false,
    valueGetter: (params: any) => params.row?.meta?.ZUID,
  },
] as const;

const fieldTypeColumnConfigMap = {
  text: {
    width: 360,
  },
  wysiwyg_basic: {
    width: 360,
  },
  wysiwyg_advanced: {
    width: 360,
  },
  article_writer: {
    width: 360,
  },
  markdown: {
    width: 360,
  },
  textarea: {
    width: 360,
  },
  one_to_many: {
    width: 240,
    renderCell: (params: GridRenderCellParams) => {
      return <OneToManyCell items={params.value?.split(",")} />;
    },
  },
  one_to_one: {
    width: 240,
    renderCell: (params: any) =>
      params.value && <Chip label={params.value} size="small" />,
  },
  uuid: {
    width: 280,
  },
  number: {
    width: 160,
    valueFormatter: (params: any) => {
      if (!params.value) return null;
      return new Intl.NumberFormat("en-US").format(params.value);
    },
  },
  currency: {
    width: 160,
    valueFormatter: (params: any) => {
      if (!params.value) return null;
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(params.value);
    },
  },
  images: {
    width: 100,
    renderCell: (params: GridRenderCellParams) => {
      const src = params?.value?.thumbnail || params?.value?.split(",")?.[0];
      if (!src) return null;
      return (
        <img
          style={{ objectFit: "contain" }}
          width="68px"
          height="58px"
          src={src}
        />
      );
    },
  },
  dropdown: {
    width: 240,
    renderCell: (params: GridRenderCellParams) => (
      <DropDownCell params={params} />
    ),
  },
  date: {
    width: 160,
  },
  datetime: {
    width: 200,
  },
  link: {
    width: 360,
    renderCell: (params: any) => {
      return (
        <Link
          underline="none"
          target="_blank"
          href={params.value}
          sx={{
            color: "primary.main",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {params.value}
        </Link>
      );
    },
  },
  internal_link: {
    width: 240,
    renderCell: (params: any) =>
      params.value && <Chip label={params.value} size="small" />,
  },
  yes_no: {
    width: 120,
    renderCell: (params: GridRenderCellParams) => (
      <BooleanCell params={params} />
    ),
  },
  color: {
    width: 140,
    renderCell: (params: GridRenderCellParams) => {
      return (
        <Box display="flex" alignItems="center" gap={1.5}>
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: "8px",
              backgroundColor: params.value,
            }}
          />
          <Typography>{params.value?.toUpperCase()}</Typography>
        </Box>
      );
    },
  },
  sort: {
    width: 156,
    renderCell: (params: GridRenderCellParams) => <SortCell params={params} />,
  },
} as const;

export const ItemListTable = ({ loading, rows }: ItemListTableProps) => {
  const { modelZUID } = useRouterParams<{ modelZUID: string }>();
  const apiRef = useGridApiRef();
  const [initialState, setInitialState] = useState<GridInitialState>();
  const history = useHistory();
  const { stagedChanges } = useStagedChanges();
  const [selectedItems, setSelectedItems] = useSelectedItems();

  const { data: fields } = useGetContentModelFieldsQuery(modelZUID);

  const saveSnapshot = useCallback(() => {
    if (apiRef?.current?.exportState && localStorage) {
      const currentState = apiRef.current.exportState();
      localStorage.setItem(
        `${modelZUID}-dataGridState`,
        JSON.stringify(currentState)
      );
    }
  }, [apiRef, modelZUID]);

  useLayoutEffect(() => {
    if (!fields) return;
    const stateFromLocalStorage = localStorage?.getItem(
      `${modelZUID}-dataGridState`
    );

    setInitialState(
      stateFromLocalStorage
        ? JSON.parse(stateFromLocalStorage)
        : {
            pinnedColumns: {
              left: [
                GRID_CHECKBOX_SELECTION_COL_DEF.field,
                "version",
                fields?.[0]?.name,
              ],
            },
          }
    );

    window.addEventListener("beforeunload", saveSnapshot);

    return () => {
      window.removeEventListener("beforeunload", saveSnapshot);
      saveSnapshot();
    };
  }, [saveSnapshot, fields, modelZUID]);

  const columns = useMemo(() => {
    let result: any[] = [
      {
        field: "version",
        headerName: "Vers.",
        width: 104,
        sortable: false,
        filterable: false,
        renderCell: (params: GridRenderCellParams) => (
          <VersionCell params={params} />
        ),
      },
    ];
    if (fields) {
      result = [
        ...result,
        ...fields
          ?.filter((field) => !field.deletedAt)
          ?.map((field) => ({
            field: field.name,
            headerName: field.label,
            sortable: false,
            filterable: false,
            // width: fieldTypeWidthMap[field.datatype] || 100,
            valueGetter: (params: any) => params.row.data[field.name],
            ...fieldTypeColumnConfigMap[field.datatype],
          })),
      ];
    }
    return result;
  }, [fields]);

  if (!initialState) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="100%"
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <DataGridPro
      apiRef={apiRef}
      loading={loading}
      rows={rows}
      columns={[...columns, ...METADATA_COLUMNS]}
      rowHeight={54}
      onRowClick={(row) => {
        if (typeof row.id === "string" && row.id?.startsWith("new")) {
          history.push(`/content/${modelZUID}/new`);
        } else {
          history.push(`/content/${modelZUID}/${row.id}`);
        }
      }}
      checkboxSelection
      disableSelectionOnClick
      initialState={initialState}
      onSelectionModelChange={(newSelection) => setSelectedItems(newSelection)}
      selectionModel={
        stagedChanges && Object.keys(stagedChanges)?.length ? [] : selectedItems
      }
      isRowSelectable={(params) =>
        params.row?.meta?.version &&
        !(stagedChanges && Object.keys(stagedChanges)?.length)
      }
      sx={{
        backgroundColor: "common.white",
        ".MuiDataGrid-row": {
          cursor: "pointer",
        },
        border: "none",
        "& .MuiDataGrid-columnHeaderCheckbox": {
          padding: 0,
        },
        " & .MuiDataGrid-columnSeparator": {
          visibility: "visible",
        },
        "& .MuiDataGrid-pinnedColumnHeaders": {
          backgroundColor: "inherit",
        },
      }}
    />
  );
};
