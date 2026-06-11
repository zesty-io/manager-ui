// utils.ts (refactored to date-fns)
import {
  addDays,
  differenceInCalendarDays,
  format as fmt,
  parseISO,
  startOfQuarter,
  startOfWeek,
  startOfYear,
  subDays,
} from "date-fns";
import { formatLocalized } from "shell/i18n-dates";

/* ---------- Numbers / formatting ---------- */

export function calculatePercentageDifference(
  originalValue: number,
  newValue: number
) {
  const base = originalValue || 1; // avoid div-by-zero
  const pct = ((newValue - originalValue) / base) * 100;
  if (Number.isNaN(pct) || pct === 0) return "+0%";
  const sign = pct > 0 ? "+" : "";
  return `${sign}${pct.toFixed(2)}%`;
}

export function convertSecondsToMinutesAndSeconds(
  totalSeconds: number
): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = Math.floor(totalSeconds % 60);
  return `${minutes}m ${String(seconds).padStart(2, "0")}s`;
}

/* ---------- GA4 helpers ---------- */

export function findValuesForDimensions(
  data: any[],
  dimensionFilters: string[],
  metricFilterIndex?: number
): string[] {
  const result: string[] = [];
  data?.forEach((item) => {
    // Check if all dimensions exist in dimensionValues
    const matchDimensions = dimensionFilters.every((filter) =>
      item.dimensionValues.some((dv: any) => dv.value === filter)
    );

    if (matchDimensions && metricFilterIndex !== undefined) {
      result.push(item.metricValues[metricFilterIndex]?.value);
    } else if (matchDimensions) {
      result.push(...item.metricValues.map((metric: any) => metric.value));
    }
  });
  return result;
}

export function findTopDimensions(
  data: any[],
  dateRanges: string[],
  topN: number
) {
  const rows = data?.filter((item) =>
    dateRanges.every((dr) =>
      item.dimensionValues.some((d: any) => d.value === dr)
    )
  );

  const sorted = rows?.sort(
    (a, b) => Number(b.metricValues[0].value) - Number(a.metricValues[0].value)
  );

  return sorted?.slice(0, topN).map((item) => item.dimensionValues);
}

/* ---------- Date ranges & params ---------- */

export const generateDateRangesForReport = (startDate: Date, endDate: Date) => {
  const len = differenceInCalendarDays(endDate, startDate) + 1; // inclusive
  const priorStart = subDays(startDate, len);
  const priorEnd = subDays(startDate, 1);

  return [
    {
      startDate: fmt(startDate, "yyyy-MM-dd"),
      endDate: fmt(endDate, "yyyy-MM-dd"),
    },
    {
      startDate: fmt(priorStart, "yyyy-MM-dd"),
      endDate: fmt(priorEnd, "yyyy-MM-dd"),
    },
  ];
};

