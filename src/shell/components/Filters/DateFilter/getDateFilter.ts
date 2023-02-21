import moment from "moment-timezone";

import { DateFilterValue, PresetType } from "./types";

export const getDateFilterFn = ({ type, value }: DateFilterValue) => {
  switch (type) {
    case "preset":
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
      return (date: string) => moment(date).isSame(moment(value), "day");

    case "before":
      return (date: string) =>
        moment(date).isSameOrBefore(moment(value), "day");

    case "after":
      return (date: string) => moment(date).isSameOrAfter(moment(value), "day");

    // should never happen
    default:
      return (date: string) => true;
  }
};
