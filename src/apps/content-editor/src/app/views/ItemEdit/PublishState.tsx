import React, { useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import moment from "moment";
import { DataGridPro, GridValueGetterParams } from "@mui/x-data-grid-pro";
import { Box, Button, Chip } from "@mui/material";
import { theme } from "@zesty-io/material";
import { ThemeProvider } from "@mui/material/styles";
import { WithLoader } from "@zesty-io/core/WithLoader";
import { instanceApi } from "../../../../../../shell/services/instance";

type Params = {
  modelZUID: string;
  itemZUID: string;
};

type Props = {
  reloadItem: () => void;
};

export const PublishState = ({ reloadItem }: Props) => {
  const { modelZUID, itemZUID } = useParams<Params>();
  const { data, isLoading } = instanceApi.useGetItemPublishingsQuery({
    modelZUID,
    itemZUID,
  });
  const [deletePublishing] = instanceApi.useDeleteItemPublishingMutation();

  const columns = useMemo(
    () => [
      { field: "id", headerName: "Id", hide: true },
      {
        field: "_active",
        headerName: "Status",
        width: 120,
        renderCell: (value: GridValueGetterParams) => {
          if (new Date(value.row.publishAt) > new Date()) {
            return <Chip label="Scheduled" color="warning" />;
          } else if (value.row._active) {
            return <Chip label="Live" color="success" />;
          } else {
            return <></>;
          }
        },
      },
      {
        field: "version",
        headerName: "Version",
      },
      {
        field: "publishAt",
        headerName: "Go Online",
        type: "dateTime",
        flex: 1,
        valueGetter: (value: GridValueGetterParams) => {
          return `${moment(value.row.publishAt).format("ll, h:mm A")}`;
        },
      },
      {
        field: "unpublishAt",
        headerName: "Go Offline",
        type: "dateTime",
        flex: 1,
        valueGetter: (value: GridValueGetterParams) =>
          value.row.unpublishAt
            ? moment(value.row.unpublishAt).format("lll")
            : null,
      },
      {
        field: "ZUID",
        flex: 1,
        headerName: "Publishing ZUID",
      },
      {
        field: "createdAt",
        headerName: "Created At",
        type: "dateTime",
        flex: 1,
        valueGetter: (value: GridValueGetterParams) =>
          moment(value.row.createdAt).format("lll"),
      },
      {
        field: "actions",
        headerName: "Actions",
        width: 120,
        renderCell: (value) => {
          if (value.row._active) {
            return [
              <Button
                color="primary"
                sx={{ textTransform: "none" }}
                onClick={() =>
                  deletePublishing({
                    modelZUID,
                    itemZUID,
                    publishingZUID: value.row.ZUID,
                  }).then(() => {
                    reloadItem();
                  })
                }
              >
                Take Offline
              </Button>,
            ];
          } else if (new Date(value.row.publishAt) > new Date()) {
            return [
              <Button
                color="primary"
                sx={{ textTransform: "none" }}
                onClick={() =>
                  deletePublishing({
                    modelZUID,
                    itemZUID,
                    publishingZUID: value.row.ZUID,
                  }).then(() => {
                    reloadItem();
                  })
                }
              >
                Cancel
              </Button>,
            ];
          } else {
            return [];
          }
        },
      },
    ],
    []
  );

  return (
    <WithLoader
      condition={!isLoading}
      message="Fetching Publishings"
      height="100%"
    >
      {Array.isArray(data) && (
        <ThemeProvider theme={theme}>
          <Box
            sx={{
              boxSizing: "border-box",
              height: "100%",
              bgcolor: "grey.50",
              py: 2.5,
              px: 4,
            }}
          >
            <DataGridPro
              sx={{ backgroundColor: "common.white" }}
              columns={columns}
              rows={data.map((row) => ({ id: row.ZUID, ...row }))}
              rowHeight={64}
              hideFooter
              disableSelectionOnClick
            />
          </Box>
        </ThemeProvider>
      )}
    </WithLoader>
  );
};
