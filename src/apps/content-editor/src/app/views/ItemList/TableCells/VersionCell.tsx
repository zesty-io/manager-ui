import { Chip, Stack, Tooltip } from "@mui/material";
import { GridRenderCellParams } from "@mui/x-data-grid-pro";
import { useGetUsersQuery } from "../../../../../../../shell/services/accounts";

export const VersionCell = ({ params }: { params: GridRenderCellParams }) => {
  const { data: users } = useGetUsersQuery();

  const createdByUser = users?.find(
    (user) => user.ZUID === params.row?.web?.createdByUserZUID
  );
  const publishedByUser =
    users?.find(
      (user) => user.ZUID === params.row?.publishing?.publishedByUserZUID
    ) ||
    users?.find(
      (user) => user.ZUID === params.row?.priorPublishing?.publishedByUserZUID
    );
  const isScheduledPublish =
    new Date(
      params.row?.publishing?.publishAt ||
        params.row?.priorPublishing?.publishAt
    )?.getTime() > new Date()?.getTime();

  return (
    <Stack spacing={0.25}>
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
              v{params.row?.meta?.version} saved on <br />
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
              <br /> by {createdByUser?.firstName} {createdByUser?.lastName}
            </div>
          }
          slotProps={{
            popper: {
              style: {
                width: 120,
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
      {(params.row?.publishing?.version ||
        params.row?.priorPublishing?.version) && (
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
              v
              {params.row?.publishing?.version ||
                params.row?.priorPublishing?.version}{" "}
              {isScheduledPublish ? "scheduled to publish" : "published"} on{" "}
              <br />
              {new Date(
                params.row?.publishing?.publishAt ||
                  params.row?.priorPublishing?.publishAt
              ).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
                hour: "numeric",
                minute: "numeric",
                timeZoneName: "short",
              })}{" "}
              <br /> by {publishedByUser?.firstName} {publishedByUser?.lastName}
            </div>
          }
          slotProps={{
            popper: {
              style: {
                width: isScheduledPublish ? 120 : 150,
              },
            },
          }}
        >
          <Chip
            label={`v${
              params.row?.publishing?.version ||
              params.row?.priorPublishing?.version
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
          title={"Item not yet created"}
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
