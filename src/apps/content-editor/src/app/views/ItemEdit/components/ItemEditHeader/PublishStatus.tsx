import { Stack, Typography } from "@mui/material";
import { CheckCircleRounded, ScheduleRounded } from "@mui/icons-material";
import { useParams } from "react-router";

import {
  useGetItemPublishingsQuery,
  useGetContentItemQuery,
} from "../../../../../../../../shell/services/instance";

type PublishStatusProps = {};
export const PublishStatus = ({}: PublishStatusProps) => {
  const { modelZUID, itemZUID } = useParams<{
    modelZUID: string;
    itemZUID: string;
  }>();
  const { data: itemPublishings } = useGetItemPublishingsQuery({
    modelZUID,
    itemZUID,
  });
  const { data: item } = useGetContentItemQuery(itemZUID, { skip: !itemZUID });

  console.log(itemPublishings);
  console.log(item);

  const activePublishing = itemPublishings?.find(
    (itemPublishing) => itemPublishing._active
  );
  // const scheduledPublishing = itemPublishings?.find((item) => item.)

  return (
    <Stack direction="row" gap={1.25} justifyContent="end">
      <Stack direction="row" gap={1} alignItems="center">
        <CheckCircleRounded fontSize="small" color="success" />
        <Typography
          variant="body2"
          color="success.main"
          fontWeight={500}
          lineHeight="24px"
          letterSpacing="0.46px"
        >
          v10 Published
        </Typography>
      </Stack>
      <Stack direction="row" gap={1} alignItems="center">
        <ScheduleRounded fontSize="small" color="warning" />
        <Typography
          variant="body2"
          color="warning.main"
          fontWeight={500}
          lineHeight="24px"
          letterSpacing="0.46px"
        >
          v10 Scheduled
        </Typography>
      </Stack>
    </Stack>
  );
};
