import { theme } from "@zesty-io/material";
import { useRef, useState } from "react";
import { Doughnut } from "react-chartjs-2";
import { ChartEvent } from "chart.js";
import { Box, Paper, Typography, Skeleton } from "@mui/material";
import { isEqual } from "lodash";
import { numberFormatter } from "../../../../../../../../utility/numberFormatter";
import { findValuesForDimensions } from "../../utils";

export const UsersDoughnutChart = ({
  data,
  dateRange1Label,
  dateRange0Label,
  shouldCompare,
  compareData,
  loading,
}: any) => {
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
    +findValuesForDimensions(data?.rows, ["date_range_0", "new"])?.[0] || 0,
    +findValuesForDimensions(data?.rows, ["date_range_0", "returning"])?.[0] ||
      0,
  ];
  const totalUsers = [
    shouldCompare
      ? +findValuesForDimensions(compareData?.rows, ["new"])?.[0] ||
        0 + +findValuesForDimensions(compareData?.rows, ["returning"])?.[0] ||
        0
      : +findValuesForDimensions(data?.rows, ["date_range_1", "new"])?.[0] ||
        0 +
          +findValuesForDimensions(data?.rows, [
            "date_range_1",
            "returning",
          ])?.[0] ||
        0,
    +findValuesForDimensions(data?.rows, ["date_range_0", "new"])?.[0] ||
      0 +
        +findValuesForDimensions(data?.rows, [
          "date_range_0",
          "returning",
        ])?.[0] ||
      0,
  ];

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
      title: `Users for ${dateRange1Label}`,
      description:
        "Users are visitors who have initiated at least one session with your website or app within the specified period of time.",
    },
    "11": {
      title: `Users for ${dateRange0Label}`,
      description:
        "These are visitors who have initiated at least one session with your website or app within the specified period of time.",
    },
  };

  return (
    <Box
      position="relative"
      height="100%"
      onMouseLeave={() => setTooltipModel(null)}
    >
      {loading ? (
        <Box
          display="flex"
          gap={1}
          height="100%"
          alignItems="center"
          width="184px"
        >
          <Skeleton variant="circular" height="100px" width="100px" />
          <Box display="flex" flexDirection="column" gap={1}>
            <Box display="flex" gap={0.5} alignItems="center">
              <Skeleton variant="circular" width={12} height={12} />
              <Skeleton variant="rectangular" height={18} width={56} />
            </Box>
            <Box display="flex" gap={0.5} alignItems="center">
              <Skeleton
                variant="circular"
                width={12}
                height={12}
                sx={{ bgcolor: "grey.200" }}
              />
              <Skeleton variant="rectangular" height={18} width={56} />
            </Box>
          </Box>
        </Box>
      ) : (
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
                  padding: 8,
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
                ctx.font = "600 12px Mulish";
                ctx.fillStyle = theme.palette.text.secondary;
                const xCoor = chart.getDatasetMeta(0).data[0].x;
                const yCoor = chart.getDatasetMeta(0).data[0].y;
                const title = "Users";
                ctx.fillText(title, xCoor, yCoor - 14);
                ctx.font = "600 20px Mulish";
                ctx.fillStyle = theme.palette.text.primary;
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
      )}
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
