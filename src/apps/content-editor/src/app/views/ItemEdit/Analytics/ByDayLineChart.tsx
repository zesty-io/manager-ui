import { theme } from "@zesty-io/material";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Line } from "react-chartjs-2";
import ChartDataLabels from "chartjs-plugin-datalabels";
import { useHistory, useParams } from "react-router";
import { Button, Box, Paper, Typography, ButtonGroup } from "@mui/material";
import { isEqual } from "lodash";
import { ChartEvent } from "chart.js";
import moment, { Moment } from "moment-timezone";
import {
  calculatePercentageDifference,
  findValuesForDimensions,
} from "./utils";

type Params = {
  modelZUID: string;
  itemZUID: string;
};

type Props = {
  auditData: any;
  startDate: Moment;
  endDate: Moment;
  dateLabel: string;
  data: any;
};

function getDatesArray(start: Moment, end: Moment) {
  const diff = end.diff(start, "days");
  const datesArray = Array.from({ length: diff + 1 }, (_, index) =>
    start.clone().add(index, "days").format("D")
  );

  return datesArray;
}

const typeLabelMap = ["Sessions", "Avg. Duration", "Bounce Rate", "Users"];

export const ByDayLineChart = ({
  auditData,
  startDate,
  endDate,
  dateLabel,
  data,
}: Props) => {
  const history = useHistory();
  const { modelZUID, itemZUID } = useParams<Params>();
  const chartRef = useRef(null);
  const [tooltipModel, setTooltipModel] = useState(null);
  const [isTooltipEntered, setIsTooltipEntered] = useState(false);
  const [type, setType] = useState(0);

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
            date: moment(item.meta.message.split(" ").pop())
              .add(1, "days")
              .format("L"),
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
      typeof index === "number" &&
      datasetIndex === 0
    ) {
      const model = {
        datasetIndex,
        dataIndex: index,
        x: event.x - 180,
        y: event.y - 80,
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

  const lastData = findValuesForDimensions(data.rows, ["date_range_0"], type);
  const priorData = findValuesForDimensions(data.rows, ["date_range_1"], type);

  const itemPublishesByDayArray = useMemo(
    () =>
      new Array(14).fill(0).map((_, i) => {
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
    [itemPublishes, startDate, lastData]
  );

  return (
    <>
      <Box display="flex" alignItems="start" justifyContent="space-between">
        <Typography variant="h5" fontWeight={600}>
          {typeLabelMap[type]} By Day
        </Typography>
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
      </Box>

      <Box position="relative" height="100%">
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
                label: "Last 14 days",
                data: lastData,
                fill: false,
                backgroundColor: theme.palette.info.main,
                borderColor: theme.palette.info.main,
                pointRadius: 0,
                datalabels: {
                  display: false,
                },
              },
              {
                label: "Prior 14 days",
                data: priorData,
                fill: false,
                backgroundColor: theme.palette.grey[300],
                borderColor: theme.palette.grey[300],
                pointRadius: 0,
                datalabels: {
                  display: false,
                },
              },
            ],
          }}
          plugins={[ChartDataLabels]}
          options={{
            layout: {
              padding: {
                top: 20,
                bottom: 20,
              },
            },
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
                  padding: 14,
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
                },
                ticks: {
                  color: theme.palette.text.disabled,
                  font: {
                    size: 12,
                    family: "Mulish",
                  },
                },
              },
              x: {
                grid: {
                  drawOnChartArea: false,
                },
                ticks: {
                  color: theme.palette.text.disabled,
                  font: {
                    size: 12,
                    family: "Mulish",
                  },
                },
              },
            },
          }}
        />
        <Paper
          sx={{
            visibility: tooltipModel ? "visible" : "hidden",
            position: "absolute",
            top: tooltipModel?.y,
            left: tooltipModel?.x,
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
            <Typography variant="body1" color="text.secondary" sx={{ mt: 0.5 }}>
              {startDate.format("ddd D MMM")} vs {startDate.format("ddd D MMM")}
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
            <Button
              sx={{ display: "block", mt: 1.5 }}
              size="small"
              variant="contained"
              color="inherit"
              disabled={
                !itemPublishesByDayArray[tooltipModel?.dataIndex]?.version
              }
              //onClick={() => history.push(`/content/${modelZUID}/${itemZUID}?version=${itemPublishesByDayArray[tooltipModel?.dataIndex]?.version}`)}
              onClick={() =>
                history.push(`/content/${modelZUID}/${itemZUID}?version=60`)
              }
            >
              View Version{" "}
              {itemPublishesByDayArray[tooltipModel?.dataIndex]?.version}
            </Button>
          </Box>
        </Paper>
      </Box>
    </>
  );
};