import { Stack, Typography } from "@mui/material";
import { CheckCircleRounded, ScheduleRounded } from "@mui/icons-material";
import { useParams } from "react-router";
import moment from "moment";

import { useGetItemPublishingsQuery } from "../../../../../../../../shell/services/instance";

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

  const activePublishing = itemPublishings?.find(
    (itemPublishing) => itemPublishing._active
  );
  const scheduledPublishing = itemPublishings?.find(
    (item) =>
      !item._active &&
      moment.utc(item.publishAt).isAfter(moment.utc()) &&
      !item.unpublishAt
  );

  return (
    <Stack direction="row" gap={1.25} justifyContent="end">
      {activePublishing && activePublishing.version !== currentVersion && (
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
      )}
      {scheduledPublishing && scheduledPublishing.version !== currentVersion && (
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
      )}
    </Stack>
  );
};
