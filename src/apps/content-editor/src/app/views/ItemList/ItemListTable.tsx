import { useHistory, useParams as useRouterParams } from "react-router";
import {
  Box,
  CircularProgress,
  Chip,
  Typography,
  Link,
  Checkbox,
  Stack,
} from "@mui/material";
import { ImageRounded } from "@mui/icons-material";
import { useGetContentModelFieldsQuery } from "../../../../../../shell/services/instance";
import {
  DataGridPro,
  GridRenderCellParams,
  GRID_CHECKBOX_SELECTION_COL_DEF,
  useGridApiRef,
  GridInitialState,
  GridComparatorFn,
  GridPinnedColumns,
} from "@mui/x-data-grid-pro";
import {
  memo,
  useCallback,
  useLayoutEffect,
  useMemo,
  useState,
  useContext,
} from "react";
import { ContentItem } from "../../../../../../shell/services/types";
import { useStagedChanges } from "./StagedChangesContext";
import { OneToManyCell } from "./TableCells/OneToManyCell";
import { UserCell } from "./TableCells/UserCell";
import { useSelectedItems } from "./SelectedItemsContext";
import { VersionCell } from "./TableCells/VersionCell";
import { DropDownCell } from "./TableCells/DropdownCell";
import { SortCell } from "./TableCells/SortCell";
import { BooleanCell } from "./TableCells/BooleanCell";
import { currencies } from "../../../../../../shell/components/FieldTypeCurrency/currencies";
import { Currency } from "../../../../../../shell/components/FieldTypeCurrency/currencies";
import { ImageCell } from "./TableCells/ImageCell";
import { SingleRelationshipCell } from "./TableCells/SingleRelationshipCell";
import { useParams } from "../../../../../../shell/hooks/useParams";
import { TableSortContext } from "./TableSortProvider";

type ItemListTableProps = {
  loading: boolean;
  rows: ContentItem[];
};

const CURRENCY_OBJECT: Record<string, Currency> = currencies.reduce(
  (acc, curr) => {
    return {
      ...acc,
      [curr.value]: {
        ...curr,
      },
    };
  },
  {}
);

const getHtmlText = (html: string) => {
  if (!html) return "";

  const rawData = html;
  let elementFromData = document.createElement("div");
  elementFromData.innerHTML = rawData;
  const strippedData =
    elementFromData?.textContent || elementFromData?.innerText;
  return strippedData?.replace(/<[^>]*>/g, "").slice(0, 120) || "";
};

