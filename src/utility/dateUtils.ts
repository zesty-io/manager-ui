import { DateRange } from "../shell/store/types";

import moment from "moment-timezone";
export function getDateFilterFn(dateRangeFilter: DateRange) {
  const { value, type } = dateRangeFilter;
  switch (type) {
    case "preset":
      switch (value) {
        case "today":
          return (date: string) => moment(date).isSame(moment(), "day");
        case "yesterday":
          return (date: string) =>
            moment(date).isSame(moment().subtract(1, "days"), "day");
        case "last 7 days":
          return (date: string) =>
            moment(date).isSameOrAfter(moment().subtract(7, "days"), "day");
        case "last 30 days":
          return (date: string) =>
            moment(date).isSameOrAfter(moment().subtract(30, "days"), "day");
        case "last 3 months":
          return (date: string) =>
            moment(date).isSameOrAfter(moment().subtract(3, "months"), "day");
        case "last 12 months":
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
    case "range":
      return (date: string) => {
        const [start, end] = value;
        return (
          moment(date).isSameOrAfter(moment(start), "day") &&
          moment(date).isSameOrBefore(moment(end), "day")
        );
      };

    // should never happen
    default:
      return (date: string) => true;
  }
}

type GetDateFilter = (params: URLSearchParams) => DateRange;
export const getDateFilter: GetDateFilter = (params) => {
  // TODO check for malformed date ranges
  if (params.has("dateFilter")) {
    const preset = params.get("dateFilter");
    const presetMap = {
      today: "today",
      yesterday: "yesterday",
      last7days: "last 7 days",
      last30days: "last 30 days",
      last3months: "last 3 months",
      last12months: "last 12 months",
    } as const;
    if (preset in presetMap) {
      return {
        type: "preset",
        value: presetMap[preset as keyof typeof presetMap],
      };
    }
  } else if (params.has("to") && params.has("from")) {
    if (params.get("to") === params.get("from")) {
      return {
        type: "on",
        value: params.get("to"),
      };
    } else {
      return {
        type: "range",
        value: [params.get("from"), params.get("to")],
      };
    }
  } else if (params.has("to")) {
    return {
      type: "before",
      value: params.get("to"),
    };
  } else if (params.has("from")) {
    return {
      type: "after",
      value: params.get("from"),
    };
  }
};