export const generateReportRequests = (
  propertyId: string,
  itemPath: string,
  startDate: Date,
  endDate: Date,
  withPrior = true
) => {
  const dateRanges = withPrior
    ? generateDateRangesForReport(startDate, endDate)
    : [
        {
          startDate: fmt(startDate, "yyyy-MM-dd"),
          endDate: fmt(endDate, "yyyy-MM-dd"),
        },
      ];

  return {
    property: propertyId,
    requests: [
      {
        dimensions: [{ name: "pagePath" }],
        metrics: [
          { name: "screenPageViews" },
          { name: "averageSessionDuration" },
          { name: "bounceRate" },
          { name: "conversions" },
          { name: "userEngagementDuration" },
        ],
        dateRanges,
        dimensionFilter: {
          filter: {
            stringFilter: { matchType: "EXACT", value: itemPath },
            fieldName: "pagePath",
          },
        },
      },
      {
        dimensions: [{ name: "pagePath" }, { name: "newVsReturning" }],
        metrics: [{ name: "totalUsers" }],
        dateRanges,
        dimensionFilter: {
          filter: {
            stringFilter: { matchType: "EXACT", value: itemPath },
            fieldName: "pagePath",
          },
        },
      },
      {
        dimensions: [
          { name: "pagePath" },
          { name: "firstUserDefaultChannelGroup" },
        ],
        metrics: [{ name: "totalUsers" }],
        dateRanges,
        dimensionFilter: {
          filter: {
            stringFilter: { matchType: "EXACT", value: itemPath },
            fieldName: "pagePath",
          },
        },
        orderBys: [{ metric: { metricName: "totalUsers" }, desc: true }],
      },
      {
        dimensions: [{ name: "pagePath" }, { name: "country" }],
        metrics: [{ name: "totalUsers" }],
        dateRanges,
        dimensionFilter: {
          filter: {
            stringFilter: { matchType: "EXACT", value: itemPath },
            fieldName: "pagePath",
          },
        },
        orderBys: [{ metric: { metricName: "totalUsers" }, desc: true }],
      },
      {
        dimensions: [{ name: "pagePath" }, { name: "date" }],
        metrics: [
          { name: "sessions" },
          { name: "userEngagementDuration" },
          { name: "bounceRate" },
          { name: "totalUsers" },
        ],
        dateRanges,
        dimensionFilter: {
          filter: {
            stringFilter: { matchType: "EXACT", value: itemPath },
            fieldName: "pagePath",
          },
        },
        orderBys: [{ dimension: { dimensionName: "date" } }],
      },
    ],
  };
};

export const getDateRangeAndLabelsFromParams = (
  params: URLSearchParams
): [Date, Date, string, string] => {
  const preset = params.get("datePreset");
  const from = params.get("from");
  const to = params.get("to");

  if (from && to) {
    const start = parseISO(from);
    const end = parseISO(to);
    return [
      start,
      end,
      formatLocalized(start, "eee d LLL"),
      formatLocalized(end, "eee d LLL"),
    ];
  }

  const today = new Date();

  switch (preset) {
    case "today": {
      const start = today;
      const end = today;
      return [start, end, "Today", "Yesterday"];
    }
    case "yesterday": {
      const d = subDays(today, 1);
      return [d, d, "Yesterday", "Day Before Yesterday"];
    }
    case "last_7_days": {
      const start = subDays(today, 7);
      const end = subDays(today, 1);
      return [start, end, "Last 7 Days", "Prior 7 Days"];
    }
    case "last_14_days": {
      const start = subDays(today, 14);
      const end = subDays(today, 1);
      return [start, end, "Last 14 Days", "Prior 14 Days"];
    }
    case "last_30_days": {
      const start = subDays(today, 30);
      const end = subDays(today, 1);
      return [start, end, "Last 30 Days", "Prior 30 Days"];
    }
    case "last_3_months": {
      const start = subDays(today, 90);
      const end = subDays(today, 1);
      return [start, end, "Last 3 Months", "Prior 3 Months"];
    }
    case "last_12_months": {
      const start = subDays(today, 365);
      const end = subDays(today, 1);
      return [start, end, "Last 12 Months", "Prior 12 Months"];
    }
    case "this_week": {
      // By default date-fns week starts Sunday; adjust with options if needed
      const start = startOfWeek(today /* , { weekStartsOn: 0 } */);
      const end = subDays(today, 1);
      return [start, end, "This Week", "Last Week"];
    }
    case "this_year": {
      const start = startOfYear(today);
      const end = subDays(today, 1);
      return [start, end, "This Year", "Last Year"];
    }
    case "quarter_to_date": {
      const start = startOfQuarter(today);
      const end = subDays(today, 1);
      return [start, end, "This Quarter", "Last Quarter"];
    }
    default: {
      const start = subDays(today, 14);
      const end = subDays(today, 1);
      return [start, end, "Last 14 Days", "Prior 14 Days"];
    }
  }
};

/* ---------- misc ---------- */

export const padArray = (
  arr: any[],
  desiredLength: number,
  padValue = 0
): any[] => {
  const copy = [...arr];
  while (copy.length < desiredLength) copy.unshift(padValue);
  return copy;
};
