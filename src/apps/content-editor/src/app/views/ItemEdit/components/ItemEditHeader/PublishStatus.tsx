import { Stack, Typography, Tooltip } from "@mui/material";
import { CheckCircleRounded, ScheduleRounded } from "@mui/icons-material";
import { useParams } from "react-router";
import { useGetItemPublishingsQuery } from "../../../../../../../../shell/services/instance";
import { formatDate } from "../../../../../../../../utility/formatDate";
import { useGetUsersQuery } from "../../../../../../../../shell/services/accounts";
import { TooltipTitle } from "./TooltipTitle";

type PublishStatusProps = {
  currentVersion: number;
};
export const PublishStatus = ({ currentVersion }: PublishStatusProps) => {
  const { modelZUID, itemZUID } = useParams<{
    modelZUID: string;
    itemZUID: string;
  }>();
  const { data: itemPublishings, isFetching: isFetchingPublishStatus } =
    useGetItemPublishingsQuery({
      modelZUID,
      itemZUID,
    });
  const { data: users } = useGetUsersQuery();

  const activePublishing = itemPublishings?.find(
    (itemPublishing) => itemPublishing._active
  );
  const scheduledPublishing = itemPublishings?.find(
    (item) =>
      !item._active &&
      new Date(item.publishAt).getTime() > Date.now() &&
      !item.unpublishAt
  );

  const scheduledUnpublishing = itemPublishings?.find(
    (item) =>
      item?._active &&
      item?.unpublishAt &&
      new Date(item?.unpublishAt).getTime() > Date.now() &&
      // Check if the unpublishAt date is different from the publishAt date of the scheduled publishing
      // This ensures that we only consider it a scheduled unpublishing if the unpublishAt date is different from the publishAt date of the scheduled publishing
      item.publishAt &&
      new Date(item?.publishAt).getTime() <= Date.now() &&
      new Date(item?.unpublishAt).getTime() !==
        new Date(scheduledPublishing?.publishAt).getTime()
  );

  const getUserNameByZUID = (userZUID?: string) => {
    const user = users?.find((u) => u.ZUID === userZUID);
    const completeUserName = !user
      ? ""
      : `${user.firstName || ""} ${user.lastName || ""}`.trim();
    return completeUserName;
  };

  if (isFetchingPublishStatus) {
    return <></>;
  }

  return (
    <Stack direction="row" gap={1.25} justifyContent="end">
      {activePublishing && activePublishing.version !== currentVersion && (
        <Tooltip
          enterDelay={1000}
          enterNextDelay={1000}
          title={
            <TooltipTitle
              text={`v${activePublishing.version} published`}
              dateTime={activePublishing.publishAt || ""}
              userName={getUserNameByZUID(
                activePublishing?.publishedByUserZUID
              )}
            />
          }
          placement="bottom-start"
        >
          <Stack direction="row" gap={1} alignItems="center">
            <CheckCircleRounded fontSize="small" color="success" />
            <Typography
              variant="body2"
              color="success.main"
              fontWeight={500}
              lineHeight="24px"
              letterSpacing="0.46px"
            >
              v{activePublishing.version} Published
            </Typography>
          </Stack>
        </Tooltip>
      )}
      {scheduledPublishing &&
        scheduledPublishing.version !== currentVersion && (
          <Tooltip
            enterDelay={1000}
            enterNextDelay={1000}
            title={
              <TooltipTitle
                text={`v${scheduledPublishing.version} scheduled to publish`}
                dateTime={scheduledPublishing.publishAt || ""}
                userName={getUserNameByZUID(
                  scheduledPublishing?.publishedByUserZUID
                )}
              />
            }
            placement="bottom-start"
          >
            <Stack direction="row" gap={1} alignItems="center">
              <ScheduleRounded fontSize="small" color="warning" />
              <Typography
                variant="body2"
                color="warning.main"
                fontWeight={500}
                lineHeight="24px"
                letterSpacing="0.46px"
              >
                v{scheduledPublishing.version} Scheduled
              </Typography>
            </Stack>
          </Tooltip>
        )}

      {!!scheduledUnpublishing &&
        scheduledUnpublishing?._active &&
        scheduledUnpublishing.version === currentVersion && (
          <Tooltip
            enterDelay={1000}
            enterNextDelay={1000}
            title={
              <TooltipTitle
                text={`v${scheduledUnpublishing.version} scheduled to unpublish`}
                dateTime={scheduledUnpublishing.unpublishAt || ""}
                userName={getUserNameByZUID(
                  scheduledUnpublishing?.publishedByUserZUID
                )}
              />
            }
            placement="bottom-start"
          >
            <Stack
              data-cy="ScheduledUnpublishIndicator"
              direction="row"
              gap={1}
              alignItems="center"
            >
              <ScheduleRounded fontSize="small" color="warning" />
              <Typography
                variant="body2"
                color="warning.main"
                fontWeight={500}
                lineHeight="24px"
                letterSpacing="0.46px"
              >
                {`v${scheduledUnpublishing.version} Scheduled Unpublish`}
              </Typography>
            </Stack>
          </Tooltip>
        )}
    </Stack>
  );
};
