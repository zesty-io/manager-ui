import moment, { Moment } from "moment-timezone";

export function calculatePercentageDifference(
  originalValue: number,
  newValue: number
) {
  const difference = newValue - originalValue;
  const percentageDifference = (difference / (originalValue || 1)) * 100;

  return `${Math.sign(percentageDifference * 100) === 1 ? "+" : ""}${
    Number.isNaN(percentageDifference) || percentageDifference === 0
      ? "+0%"
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

export function findTopDimensions(
  data: any[],
  dateRanges: string[],
  topN: number
) {
  const dateRangeData = data?.filter((item) =>
    dateRanges.every((dateRange) =>
      item.dimensionValues.some(
        (dimension: any) => dimension.value === dateRange
      )
    )
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
          {
            name: "userEngagementDuration",
          },
        ],
        dateRanges: [
          ...(withPrior
            ? generateDateRangesForReport(startDate, endDate)
            : [
                {
                  startDate: startDate?.format("YYYY-MM-DD"),
                  endDate: endDate?.format("YYYY-MM-DD"),
                },
              ]),
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
          ...(withPrior
            ? generateDateRangesForReport(startDate, endDate)
            : [
                {
                  startDate: startDate?.format("YYYY-MM-DD"),
                  endDate: endDate?.format("YYYY-MM-DD"),
                },
              ]),
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
          ...(withPrior
            ? generateDateRangesForReport(startDate, endDate)
            : [
                {
                  startDate: startDate?.format("YYYY-MM-DD"),
                  endDate: endDate?.format("YYYY-MM-DD"),
                },
              ]),
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
          ...(withPrior
            ? generateDateRangesForReport(startDate, endDate)
            : [
                {
                  startDate: startDate?.format("YYYY-MM-DD"),
                  endDate: endDate?.format("YYYY-MM-DD"),
                },
              ]),
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
            name: "userEngagementDuration",
          },
          {
            name: "bounceRate",
          },
          {
            name: "totalUsers",
          },
        ],
        dateRanges: [
          ...(withPrior
            ? generateDateRangesForReport(startDate, endDate)
            : [
                {
                  startDate: startDate?.format("YYYY-MM-DD"),
                  endDate: endDate?.format("YYYY-MM-DD"),
                },
              ]),
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

export const getDateRangeAndLabelsFromParams = (
  params: URLSearchParams
): [Moment, Moment, string, string] => {
  const preset = params.get("datePreset");
  const from = params.get("from");
  const to = params.get("to");
  if (from && to) {
    return [
      moment(from, "YYYY-MM-DD"),
      moment(to, "YYYY-MM-DD"),
      moment(from).format("ddd D MMM"),
      moment(to).format("ddd D MMM"),
    ];
  } else {
    switch (preset) {
      case "today":
        return [moment(), moment(), "Today", "Yesterday"];
      case "yesterday":
        return [
          moment().subtract(1, "days"),
          moment().subtract(1, "days"),
          "Yesterday",
          "Day Before Yesterday",
        ];
      case "last_7_days":
        return [
          moment().subtract(7, "days"),
          moment().subtract(1, "days"),
          "Last 7 Days",
          "Prior 7 Days",
        ];
      case "last_14_days":
        return [
          moment().subtract(14, "days"),
          moment().subtract(1, "days"),
          "Last 14 Days",
          "Prior 14 Days",
        ];
      case "last_30_days":
        return [
          moment().subtract(30, "days"),
          moment().subtract(1, "days"),
          "Last 30 Days",
          "Prior 30 Days",
        ];
      case "last_3_months":
        return [
          moment().subtract(90, "days"),
          moment().subtract(1, "days"),
          "Last 3 Months",
          "Prior 3 Months",
        ];
      case "last_12_months":
        return [
          moment().subtract(365, "days"),
          moment().subtract(1, "days"),
          "Last 12 Months",
          "Prior 12 Months",
        ];
      case "this_week":
        return [
          moment().startOf("week"),
          moment().subtract(1, "days"),
          "This Week",
          "Last Week",
        ];
      case "this_year":
        return [
          moment().startOf("year"),
          moment().subtract(1, "days"),
          "This Year",
          "Last Year",
        ];
      case "quarter_to_date":
        return [
          moment().startOf("quarter"),
          moment().subtract(1, "days"),
          "This Quarter",
          "Last Quarter",
        ];
      default:
        return [
          moment().subtract(14, "days"),
          moment().subtract(1, "days"),
          "Last 14 Days",
          "Prior 14 Days",
        ];
    }
  }
};

export const generateDateRangesForReport = (
  startDate: Moment,
  endDate: Moment
) => {
  return [
    {
      startDate: startDate?.format("YYYY-MM-DD"),
      endDate: endDate?.format("YYYY-MM-DD"),
    },
    {
      startDate: startDate
        ?.clone()
        ?.subtract(endDate.diff(startDate, "days") + 1 || 1, "days")
        ?.format("YYYY-MM-DD"),
      endDate: startDate?.clone?.()?.subtract(1, "days")?.format("YYYY-MM-DD"),
    },
  ];
};

export const padArray = (
  arr: any[],
  desiredLength: number,
  padValue = 0
): any[] => {
  let newArr = [...arr]; // create a copy of the array
  while (newArr.length < desiredLength) {
    newArr.unshift(padValue);
  }
  return newArr;
};
