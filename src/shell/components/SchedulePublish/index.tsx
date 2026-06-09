import { useState } from "react";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation();
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

  const handleSchedulePublish = () => {
    setIsLoading(true);

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

    dispatch(
      publish(
        item?.meta?.contentModelZUID,
        item?.meta?.ZUID,
        {
          publishAt: publishAtUtcStr,
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

    dispatch(
      unpublish(
        item?.meta?.contentModelZUID,
        item?.meta?.ZUID,
        item?.scheduling?.ZUID,
        { version: item?.scheduling?.version }
      )
      // @ts-expect-error untyped action
    ).finally(() => {
      setIsLoading(false);
      onClose();
      onUnscheduleSuccess?.();
    });
  };

  const guessedTz = tzGuess;
  const scheduledLocalText = item?.scheduling?.publishAt
    ? formatInTimeZone(
        item.scheduling.publishAt,
        guessedTz,
        "MMM d, yyyy 'at' h:mm a"
      )
    : "";

  const tzLabel =
    TIMEZONES.find((tz) => tz.id === guessedTz)?.label || guessedTz;

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
                  : "Schedule Publish:"}
                &nbsp;
              </Typography>
              <Typography variant="h5" display="inline">
                {item?.web?.metaLinkText}
              </Typography>
            </Box>

            <Typography variant="body2" color="text.secondary">
              {item?.scheduling?.isScheduled
                ? `v${item?.web?.version} is scheduled to publish on ${scheduledLocalText} in ${tzLabel}.`
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
          {t("cancel")}
        </Button>

        {item?.scheduling?.isScheduled ? (
          <Button
            data-cy="UnschedulePublishButton"
            variant="contained"
            color="warning"
            startIcon={<CalendarTodayRoundedIcon />}
            onClick={handleUnschedulePublish}
            loading={isLoading}
          >
            Unschedule Publish
          </Button>
        ) : (
          <Button
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
            Schedule Publish
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};
