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
import ScheduleRoundedIcon from "@mui/icons-material/ScheduleRounded";
import WarningRoundedIcon from "@mui/icons-material/WarningRounded";
import CalendarTodayRoundedIcon from "@mui/icons-material/CalendarTodayRounded";
import InfoRoundedIcon from "@mui/icons-material/InfoRounded";
import { useDispatch } from "react-redux";

import { ContentItemWithDirtyAndPublishing } from "../../services/types";
import { useGetUsersQuery } from "../../services/accounts";
import { FieldTypeDateTime } from "../FieldTypeDateTime";
import { TIMEZONES } from "../FieldTypeDateTime/util";
import { publish, unpublish } from "../../store/content";

import { format as fmt, isBefore, formatDistanceToNow } from "date-fns";
import { zonedTimeToUtc, formatInTimeZone } from "date-fns-tz";

type SchedulePublishProps = {
  item: ContentItemWithDirtyAndPublishing;
  onClose: () => void;
  onPublishNow: () => void;
  onUnpublishNow?: () => void;
  onScheduleSuccess?: () => void;
  onUnscheduleSuccess?: () => void;
  scheduledAction?: "publish" | "unpublish" | null;
};

export const SchedulePublish = ({
  onClose,
  item,
  onPublishNow,
  onUnpublishNow,
  onScheduleSuccess,
  onUnscheduleSuccess,
  scheduledAction,
}: SchedulePublishProps) => {
  const dispatch = useDispatch();
  const { data: users } = useGetUsersQuery();

  // Next top of the hour (local)
  const now = new Date();
  const nextTopOfHour = new Date(now);
  nextTopOfHour.setMinutes(0, 0, 0);
  nextTopOfHour.setHours(nextTopOfHour.getHours() + 1);

  const [publishDateTime, setPublishDateTime] = useState(
    fmt(nextTopOfHour, "yyyy-MM-dd HH:mm:ss")
  );

  const tzGuess =
    Intl.DateTimeFormat().resolvedOptions().timeZone || "America/Los_Angeles";
  const [publishTimezone, setPublishTimezone] = useState(tzGuess);
  const [isLoading, setIsLoading] = useState(false);

  const latestChangeCreator = users?.find(
    (user) => user.ZUID === item?.web?.createdByUserZUID
  );

  const selectedUtc = zonedTimeToUtc(
    publishDateTime.replace(/\.\d+$/, ""),
    publishTimezone
  );
  const isValidUtc = !isNaN(selectedUtc.getTime());
  const isSelectedDatetimePast = isValidUtc
    ? isBefore(selectedUtc, new Date())
    : false;

  const isForUnpublish = scheduledAction === "unpublish";

  const hasSchedulePublish =
    item?.meta?.version === item?.scheduling?.version &&
    item?.scheduling?.isScheduled;

  const hasScheduleUnpublish =
    item?.meta?.version === item?.publishing?.version &&
    item?.publishing?.unpublishAt &&
    new Date(item?.publishing?.unpublishAt).getTime() > Date.now();

  // Gate "already scheduled" UI on the flow the user is in — avoids showing the
  // unschedule prompt when the opposing schedule type exists but is irrelevant.
  const hasExistingSchedule = isForUnpublish
    ? hasScheduleUnpublish
    : hasSchedulePublish;

  // API value must be UTC "YYYY-MM-DD HH:mm:ss"
  const publishAtUtcStr = formatInTimeZone(
    selectedUtc,
    "UTC",
    "yyyy-MM-dd HH:mm:ss"
  );

  // Pretty local confirmation text in the chosen timezone
  const localPretty = formatInTimeZone(
    selectedUtc,
    publishTimezone,
    "MMMM do yyyy, 'at' h:mm a"
  );

  const handleSchedulePublish = () => {
    setIsLoading(true);

    dispatch(
      publish(
        item?.meta?.contentModelZUID,
        item?.meta?.ZUID,
        {
          publishAt: isForUnpublish ? "now" : publishAtUtcStr,
          unpublishAt: isForUnpublish ? publishAtUtcStr : "never",
          version: item?.meta?.version,
        },
        {
          localTime: localPretty,
          localTimezone: publishTimezone,
        }
      )
      // @ts-expect-error untyped action
    ).finally(() => {
      onScheduleSuccess?.();
      setIsLoading(false);
      onClose();
    });
  };

  const handleUnschedulePublish = () => {
    setIsLoading(true);

    let actionDispatch = null;

    if (isForUnpublish) {
      // The API has no dedicated "remove unpublishAt" endpoint. Re-publishing with
      // unpublishAt: "never" overwrites the existing publishing record in place,
      // clearing the scheduled takedown while keeping the item live.
      actionDispatch = publish(
        item?.meta?.contentModelZUID,
        item?.meta?.ZUID,
        {
          publishAt: "now",
          unpublishAt: "never",
          version: item?.publishing?.version,
        },
        {
          localTime: localPretty,
          localTimezone: publishTimezone,
        }
      );
    } else {
      actionDispatch = unpublish(
        item?.meta?.contentModelZUID,
        item?.meta?.ZUID,
        item?.scheduling?.ZUID,
        { version: item?.scheduling?.version }
      );
    }
    dispatch(
      actionDispatch
      // @ts-expect-error untyped action
    ).finally(() => {
      setIsLoading(false);
      onClose();
      onUnscheduleSuccess?.();
    });
  };

  const guessedTz = tzGuess;

  const dateText = isForUnpublish
    ? item?.publishing?.unpublishAt
    : item?.scheduling?.publishAt;

  const scheduledLocalText = dateText
    ? formatInTimeZone(dateText, guessedTz, "MMM d, yyyy 'at' h:mm a")
    : "";

  const tzLabel =
    TIMEZONES.find((tz) => tz.id === guessedTz)?.label || guessedTz;

  const publishHeader = hasSchedulePublish
    ? "Unschedule Publish:"
    : "Schedule Publish:";

  const unpublishHeader = hasScheduleUnpublish
    ? "Unschedule Unpublish:"
    : "Schedule Unpublish:";

  return (
    <Dialog
      data-cy="SchedulePublishModal"
      open
      onClose={onClose}
      PaperProps={{ sx: { maxWidth: 640, width: 640 } }}
    >
      <DialogTitle>
        <Stack gap={1.5}>
          <Box
            sx={{
              backgroundColor: "warning.light",
              borderRadius: "100%",
              width: 40,
              height: 40,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            {hasExistingSchedule ? (
              <CalendarTodayRoundedIcon color="warning" />
            ) : (
              <ScheduleRoundedIcon color="warning" />
            )}
          </Box>
          <Box>
            <Box mb={1}>
              <Typography variant="h5" display="inline" fontWeight={700}>
                {isForUnpublish ? unpublishHeader : publishHeader}
                &nbsp;
              </Typography>
              <Typography variant="h5" display="inline">
                {item?.web?.metaLinkText}
              </Typography>
            </Box>

            <Typography variant="body2" color="text.secondary">
              {hasExistingSchedule
                ? `v${item?.web?.version} is scheduled to ${
                    isForUnpublish ? "unpublish" : "publish"
                  } on ${scheduledLocalText} in ${tzLabel}.`
                : `v${item?.web?.version} saved ${
                    item?.web?.createdAt
                      ? formatDistanceToNow(new Date(item.web.createdAt), {
                          addSuffix: true,
                        })
                      : ""
                  } by ${latestChangeCreator?.firstName ?? ""} ${
                    latestChangeCreator?.lastName ?? ""
                  }`}
            </Typography>
          </Box>
        </Stack>
      </DialogTitle>

      <DialogContent data-cy="PublishScheduleModal">
        {hasExistingSchedule ? (
          <Alert severity="info" icon={<InfoRoundedIcon />}>
            This will enable the ability to schedule or publish other versions
            of this content item
          </Alert>
        ) : (
          <>
            <Typography variant="subtitle2" fontWeight={600} mb={0.5}>
              {`${isForUnpublish ? "Unpublish" : "Publish"} on`}
            </Typography>
            <FieldTypeDateTime
              disablePast
              showTimezonePicker
              showClearButton={false}
              name="publishDateTime"
              value={publishDateTime}
              selectedTimezone={publishTimezone}
              onChange={(datetime: any) => {
                const normalized = String(datetime).replace(/\.\d+$/, "");
                setPublishDateTime(normalized);
              }}
              onTimezoneChange={(timezone: any) => setPublishTimezone(timezone)}
            />
            {isSelectedDatetimePast && (
              <Alert
                severity="warning"
                icon={<WarningRoundedIcon fontSize="inherit" />}
                sx={{ mt: 2.5 }}
              >
                {`Since the selected time is a current or past date, this will be immediately ${
                  isForUnpublish ? "unpublished" : "published"
                }.`}
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

        {hasExistingSchedule ? (
          <Button
            data-cy="UnschedulePublishButton"
            variant="contained"
            color="warning"
            startIcon={<CalendarTodayRoundedIcon />}
            onClick={handleUnschedulePublish}
            loading={isLoading}
          >
            {isForUnpublish && hasScheduleUnpublish
              ? "Cancel Scheduled Unpublish"
              : "Unschedule Publish"}
          </Button>
        ) : (
          <Button
            data-cy="SchedulePublishButton"
            variant="contained"
            startIcon={<ScheduleRoundedIcon />}
            onClick={() => {
              if (isSelectedDatetimePast) {
                if (isForUnpublish) {
                  onUnpublishNow?.();
                } else {
                  onPublishNow();
                }
              } else {
                handleSchedulePublish();
              }
            }}
            loading={isLoading}
          >
            {`Schedule ${isForUnpublish ? "Unpublish" : "Publish"}`}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};
