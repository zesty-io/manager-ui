import moment from "moment-timezone";

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
  const isBefore = !!to && !!!from;
  const isAfter = !!from && !!!to;
  const isOn = !!to && !!from && to === from;
  const isRange = !!to && !!from && to !== from;
  let dateFilterFn: (date: string) => boolean;

  if (isPreset) {
    dateFilterFn = getDateFilterFn({
      type: "preset",
      value: preset,
    });
  }

  if (isBefore) {
    dateFilterFn = getDateFilterFn({ type: "before", value: to });
  }

  if (isAfter) {
    dateFilterFn = getDateFilterFn({ type: "after", value: from });
  }

  if (isOn) {
    dateFilterFn = getDateFilterFn({ type: "on", value: from });
  }

  if (isRange) {
    dateFilterFn = getDateFilterFn({
      type: "daterange",
      value: { from: from, to: to },
    });
  }

  return dateFilterFn;
};

export const getDateFilterFn = ({ type, value }: DateFilterValue) => {
  switch (type) {
    case "preset":
      switch (value as PresetType) {
        case "today":
          return (date: string) => moment(date).isSame(moment(), "day");

        case "yesterday":
          return (date: string) =>
            moment(date).isSame(moment().subtract(1, "days"), "day");

        case "last_7_days":
          return (date: string) =>
            moment(date).isSameOrAfter(moment().subtract(7, "days"), "day");

        case "last_14_days":
          return (date: string) =>
            moment(date).isSameOrAfter(moment().subtract(14, "days"), "day");

        case "last_30_days":
          return (date: string) =>
            moment(date).isSameOrAfter(moment().subtract(30, "days"), "day");

        case "last_3_months":
          return (date: string) =>
            moment(date).isSameOrAfter(moment().subtract(3, "months"), "day");

        case "last_12_months":
          return (date: string) =>
            moment(date).isSameOrAfter(moment().subtract(12, "months"), "day");

        // should never happen
        default:
          return (date: string) => true;
      }

    case "on":
      return (date: string) =>
        moment(date).isSame(moment(value as string), "day");

    case "before":
      return (date: string) =>
        moment(date).isSameOrBefore(moment(value as string), "day");

    case "after":
      return (date: string) =>
        moment(date).isSameOrAfter(moment(value as string), "day");

    case "daterange":
      return (date: string) => {
        const _value = value as DateRangeFilterValue;

        return moment(date).isBetween(
          moment(_value.from),
          moment(_value.to),
          "day",
          "[]"
        );
      };

    // should never happen
    default:
      return (date: string) => true;
  }
};
