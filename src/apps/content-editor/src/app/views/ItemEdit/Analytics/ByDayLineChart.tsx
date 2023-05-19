import { theme } from "@zesty-io/material";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Line } from "react-chartjs-2";
import ChartDataLabels from "chartjs-plugin-datalabels";
import { useHistory, useParams } from "react-router";
import { Button, Box, Paper, Typography, ButtonGroup } from "@mui/material";
import { isEqual } from "lodash";
import { ChartEvent } from "chart.js";
import moment, { Moment } from "moment-timezone";
import { numberFormatter } from "../../../../../../../utility/numberFormatter";

type Params = {
  modelZUID: string;
  itemZUID: string;
};

type Props = {
  auditData: any;
  startDate: Moment;
  endDate: Moment;
};

function getDatesArray(start: Moment, end: Moment) {
  const diff = end.diff(start, "days");
  const datesArray = Array.from({ length: diff + 1 }, (_, index) =>
    start.clone().add(index, "days").format("D")
  );

  return datesArray;
}

export const ByDayLineChart = ({ auditData, startDate, endDate }: Props) => {
  const history = useHistory();
  const { modelZUID, itemZUID } = useParams<Params>();
  const chartRef = useRef(null);
  const [tooltipModel, setTooltipModel] = useState(null);
  const [isTooltipEntered, setIsTooltipEntered] = useState(false);

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

    if (typeof datasetIndex === "number" && typeof index === "number") {
      const meta = chart.getDatasetMeta(datasetIndex);
      // const data = meta.data[index];
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

  const lastData = [12, 19, 3, 5, 2, 3, 9, 12, 19, 3, 5, 2, 3, 9];

  const dateLabels = useMemo(
    () => getDatesArray(startDate, endDate),
    [startDate, endDate]
  );

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
    [itemPublishes, startDate]
  );

  return (
    <>
      <Box display="flex" alignItems="start" justifyContent="space-between">
        <Typography variant="h5" fontWeight={600}>
          Sessions By Day
        </Typography>
        <ButtonGroup size="small">
          <Button variant="contained" color="inherit">
            Sessions
          </Button>
          <Button variant="outlined" color="inherit">
            Avg. Duration
          </Button>
          <Button variant="outlined" color="inherit">
            Bounce Rate
          </Button>
          <Button variant="outlined" color="inherit">
            Users
          </Button>
        </ButtonGroup>
      </Box>

      <Box position="relative" height="100%">
        <Line
          ref={chartRef}
          data={{
            labels: dateLabels,
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
                    if (value === 0) return "";
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
                data: [2, 3, 20, 5, 0, 4, 9, 2, 3, 20, 5, 1, 4, 9],
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
                  text: "Sessions",
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
          }}
          onMouseLeave={() => {
            setIsTooltipEntered(false);
            setTooltipModel(null);
          }}
        >
          <Box sx={{ p: 2 }}>
            <Typography variant="body1" fontWeight={600}>
              {tooltipModel?.datasetIndex}
              {tooltipModel?.dataIndex}
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mt: 0.5 }}>
              {startDate.format("ddd D MMM")} vs {startDate.format("ddd D MMM")}
            </Typography>
            <Typography variant="h2" fontWeight={600}>
              {numberFormatter.format(6000)}
            </Typography>
            <Typography
              variant="body3"
              color="text.disabled"
              fontWeight={600}
              sx={{ mt: 1 }}
            >
              {numberFormatter.format(6000) + " "}
              <Typography variant="body3" color="error.main" fontWeight={600}>
                - 40%
              </Typography>
            </Typography>
            <Button
              sx={{ display: "block", mt: 1.5 }}
              size="small"
              variant="contained"
              color="inherit"
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
