import { Moment } from "moment-timezone";

export function calculatePercentageDifference(
  originalValue: number,
  newValue: number
) {
  const difference = newValue - originalValue;
  const percentageDifference = (difference / (originalValue || 1)) * 100;

  return `${Math.sign(percentageDifference * 100) === 1 ? "+" : ""}${
    Number.isNaN(percentageDifference) || percentageDifference === 0
      ? ""
      : `${percentageDifference.toFixed(2)}%`
  }`;
}

export function convertSecondsToMinutesAndSeconds(
  totalSeconds: number
): string {
  const minutes: number = Math.floor(totalSeconds / 60);
  const seconds: number = Math.floor(totalSeconds % 60);
  return `${minutes}m ${seconds.toString().padStart(2, "0")}s`;
}

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

export function findTopDimensionsForDateRange(
  data: any[],
  dateRange: string,
  topN: number
) {
  const dateRangeData = data?.filter((item) =>
    item.dimensionValues.some((dimension: any) => dimension.value === dateRange)
  );

  const sortedData = dateRangeData?.sort(
    (a, b) => Number(b.metricValues[0].value) - Number(a.metricValues[0].value)
  );

  return sortedData?.slice(0, topN).map((item) => item.dimensionValues);
}

export const generateReportRequests = (
  propertyId: string,
  itemPath: string,
  startDate: Moment,
  endDate: Moment,
  withPrior = true
) => {
  return {
    property: propertyId,
    requests: [
      {
        dimensions: [
          {
            name: "pagePath",
          },
        ],
        metrics: [
          {
            name: "sessions",
          },
          {
            name: "averageSessionDuration",
          },
          {
            name: "bounceRate",
          },
          {
            name: "conversions",
          },
        ],
        dateRanges: [
          {
            startDate: startDate?.format("YYYY-MM-DD"),
            endDate: endDate?.format("YYYY-MM-DD"),
          },
          ...(withPrior
            ? [
                {
                  startDate: startDate
                    ?.clone()
                    ?.subtract(endDate.diff(startDate, "days") || 1, "days")
                    ?.format("YYYY-MM-DD"),
                  endDate: startDate?.format("YYYY-MM-DD"),
                },
              ]
            : []),
        ],
        dimensionFilter: {
          filter: {
            stringFilter: {
              matchType: "EXACT",
              value: itemPath,
            },
            fieldName: "pagePath",
          },
        },
      },
      {
        dimensions: [
          {
            name: "pagePath",
          },
          {
            name: "newVsReturning",
          },
        ],
        metrics: [
          {
            name: "totalUsers",
          },
        ],
        dateRanges: [
          {
            startDate: startDate?.format("YYYY-MM-DD"),
            endDate: endDate?.format("YYYY-MM-DD"),
          },
          ...(withPrior
            ? [
                {
                  startDate: startDate
                    ?.clone()
                    ?.subtract(endDate.diff(startDate, "days") || 1, "days")
                    ?.format("YYYY-MM-DD"),
                  endDate: startDate?.format("YYYY-MM-DD"),
                },
              ]
            : []),
        ],
        dimensionFilter: {
          filter: {
            stringFilter: {
              matchType: "EXACT",
              value: itemPath,
            },
            fieldName: "pagePath",
          },
        },
      },
      {
        dimensions: [
          {
            name: "pagePath",
          },
          {
            name: "firstUserDefaultChannelGroup",
          },
        ],
        metrics: [
          {
            name: "totalUsers",
          },
        ],
        dateRanges: [
          {
            startDate: startDate?.format("YYYY-MM-DD"),
            endDate: endDate?.format("YYYY-MM-DD"),
          },
          ...(withPrior
            ? [
                {
                  startDate: startDate
                    ?.clone()
                    ?.subtract(endDate.diff(startDate, "days") || 1, "days")
                    ?.format("YYYY-MM-DD"),
                  endDate: startDate?.format("YYYY-MM-DD"),
                },
              ]
            : []),
        ],
        dimensionFilter: {
          filter: {
            stringFilter: {
              matchType: "EXACT",
              value: itemPath,
            },
            fieldName: "pagePath",
          },
        },
        orderBys: [
          {
            metric: {
              metricName: "totalUsers",
            },
            desc: true,
          },
        ],
      },
      {
        dimensions: [
          {
            name: "pagePath",
          },
          {
            name: "country",
          },
        ],
        metrics: [
          {
            name: "totalUsers",
          },
        ],
        dateRanges: [
          {
            startDate: startDate?.format("YYYY-MM-DD"),
            endDate: endDate?.format("YYYY-MM-DD"),
          },
          ...(withPrior
            ? [
                {
                  startDate: startDate
                    ?.clone()
                    ?.subtract(endDate.diff(startDate, "days") || 1, "days")
                    ?.format("YYYY-MM-DD"),
                  endDate: startDate?.format("YYYY-MM-DD"),
                },
              ]
            : []),
        ],
        dimensionFilter: {
          filter: {
            stringFilter: {
              matchType: "EXACT",
              value: itemPath,
            },
            fieldName: "pagePath",
          },
        },
        orderBys: [
          {
            metric: {
              metricName: "totalUsers",
            },
            desc: true,
          },
        ],
      },
      {
        dimensions: [
          {
            name: "pagePath",
          },
          {
            name: "date",
          },
        ],
        metrics: [
          {
            name: "sessions",
          },
          {
            name: "averageSessionDuration",
          },
          {
            name: "bounceRate",
          },
          {
            name: "totalUsers",
          },
        ],
        dateRanges: [
          {
            startDate: startDate?.format("YYYY-MM-DD"),
            endDate: endDate?.format("YYYY-MM-DD"),
          },
          ...(withPrior
            ? [
                {
                  startDate: startDate
                    ?.clone()
                    ?.subtract(endDate.diff(startDate, "days") || 1, "days")
                    ?.format("YYYY-MM-DD"),
                  endDate: startDate?.format("YYYY-MM-DD"),
                },
              ]
            : []),
        ],
        dimensionFilter: {
          filter: {
            stringFilter: {
              matchType: "EXACT",
              value: itemPath,
            },
            fieldName: "pagePath",
          },
        },
        orderBys: [
          {
            dimension: {
              dimensionName: "date",
            },
          },
        ],
      },
    ],
  };
};
