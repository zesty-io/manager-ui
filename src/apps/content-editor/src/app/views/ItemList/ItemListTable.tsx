import { useHistory, useParams as useRouterParams } from "react-router";
import { Box, Typography, Link, Checkbox } from "@mui/material";
import {
  DataGridPro,
  GridRenderCellParams,
  useGridApiRef,
  GridInitialState,
} from "@mui/x-data-grid-pro";
import {
  memo,
  useCallback,
  useLayoutEffect,
  useMemo,
  useState,
  useContext,
  forwardRef,
} from "react";
import AutoSizer, { Size } from "react-virtualized-auto-sizer";
import {
  ContentItem,
  ContentModelField,
} from "../../../../../../shell/services/types";
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
import { TableSortContext } from "./TableSortProvider";
import { FIELD_SKELETON_MAP, gridLoadingStyles } from "./Loader";
import { Skeleton } from "@mui/material";
import DataGridSkeletonCell from "../../../../../../shell/components/DataGridSkeletonCell";

type ItemListTableProps = {
  loading: boolean;
  rows: ContentItem[];
  fields: ContentModelField[];
  noRowsOverlay: () => JSX.Element;
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
    filterable: true,
    renderCell: (params: GridRenderCellParams) => <UserCell params={params} />,
  },
  {
    field: "createdOn",
    headerName: "Date Created",
    width: 200,
    filterable: true,
    valueGetter: (params: any, row: any) => row?.meta?.createdAt,
  },

  {
    field: "lastSaved",
    headerName: "Last Saved",
    width: 200,
    filterable: true,
    valueGetter: (params: any, row: any) => row?.web?.updatedAt,
  },
  {
    field: "lastPublished",
    headerName: "Last Published",
    width: 200,
    filterable: true,
    valueGetter: (params: any, row: any) => row?.publishing?.publishAt,
  },
  {
    field: "zuid",
    headerName: "ZUID",
    width: 200,
    filterable: true,
    valueGetter: (params: any, row: any) => row?.meta?.ZUID,
  },
];
const fieldTypeColumnConfigMap = {
  text: {
    width: 360,
    filterable: true,
  },
  wysiwyg_basic: {
    width: 360,
    valueFormatter: (value: any) => getHtmlText(value),
    filterable: true,
  },
  wysiwyg_advanced: {
    width: 360,
    valueFormatter: (value: any) => getHtmlText(value),
    filterable: true,
  },
  article_writer: {
    width: 360,
    valueFormatter: (value: any) => getHtmlText(value),
    filterable: true,
  },
  markdown: {
    width: 360,
    filterable: true,
  },
  textarea: {
    width: 360,
    filterable: true,
  },
  one_to_many: {
    width: 240,
    filterable: true,
    renderCell: (params: GridRenderCellParams) => {
      return <OneToManyCell items={params.value?.split(",")} />;
    },
  },
  one_to_one: {
    width: 240,
    filterable: true,
    renderCell: (params: any) =>
      params.value && <SingleRelationshipCell params={params} />,
  },
  uuid: {
    width: 280,
    filterable: true,
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
  images: {
    width: 100,
    renderCell: (params: GridRenderCellParams) => {
      return <ImageCell params={params} />;
    },
  },
  dropdown: {
    width: 240,
    filterable: true,
    renderCell: (params: GridRenderCellParams) => (
      <DropDownCell params={params} />
    ),
  },
  date: {
    width: 160,
    filterable: true,
  },
  datetime: {
    width: 200,
    filterable: true,
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
  internal_link: {
    width: 240,
    filterable: true,
    renderCell: (params: any) =>
      params.value && <SingleRelationshipCell params={params} />,
  },
  yes_no: {
    width: 120,
    filterable: true,
    renderCell: (params: GridRenderCellParams) => (
      <BooleanCell params={params} />
    ),
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
  sort: {
    width: 112,
    filterable: true,
    renderCell: (params: GridRenderCellParams) => <SortCell params={params} />,
  },
  block_selector: {
    width: 200,
    filterable: true,
  },
  repeater_field: {
    width: 200,
    filterable: true,
  },
} as const;

export const ItemListTable = memo(
  ({ loading, rows, fields, noRowsOverlay }: ItemListTableProps) => {
    const { modelZUID } = useRouterParams<{ modelZUID: string }>();
    const apiRef = useGridApiRef();
    const [initialState, setInitialState] = useState<GridInitialState>();
    const history = useHistory();
    const { stagedChanges } = useStagedChanges();
    const [selectedItems, setSelectedItems] = useSelectedItems();
    const [sortModel, setSortModel] = useContext(TableSortContext);
    const [pinnedColumns, setPinnedColumns] = useState({});

    const saveSnapshot = useCallback(() => {
      if (apiRef?.current?.exportState && localStorage) {
        const currentState = apiRef.current.exportState();
        const fullState = {
          ...currentState,
          pinnedColumns: apiRef.current.getPinnedColumns(),
        };
        localStorage.setItem(
          `${modelZUID}-dataGridState`,
          JSON.stringify(fullState)
        );
      }
    }, [apiRef, modelZUID]);

    useLayoutEffect(() => {
      if (!fields) return;
      const stateFromLocalStorage = localStorage?.getItem(
        `${modelZUID}-dataGridState`
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
          left: ["__check__", "version", fields?.[0]?.name],
        });
      }

      window.addEventListener("beforeunload", saveSnapshot);

      return () => {
        window.removeEventListener("beforeunload", saveSnapshot);
        saveSnapshot();
      };
    }, [saveSnapshot, fields, modelZUID]);

    const columns = useMemo(() => {
      const gridState = localStorage?.getItem(`${modelZUID}-dataGridState`);
      const colDimensions = gridState
        ? JSON.parse(gridState)?.columns?.dimensions
        : null;

      let result: any[] = [
        {
          field: "version",
          headerName: "Vers.",
          width: 64,
          sortable: true,
          filterable: false,
          cellClassName: "version",
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
              cellClassName: field?.datatype,
              valueGetter: (params: any, row: any) => {
                if (field.datatype === "currency") {
                  return {
                    value: row.data[field.name],
                    currency: field.settings?.currency || "USD",
                  };
                }

                return row.data[field.name];
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
      result = [
        ...result,
        ...METADATA_COLUMNS?.map((column) => ({
          ...column,
          cellClassName: column.field,
          flex: !fields?.length ? 1 : 0,
        })),
      ];
      return result.map((column) => {
        const { headerName, ...other } = column;
        return {
          ...other,
          width: colDimensions?.[column.field]?.width || column.width,
          renderHeader: () =>
            loading ? FIELD_SKELETON_MAP.header : headerName,
        };
      });
    }, [fields, loading]);

    return (
      <AutoSizer>
        {({ width, height }: Size) => (
          <DataGridPro
            data-cy="listItemTable"
            apiRef={apiRef}
            loading={loading}
            rows={loading ? [] : rows}
            columns={columns}
            style={{
              width,
              height: height - 60,
            }}
            pinnedColumns={pinnedColumns}
            onPinnedColumnsChange={(newPinnedColumns) =>
              setPinnedColumns(newPinnedColumns)
            }
            rowHeight={54}
            hideFooter
            onRowClick={(row) => {
              if (selectedItems.length) {
                if (selectedItems.includes(row.id)) {
                  setSelectedItems(
                    selectedItems.filter((id: string) => id !== row.id)
                  );
                } else {
                  setSelectedItems([...selectedItems, row.id]);
                }
              } else {
                if (typeof row.id === "string" && row.id?.startsWith("new")) {
                  history.push(`/content/${modelZUID}/new`);
                } else {
                  history.push(`/content/${modelZUID}/${row.id}`);
                }
              }
            }}
            slots={{
              noRowsOverlay: noRowsOverlay,
              baseCheckbox: forwardRef((props: any, ref: any) => {
                return loading ? (
                  <Skeleton variant="rounded" width="18px" height="18px" />
                ) : (
                  <Checkbox
                    ref={ref}
                    disabled={
                      stagedChanges && Object.keys(stagedChanges)?.length
                    }
                    {...props}
                  />
                );
              }),
              skeletonCell: DataGridSkeletonCell,
            }}
            slotProps={{
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
              loadingOverlay: {
                variant: "skeleton",
                noRowsVariant: "skeleton",
              },
              row: {
                "data-cy": "itemListRow",
              },
            }}
            getRowClassName={(params) => {
              // if included in staged changes, highlight the row
              if (stagedChanges?.[params.id]) {
                return "Mui-selected";
              }
            }}
            checkboxSelection
            disableRowSelectionOnClick
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
            onRowSelectionModelChange={(newSelection: any) =>
              setSelectedItems(newSelection)
            }
            rowSelectionModel={
              stagedChanges && Object.keys(stagedChanges)?.length
                ? []
                : selectedItems
            }
            isRowSelectable={(params) =>
              params.row?.meta?.version &&
              !(stagedChanges && Object.keys(stagedChanges)?.length)
            }
            onColumnWidthChange={saveSnapshot}
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
                " .MuiDataGrid-cell": {
                  borderBottom: (theme) =>
                    `1px solid ${theme.palette.primary.main}`,
                },
              },
              // Makes sure that the custom overlay is interactive
              "& [data-cy='NoResults']": {
                pointerEvents: "all",
              },
              "& .MuiDataGrid-row.MuiDataGrid-rowSkeleton": {
                borderBottom: "1px solid",
                borderColor: "border",
              },
              ...(loading ? gridLoadingStyles : {}),
            }}
          />
        )}
      </AutoSizer>
    );
  }
);
