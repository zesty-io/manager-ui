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

  // ── Publish flow (original behaviour) ────────────────────────────────────
  // Uses item?.scheduling?.isScheduled directly, matching the pre-PR component.
  const isAlreadyScheduledPublish = item?.scheduling?.isScheduled;

  const publishScheduledLocalText = item?.scheduling?.publishAt
    ? formatInTimeZone(
        item.scheduling.publishAt,
        tzGuess,
        "MMM d, yyyy 'at' h:mm a"
      )
    : "";

  const handleSchedulePublish = () => {
    setIsLoading(true);

    const publishAtUtcStr = formatInTimeZone(
      selectedUtc,
      "UTC",
      "yyyy-MM-dd HH:mm:ss"
    );
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

  // ── Unpublish flow (new behaviour) ────────────────────────────────────────
  // Broader check: any active future-scheduled publish blocks the API from
  // accepting a new POST to /publishings, regardless of version.
  const hasAnyScheduledPublish =
    !!item?.scheduling?.ZUID &&
    !!item?.scheduling?.publishAt &&
    new Date(item?.scheduling?.publishAt).getTime() > Date.now();

  const isAlreadyScheduledUnpublish = !!(
    item?.meta?.version === item?.publishing?.version &&
    item?.publishing?.unpublishAt &&
    new Date(item?.publishing?.unpublishAt).getTime() > Date.now()
  );

  const unpublishScheduledLocalText = item?.publishing?.unpublishAt
    ? formatInTimeZone(
        item.publishing.unpublishAt,
        tzGuess,
        "MMM d, yyyy 'at' h:mm a"
      )
    : "";

  const handleScheduleUnpublish = () => {
    setIsLoading(true);

    const publishAtUtcStr = formatInTimeZone(
      selectedUtc,
      "UTC",
      "yyyy-MM-dd HH:mm:ss"
    );
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
          publishAt: "now",
          unpublishAt: publishAtUtcStr,
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

  const handleUnscheduleUnpublish = async () => {
    setIsLoading(true);

    try {
      // The API has no dedicated "remove unpublishAt" endpoint. Re-publishing with
      // unpublishAt: "never" clears the scheduled takedown while keeping the item live.
      // However, when a scheduled future publish also exists, the API rejects creating
      // a new publishing record with "already has a scheduled publish event." Delete
      // the scheduled publish first to unblock the POST.
      if (hasAnyScheduledPublish) {
        await (dispatch as Function)(
          unpublish(
            item?.meta?.contentModelZUID,
            item?.meta?.ZUID,
            item?.scheduling?.ZUID,
            { version: item?.scheduling?.version }
          )
        );
      }

      await (dispatch as Function)(
        publish(
          item?.meta?.contentModelZUID,
          item?.meta?.ZUID,
          {
            publishAt: "now",
            unpublishAt: "never",
            version: item?.publishing?.version,
          },
          {
            localTime: "",
            localTimezone: publishTimezone,
          }
        )
      );

      onUnscheduleSuccess?.();
    } catch {
      // Error notification is handled by the thunk; swallow here so the
      // finally block always closes the dialog cleanly.
    } finally {
      setIsLoading(false);
      onClose();
    }
  };

  // ── Shared timezone label ─────────────────────────────────────────────────
  const tzLabel = TIMEZONES.find((tz) => tz.id === tzGuess)?.label || tzGuess;

  // ── Render ────────────────────────────────────────────────────────────────
  if (isForUnpublish) {
    // New unpublish scheduling flow
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
              {isAlreadyScheduledUnpublish ? (
                <CalendarTodayRoundedIcon color="warning" />
              ) : (
                <ScheduleRoundedIcon color="warning" />
              )}
            </Box>
            <Box>
              <Box mb={1}>
                <Typography variant="h5" display="inline" fontWeight={700}>
                  {isAlreadyScheduledUnpublish
                    ? "Unschedule Unpublish:"
                    : "Schedule Unpublish:"}
                  &nbsp;
                </Typography>
                <Typography variant="h5" display="inline">
                  {item?.web?.metaLinkText}
                </Typography>
              </Box>

              <Typography variant="body2" color="text.secondary">
                {isAlreadyScheduledUnpublish
                  ? `v${item?.web?.version} is scheduled to unpublish on ${unpublishScheduledLocalText} in ${tzLabel}.`
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
          {isAlreadyScheduledUnpublish ? (
            <>
              <Alert severity="info" icon={<InfoRoundedIcon />}>
                This will enable the ability to schedule or publish other
                versions of this content item
              </Alert>
              {hasAnyScheduledPublish && (
                <Alert
                  severity="warning"
                  icon={<WarningRoundedIcon fontSize="inherit" />}
                  sx={{ mt: 1.5 }}
                >
                  {`This will also cancel the scheduled publish for v${item?.scheduling?.version}.`}
                </Alert>
              )}
            </>
          ) : (
            <>
              <Typography variant="subtitle2" fontWeight={600} mb={0.5}>
                Unpublish on
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
                onTimezoneChange={(timezone: any) =>
                  setPublishTimezone(timezone)
                }
              />
              {isSelectedDatetimePast && (
                <Alert
                  severity="warning"
                  icon={<WarningRoundedIcon fontSize="inherit" />}
                  sx={{ mt: 2.5 }}
                >
                  Since the selected time is a current or past date, this will
                  be immediately unpublished.
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

          {isAlreadyScheduledUnpublish ? (
            <Button
              data-cy="UnschedulePublishButton"
              variant="contained"
              color="warning"
              startIcon={<CalendarTodayRoundedIcon />}
              onClick={handleUnscheduleUnpublish}
              loading={isLoading}
            >
              Cancel Scheduled Unpublish
            </Button>
          ) : (
            <Button
              data-cy="SchedulePublishButton"
              variant="contained"
              startIcon={<ScheduleRoundedIcon />}
              onClick={() => {
                if (isSelectedDatetimePast) {
                  onUnpublishNow?.();
                } else {
                  handleScheduleUnpublish();
                }
              }}
              loading={isLoading}
            >
              Schedule Unpublish
            </Button>
          )}
        </DialogActions>
      </Dialog>
    );
  }

  // Original publish scheduling flow (unchanged from pre-PR behaviour)
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
            {isAlreadyScheduledPublish ? (
              <CalendarTodayRoundedIcon color="warning" />
            ) : (
              <ScheduleRoundedIcon color="warning" />
            )}
          </Box>
          <Box>
            <Box mb={1}>
              <Typography variant="h5" display="inline" fontWeight={700}>
                {isAlreadyScheduledPublish
                  ? "Unschedule Publish:"
                  : "Schedule Publish:"}
                &nbsp;
              </Typography>
              <Typography variant="h5" display="inline">
                {item?.web?.metaLinkText}
              </Typography>
            </Box>

            <Typography variant="body2" color="text.secondary">
              {isAlreadyScheduledPublish
                ? `v${item?.web?.version} is scheduled to publish on ${publishScheduledLocalText} in ${tzLabel}.`
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
        {isAlreadyScheduledPublish ? (
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
          Cancel
        </Button>

        {isAlreadyScheduledPublish ? (
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
