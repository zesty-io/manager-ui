import { theme } from "@zesty-io/material";
import { useMemo, useRef, useState } from "react";
import { Line } from "react-chartjs-2";
import ChartDataLabels from "chartjs-plugin-datalabels";
import {
  Button,
  Box,
  Paper,
  Typography,
  ButtonGroup,
  Skeleton,
} from "@mui/material";
import { ChartEvent } from "chart.js";
import { addDays, differenceInCalendarDays, getYear } from "date-fns";
import { formatLocalized } from "shell/i18n/dates";

import "chartjs-adapter-date-fns";

import lineChartSkeleton2 from "../../../../../../../../../public/images/lineChartSkeleton2.svg";
import {
  calculatePercentageDifference,
  findValuesForDimensions,
  padArray,
} from "../../utils";

type Props = {
  startDate: Date;
  endDate: Date;
  dateRange0Label: string;
  dateRange1Label: string;
  data: any;
  loading?: boolean;
};

function getDatesArray(start: Date, end: Date) {
  const diff = differenceInCalendarDays(end, start);
  return Array.from({ length: diff + 1 }, (_, i) => addDays(start, i));
}

export const ByDayLineChart = ({
  startDate,
  endDate,
  dateRange0Label,
  dateRange1Label,
  data,
  loading = true,
}: Props) => {
  const chartRef = useRef<any>(null);
  const [tooltipModel, setTooltipModel] = useState<any>(null);
  const [isTooltipEntered, setIsTooltipEntered] = useState(false);

  const handleHover = (event: ChartEvent, chartElement: Array<any>) => {
    if (chartElement.length === 0 && !isTooltipEntered) {
      setTooltipModel(null);
      return;
    }

    const chart = chartRef.current;
    const activeElement = chart?.getElementsAtEventForMode(
      event.native!,
      "nearest",
      { intersect: true },
      false
    )?.[0];

    const datasetIndex = activeElement?.datasetIndex;
    const index = activeElement?.index;

    if (typeof datasetIndex === "number" && typeof index === "number") {
      const model = {
        datasetIndex,
        dataIndex: index,
        x: (event as any).x - 180,
        y: (event as any).y - 100,
      };
      if (
        !tooltipModel ||
        model.dataIndex !== tooltipModel.dataIndex ||
        model.datasetIndex !== tooltipModel.datasetIndex
      ) {
        setTooltipModel(model);
        setIsTooltipEntered(true);
      }
    }
  };

  const dateChartLabels = useMemo(
    () => getDatesArray(startDate, endDate),
    [startDate, endDate]
  );

  const daysSpan = differenceInCalendarDays(endDate, startDate) + 1;

  const lastData = useMemo(() => {
    const result = findValuesForDimensions(data?.rows, ["date_range_0"]);
    if (result.length === 1 || result.length === 2)
      return [result[result.length - 1]];
    return padArray(result, daysSpan * 2).slice(daysSpan);
  }, [data, daysSpan]);

  const priorData = useMemo(() => {
    const result = findValuesForDimensions(data?.rows, ["date_range_1"]);
    if (result.length === 1 || result.length === 2) return [result[0]];
    return padArray(result, daysSpan * 2).slice(0, daysSpan);
  }, [data, daysSpan]);

  const spansMoreThanOneYear = useMemo(() => {
    if (!dateChartLabels.length) return false;
    const first = dateChartLabels[0];
    const last = dateChartLabels[dateChartLabels.length - 1];
    return getYear(first) !== getYear(last);
  }, [dateChartLabels]);

  if (loading) {
    return (
      <Box height="106px" width="100%" minWidth="0">
        <img src={lineChartSkeleton2} height="100%" width="100%" />
      </Box>
    );
  }

  return (
    <Box position="relative" height="106px" width="100%" minWidth="0">
      <Line
        ref={chartRef}
        data={{
          labels: dateChartLabels, // Dates, not strings
          datasets: [
            {
              label: dateRange0Label,
              data: lastData,
              fill: false,
              backgroundColor: theme.palette.info.main,
              borderColor: theme.palette.info.main,
              pointRadius: lastData.length <= 2 ? 4 : 0,
              datalabels: { display: false },
              borderWidth: 2,
            },
            {
              label: dateRange1Label,
              data: priorData,
              fill: false,
              backgroundColor: theme.palette.grey[300],
              borderColor: theme.palette.grey[300],
              pointRadius: priorData.length <= 2 ? 4 : 0,
              datalabels: { display: false },
              borderWidth: 2,
            },
          ],
        }}
        plugins={[ChartDataLabels]}
        options={{
          layout: { padding: 0 },
          responsive: true,
          maintainAspectRatio: false,
          onHover: handleHover,
          plugins: {
            tooltip: { enabled: false },
            legend: {
              display: true,
              position: "top",
              align: "start",
              labels: {
                usePointStyle: true,
                pointStyle: "circle",
                boxWidth: 4.5,
                font: { family: "Mulish", size: 12 },
                color: theme.palette.text.primary,
              },
            },
          },
          scales: {
            y: { display: false, beginAtZero: true },
            x: {
              grid: {
                drawOnChartArea: false,
                drawTicks: false,
                drawBorder: false,
              },
              type: "time",
              time: {
                // no parser needed when labels are Date objects
                unit: "day",
                displayFormats: {
                  day: spansMoreThanOneYear ? "MMM d yyyy" : "MMM d",
                },
              },
              ticks: {
                padding: 0,
                color: theme.palette.text.disabled,
                font: { size: 12, family: "Mulish" },
                maxTicksLimit: 5,
                maxRotation: 0,
                minRotation: 0,
                autoSkip: true,
              },
            },
          },
        }}
      />

      <Paper
        sx={{
          display: tooltipModel ? "block" : "none",
          position: "absolute",
          top: tooltipModel?.y,
          left: tooltipModel?.x,
          width: 258,
          zIndex: theme.zIndex.tooltip,
        }}
        onMouseLeave={() => {
          setIsTooltipEntered(false);
          setTooltipModel(null);
        }}
      >
        <Box sx={{ p: 2 }}>
          <Typography variant="body1" fontWeight={600}>
            Sessions
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mt: 0.5 }}>
            {formatLocalized(
              addDays(startDate, tooltipModel?.dataIndex ?? 0),
              "eee d MMM"
            )}{" "}
            vs{" "}
            {formatLocalized(
              addDays(
                addDays(startDate, -daysSpan),
                tooltipModel?.dataIndex ?? 0
              ),
              "eee d MMM"
            )}
          </Typography>
          <Typography variant="h2" fontWeight={600}>
            {lastData?.[tooltipModel?.dataIndex]?.toLocaleString()}
          </Typography>
          <Typography
            variant="body3"
            color="text.disabled"
            fontWeight={600}
            sx={{ mt: 1 }}
          >
            {priorData?.[tooltipModel?.dataIndex]?.toLocaleString()}{" "}
            <Typography
              variant="body3"
              color={
                calculatePercentageDifference(
                  +(priorData?.[tooltipModel?.dataIndex] ?? 0),
                  +(lastData?.[tooltipModel?.dataIndex] ?? 0)
                ).startsWith("-")
                  ? "error.main"
                  : "success.main"
              }
              fontWeight={600}
            >
              {calculatePercentageDifference(
                +(priorData?.[tooltipModel?.dataIndex] ?? 0),
                +(lastData?.[tooltipModel?.dataIndex] ?? 0)
              )}
            </Typography>
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};
