import { isSameDay, subDays, getYear } from "date-fns";
import { utcToZonedTime } from "date-fns-tz";

import { formatLocalized } from "shell/i18n/dates";
import i18n from "shell/i18n";

export const isTodayOrYesterday = (dateString?: string): boolean => {
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  const input = new Date(dateString || "");

  if (isNaN(input.getTime())) return false;

  const zoned = utcToZonedTime(input, timeZone);
  const nowZoned = utcToZonedTime(new Date(), timeZone);

  return isSameDay(zoned, nowZoned) || isSameDay(zoned, subDays(nowZoned, 1));
};

export const formatDate = (
  dateString: string,
  showPastYear?: boolean
): string => {
  try {
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
    const input = new Date(dateString);
    if (isNaN(input.getTime())) return i18n.t("common.invalidDate");

    // Convert to the user's TZ for comparisons/formatting
    const zoned = utcToZonedTime(input, timeZone);
    const nowZoned = utcToZonedTime(new Date(), timeZone);

    let dateLabel: string;
    if (isSameDay(zoned, nowZoned)) {
      dateLabel = i18n.t("common.today");
    } else if (isSameDay(zoned, subDays(nowZoned, 1))) {
      dateLabel = i18n.t("common.yesterday");
    } else if (showPastYear) {
      dateLabel =
        getYear(zoned) === getYear(nowZoned)
          ? formatLocalized(zoned, "MMM d")
          : formatLocalized(zoned, "MMM d, yyyy");
    } else {
      dateLabel = formatLocalized(zoned, "MMM d");
    }

    // Get TZ abbreviation via Intl parts (e.g., "PDT")
    const tzName =
      new Intl.DateTimeFormat("en-US", {
        timeZone,
        timeZoneName: "short",
      })
        .formatToParts(zoned)
        .find((p) => p.type === "timeZoneName")?.value || "";

    const timeLabel = formatLocalized(zoned, "h:mm a");
    return `${dateLabel}, ${timeLabel} ${tzName}`;
  } catch (e) {
    // Fallback: best-effort local formatting
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return i18n.t("common.invalidDate");
    return formatLocalized(d, "MMM d, h:mm a");
  }
};
