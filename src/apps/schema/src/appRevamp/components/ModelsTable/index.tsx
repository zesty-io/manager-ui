import { Box, Typography, Skeleton } from "@mui/material";
import {
  DataGridPro,
  GridRenderCellParams,
  GridSortModel,
  GridValueFormatterParams,
} from "@mui/x-data-grid-pro";
import FormatListBulletedRoundedIcon from "@mui/icons-material/FormatListBulletedRounded";
import {
  useGetContentModelFieldsQuery,
  useGetContentModelItemsQuery,
  useGetContentModelsQuery,
} from "../../../../../../shell/services/instance";
import { ContentModel } from "../../../../../../shell/services/types";
import { FileTable } from "@zesty-io/material";
import DescriptionRoundedIcon from "@mui/icons-material/DescriptionRounded";
import moment from "moment-timezone";
import { useMemo, useState } from "react";
import { useHistory } from "react-router";
import { NoSearchResults } from "../NoSearchResults";

const modelIconMap = {
  templateset: (
    <FormatListBulletedRoundedIcon fontSize="small" color="action" />
  ),
  dataset: <FileTable fontSize="small" color="action" />,
  pageset: <DescriptionRoundedIcon fontSize="small" color="action" />,
};

const modelNameMap = {
  templateset: "Multi Page",
  dataset: "Headless Dataset",
  pageset: "Single Page",
};

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

  const filteredModels = useMemo(() => {
    if (!search) {
      return models;
    }
    return models?.filter((model: ContentModel) => {
      return (
        model.label.toLowerCase().includes(search.toLowerCase()) ||
        model.name.toLowerCase().includes(search.toLowerCase()) ||
        modelNameMap[model.type as keyof typeof modelNameMap]
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        model.ZUID.toLowerCase().includes(search.toLowerCase())
      );
    });
  }, [search, models]);

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
          {modelIconMap[row.type as keyof typeof modelIconMap]}
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

  return (
    <Box height={filteredModels?.length ? "100%" : "55px"}>
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
      {!filteredModels?.length && !isFetching && (
        <Box sx={{ mt: 10 }}>
          <NoSearchResults
            searchTerm={search}
            onSearchAgain={() => onEmptySearch()}
          />
        </Box>
      )}
    </Box>
  );
};
