import {
  isSameDay,
  isWithinInterval,
  startOfDay,
  endOfDay,
  subDays,
  subMonths,
  isValid,
  isBefore,
  isAfter,
  isEqual,
} from "date-fns";

import { DateFilterValue, DateRangeFilterValue, PresetType } from "./types";

export const getDateFilterFnByValues = ({
  preset,
  from,
  to,
}: {
  preset: string;
  from: string;
  to: string;
}) => {
  const isPreset = !!preset;
  const isBeforeFlag = !!to && !from;
  const isAfterFlag = !!from && !to;
  const isOn = !!to && !!from && to === from;
  const isRange = !!to && !!from && to !== from;

  if (isPreset) return getDateFilterFn({ type: "preset", value: preset });
  if (isBeforeFlag) return getDateFilterFn({ type: "before", value: to });
  if (isAfterFlag) return getDateFilterFn({ type: "after", value: from });
  if (isOn) return getDateFilterFn({ type: "on", value: from });
  if (isRange)
    return getDateFilterFn({ type: "daterange", value: { from, to } });

  return undefined;
};

const toDate = (input: string | Date) =>
  input instanceof Date ? input : new Date(input);

export const getDateFilterFn = ({ type, value }: DateFilterValue) => {
  const today = new Date();

  switch (type) {
    case "preset": {
      const v = value as PresetType;

      if (v === "today")
        return (date: string) => isSameDay(toDate(date), today);

      if (v === "yesterday")
        return (date: string) => isSameDay(toDate(date), subDays(today, 1));

      if (v === "last_7_days")
        return (date: string) =>
          isWithinInterval(toDate(date), {
            start: startOfDay(subDays(today, 7)),
            end: endOfDay(today),
          });

      if (v === "last_14_days")
        return (date: string) =>
          isWithinInterval(toDate(date), {
            start: startOfDay(subDays(today, 14)),
            end: endOfDay(today),
          });

      if (v === "last_30_days")
        return (date: string) =>
          isWithinInterval(toDate(date), {
            start: startOfDay(subDays(today, 30)),
            end: endOfDay(today),
          });

      if (v === "last_3_months")
        return (date: string) =>
          isWithinInterval(toDate(date), {
            start: startOfDay(subMonths(today, 3)),
            end: endOfDay(today),
          });

      if (v === "last_12_months")
        return (date: string) =>
          isWithinInterval(toDate(date), {
            start: startOfDay(subMonths(today, 12)),
            end: endOfDay(today),
          });

      return () => true;
    }

    case "on": {
      const d = toDate(value as string);
      return (date: string) => isSameDay(toDate(date), d);
    }

    case "before": {
      const d = endOfDay(toDate(value as string));
      return (date: string) => {
        const dt = toDate(date);
        return isBefore(dt, d) || isEqual(dt, d);
      };
    }

    case "after": {
      const d = startOfDay(toDate(value as string));
      return (date: string) => {
        const dt = toDate(date);
        return isAfter(dt, d) || isEqual(dt, d);
      };
    }

    case "daterange": {
      const { from, to } = value as DateRangeFilterValue;
      const fromDate = toDate(from);
      const toDateVal = toDate(to);
      if (!isValid(fromDate) || !isValid(toDateVal)) return () => true;

      return (date: string) =>
        isWithinInterval(toDate(date), {
          start: startOfDay(fromDate),
          end: endOfDay(toDateVal),
        });
    }

    default:
      return () => true;
  }
};
