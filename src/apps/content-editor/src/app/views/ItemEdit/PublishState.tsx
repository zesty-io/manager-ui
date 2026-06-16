import React, { useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import { DataGridPro } from "@mui/x-data-grid-pro";
import { Box, Button, Chip } from "@mui/material";
import { WithLoader } from "shell/components/legacy/WithLoader";
import { instanceApi } from "../../../../../../shell/services/instance";
import { formatLocalized } from "shell/i18n/dates";
import { isValid } from "date-fns";

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
      {
        field: "_active",
        headerName: "Status",
        width: 120,
        renderCell: (value: any) => {
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
        flex: 1,
        valueGetter: (_: any, row: any) => {
          if (!row.publishAt) return null;
          const d = new Date(row.publishAt);
          return isValid(d) ? formatLocalized(d, "MMM dd yyyy, h:mm a") : "";
        },
      },
      {
        field: "unpublishAt",
        headerName: "Go Offline",
        flex: 1,
        valueGetter: (_: any, row: any) => {
          if (!row.unpublishAt) return null;
          const d = new Date(row.unpublishAt);
          return isValid(d) ? formatLocalized(d, "MMM dd yyyy, h:mm a") : "";
        },
      },
      {
        field: "ZUID",
        flex: 1,
        headerName: "Publishing ZUID",
      },
      {
        field: "createdAt",
        headerName: "Created At",
        flex: 1,
        valueGetter: (_: any, row: any) => {
          if (!row.createdAt) return null;
          const d = new Date(row.createdAt);
          return isValid(d) ? formatLocalized(d, "MMM dd yyyy, h:mm a") : "";
        },
      },
      {
        field: "actions",
        headerName: "Actions",
        width: 128,
        renderCell: (value) => {
          if (value.row._active) {
            return [
              <Button
                key="take-offline"
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
                key="delete-publishing"
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
            disableRowSelectionOnClick
          />
        </Box>
      )}
    </WithLoader>
  );
};
