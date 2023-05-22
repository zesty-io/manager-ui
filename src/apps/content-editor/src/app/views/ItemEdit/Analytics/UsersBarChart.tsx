import { theme } from "@zesty-io/material";
import { useRef, useState } from "react";
import { Bar } from "react-chartjs-2";
import ChartDataLabels from "chartjs-plugin-datalabels";
import { Button, Box, Paper, Typography, ButtonGroup } from "@mui/material";
import { isEqual } from "lodash";
import { ChartEvent } from "chart.js";
import { Moment } from "moment-timezone";
import { numberFormatter } from "../../../../../../../utility/numberFormatter";

type Props = {
  auditData: any;
  startDate: Moment;
  endDate: Moment;
};

const sourceDataIndexMap = [
  "Organic",
  "Direct",
  "Referral",
  "Organic Social",
  "Organic Video",
];

function calculatePercentageDifference(
  originalValue: number,
  newValue: number
) {
  const difference = newValue - originalValue;
  const percentageDifference = ((difference / originalValue) * 100).toFixed(2);
  return `${
    Math.sign((difference / originalValue) * 100) === 1 ? "+" : ""
  }${percentageDifference}`;
}

export const UsersBarChart = ({ startDate, endDate }: Props) => {
  const chartRef = useRef(null);
  const [tooltipModel, setTooltipModel] = useState(null);
  const [type, setType] = useState("Source");

  const handleHover = (event: ChartEvent, chartElement: Array<any>) => {
    if (chartElement.length === 0) {
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
        x: event.x + 20,
        y: event.y - 20,
      };
      if (!isEqual(tooltipModel, model)) {
        setTooltipModel(model);
      }
    }
  };

  const lastSet = [374, 320, 301, 267, 223];
  const priorSet = [323, 300, 272, 251, 280];

  return (
    <>
      <Box display="flex" alignItems="start" justifyContent="space-between">
        <Typography variant="h5" fontWeight={600}>
          Users By {type}
        </Typography>
        <ButtonGroup size="small">
          <Button
            variant={type === "Source" ? "contained" : "outlined"}
            color="inherit"
            onClick={() => setType("Source")}
          >
            Source
          </Button>
          <Button
            variant={type === "Country" ? "contained" : "outlined"}
            color="inherit"
            onClick={() => setType("Country")}
          >
            Country
          </Button>
        </ButtonGroup>
      </Box>
      <Box position="relative" height="100%">
        <Bar
          ref={chartRef}
          data={{
            labels: [
              "Organic",
              "Direct",
              "Referral",
              ["Organic", "Social"],
              ["Organic", "Video"],
            ],
            datasets: [
              {
                label: "Last",
                data: lastSet,
                backgroundColor: theme.palette.info.main,
                datalabels: {
                  display: true,
                  color: theme.palette.text.disabled,

                  offset: 2,
                  anchor: "end",
                  align: "end",
                  clip: false,
                  font: {
                    family: "Mulish",
                    size: 10,
                    weight: 600,
                  },
                },
              },
              {
                label: "Prior",
                data: priorSet,
                backgroundColor: theme.palette.grey[200],
                datalabels: {
                  display: true,
                  color: theme.palette.text.disabled,
                  offset: 2,
                  anchor: "end",
                  align: "end",
                  clip: false,
                  font: {
                    family: "Mulish",
                    size: 10,
                    weight: 600,
                  },
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
            indexAxis: "y",
          }}
        />
        <Paper
          sx={{
            visibility: tooltipModel ? "visible" : "hidden",
            position: "absolute",
            top: tooltipModel?.y,
            left: tooltipModel?.x,
            width: 258,
            zIndex: theme.zIndex.tooltip,
          }}
          onMouseLeave={() => {
            setTooltipModel(null);
          }}
        >
          <Box sx={{ p: 2 }}>
            <Typography variant="body1" fontWeight={600}>
              {/* {tooltipModel?.datasetIndex}
            {tooltipModel?.dataIndex} */}
              {sourceDataIndexMap?.[tooltipModel?.dataIndex]}
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mt: 0.5 }}>
              Last 14 Days vs Prev 14 Days
            </Typography>
            <Typography variant="h2" fontWeight={600}>
              {numberFormatter.format(lastSet?.[tooltipModel?.dataIndex])}
            </Typography>
            <Typography
              variant="body3"
              color="text.disabled"
              fontWeight={600}
              sx={{ mt: 1 }}
            >
              {numberFormatter.format(priorSet?.[tooltipModel?.dataIndex]) +
                " "}
              {/* @ts-ignore */}
              <Typography
                variant="body3"
                color={
                  calculatePercentageDifference(
                    priorSet?.[tooltipModel?.dataIndex],
                    lastSet?.[tooltipModel?.dataIndex]
                  ).startsWith("-")
                    ? "error.main"
                    : "success.main"
                }
                fontWeight={600}
              >
                {calculatePercentageDifference(
                  priorSet?.[tooltipModel?.dataIndex],
                  lastSet?.[tooltipModel?.dataIndex]
                )}
                %
              </Typography>
            </Typography>
          </Box>
        </Paper>
      </Box>
    </>
  );
};
