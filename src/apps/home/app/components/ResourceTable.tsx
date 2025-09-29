import { DataGridPro, GridRenderCellParams } from "@mui/x-data-grid-pro";
import {
  useGetAuditsQuery,
  useGetContentItemQuery,
  useGetContentModelQuery,
} from "../../../../shell/services/instance";
import { useSelector } from "react-redux";
import { Typography, Skeleton, Tooltip, Box } from "@mui/material";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import CodeIcon from "@mui/icons-material/Code";
import { Database } from "@zesty-io/material";
import { useHistory } from "react-router";
import { useMemo } from "react";
import { uniqBy } from "lodash";
import AutoSizer, { Size } from "react-virtualized-auto-sizer";
import { EmptyState } from "./EmptyState";
import { resolveUrlFromAudit } from "../../../../utility/resolveResourceUrlFromAudit";
import { Audit } from "../../../../shell/services/types";
import { format, subDays } from "date-fns";

interface Props {
  dateRange: number;
}

const viewableResourceTypes = ["content", "schema", "code"];

const iconMap = {
  content: <EditRoundedIcon color="action" fontSize="small" />,
  schema: <Database color="action" />,
  code: <CodeIcon color="action" />,
};

const NameCell = ({ affectedZUID, resourceType }: any) => {
  const languages = useSelector((state: any) => state.languages);
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

  const lang = languages.find(
    (lang: any) => lang.ID === contentItem?.meta?.langID
  );

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
    return (
      <Box display="flex" height="100%" alignItems="center">
        <Skeleton variant="rectangular" width="100%" />
      </Box>
    );
  }

  return (
    <Box display="flex" height="100%" alignItems="center">
      {iconMap[resourceType as keyof typeof iconMap]}
      <Typography variant="body2" component="span" sx={{ ml: 2 }} noWrap>
        {name ? (
          <>
            {name}{" "}
            {lang?.code && Object.keys(contentItem?.siblings)?.length > 1
              ? `(${lang?.code})`
              : ""}
          </>
        ) : (
          `${affectedZUID} (${
            resourceType === "content" && contentItem
              ? "Missing Meta Title"
              : "Deleted"
          })`
        )}
      </Typography>
    </Box>
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
    return (
      <Box display="flex" height="100%" alignItems="center">
        <Skeleton variant="rectangular" width="100%" />
      </Box>
    );
  }

  return (
    <Box
      display="flex"
      flexDirection="column"
      height="100%"
      justifyContent="center"
    >
      <Typography variant="body2" color="text.secondary">
        {version ? `v${version}` : ""}
      </Typography>
    </Box>
  );
};

export const ResourceTable = ({ dateRange }: Props) => {
  const { data: audit, isFetching: isAuditFetching } = useGetAuditsQuery({
    start_date: format(subDays(new Date(), dateRange), "MM/dd/yyyy"),
    end_date: format(new Date(), "MM/dd/yyyy"),
  });

  const history = useHistory();

  const handleRowClick = (row: Audit) => {
    history.push(resolveUrlFromAudit(row));
  };

  const columns = [
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

  if (
    !isAuditFetching &&
    !uniqBy(
      audit?.filter((resource) =>
        viewableResourceTypes.includes(resource.resourceType)
      ),
      "affectedZUID"
    )?.length
  ) {
    return <EmptyState />;
  }

  return (
    <Box width="100%">
      <AutoSizer>
        {({ width, height }: Size) => (
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
            onCellClick={() => {}}
            style={{ width, height }}
            sx={{
              backgroundColor: "common.white",
              ".MuiDataGrid-row": {
                cursor: "pointer",
              },
            }}
          />
        )}
      </AutoSizer>
    </Box>
  );
};
