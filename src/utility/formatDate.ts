import { format as dfFormat, isSameDay, subDays, getYear } from "date-fns";
import { utcToZonedTime } from "date-fns-tz";

export const formatDate = (
  dateString: string,
  showPastYear?: boolean
): string => {
  try {
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
    const input = new Date(dateString);
    if (isNaN(input.getTime())) return "Invalid Date";

    // Convert to the user's TZ for comparisons/formatting
    const zoned = utcToZonedTime(input, timeZone);
    const nowZoned = utcToZonedTime(new Date(), timeZone);

    let dateLabel: string;
    if (isSameDay(zoned, nowZoned)) {
      dateLabel = "Today";
    } else if (isSameDay(zoned, subDays(nowZoned, 1))) {
      dateLabel = "Yesterday";
    } else if (showPastYear) {
      dateLabel =
        getYear(zoned) === getYear(nowZoned)
          ? dfFormat(zoned, "MMM d")
          : dfFormat(zoned, "MMM d, yyyy");
    } else {
      dateLabel = dfFormat(zoned, "MMM d");
    }

    // Get TZ abbreviation via Intl parts (e.g., "PDT")
    const tzName =
      new Intl.DateTimeFormat("en-US", {
        timeZone,
        timeZoneName: "short",
      })
        .formatToParts(zoned)
        .find((p) => p.type === "timeZoneName")?.value || "";

    const timeLabel = dfFormat(zoned, "h:mm a");
    return `${dateLabel}, ${timeLabel} ${tzName}`;
  } catch (e) {
    // Fallback: best-effort local formatting
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return "Invalid Date";
    return dfFormat(d, "MMM d, h:mm a");
  }
};
