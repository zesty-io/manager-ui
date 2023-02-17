import { Box, Typography, Skeleton, SvgIcon } from "@mui/material";
import {
  DataGridPro,
  GridRenderCellParams,
  GridSortModel,
  GridValueFormatterParams,
} from "@mui/x-data-grid-pro";
import {
  useGetContentModelFieldsQuery,
  useGetContentModelItemsQuery,
  useGetContentModelsQuery,
} from "../../../../../shell/services/instance";
import { ContentModel, ModelType } from "../../../../../shell/services/types";
import moment from "moment-timezone";
import { useMemo, useState, useReducer } from "react";
import { useHistory } from "react-router";
import { NoResults } from "./NoResults";
import { modelIconMap, modelNameMap } from "../utils";
import { Filters } from "./Filters";
import { AllModelsEmptyState } from "./AllModelsEmptyState";

const FieldsCell = ({ ZUID }: any) => {
  const { data, isLoading } = useGetContentModelFieldsQuery(ZUID);
  if (isLoading) {
    return <Skeleton variant="rectangular" width="100%" />;
  }

  return <Typography variant="body2">{data?.length}</Typography>;
};

const ContentItemsCell = ({ ZUID }: any) => {
  const { data, isLoading } = useGetContentModelItemsQuery(ZUID);
  if (isLoading) {
    return <Skeleton variant="rectangular" width="100%" />;
  }

  return <Typography variant="body2">{data?.length}</Typography>;
};

export type ModelFilter = {
  modelType: ModelType | "";
  user: string;
  lastUpdated: string;
};
interface Props {
  search?: string;
  onEmptySearch?: () => void;
}

export const ModelsTable = ({ search, onEmptySearch }: Props) => {
  const history = useHistory();
  // Used to initialize the table sorted by name
  const [sortModel, setSortModel] = useState<GridSortModel>([
    {
      field: "name",
      sort: "asc",
    },
  ]);
  const { data: models, isFetching } = useGetContentModelsQuery();

  const [activeFilters, setActiveFilters] = useReducer(
    (currentFilters: ModelFilter, newFilter: Partial<ModelFilter>) => {
      return {
        ...currentFilters,
        ...newFilter,
      };
    },
    { modelType: "", user: "", lastUpdated: "" }
  );

  const filteredModels = useMemo(() => {
    let localModels = models;

    if (Object.values(activeFilters).some((filter) => filter !== "")) {
      localModels = models?.filter((model: ContentModel) => {
        // TODO: Logic for lastUpdated probably needs to be updated
        return (
          (activeFilters.modelType === ""
            ? true
            : model.type === activeFilters.modelType) &&
          (activeFilters.user === ""
            ? true
            : model.createdByUserZUID === activeFilters.user) &&
          (activeFilters.lastUpdated === ""
            ? true
            : model.updatedAt === activeFilters.lastUpdated)
        );
      });
    }

    if (!search) {
      return localModels;
    }

    return localModels?.filter((model: ContentModel) => {
      return (
        model.label.toLowerCase().includes(search.toLowerCase()) ||
        model.name.toLowerCase().includes(search.toLowerCase()) ||
        modelNameMap[model.type as keyof typeof modelNameMap]
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        model.ZUID.toLowerCase().includes(search.toLowerCase())
      );
    });
  }, [search, models, activeFilters]);

  const handleRowClick = (row: ContentModel) => {
    history.push(`/schema/${row.ZUID}`);
  };

  const columns = [
    { field: "id", headerName: "Id", hide: true },
    {
      field: "name",
      headerName: "Name",
      flex: 1,
      renderCell: ({ row }: GridRenderCellParams) => (
        <Box display="flex" gap={2} width="100%">
          <SvgIcon
            fontSize="small"
            color="action"
            component={modelIconMap[row.type as keyof typeof modelIconMap]}
          />
          <Typography variant="body2" noWrap>
            {row.label}
          </Typography>
        </Box>
      ),
    },
    {
      field: "type",
      headerName: "Model Type",
      width: 152,
      valueFormatter: (params: GridValueFormatterParams) =>
        modelNameMap[params.value as keyof typeof modelNameMap],
    },
    {
      field: "updatedAt",
      headerName: "Updated",
      width: 120,
      valueFormatter: (params: GridValueFormatterParams) =>
        moment(params.value).fromNow(),
    },
    {
      field: "fields",
      headerName: "Fields",
      width: 104,
      headerAlign: "right",
      align: "right",
      sortable: false,
      renderCell: ({ row }: GridRenderCellParams) => <FieldsCell {...row} />,
    },
    {
      field: "contentItems",
      headerName: "Content Items",
      width: 120,
      headerAlign: "right",
      align: "right",
      sortable: false,
      renderCell: ({ row }: GridRenderCellParams) => (
        <ContentItemsCell {...row} />
      ),
    },
  ];

  if (!models?.length && !isFetching) {
    return <AllModelsEmptyState />;
  }

  return (
    <Box
      height={filteredModels?.length ? "100%" : "55px"}
      display="flex"
      flexDirection="column"
    >
      <Filters value={activeFilters} onChange={setActiveFilters} />
      <DataGridPro
        // @ts-expect-error - missing types for headerAlign and align on DataGridPro
        columns={columns}
        rows={
          filteredModels?.map((model) => ({ ...model, id: model.ZUID })) || []
        }
        loading={isFetching}
        hideFooter
        rowHeight={52}
        disableSelectionOnClick
        disableColumnResize
        disableColumnFilter
        disableColumnMenu
        onRowClick={(params) => handleRowClick(params.row)}
        sortModel={sortModel}
        onSortModelChange={(model) => setSortModel(model)}
        sx={{
          ".MuiDataGrid-row": {
            cursor: "pointer",
          },
        }}
      />
      {!filteredModels?.length && !isFetching && search && (
        <Box sx={{ mt: 10 }}>
          <NoResults
            type="search"
            searchTerm={search}
            onButtonClick={() => onEmptySearch()}
          />
        </Box>
      )}

      {!filteredModels?.length && !isFetching && !search && (
        <Box sx={{ mt: 10 }}>
          <NoResults
            type="filter"
            onButtonClick={() =>
              setActiveFilters({ modelType: "", user: "", lastUpdated: "" })
            }
          />
        </Box>
      )}
    </Box>
  );
};
