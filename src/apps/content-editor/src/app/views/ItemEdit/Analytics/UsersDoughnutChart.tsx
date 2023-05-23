import { theme } from "@zesty-io/material";
import { useRef, useState } from "react";
import { Doughnut } from "react-chartjs-2";
import { ChartEvent } from "chart.js";
import { Box, Paper, Typography } from "@mui/material";
import { isEqual } from "lodash";
import { numberFormatter } from "../../../../../../../utility/numberFormatter";
import { findValuesForDimensions } from "./utils";

const datasetIndexMap = {
  "00": {
    title: "New Users",
    description:
      "New users are users who have never visited your website or app before.",
  },
  "01": {
    title: "Returning Users",
    description:
      "Returning users are users who have visited your website or app before.",
  },
  "10": {
    title: "Users for the Prior 14 Days",
    description:
      "Users are visitors who have initiated at least one session with your website or app within the specified period of time.",
  },
  "11": {
    title: "Users for the Last 14 Days",
    description:
      "These are visitors who have initiated at least one session with your website or app within the last 14 days.",
  },
};

export const UsersDoughnutChart = ({ data }: any) => {
  const chartRef = useRef(null);
  const [tooltipModel, setTooltipModel] = useState(null);

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
      const model = {
        datasetIndex,
        dataIndex: index,
        x: event.x - 200,
        y: event.y + 10,
      };
      if (!isEqual(tooltipModel, model)) {
        setTooltipModel(model);
      }
    }
  };

  const newVsReturningUsers = [
    +findValuesForDimensions(data?.rows, ["date_range_0", "new"])?.[0],
    +findValuesForDimensions(data?.rows, ["date_range_0", "returning"])?.[0],
  ];
  const totalUsers = [
    +findValuesForDimensions(data?.rows, ["date_range_1", "new"])?.[0] +
      +findValuesForDimensions(data?.rows, ["date_range_1", "returning"])?.[0],
    +findValuesForDimensions(data?.rows, ["date_range_0", "new"])?.[0] +
      +findValuesForDimensions(data?.rows, ["date_range_0", "returning"])?.[0],
  ];

  return (
    <Box position="relative" height="100%">
      <Doughnut
        ref={chartRef}
        data={{
          labels: ["New", "Returning"],
          datasets: [
            {
              label: "New vs Returning Users",
              data: newVsReturningUsers,
              backgroundColor: [
                theme.palette.info.light,
                theme.palette.info.main,
              ],
              borderWidth: 0,
            },
            {
              label: "Total Users",
              data: totalUsers,
              backgroundColor: [
                theme.palette.grey[200],
                theme.palette.grey[500],
              ],
              borderWidth: 0,
            },
          ],
        }}
        options={{
          maintainAspectRatio: false,
          onHover: handleHover,
          plugins: {
            tooltip: {
              enabled: false,
            },
            legend: {
              display: true,
              position: "right",
              labels: {
                usePointStyle: true,
                pointStyle: "circle",
                boxWidth: 8,
                font: {
                  family: "Mulish",
                  size: 12,
                },
                color: theme.palette.text.secondary,
                padding: 14,
              },
            },
          },
          cutout: "65%",
        }}
        plugins={[
          {
            id: "users-chart",
            beforeDatasetsDraw: (chart) => {
              const ctx = chart.ctx;
              ctx.save();
              ctx.textAlign = "center";
              ctx.textBaseline = "middle";
              ctx.font = "bold 12px Mulish";
              ctx.fillStyle = theme.palette.text.secondary;
              const xCoor = chart.getDatasetMeta(0).data[0].x;
              const yCoor = chart.getDatasetMeta(0).data[0].y;
              const title = "Users";
              ctx.fillText(title, xCoor, yCoor - 14);
              ctx.font = "bold 20px Mulish";
              ctx.fillStyle = theme.palette.text.primary;
              // ADD TOTAL USERS FROM SECONDARY DATASET
              const subtitle = numberFormatter.format(
                (chart.data.datasets[0].data.reduce(
                  (a: number, b: number) => a + b,
                  0
                ) as number) || 0
              );
              ctx.fillText(subtitle, xCoor, yCoor + 6);
              ctx.restore();
            },
          },
        ]}
      />
      <Paper
        sx={{
          visibility: tooltipModel ? "visible" : "hidden",
          position: "absolute",
          top: tooltipModel?.y,
          left: tooltipModel?.x,
          zIndex: theme.zIndex.tooltip,
          width: 200,
        }}
        onMouseLeave={() => {
          setTooltipModel(null);
        }}
      >
        <Box sx={{ p: 2 }}>
          <Typography
            variant="body3"
            fontWeight="600"
            color="text.secondary"
            sx={{ mb: 0.25 }}
          >
            {
              datasetIndexMap[
                `${tooltipModel?.datasetIndex}${tooltipModel?.dataIndex}` as keyof typeof datasetIndexMap
              ]?.title
            }
          </Typography>
          <Typography variant="h4" fontWeight="600">
            {(tooltipModel?.datasetIndex === 0
              ? newVsReturningUsers[tooltipModel?.dataIndex]
              : totalUsers[tooltipModel?.dataIndex]
            )?.toLocaleString()}
          </Typography>
          <Typography
            variant="body3"
            fontWeight="500"
            color="text.secondary"
            sx={{ mb: 1, fontSize: "10px" }}
          >
            {
              datasetIndexMap[
                `${tooltipModel?.datasetIndex}${tooltipModel?.dataIndex}` as keyof typeof datasetIndexMap
              ]?.description
            }
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};