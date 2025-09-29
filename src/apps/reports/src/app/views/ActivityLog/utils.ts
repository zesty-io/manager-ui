import { format as fmt, isValid as isValidDate } from "date-fns";

// This assumes the date passed in the param has a format of YYYY-MM-DD
export const toUTC = (originalDate: string) => {
  if (!originalDate) return;

  const [yearStr, monthStr, dayStr] = originalDate.split("-");
  const year = Number(yearStr);
  const month = Number(monthStr);
  const day = Number(dayStr);

  if (
    !Number.isFinite(year) ||
    !Number.isFinite(month) ||
    !Number.isFinite(day)
  )
    return;

  // Create a UTC date at 00:00:00 UTC for the provided Y-M-D
  const utcDate = new Date(Date.UTC(year, month - 1, day));
  if (!isValidDate(utcDate)) return;

  return fmt(utcDate, "P");
};
