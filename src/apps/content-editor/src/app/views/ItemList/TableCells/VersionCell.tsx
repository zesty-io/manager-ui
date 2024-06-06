import { Chip, Stack, Tooltip } from "@mui/material";
import { GridRenderCellParams } from "@mui/x-data-grid-pro";
import { useGetUsersQuery } from "../../../../../../../shell/services/accounts";

export const VersionCell = ({ params }: { params: GridRenderCellParams }) => {
  const { data: users } = useGetUsersQuery();

  const createdByUser = users?.find(
    (user) => user.ZUID === params.row?.meta?.createdByUserZUID
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
          enterDelay={1000}
          enterNextDelay={1000}
          title={`v${params.row?.meta?.version} saved on ${new Date(
            params.row?.meta?.updatedAt
          ).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "numeric",
            minute: "numeric",
            timeZoneName: "short",
          })} by ${createdByUser?.firstName} ${createdByUser?.lastName}`}
          slotProps={{
            popper: {
              style: {
                width: 116,
              },
            },
          }}
          placement="bottom"
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
          enterDelay={1000}
          enterNextDelay={1000}
          title={`v${
            params.row?.publishing?.version ||
            params.row?.priorPublishing?.version
          } ${
            isScheduledPublish ? "scheduled to publish" : "published"
          } on ${new Date(
            params.row?.publishing?.publishAt ||
              params.row?.priorPublishing?.publishAt
          ).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "numeric",
            minute: "numeric",
            timeZoneName: "short",
          })} by ${publishedByUser?.firstName} ${publishedByUser?.lastName}`}
          slotProps={{
            popper: {
              style: {
                width: isScheduledPublish ? 116 : 146,
              },
            },
          }}
          placement="bottom"
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
          placement="bottom"
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
