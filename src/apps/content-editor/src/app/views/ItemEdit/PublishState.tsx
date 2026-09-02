import React, { useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import { DataGridPro } from "@mui/x-data-grid-pro";
import { Box, Button, Chip } from "@mui/material";
import { WithLoader } from "shell/components/legacy/WithLoader";
import { instanceApi } from "../../../../../../shell/services/instance";
import { formatLocalized } from "shell/i18n/dates";
import { isValid } from "date-fns";
import { useTranslation } from "react-i18next";

type Params = {
  modelZUID: string;
  itemZUID: string;
};

type Props = {
  reloadItem: () => void;
};

export const PublishState = ({ reloadItem }: Props) => {
  const { t } = useTranslation();
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
        headerName: t("content.itemListStatus"),
        width: 200,
        renderCell: (value: any) => {
          if (new Date(value.row.publishAt) > new Date()) {
            return (
              <Chip
                label={t("content.itemListStatusScheduled")}
                color="warning"
              />
            );
          } else if (value.row._active) {
            return <Chip label={t("content.itemEditLive")} color="success" />;
          } else {
            return <></>;
          }
        },
      },
      {
        field: "version",
        headerName: t("content.itemEditVersion"),
      },
      {
        field: "publishAt",
        headerName: t("content.itemEditGoOnline"),
        flex: 1,
        valueGetter: (_: any, row: any) => {
          if (!row.publishAt) return null;
          const d = new Date(row.publishAt);
          return isValid(d) ? formatLocalized(d, "MMM dd yyyy, h:mm a") : "";
        },
      },
      {
        field: "unpublishAt",
        headerName: t("content.itemEditGoOffline"),
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
        headerName: t("content.itemEditPublishingZuid"),
      },
      {
        field: "createdAt",
        headerName: t("content.itemEditCreatedAt"),
        flex: 1,
        valueGetter: (_: any, row: any) => {
          if (!row.createdAt) return null;
          const d = new Date(row.createdAt);
          return isValid(d) ? formatLocalized(d, "MMM dd yyyy, h:mm a") : "";
        },
      },
      {
        field: "actions",
        headerName: t("content.itemEditActions"),
        width: 200,
        renderCell: (value: any) => {
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
                {t("content.itemEditTakeOffline")}
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
                {t("common.cancel")}
              </Button>,
            ];
          } else {
            return [];
          }
        },
      },
    ],
    [deletePublishing, itemZUID, modelZUID, reloadItem, t]
  );

  return (
    <WithLoader
      condition={!isLoading}
      message={t("content.itemEditFetchingPublishings")}
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