const METADATA_COLUMNS = [
  {
    field: "createdBy",
    headerName: "Created By",
    width: 240,
    filterable: false,
    renderCell: (params: GridRenderCellParams) => <UserCell params={params} />,
  },
  {
    field: "createdOn",
    headerName: "Date Created",
    width: 200,
    filterable: false,
    valueGetter: (params: any) => params.row?.meta?.createdAt,
  },

  {
    field: "lastSaved",
    headerName: "Last Saved",
    width: 200,
    filterable: false,
    valueGetter: (params: any) => params.row?.web?.updatedAt,
  },
  {
    field: "lastPublished",
    headerName: "Last Published",
    width: 200,
    filterable: false,
    valueGetter: (params: any) => params.row?.publishing?.publishAt,
  },
  {
    field: "zuid",
    headerName: "ZUID",
    width: 200,
    filterable: false,
    valueGetter: (params: any) => params.row?.meta?.ZUID,
  },
];
const fieldTypeColumnConfigMap = {
  text: {
    width: 360,
  },
  wysiwyg_basic: {
    width: 360,
    valueFormatter: (params: any) => getHtmlText(params.value),
  },
  wysiwyg_advanced: {
    width: 360,
    valueFormatter: (params: any) => getHtmlText(params.value),
  },
  article_writer: {
    width: 360,
    valueFormatter: (params: any) => getHtmlText(params.value),
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
      params.value && <SingleRelationshipCell params={params} />,
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
    align: "right",
  },
  currency: {
    width: 160,
    valueFormatter: (params: any) => {
      if (params.value?.value === undefined || params.value?.value === null)
        return "";

      return `${
        CURRENCY_OBJECT[params.value?.currency]?.symbol_native
      } ${new Intl.NumberFormat("en-US", {
        minimumFractionDigits: 2,
      }).format(params.value.value)}`;
    },
    align: "right",
  },
  images: {
    width: 100,
    renderCell: (params: GridRenderCellParams) => {
      return <ImageCell params={params} />;
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
  internal_link: {
    width: 240,
    renderCell: (params: any) =>
      params.value && <SingleRelationshipCell params={params} />,
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
  sort: {
    width: 112,
    renderCell: (params: GridRenderCellParams) => <SortCell params={params} />,
  },
} as const;

export const ItemListTable = memo(({ loading, rows }: ItemListTableProps) => {
  const { modelZUID } = useRouterParams<{ modelZUID: string }>();
  const apiRef = useGridApiRef();
  const [initialState, setInitialState] = useState<GridInitialState>();
  const history = useHistory();
  const { stagedChanges } = useStagedChanges();
  const [selectedItems, setSelectedItems] = useSelectedItems();
  const [params, setParams] = useParams();
  const [sortModel, setSortModel] = useContext(TableSortContext);
  const [pinnedColumns, setPinnedColumns] = useState<GridPinnedColumns>({});

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
      stateFromLocalStorage ? JSON.parse(stateFromLocalStorage) : {}
    );
    setPinnedColumns({
      left: ["__check__", "version", fields?.[0]?.name],
    });

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
        width: 59,
        sortable: true,
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
          ?.filter((field) => !field.deletedAt && field?.settings?.list)
          ?.map((field) => ({
            field: field.name,
            headerName: field.label,
            filterable: false,
            valueGetter: (params: any) => {
              if (field.datatype === "currency") {
                return {
                  value: params.row.data[field.name],
                  currency: field.settings?.currency || "USD",
                };
              }

              return params.row.data[field.name];
            },
            ...fieldTypeColumnConfigMap[field.datatype],
            // if field is yes_no but it has custom options increase the width
            ...(field.datatype === "yes_no" &&
              field?.settings?.options?.[0] !== "No" &&
              field?.settings?.options?.[1] !== "Yes" && {
                width: 280,
              }),
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
      pinnedColumns={pinnedColumns}
      onPinnedColumnsChange={(newPinnedColumns) =>
        setPinnedColumns(newPinnedColumns)
      }
      rowHeight={54}
      hideFooter
      onRowClick={(row) => {
        if (typeof row.id === "string" && row.id?.startsWith("new")) {
          history.push(`/content/${modelZUID}/new`);
        } else {
          history.push(`/content/${modelZUID}/${row.id}`);
        }
      }}
      components={{
        NoRowsOverlay: () => <></>,
        BaseCheckbox: (props) => (
          <Checkbox
            disabled={stagedChanges && Object.keys(stagedChanges)?.length}
            {...props}
          />
        ),
      }}
      componentsProps={{
        baseTooltip: {
          placement: "top-start",
          slotProps: {
            popper: {
              modifiers: [
                {
                  name: "offset",
                  options: {
                    offset: [0, -30],
                  },
                },
              ],
            },
          },
        },
      }}
      getRowClassName={(params) => {
        // if included in staged changes, highlight the row
        if (stagedChanges?.[params.id]) {
          return "Mui-selected";
        }
      }}
      checkboxSelection
      disableSelectionOnClick
      initialState={initialState}
      sortingOrder={["desc", "asc", null]}
      sortModel={sortModel}
      sortingMode="server"
      onSortModelChange={(newSortModel) => {
        if (!Object.entries(newSortModel)?.length) {
          setSortModel([
            {
              field: "lastSaved",
              sort: "desc",
            },
          ]);
        } else {
          setSortModel(newSortModel);
        }
      }}
      onSelectionModelChange={(newSelection) => setSelectedItems(newSelection)}
      selectionModel={
        stagedChanges && Object.keys(stagedChanges)?.length ? [] : selectedItems
      }
      isRowSelectable={(params) =>
        params.row?.meta?.version &&
        !(stagedChanges && Object.keys(stagedChanges)?.length)
      }
      sx={{
        ...(!rows?.length &&
          !loading && {
            maxHeight: 56,
          }),
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
        ".MuiDataGrid-columnHeader": {
          "&:hover .MuiDataGrid-columnSeparator": {
            visibility: "visible",
          },
        },
        ".MuiDataGrid-columnSeparator": {
          visibility: "hidden",
        },
        "& .MuiDataGrid-cell:focus-within": {
          outline: "none",
        },
        "& .MuiDataGrid-columnHeader:focus-within": {
          outline: "none",
        },
        "& .MuiDataGrid-cell:has([data-cy='sortCell'])": {
          padding: 0,
        },
        "& .MuiDataGrid-row.Mui-selected": {
          borderBottom: (theme) => `2px solid ${theme.palette.primary.main}`,
        },
      }}
    />
  );
});
