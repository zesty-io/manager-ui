import { theme } from "@zesty-io/material";
import { useRef, useState } from "react";
import { Doughnut } from "react-chartjs-2";
import formatNumberWithSuffix from "../../../../../../../utility/formatNumberWithSuffix";
import { ChartEvent } from "chart.js";
import { Box, Paper, Typography } from "@mui/material";
import { isEqual } from "lodash";

export const UsersDoughnutChart = () => {
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
      const meta = chart.getDatasetMeta(datasetIndex);
      // const data = meta.data[index];
      const model = {
        datasetIndex,
        dataIndex: index,
        x: event.x + 8,
        y: event.y,
      };
      if (!isEqual(tooltipModel, model)) {
        setTooltipModel(model);
      }
    }
  };

  return (
    <Box position="relative" height="100%">
      <Doughnut
        ref={chartRef}
        data={{
          labels: ["New", "Returning"],
          datasets: [
            {
              label: "New vs Returning Users",
              data: [500, 3000],
              backgroundColor: [
                theme.palette.info.light,
                theme.palette.info.main,
              ],
              borderWidth: 0,
            },
            {
              label: "Total Users",
              data: [500 + 3000, 1500],
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
              const subtitle = formatNumberWithSuffix(
                chart.data.datasets[0].data.reduce(
                  (a: number, b: number) => a + b,
                  0
                ) as number
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
        }}
        onMouseLeave={() => {
          setTooltipModel(null);
        }}
      >
        <Box sx={{ p: 2 }}>
          <Typography variant="h3" fontWeight="600" color="text.secondary">
            {tooltipModel?.datasetIndex}
            {tooltipModel?.dataIndex}
          </Typography>
          {/* <Typography variant="h3" fontWeight="600" color="text.secondary">{tooltipModel.title}</Typography>
          <Typography variant="h4" fontWeight="600">{tooltipModel.title}</Typography>
          <Typography variant="h3" fontWeight="600" color="text.secondary">{tooltipModel.title}</Typography> */}
          {/* <Typography variant="h3" fontWeight="600">
            {tooltipModel?.label}
          </Typography>
          <Typography variant="body1" color="text.secondary" mt={1}>
            {tooltipModel?.formattedValue}
          </Typography> */}
          TEST
        </Box>
      </Paper>
    </Box>
  );
};
