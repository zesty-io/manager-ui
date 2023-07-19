import { getTheme } from "@zesty-io/material";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Line } from "react-chartjs-2";
import ChartDataLabels from "chartjs-plugin-datalabels";
import { useHistory, useParams } from "react-router";
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
import lineChartSkeleton from "../../../../../../../../../public/images/lineChartSkeleton.svg";
import {
  calculatePercentageDifference,
  convertSecondsToMinutesAndSeconds,
  findValuesForDimensions,
} from "../utils";

type Params = {
  modelZUID: string;
  itemZUID: string;
};

type Props = {
  auditData: any;
  startDate: Moment;
  endDate: Moment;
  dateRange0Label: string;
  dateRange1Label: string;
  data: any;
  compareData: any;
  shouldCompare: boolean;
  loading?: boolean;
};

function getDatesArray(start: Moment, end: Moment) {
  const diff = end.diff(start, "days");
  const datesArray = Array.from({ length: diff + 1 }, (_, index) => {
    return start.clone().add(index, "days").format("YYYY-MM-DD");
  });

  return datesArray;
}

const typeLabelMap = ["Sessions", "Avg. Duration", "Bounce Rate", "Users"];

export const ByDayLineChart = ({
  auditData,
  startDate,
  endDate,
  dateRange0Label,
  dateRange1Label,
  data,
  compareData,
  shouldCompare,
  loading = false,
}: Props) => {
  const history = useHistory();
  const { modelZUID, itemZUID } = useParams<Params>();
  const chartRef = useRef(null);
  const [tooltipModel, setTooltipModel] = useState(null);
  const [isTooltipEntered, setIsTooltipEntered] = useState(false);
  const [type, setType] = useState(0);
  const theme = getTheme();

  const itemPublishes = useMemo(
    () =>
      auditData
        ?.filter(
          (item: any) =>
            item.affectedZUID === itemZUID &&
            (item.action === 4 || item.action === 6)
        )
        ?.map((item: any) => {
          return {
            date: moment(item.meta.message.split(" ").pop()).format("L"),
            version: item.meta.version,
          };
        })
        .sort((a: any, b: any) => b.version - a.version),
    [auditData, itemZUID]
  );

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
    const result = findValuesForDimensions(data?.rows, ["date_range_0"], type);
    const diff = (endDate.diff(startDate, "days") + 1) * 2 - result?.length - 1;
    const zeroPadding = diff > 0 ? new Array(Math.abs(diff)).fill(0) : [];
    if (result.length === 1 || result.length === 2) {
      return [result.pop()];
    }
    return [...zeroPadding, ...result].slice(endDate.diff(startDate, "days"));
  }, [data, type]);

  const priorData = useMemo(() => {
    const result = shouldCompare
      ? findValuesForDimensions(compareData?.rows, [], type)
      : findValuesForDimensions(data?.rows, ["date_range_1"], type);
    const diff = (endDate.diff(startDate, "days") + 1) * 2 - result?.length - 1;
    const zeroPadding = diff > 0 ? new Array(Math.abs(diff)).fill(0) : [];
    if (result?.length === 1 || result?.length === 2) {
      return [result[0]];
    }
    return shouldCompare
      ? [...zeroPadding, ...result].slice(endDate.diff(startDate, "days"))
      : [...zeroPadding, ...result].slice(
          0,
          endDate.diff(startDate, "days") + 1
        );
  }, [data, type, shouldCompare, compareData]);

  const spansMoreThanOneYear = useMemo(() => {
    let firstDate = moment(dateChartLabels[0]);
    let lastDate = moment(dateChartLabels[dateChartLabels.length - 1]);

    return firstDate.year() !== lastDate.year();
  }, [dateChartLabels]);

  const itemPublishesByDayArray = useMemo(
    () =>
      new Array(endDate.diff(startDate, "days") + 1).fill(0).map((_, i) => {
        if (
          itemPublishes?.find(
            (item: any) =>
              item.date === moment(startDate).add(i, "days").format("L")
          )
        ) {
          return {
            value: lastData[i],
            ...itemPublishes?.find(
              (item: any) =>
                item.date === moment(startDate).add(i, "days").format("L")
            ),
          };
        } else {
          return null;
        }
      }),
    [itemPublishes, startDate, endDate, lastData]
  );

  return (
    <>
      <Box display="flex" alignItems="start" justifyContent="space-between">
        {loading ? (
          <Skeleton variant="rectangular" width="147px" height="28px" />
        ) : (
          <Typography variant="h5" fontWeight={600}>
            {typeLabelMap[type]} By Day
          </Typography>
        )}
        {loading ? (
          <Box display="flex">
            <Skeleton variant="rectangular" width="81px" height="32px" />
            <Box
              width="81px"
              height="32px"
              sx={{
                border: `1px solid ${theme.palette.border}`,
              }}
            />
            <Box
              width="81px"
              height="32px"
              sx={{
                border: `1px solid ${theme.palette.border}`,
              }}
            />
            <Box
              width="81px"
              height="32px"
              sx={{
                border: `1px solid ${theme.palette.border}`,
              }}
            />
          </Box>
        ) : (
          <ButtonGroup size="small">
            <Button
              variant={type === 0 ? "contained" : "outlined"}
              color="inherit"
              onClick={() => setType(0)}
            >
              Sessions
            </Button>
            <Button
              variant={type === 1 ? "contained" : "outlined"}
              color="inherit"
              onClick={() => setType(1)}
            >
              Avg. Duration
            </Button>
            <Button
              variant={type === 2 ? "contained" : "outlined"}
              color="inherit"
              onClick={() => setType(2)}
            >
              Bounce Rate
            </Button>
            <Button
              variant={type === 3 ? "contained" : "outlined"}
              color="inherit"
              onClick={() => setType(3)}
            >
              Users
            </Button>
          </ButtonGroup>
        )}
      </Box>
      {loading ? (
        <Box>
          <Box display="flex" gap={2} my={2.5}>
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              gap={0.5}
            >
              <Skeleton
                variant="circular"
                width="12px"
                height="12px"
                sx={{ bgcolor: "grey.200" }}
              />
              <Skeleton variant="rectangular" width="77px" height="18px" />
            </Box>
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              gap={0.5}
            >
              <Skeleton variant="circular" width="12px" height="12px" />
              <Skeleton variant="rectangular" width="77px" height="18px" />
            </Box>
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              gap={0.5}
            >
              <Skeleton variant="circular" width="12px" height="12px" />
              <Skeleton variant="rectangular" width="77px" height="18px" />
            </Box>
          </Box>
          <Box display="flex" width="100%" height="100%">
            <Box width="100%" height="100%" mt={3}>
              <img src={lineChartSkeleton} width="100%" height="177px" />
            </Box>
            <Box display="flex" flexDirection="column" gap={4.25}>
              {new Array(6).fill(0).map((_, i) => (
                <Skeleton
                  key={i}
                  variant="rectangular"
                  width="40px"
                  height="20px"
                />
              ))}
            </Box>
          </Box>
          <Box display="flex" justifyContent="space-between" ml={8} mt={2}>
            {new Array(9).fill(0).map((_, i) => (
              <Skeleton
                key={i}
                variant="rectangular"
                width="8px"
                height="18px"
              />
            ))}
          </Box>
        </Box>
      ) : (
        <Box position="relative" height="387px">
          <Line
            ref={chartRef}
            data={{
              labels: dateChartLabels,
              datasets: [
                {
                  label: "Item Published",
                  data: itemPublishesByDayArray.map(
                    (item: any) => item?.value || 0
                  ),
                  fill: false,
                  backgroundColor: theme.palette.success.main,
                  borderColor: "transparent",
                  pointRadius: (ctx) => (ctx.raw === 0 ? 0 : 4),
                  datalabels: {
                    display: true,
                    color: theme.palette.text.disabled,
                    align: "top",
                    offset: 4,
                    font: {
                      family: "Mulish",
                      size: 12,
                      weight: 600,
                    },
                    formatter: (value: any, ctx: any, ...rest) => {
                      if (
                        value === 0 ||
                        !itemPublishesByDayArray[ctx.dataIndex]?.version
                      )
                        return "";
                      return `v${
                        itemPublishesByDayArray[ctx.dataIndex]?.version
                      }`;
                    },
                  },
                },
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
                padding: {
                  top: 16,
                },
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
                    boxWidth: 8,
                    font: {
                      family: "Mulish",
                      size: 12,
                    },
                    color: theme.palette.text.primary,
                    padding: 6,
                  },
                },
              },
              scales: {
                y: {
                  title: {
                    display: true,
                    text: typeLabelMap[type],
                    align: "end",
                    font: {
                      size: 12,
                      family: "Mulish",
                      weight: "600",
                    },
                    color: theme.palette.text.disabled,
                  },
                  beginAtZero: true,
                  position: "right",
                  grid: {
                    drawOnChartArea: true,
                    color: function (context) {
                      return context.tick.value % 1 === 0
                        ? theme.palette.grey[300]
                        : "transparent";
                    },
                    borderDash: [4, 4],
                    drawBorder: false,
                  },
                  ticks: {
                    color: theme.palette.text.disabled,
                    font: {
                      size: 12,
                      family: "Mulish",
                    },
                    padding: 8,
                    callback: function (value, index, values) {
                      switch (type) {
                        case 1:
                          return convertSecondsToMinutesAndSeconds(+value);
                        case 2:
                          return Math.floor(+value * 100) + "%";
                        default:
                          return value;
                      }
                    },
                  },
                },
                x: {
                  grid: {
                    drawOnChartArea: false,
                    drawTicks: false,
                  },
                  type: "time",
                  time: {
                    parser: "YYYY-MM-DD",
                    unit: "day",
                    displayFormats: {
                      day: spansMoreThanOneYear ? "MMM DD YYYY" : "MMM DD",
                    },
                  },
                  ticks: {
                    padding: 8,
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
                {typeLabelMap[type]}
              </Typography>
              <Typography
                variant="body1"
                color="text.secondary"
                sx={{ mt: 0.5 }}
              >
                {shouldCompare
                  ? dateRange0Label
                  : moment(startDate)
                      .add(tooltipModel?.dataIndex, "days")
                      .format("ddd D MMM")}{" "}
                vs{" "}
                {shouldCompare
                  ? dateRange1Label
                  : moment(startDate)
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
              {itemPublishesByDayArray[tooltipModel?.dataIndex]?.version ? (
                <Button
                  sx={{ display: "block", mt: 1.5 }}
                  size="small"
                  variant="contained"
                  color="inherit"
                  //onClick={() => history.push(`/content/${modelZUID}/${itemZUID}?version=${itemPublishesByDayArray[tooltipModel?.dataIndex]?.version}`)}
                  onClick={() =>
                    history.push(
                      `/content/${modelZUID}/${itemZUID}?version=${
                        itemPublishesByDayArray[tooltipModel?.dataIndex]
                          ?.version
                      }`
                    )
                  }
                >
                  View Version{" "}
                  {itemPublishesByDayArray[tooltipModel?.dataIndex]?.version}
                </Button>
              ) : null}
            </Box>
          </Paper>
        </Box>
      )}
    </>
  );
};
