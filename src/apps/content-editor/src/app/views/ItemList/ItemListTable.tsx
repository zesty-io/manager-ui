import { useHistory, useParams as useRouterParams } from "react-router";
import {
  Box,
  Button,
  CircularProgress,
  Chip,
  Typography,
  Stack,
  Menu,
  MenuItem,
  Link,
  ToggleButtonGroup,
  ToggleButton,
  Tooltip,
} from "@mui/material";
import { useGetContentModelFieldsQuery } from "../../../../../../shell/services/instance";
import {
  DataGridPro,
  GridRenderCellParams,
  GRID_CHECKBOX_SELECTION_COL_DEF,
  useGridApiRef,
  GridInitialState,
} from "@mui/x-data-grid-pro";
import { useCallback, useLayoutEffect, useMemo, useRef, useState } from "react";
import { KeyboardArrowDownRounded } from "@mui/icons-material";
import { ContentItem } from "../../../../../../shell/services/types";
import { useStagedChanges } from "./StagedChangesContext";
import { FieldTypeSort } from "../../../../../../shell/components/FieldTypeSort";
import { useGetUsersQuery } from "../../../../../../shell/services/accounts";
import { OneToManyColumn } from "./OneToManyColumn";
import { UserCell } from "./UserCell";
import { useSelectedItems } from "./SelectedItemsContext";

type ItemListTableProps = {
  loading: boolean;
  rows: ContentItem[];
};

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
      return <OneToManyColumn items={params.value?.split(",")} />;
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
    renderCell: ({ row }: GridRenderCellParams) => {
      const src =
        row.data.images?.thumbnail || row.data.images?.split(",")?.[0];
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
    valueFormatter: (params: any) => {
      if (!params.value) return null;
      return new Date(params.value)?.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    },
  },
  datetime: {
    width: 200,
    valueFormatter: (params: any) => {
      if (!params.value) return null;
      return new Date(params.value)?.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "numeric",
      });
    },
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
    // Metadata
    result = [
      ...result,
      {
        field: "createdBy",
        headerName: "Created By",
        width: 240,
        sortable: false,
        filterable: false,
        renderCell: (params: GridRenderCellParams) => (
          <UserCell params={params} />
        ),
      },
      {
        field: "createdOn",
        headerName: "Created On",
        width: 200,
        sortable: false,
        filterable: false,
        valueGetter: (params: any) => params.row?.meta?.createdAt,
        valueFormatter: (params: any) =>
          new Date(params.value)?.toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "numeric",
            minute: "numeric",
          }),
      },

      {
        field: "lastSaved",
        headerName: "Last Saved",
        width: 200,
        sortable: false,
        filterable: false,
        valueGetter: (params: any) => params.row?.web?.updatedAt,
        valueFormatter: (params: any) => {
          if (!params.value) return null;
          return new Date(params.value)?.toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "numeric",
            minute: "numeric",
          });
        },
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
        valueFormatter: (params: any) => {
          if (!params.value) return null;
          return new Date(params.value)?.toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "numeric",
            minute: "numeric",
          });
        },
      },
      {
        field: "zuid",
        headerName: "ZUID",
        width: 200,
        sortable: false,
        filterable: false,
        valueGetter: (params: any) => params.row?.meta?.ZUID,
      },
    ];
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
      columns={columns}
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

export const DropDownCell = ({ params }: { params: GridRenderCellParams }) => {
  const { stagedChanges, updateStagedChanges } = useStagedChanges();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const { modelZUID } = useRouterParams<{ modelZUID: string }>();
  const { data: fields, isFetching: isFieldsFetching } =
    useGetContentModelFieldsQuery(modelZUID);
  const field = fields?.find((field) => field.name === params.field);
  const handleChange = (value: any) => {
    setAnchorEl(null);
    updateStagedChanges(params.row.id, params.field, value);
  };

  return (
    <>
      <Button
        sx={{
          color: "text.disabled",
          height: "24px",
          minWidth: "unset",
          padding: "2px",
          " .MuiButton-endIcon": {
            marginLeft: "4px",
          },
        }}
        color="inherit"
        endIcon={<KeyboardArrowDownRounded color="action" />}
        onClick={(e) => {
          e.stopPropagation();
          setAnchorEl(e.currentTarget);
        }}
      >
        {stagedChanges?.[params.row.id]?.[params.field] === null
          ? "Select"
          : field?.settings?.options[
              stagedChanges?.[params.row.id]?.[params.field]
            ] ||
            field?.settings?.options[params?.value] ||
            "Select"}
      </Button>
      <Menu
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "left",
        }}
        anchorEl={anchorEl}
        open={!!anchorEl}
      >
        <MenuItem
          onClick={() => {
            handleChange(null);
          }}
        >
          Select
        </MenuItem>
        {field?.settings?.options &&
          Object.entries(field?.settings?.options)?.map(([key, value]) => (
            <MenuItem
              key={key}
              onClick={() => {
                handleChange(key);
              }}
            >
              {value}
            </MenuItem>
          ))}
      </Menu>
    </>
  );
};

