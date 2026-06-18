import { Chip, Stack, Tooltip } from "@mui/material";
import { GridRenderCellParams } from "@mui/x-data-grid-pro";
import { useTranslation } from "react-i18next";

export const VersionCell = ({ params }: { params: GridRenderCellParams }) => {
  const { t } = useTranslation();
  const createdByUserName = params.row?.web?.createdByUserName;
  const isScheduledPublish = !!params.row?.scheduling?.publishAt;
  const publishedByUserName = isScheduledPublish
    ? params.row?.meta?.scheduledByUserName
    : params.row?.meta?.publishedByUserName;

  return (
    <Stack spacing={0.25} height="100%" justifyContent="center">
      {params.row?.meta?.version !== params.row?.publishing?.version && (
        <Tooltip
          placement="bottom-start"
          enterDelay={1000}
          enterNextDelay={1000}
          PopperProps={{
            modifiers: [
              {
                name: "offset",
                options: {
                  offset: [0, -10],
                },
              },
            ],
          }}
          title={
            <div>
              {t("content.itemListVersionSavedOn", {
                version: params.row?.meta?.version,
              })}{" "}
              <br />
              {new Date(params.row?.meta?.updatedAt).toLocaleDateString(
                "en-US",
                {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                  hour: "numeric",
                  minute: "numeric",
                  timeZoneName: "short",
                }
              )}{" "}
              <br />{" "}
              {t("content.itemListVersionByUser", { name: createdByUserName })}
            </div>
          }
          slotProps={{
            popper: {
              style: {
                width: 160,
              },
            },
          }}
        >
          <Chip
            label={`v${params.row?.meta?.version}`}
            size="small"
            color="info"
            sx={{
              height: 20,
            }}
          />
        </Tooltip>
      )}
      {(params.row?.publishing?.version || params.row?.scheduling?.version) && (
        <Tooltip
          placement="bottom-start"
          enterDelay={1000}
          enterNextDelay={1000}
          PopperProps={{
            modifiers: [
              {
                name: "offset",
                options: {
                  offset: [0, -8],
                },
              },
            ],
          }}
          title={
            <div>
              {isScheduledPublish
                ? t("content.itemListVersionScheduledOn", {
                    version:
                      params.row?.scheduling?.version ||
                      params.row?.publishing?.version,
                  })
                : t("content.itemListVersionPublishedOn", {
                    version:
                      params.row?.scheduling?.version ||
                      params.row?.publishing?.version,
                  })}{" "}
              <br />
              {new Date(
                isScheduledPublish
                  ? params.row?.scheduling?.publishAt
                  : params.row?.publishing?.publishAt
              ).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
                hour: "numeric",
                minute: "numeric",
                timeZoneName: "short",
              })}{" "}
              <br />{" "}
              {t("content.itemListVersionByUser", {
                name: publishedByUserName,
              })}
            </div>
          }
          slotProps={{
            popper: {
              style: {
                width: 160,
              },
            },
          }}
        >
          <Chip
            label={`v${
              params.row?.scheduling?.version || params.row?.publishing?.version
            }`}
            size="small"
            color={isScheduledPublish ? "warning" : "success"}
            sx={{
              height: 20,
            }}
          />
        </Tooltip>
      )}

      {!params.row?.meta?.version && (
        <Tooltip
          enterDelay={1000}
          enterNextDelay={1000}
          title={t("content.itemListItemNotYetCreated")}
          placement="bottom-start"
          PopperProps={{
            modifiers: [
              {
                name: "offset",
                options: {
                  offset: [0, -8],
                },
              },
            ],
          }}
        >
          <Chip
            label={"v0"}
            size="small"
            sx={{
              height: 20,
            }}
          />
        </Tooltip>
      )}
    </Stack>
  );
};
