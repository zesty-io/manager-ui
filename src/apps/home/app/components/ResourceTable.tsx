import moment from "moment";
import {
  DataGridPro,
  GridAutoSizer,
  GridRenderCellParams,
} from "@mui/x-data-grid-pro";
import {
  useGetAuditsQuery,
  useGetItemQuery,
} from "../../../../shell/services/instance";
import { useSelector } from "react-redux";
import { Box, Typography, Skeleton } from "@mui/material";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import CodeIcon from "@mui/icons-material/Code";
import { Database } from "@zesty-io/material";

const viewableResourceTypes = ["content", "schema", "code"];

const iconMap = {
  content: <EditRoundedIcon color="action" fontSize="small" />,
  schema: <Database color="action" />,
  code: <CodeIcon color="action" />,
};

const NameCell = ({ affectedZUID, resourceType }: any) => {
  const { data, isLoading } = useGetItemQuery(affectedZUID, {
    skip: resourceType === "code",
  });
  const fileData = useSelector((state: any) =>
    Object.values(state.files).find((item: any) => item.ZUID === affectedZUID)
  ) as any;

  const name =
    resourceType === "code" ? fileData?.fileName : data?.web?.metaTitle;

  if (isLoading) {
    return <Skeleton variant="rectangular" width="100%" />;
  }

  return (
    <>
      {iconMap[resourceType as keyof typeof iconMap]}
      <Box component="span" sx={{ ml: 2 }}>
        {name ? name : `${affectedZUID} (Missing Meta Title)`}
      </Box>
    </>
  );
};

const VersionCell = ({ affectedZUID, resourceType }: any) => {
  const { data, isLoading } = useGetItemQuery(affectedZUID, {
    skip: resourceType === "code",
  });
  const fileData = useSelector((state: any) =>
    Object.values(state.files).find((item: any) => item.ZUID === affectedZUID)
  ) as any;

  const version =
    resourceType === "code" ? fileData?.version : data?.meta?.version;

  if (isLoading) {
    return <Skeleton variant="rectangular" width="100%" />;
  }

  return <Typography color="text.secondary">v{version}</Typography>;
};

export const ResourceTable = () => {
  const { data: audit, isFetching: isAuditFetching } = useGetAuditsQuery({
    start_date: moment().subtract(1, "months").format("L"),
    end_date: moment().format("L"),
  });

  const columns = [
    { field: "id", headerName: "Id", hide: true },
    {
      field: "name",
      headerName: "Name",
      flex: 1,
      sortable: false,
      renderCell: ({ row }: GridRenderCellParams) => <NameCell {...row} />,
    },
    {
      field: "version",
      headerName: "Vers.",
      headerAlign: "right",
      align: "right",
      sortable: false,
      renderCell: ({ row }: GridRenderCellParams) => <VersionCell {...row} />,
    },
  ];

  return (
    <DataGridPro
      // @ts-expect-error - missing types for headerAlign and align on DataGridPro
      columns={columns}
      rows={
        audit
          ?.filter((resource) =>
            viewableResourceTypes.includes(resource.resourceType)
          )
          ?.map((row: any) => ({ id: row.ZUID, ...row })) || []
      }
      rowHeight={52}
      hideFooter
      disableSelectionOnClick
      disableColumnFilter
      loading={isAuditFetching}
      sx={{
        backgroundColor: "common.white",
      }}
    />
  );
};
