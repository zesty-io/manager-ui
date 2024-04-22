import { useState } from "react";
import {
  Dialog,
  DialogActions,
  DialogTitle,
  DialogContent,
  Typography,
  Button,
  Stack,
  Box,
  Alert,
} from "@mui/material";
import { LoadingButton } from "@mui/lab";
import ScheduleRoundedIcon from "@mui/icons-material/ScheduleRounded";
import WarningRoundedIcon from "@mui/icons-material/WarningRounded";
import CalendarTodayRoundedIcon from "@mui/icons-material/CalendarTodayRounded";
import InfoRoundedIcon from "@mui/icons-material/InfoRounded";
import moment from "moment-timezone";
import { useDispatch } from "react-redux";

import { ContentItemWithDirtyAndPublishing } from "../../services/types";
import { useGetUsersQuery } from "../../services/accounts";
import { FieldTypeDateTime } from "../FieldTypeDateTime";
import { TIMEZONES } from "../FieldTypeDateTime/util";
import { publish, unpublish } from "../../store/content";

type SchedulePublishProps = {
  item: ContentItemWithDirtyAndPublishing;
  onClose: () => void;
  onPublishNow: () => void;
  onScheduleSuccess?: () => void;
  onUnscheduleSuccess?: () => void;
};
export const SchedulePublish = ({
  onClose,
  item,
  onPublishNow,
  onScheduleSuccess,
  onUnscheduleSuccess,
}: SchedulePublishProps) => {
  const dispatch = useDispatch();
  const { data: users } = useGetUsersQuery();
  const [publishDateTime, setPublishDateTime] = useState(
    moment().minute(0).second(0).add(1, "hours").format("yyyy-MM-DD HH:mm:ss")
  );
  const [publishTimezone, setPublishTimezone] = useState(
    moment.tz.guess() ?? "America/Los_Angeles"
  );
  const [isLoading, setIsLoading] = useState(false);

  const latestChangeCreator = users?.find(
    (user) => user.ZUID === item?.web?.createdByUserZUID
  );

  const isSelectedDatetimePast = moment
    .utc(moment.tz(publishDateTime, publishTimezone))
    .isBefore(moment.utc());

  const handleSchedulePublish = () => {
    setIsLoading(true);

    dispatch(
      publish(
        item?.meta?.contentModelZUID,
        item?.meta?.ZUID,
        {
          // Used for the api call
          publishAt: moment
            .utc(moment.tz(publishDateTime, publishTimezone))
            .format("YYYY-MM-DD HH:mm:ss"),
          version: item?.meta?.version,
        },
        {
          // Used for the confirmation msg
          localTime: moment
            .utc(moment.tz(publishDateTime, publishTimezone))
            .format("MMMM Do YYYY, [at] h:mm a"),
          localTimezone: publishTimezone,
        }
      )
      // @ts-expect-error untyped
    ).finally(() => {
      onScheduleSuccess?.();
      setIsLoading(false);
      onClose();
    });
  };

  const handleUnschedulePublish = () => {
    setIsLoading(true);

    dispatch(
      unpublish(
        item?.meta?.contentModelZUID,
        item?.meta?.ZUID,
        item?.scheduling?.ZUID,
        { version: item?.scheduling?.version }
      )
      // @ts-expect-error untyped
    ).finally(() => {
      setIsLoading(false);
      onClose();
      onUnscheduleSuccess?.();
    });
  };

  return (
    <Dialog
      open
      onClose={onClose}
      PaperProps={{
        sx: {
          maxWidth: 640,
          width: 640,
        },
      }}
    >
      <DialogTitle>
        <Stack gap={1.5}>
          <Box
            sx={{
              backgroundColor: "warning.light",
              borderRadius: "100%",
              width: "40px",
              height: "40px",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            {item?.scheduling?.isScheduled ? (
              <CalendarTodayRoundedIcon color="warning" />
            ) : (
              <ScheduleRoundedIcon color="warning" />
            )}
          </Box>
          <Box>
            <Box mb={1}>
              <Typography variant="h5" display="inline" fontWeight={700}>
                {item?.scheduling?.isScheduled
                  ? "Unschedule Publish:"
                  : "Schedule Content Item Publish:"}
                &nbsp;
              </Typography>
              <Typography variant="h5" display="inline">
                {item?.web?.metaLinkText}
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary">
              {item?.scheduling?.isScheduled
                ? `v${item?.web?.version} is scheduled to publish on ${moment
                    .utc(item?.scheduling?.publishAt)
                    .tz(moment.tz.guess())
                    .format("MMM D, YYYY [at] H:mm A")} in ${
                    TIMEZONES.find(
                      (timezone) => timezone.id === moment.tz.guess()
                    )?.label
                  }.`
                : `v${item?.web?.version} saved 
              ${moment(item?.web?.createdAt).fromNow()} by 
              ${latestChangeCreator?.firstName} ${
                    latestChangeCreator?.lastName
                  }`}
            </Typography>
          </Box>
        </Stack>
      </DialogTitle>
      <DialogContent data-cy="PublishScheduleModal">
        {item?.scheduling?.isScheduled ? (
          <Alert severity="info" icon={<InfoRoundedIcon />}>
            This will enable the ability to schedule or publish other versions
            of this content item
          </Alert>
        ) : (
          <>
            <Typography variant="subtitle2" fontWeight={600} mb={0.5}>
              Publish on
            </Typography>
            <FieldTypeDateTime
              disablePast
              showTimezonePicker
              showClearButton={false}
              name="publishDateTime"
              value={publishDateTime}
              selectedTimezone={publishTimezone}
              onChange={(datetime) => {
                console.log(datetime);
                setPublishDateTime(datetime);
              }}
              onTimezoneChange={(timezone) => {
                setPublishTimezone(timezone);
              }}
            />
            {isSelectedDatetimePast && (
              <Alert
                severity="warning"
                icon={<WarningRoundedIcon fontSize="inherit" />}
                sx={{
                  mt: 2.5,
                }}
              >
                Since the selected time is a current or past date, this will be
                immediately published.
              </Alert>
            )}
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button
          data-cy="CancelSchedulePublishButton"
          variant="text"
          color="inherit"
          onClick={onClose}
          disabled={isLoading}
        >
          Cancel
        </Button>
        {item?.scheduling?.isScheduled ? (
          <LoadingButton
            data-cy="UnschedulePublishButton"
            variant="contained"
            color="warning"
            startIcon={<CalendarTodayRoundedIcon />}
            onClick={handleUnschedulePublish}
            loading={isLoading}
          >
            Unschedule Publish
          </LoadingButton>
        ) : (
          <LoadingButton
            data-cy="SchedulePublishButton"
            variant="contained"
            startIcon={<ScheduleRoundedIcon />}
            onClick={() => {
              if (isSelectedDatetimePast) {
                onPublishNow();
              } else {
                handleSchedulePublish();
              }
            }}
            loading={isLoading}
          >
            Schedule v{item?.web?.version} for Publish
          </LoadingButton>
        )}
      </DialogActions>
    </Dialog>
  );
};
