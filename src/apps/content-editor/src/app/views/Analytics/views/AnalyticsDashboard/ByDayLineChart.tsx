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
import { isEqual, last } from "lodash";
import { ChartEvent } from "chart.js";
import moment, { Moment } from "moment-timezone";
import "chartjs-adapter-moment";
import lineChartSkeleton2 from "../../../../../../../../../public/images/lineChartSkeleton2.svg";
import {
  calculatePercentageDifference,
  findValuesForDimensions,
  padArray,
} from "../../utils";

type Params = {
  modelZUID: string;
  itemZUID: string;
};

type Props = {
  startDate: Moment;
  endDate: Moment;
  dateRange0Label: string;
  dateRange1Label: string;
  data: any;
  loading?: boolean;
};

function getDatesArray(start: Moment, end: Moment) {
  const diff = end.diff(start, "days");
  const datesArray = Array.from({ length: diff + 1 }, (_, index) => {
    return start.clone().add(index, "days").format("YYYY-MM-DD");
  });

  return datesArray;
}

export const ByDayLineChart = ({
  startDate,
  endDate,
  dateRange0Label,
  dateRange1Label,
  data,
  loading = true,
}: Props) => {
  const chartRef = useRef(null);
  const [tooltipModel, setTooltipModel] = useState(null);
  const [isTooltipEntered, setIsTooltipEntered] = useState(false);

  const handleHover = (event: ChartEvent, chartElement: Array<any>) => {
    if (chartElement.length === 0 && !isTooltipEntered) {
      setTooltipModel(null);
      return;
    }

    const chart = chartRef.current;
    const activeElement = chart.getElementsAtEventForMode(
      event.native,
      "nearest",
      { intersect: true },
      false
    )[0];
    const datasetIndex = activeElement?.datasetIndex;
    const index = activeElement?.index;
    if (
      typeof datasetIndex === "number" &&
      typeof index === "number"
      // datasetIndex === 0 &&
      // itemPublishesByDayArray[index]?.version
    ) {
      const model = {
        datasetIndex,
        dataIndex: index,
        x: event.x - 180,
        y: event.y - 100,
      };
      if (!isEqual(tooltipModel, model)) {
        setTooltipModel(model);
        setIsTooltipEntered(true);
      }
    }
  };

  const dateChartLabels = useMemo(
    () => getDatesArray(startDate, endDate),
    [startDate, endDate]
  );

  const lastData = useMemo(() => {
    const result = findValuesForDimensions(data?.rows, ["date_range_0"]);
    if (result.length === 1 || result.length === 2) {
      return [result.pop()];
    }

    return padArray(result, (endDate.diff(startDate, "days") + 1) * 2)?.slice(
      endDate.diff(startDate, "days") + 1
    );
  }, [data]);

  const priorData = useMemo(() => {
    const result = findValuesForDimensions(data?.rows, ["date_range_1"]);
    if (result?.length === 1 || result?.length === 2) {
      return [result[0]];
    }

    return padArray(result, (endDate.diff(startDate, "days") + 1) * 2)?.slice(
      0,
      endDate.diff(startDate, "days") + 1
    );
  }, [data]);

  const spansMoreThanOneYear = useMemo(() => {
    let firstDate = moment(dateChartLabels[0]);
    let lastDate = moment(dateChartLabels[dateChartLabels.length - 1]);

    return firstDate.year() !== lastDate.year();
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
          labels: dateChartLabels,
          datasets: [
            {
              label: dateRange0Label,
              data: lastData,
              fill: false,
              backgroundColor: theme.palette.info.main,
              borderColor: theme.palette.info.main,
              pointRadius: lastData.length <= 2 ? 4 : 0,
              datalabels: {
                display: false,
              },
              borderWidth: 2,
            },
            {
              label: dateRange1Label,
              data: priorData,
              fill: false,
              backgroundColor: theme.palette.grey[300],
              borderColor: theme.palette.grey[300],
              pointRadius: priorData.length <= 2 ? 4 : 0,
              datalabels: {
                display: false,
              },
              borderWidth: 2,
            },
          ],
        }}
        plugins={[ChartDataLabels]}
        options={{
          layout: {
            padding: 0,
          },
          responsive: true,
          maintainAspectRatio: false,
          onHover: handleHover,
          plugins: {
            tooltip: {
              enabled: false,
            },
            legend: {
              display: true,
              position: "top",
              align: "start",
              labels: {
                usePointStyle: true,
                pointStyle: "circle",
                boxWidth: 4.5,
                font: {
                  family: "Mulish",
                  size: 12,
                },
                color: theme.palette.text.primary,
              },
            },
          },
          scales: {
            y: {
              display: false,
              beginAtZero: true,
            },
            x: {
              grid: {
                drawOnChartArea: false,
                drawTicks: false,
                drawBorder: false,
              },
              type: "time",
              time: {
                parser: "YYYY-MM-DD",
                unit: "day",
                displayFormats: {
                  day: spansMoreThanOneYear ? "MMM D YYYY" : "MMM D",
                },
              },
              ticks: {
                padding: 0,
                color: theme.palette.text.disabled,
                font: {
                  size: 12,
                  family: "Mulish",
                },
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
            {moment(startDate)
              .add(tooltipModel?.dataIndex, "days")
              .format("ddd D MMM")}{" "}
            vs{" "}
            {moment(startDate)
              .subtract(endDate.diff(startDate, "days") + 1, "days")
              .add(tooltipModel?.dataIndex, "days")
              .format("ddd D MMM")}
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
            {priorData?.[tooltipModel?.dataIndex]?.toLocaleString() + " "}
            <Typography
              variant="body3"
              color={
                calculatePercentageDifference(
                  +priorData?.[tooltipModel?.dataIndex],
                  +lastData?.[tooltipModel?.dataIndex]
                ).startsWith("-")
                  ? "error.main"
                  : "success.main"
              }
              fontWeight={600}
            >
              {calculatePercentageDifference(
                +priorData?.[tooltipModel?.dataIndex],
                +lastData?.[tooltipModel?.dataIndex]
              )}
            </Typography>
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};
