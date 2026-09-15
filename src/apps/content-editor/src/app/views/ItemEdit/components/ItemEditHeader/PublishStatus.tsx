import { Stack, Typography, Tooltip } from "@mui/material";
import { CheckCircleRounded, ScheduleRounded } from "@mui/icons-material";
import { useParams } from "react-router";

import { useGetItemPublishingsQuery } from "../../../../../../../../shell/services/instance";
import { formatDate } from "../../../../../../../../utility/formatDate";
import { useGetUsersQuery } from "../../../../../../../../shell/services/accounts";
import { useTranslation } from "react-i18next";

type PublishStatusProps = {
  currentVersion: number;
};
export const PublishStatus = ({ currentVersion }: PublishStatusProps) => {
  const { t } = useTranslation();
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

  const getUsername = (userZUID: string) => {
    const user = users?.find((user) => user.ZUID === userZUID);

    if (user) {
      return `${user.firstName} ${user.lastName}`;
    }
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
            <>
              {t("content.itemEditVersionPublishedOn", {
                version: activePublishing.version,
              })}{" "}
              <br />
              {formatDate(activePublishing.publishAt)} <br />
              {t("content.itemEditByUser", {
                name: getUsername(activePublishing.publishedByUserZUID),
              })}
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
              {t("content.itemEditVersionPublishedLabel", {
                version: activePublishing.version,
              })}
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
              <>
                {t("content.itemEditVersionScheduledToPublishOn", {
                  version: scheduledPublishing.version,
                })}{" "}
                <br />
                {formatDate(scheduledPublishing.publishAt)} <br />
                {t("content.itemEditByUser", {
                  name: getUsername(scheduledPublishing.publishedByUserZUID),
                })}
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
                {t("content.itemEditVersionScheduledLabel", {
                  version: scheduledPublishing.version,
                })}
              </Typography>
            </Stack>
          </Tooltip>
        )}
    </Stack>
  );
};
