import { Stack, Typography, Tooltip } from "@mui/material";
import { CheckCircleRounded, ScheduleRounded } from "@mui/icons-material";
import { useParams } from "react-router";
import moment from "moment";

import { useGetItemPublishingsQuery } from "../../../../../../../../shell/services/instance";
import { formatDate } from "../../../../../../../../utility/formatDate";
import { useGetUsersQuery } from "../../../../../../../../shell/services/accounts";

type PublishStatusProps = {
  currentVersion: number;
};
export const PublishStatus = ({ currentVersion }: PublishStatusProps) => {
  const { modelZUID, itemZUID } = useParams<{
    modelZUID: string;
    itemZUID: string;
  }>();
  const { data: itemPublishings } = useGetItemPublishingsQuery({
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
      moment.utc(item.publishAt).isAfter(moment.utc()) &&
      !item.unpublishAt
  );

  const getUsername = (userZUID: string) => {
    const user = users?.find((user) => user.ZUID === userZUID);

    if (user) {
      return `${user.firstName} ${user.lastName}`;
    }
  };

  return (
    <Stack direction="row" gap={1.25} justifyContent="end">
      {activePublishing && activePublishing.version !== currentVersion && (
        <Tooltip
          enterDelay={1000}
          enterNextDelay={1000}
          title={
            <>
              v{activePublishing.version} published on <br />
              {formatDate(activePublishing.publishAt)} <br />
              by {getUsername(activePublishing.publishedByUserZUID)}
            </>
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
      {scheduledPublishing && scheduledPublishing.version !== currentVersion && (
        <Tooltip
          enterDelay={1000}
          enterNextDelay={1000}
          title={
            <>
              v{scheduledPublishing.version} scheduled on <br />
              {formatDate(scheduledPublishing.publishAt)} <br />
              by {getUsername(scheduledPublishing.publishedByUserZUID)}
            </>
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
    </Stack>
  );
};
