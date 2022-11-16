import moment from "moment";
import {
  DataGridPro,
  GridAutoSizer,
  GridRenderCellParams,
} from "@mui/x-data-grid-pro";
import {
  useGetAuditsQuery,
  useGetContentItemQuery,
  useGetContentModelQuery,
} from "../../../../shell/services/instance";
import { useSelector } from "react-redux";
import { Box, Typography, Skeleton } from "@mui/material";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import CodeIcon from "@mui/icons-material/Code";
import { Database } from "@zesty-io/material";
import { useHistory } from "react-router";
import { useMemo } from "react";
import { uniqBy } from "lodash";

const viewableResourceTypes = ["content", "schema", "code"];

const iconMap = {
  content: <EditRoundedIcon color="action" fontSize="small" />,
  schema: <Database color="action" />,
  code: <CodeIcon color="action" />,
};

const NameCell = ({ affectedZUID, resourceType }: any) => {
  const { data: contentItem, isLoading: isItemLoading } =
    useGetContentItemQuery(affectedZUID, {
      skip: resourceType !== "content",
    });
  const { data: contentModel, isLoading: isModelLoading } =
    useGetContentModelQuery(affectedZUID, {
      skip: resourceType !== "schema",
    });
  const fileData = useSelector((state: any) =>
    Object.values(state.files).find((item: any) => item.ZUID === affectedZUID)
  ) as any;

  const isLoading = isItemLoading || isModelLoading;

  const name = useMemo(() => {
    switch (resourceType) {
      case "content":
        return contentItem?.web?.metaTitle;
      case "schema":
        return contentModel?.label;
      case "code":
        return fileData?.fileName;
    }
  }, [resourceType, contentItem, contentModel, fileData]);

  if (isLoading) {
    return <Skeleton variant="rectangular" width="100%" />;
  }

  return (
    <>
      {iconMap[resourceType as keyof typeof iconMap]}
      <Box component="span" sx={{ ml: 2 }}>
        {name
          ? name
          : `${affectedZUID} (${
              resourceType === "content" && contentItem
                ? "Missing Meta Title"
                : "Deleted"
            })`}
      </Box>
    </>
  );
};

const VersionCell = ({ affectedZUID, resourceType }: any) => {
  const { data, isLoading } = useGetContentItemQuery(affectedZUID, {
    skip: resourceType !== "content",
  });
  const fileData = useSelector((state: any) =>
    Object.values(state.files).find((item: any) => item.ZUID === affectedZUID)
  ) as any;

  const version =
    resourceType === "code" ? fileData?.version : data?.meta?.version;

  if (isLoading) {
    return <Skeleton variant="rectangular" width="100%" />;
  }

  return (
    <Typography color="text.secondary">
      {version ? `v${version}` : ""}
    </Typography>
  );
};

export const ResourceTable = () => {
  const { data: audit, isFetching: isAuditFetching } = useGetAuditsQuery({
    start_date: moment().subtract(1, "months").format("L"),
    end_date: moment().format("L"),
  });

  const history = useHistory();

  const handleRowClick = ({ affectedZUID, resourceType, meta }: any) => {
    if (resourceType === "code") {
      history.push("/code/file/" + meta?.uri.split("/").slice(3).join("/"));
    } else {
      history.push(new URL(meta?.url)?.pathname);
    }
  };

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
        uniqBy(
          audit?.filter((resource) =>
            viewableResourceTypes.includes(resource.resourceType)
          ),
          "affectedZUID"
        )?.map((row: any) => ({ id: row.ZUID, ...row })) || []
      }
      rowHeight={52}
      hideFooter
      disableSelectionOnClick
      disableColumnFilter
      loading={isAuditFetching}
      onRowClick={(params) => handleRowClick(params.row)}
      sx={{
        backgroundColor: "common.white",
      }}
    />
  );
};
