import React, { useMemo } from "react";
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

export const PublishState = () => {
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
        width: 110,
        renderCell: (value: GridValueGetterParams) => {
          if (new Date(value.row.publishAt) > new Date()) {
            return (
              <Chip
                label="Scheduled"
                color="warning"
                sx={{ color: "common.white" }}
              />
            );
          } else if (value.row._active) {
            return (
              <Chip
                label="Live"
                color="success"
                sx={{ color: "common.white" }}
              />
            );
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
                  })
                }
              >
                Take Offline
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
              height: "calc(100% - 73px)",
              p: 2,
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
