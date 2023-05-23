export function calculatePercentageDifference(
  originalValue: number,
  newValue: number
) {
  const difference = newValue - originalValue;
  const percentageDifference = ((difference / originalValue) * 100).toFixed(2);

  return Number.isNaN((difference / originalValue) * 100)
    ? ""
    : `${
        Math.sign((difference / originalValue) * 100) === 1 ? "+" : ""
      }${percentageDifference}%`;
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

  data.forEach((item) => {
    // Check if all dimensions exist in dimensionValues
    const matchDimensions = dimensionFilters.every((filter) =>
      item.dimensionValues.some((dv: any) => dv.value === filter)
    );

    if (
      matchDimensions &&
      metricFilterIndex !== undefined &&
      item.metricValues[metricFilterIndex]
    ) {
      result.push(item.metricValues[metricFilterIndex].value);
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
  const dateRangeData = data.filter((item) =>
    item.dimensionValues.some((dimension: any) => dimension.value === dateRange)
  );

  const sortedData = dateRangeData.sort(
    (a, b) => Number(b.metricValues[0].value) - Number(a.metricValues[0].value)
  );

  return sortedData.slice(0, topN).map((item) => item.dimensionValues);
}