export const BooleanCell = ({ params }: { params: GridRenderCellParams }) => {
  const { stagedChanges, updateStagedChanges } = useStagedChanges();
  const { modelZUID } = useRouterParams<{ modelZUID: string }>();
  const { data: fields, isFetching: isFieldsFetching } =
    useGetContentModelFieldsQuery(modelZUID);
  const field = fields?.find((field) => field.name === params.field);
  const handleChange = (value: any) => {
    updateStagedChanges(params.row.id, params.field, value);
  };

  return (
    <ToggleButtonGroup
      size="small"
      color="primary"
      value={stagedChanges?.[params.row.id]?.[params.field] ?? params.value}
      exclusive
      onChange={(e, value) => {
        e.stopPropagation();
        if (value === null) {
          return;
        }
        handleChange(Number(value));
      }}
    >
      {field?.settings?.options &&
        Object.entries(field?.settings?.options)?.map(([key, value]) => (
          <ToggleButton key={key} value={Number(key)}>
            {value}
          </ToggleButton>
        ))}
    </ToggleButtonGroup>
  );
};

export const SortCell = ({ params }: { params: GridRenderCellParams }) => {
  const { stagedChanges, updateStagedChanges } = useStagedChanges();
  const handleChange = (value: any) => {
    updateStagedChanges(params.row.id, params.field, value);
  };

  return (
    <FieldTypeSort
      value={
        stagedChanges?.[params.row.id]?.[params.field]?.toString() ??
        (params.value?.toString() || "0")
      }
      onChange={(evt) => {
        handleChange(parseInt(evt.target.value));
      }}
      height={40}
    />
  );
};

export const VersionCell = ({ params }: { params: GridRenderCellParams }) => {
  const { data: users } = useGetUsersQuery();

  const createdByUser = users?.find(
    (user) => user.ZUID === params.row?.meta?.createdByUserZUID
  );
  const publishedByUser =
    users?.find(
      (user) => user.ZUID === params.row?.publishing?.publishedByUserZUID
    ) ||
    users?.find(
      (user) => user.ZUID === params.row?.priorPublishing?.publishedByUserZUID
    );
  const isScheduledPublish =
    new Date(
      params.row?.publishing?.publishAt ||
        params.row?.priorPublishing?.publishAt
    )?.getTime() > new Date()?.getTime();

  return (
    <Stack spacing={0.25}>
      {params.row?.meta?.version !== params.row?.publishing?.version && (
        <Tooltip
          enterDelay={1000}
          enterNextDelay={1000}
          title={`v${params.row?.meta?.version} saved on ${new Date(
            params.row?.meta?.updatedAt
          ).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "numeric",
            minute: "numeric",
            timeZoneName: "short",
          })} by ${createdByUser?.firstName} ${createdByUser?.lastName}`}
          slotProps={{
            popper: {
              style: {
                width: 116,
              },
            },
          }}
          placement="bottom"
        >
          <Chip
            label={`v${params.row?.meta?.version}`}
            size="small"
            color="info"
          />
        </Tooltip>
      )}
      {(params.row?.publishing?.version ||
        params.row?.priorPublishing?.version) && (
        <Tooltip
          enterDelay={1000}
          enterNextDelay={1000}
          title={`v${
            params.row?.publishing?.version ||
            params.row?.priorPublishing?.version
          } ${
            isScheduledPublish ? "scheduled to publish" : "published"
          } on ${new Date(
            params.row?.publishing?.publishAt ||
              params.row?.priorPublishing?.publishAt
          ).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "numeric",
            minute: "numeric",
            timeZoneName: "short",
          })} by ${publishedByUser?.firstName} ${publishedByUser?.lastName}`}
          slotProps={{
            popper: {
              style: {
                width: isScheduledPublish ? 116 : 146,
              },
            },
          }}
          placement="bottom"
        >
          <Chip
            label={`v${
              params.row?.publishing?.version ||
              params.row?.priorPublishing?.version
            }`}
            size="small"
            color={isScheduledPublish ? "warning" : "success"}
          />
        </Tooltip>
      )}

      {!params.row?.meta?.version && (
        <Tooltip
          enterDelay={1000}
          enterNextDelay={1000}
          title={"Item not yet created"}
          placement="bottom"
        >
          <Chip label={"v0"} size="small" />
        </Tooltip>
      )}
    </Stack>
  );
};
