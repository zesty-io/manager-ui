import { useState } from "react";
import { useDispatch } from "react-redux";

import { format as fmt, isBefore, formatDistanceToNow } from "date-fns";
import { zonedTimeToUtc, formatInTimeZone } from "date-fns-tz";

import { ContentItemWithDirtyAndPublishing } from "../../services/types";
import { useGetUsersQuery } from "../../services/accounts";
import { TIMEZONES } from "../FieldTypeDateTime/util";
import { publish, unpublish } from "../../store/content";

import { SchedulePublishDialog } from "./SchedulePublishDialog";
import { ScheduleUnpublishDialog } from "./ScheduleUnpublishDialog";

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
  item,
  onClose,
  onPublishNow,
  onUnpublishNow,
  onScheduleSuccess,
  onUnscheduleSuccess,
  scheduledAction,
}: SchedulePublishProps) => {
  const dispatch = useDispatch();
  const { data: users } = useGetUsersQuery();

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

  // ── Derived display values ────────────────────────────────────────────────
  const selectedUtc = zonedTimeToUtc(
    publishDateTime.replace(/\.\d+$/, ""),
    publishTimezone
  );
  const isSelectedDatetimePast = !isNaN(selectedUtc.getTime())
    ? isBefore(selectedUtc, new Date())
    : false;

  const latestChangeCreator = users?.find(
    (user) => user.ZUID === item?.web?.createdByUserZUID
  );
  const creatorName = `${latestChangeCreator?.firstName ?? ""} ${
    latestChangeCreator?.lastName ?? ""
  }`.trim();
  const savedAgo = item?.web?.createdAt
    ? formatDistanceToNow(new Date(item.web.createdAt), { addSuffix: true })
    : "";
  const tzLabel = TIMEZONES.find((tz) => tz.id === tzGuess)?.label || tzGuess;

  // ── Publish flow ──────────────────────────────
  const isAlreadyScheduledPublish = !!item?.scheduling?.isScheduled;

  const publishScheduledLocalText = item?.scheduling?.publishAt
    ? formatInTimeZone(
        item.scheduling.publishAt,
        tzGuess,
        "MMM d, yyyy 'at' h:mm a"
      )
    : "";

  const formatPayloadTimes = (utc: Date, timezone: string) => ({
    publishAtUtcStr: formatInTimeZone(utc, "UTC", "yyyy-MM-dd HH:mm:ss"),
    localPretty: formatInTimeZone(utc, timezone, "MMMM do yyyy, 'at' h:mm a"),
  });

  const handleSchedulePublish = () => {
    setIsLoading(true);
    const { publishAtUtcStr, localPretty } = formatPayloadTimes(
      selectedUtc,
      publishTimezone
    );
    dispatch(
      publish(
        item?.meta?.contentModelZUID,
        item?.meta?.ZUID,
        { publishAt: publishAtUtcStr, version: item?.meta?.version },
        { localTime: localPretty, localTimezone: publishTimezone }
      )
    ) // @ts-expect-error untyped action
      .then(() => {
        onScheduleSuccess?.();
      })
      .catch(() => {
        // Error notification handled by the thunk
      })
      .finally(() => {
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
    ) // @ts-expect-error untyped action
      .then(() => {
        onUnscheduleSuccess?.();
      })
      .catch(() => {
        // Error notification handled by the thunk
      })
      .finally(() => {
        setIsLoading(false);
        onClose();
      });
  };

  // ── Unpublish flow ────────────────────────────────────────
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
    const { publishAtUtcStr, localPretty } = formatPayloadTimes(
      selectedUtc,
      publishTimezone
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
        { localTime: localPretty, localTimezone: publishTimezone }
      )
    ) // @ts-expect-error untyped action
      .then(() => {
        onScheduleSuccess?.();
      })
      .catch(() => {
        // Error notification handled by the thunk
      })
      .finally(() => {
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
        await dispatch(
          unpublish(
            item?.meta?.contentModelZUID,
            item?.meta?.ZUID,
            item?.scheduling?.ZUID,
            { version: item?.scheduling?.version }
          )
        );
      }
      await dispatch(
        publish(
          item?.meta?.contentModelZUID,
          item?.meta?.ZUID,
          {
            publishAt: "now",
            unpublishAt: "never",
            version: item?.publishing?.version,
          },
          { localTime: "", localTimezone: publishTimezone }
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

  // ── Shared state passed to both dumb dialogs ──────────────────────────────
  const sharedProps = {
    publishDateTime,
    publishTimezone,
    isLoading,
    isSelectedDatetimePast,
    creatorName,
    savedAgo,
    tzLabel,
    onClose,
    onDateTimeChange: (datetime: any) =>
      setPublishDateTime(String(datetime).replace(/\.\d+$/, "")),
    onTimezoneChange: (timezone: any) => setPublishTimezone(timezone),
  };

  if (scheduledAction === "unpublish") {
    return (
      <ScheduleUnpublishDialog
        {...sharedProps}
        itemName={item?.web?.metaLinkText ?? ""}
        currentVersion={item?.web?.version ?? item?.meta?.version}
        scheduledPublishVersion={item?.scheduling?.version}
        isAlreadyScheduled={isAlreadyScheduledUnpublish}
        hasAnyScheduledPublish={hasAnyScheduledPublish}
        scheduledLocalText={unpublishScheduledLocalText}
        onUnpublishNow={onUnpublishNow}
        onSchedule={handleScheduleUnpublish}
        onUnschedule={handleUnscheduleUnpublish}
      />
    );
  }

  return (
    <SchedulePublishDialog
      {...sharedProps}
      itemName={item?.web?.metaLinkText ?? ""}
      currentVersion={item?.web?.version ?? item?.meta?.version}
      isAlreadyScheduled={isAlreadyScheduledPublish}
      scheduledLocalText={publishScheduledLocalText}
      onPublishNow={onPublishNow}
      onSchedule={handleSchedulePublish}
      onUnschedule={handleUnschedulePublish}
    />
  );
};
