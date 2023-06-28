import { theme } from "@zesty-io/material";
import { useRef, useState } from "react";
import { Bar } from "react-chartjs-2";
import ChartDataLabels from "chartjs-plugin-datalabels";
import {
  Button,
  Box,
  Paper,
  Typography,
  ButtonGroup,
  Skeleton,
} from "@mui/material";
import { isEqual } from "lodash";
import { ChartEvent } from "chart.js";
import {
  calculatePercentageDifference,
  findTopDimensionsForDateRange,
  findValuesForDimensions,
} from "../../../AnalyticsDashboard/utils";

type Props = {
  usersBySourceReport: any;
  usersByCountryReport: any;
  comparedUsersBySourceReport: any;
  comparedUsersByCountryReport: any;
  dateRange0Label: string;
  dateRange1Label: string;
  shouldCompare: boolean;
  loading?: boolean;
};

export const UsersBarChart = ({
  dateRange0Label,
  dateRange1Label,
  usersBySourceReport,
  usersByCountryReport,
  comparedUsersBySourceReport,
  comparedUsersByCountryReport,
  shouldCompare,
  loading = false,
}: Props) => {
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

  const currentReport =
    type === "Source" ? usersBySourceReport : usersByCountryReport;
  const currentComparedReport =
    type === "Source"
      ? comparedUsersBySourceReport
      : comparedUsersByCountryReport;

  const topDimensions = findTopDimensionsForDateRange(
    currentReport?.rows,
    "date_range_0",
    5
  );

  const lastSet = topDimensions?.map((dimension: any) => {
    const dimensionName = dimension?.[1]?.value;
    return +findValuesForDimensions(currentReport?.rows, [
      dimensionName,
      "date_range_0",
    ]);
  });
  const priorSet = topDimensions?.map((dimension: any) => {
    const dimensionName = dimension?.[1]?.value;
    return shouldCompare
      ? +findValuesForDimensions(currentComparedReport?.rows, [dimensionName])
      : +findValuesForDimensions(currentReport?.rows, [
          dimensionName,
          "date_range_1",
        ]);
  });

  return (
    <>
      <Box display="flex" alignItems="start" justifyContent="space-between">
        {loading ? (
          <Skeleton variant="rectangular" width="147px" height="28px" />
        ) : (
          <Typography variant="h5" fontWeight={600}>
            Users By {type}
          </Typography>
        )}
        {loading ? (
          <Box display="flex">
            <Skeleton variant="rectangular" width="67px" height="32px" />
            <Box
              width="67px"
              height="32px"
              sx={{
                border: `1px solid ${theme.palette.border}`,
              }}
            />
          </Box>
        ) : (
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
          </Box>
          <Box display="flex" gap={3.5} flexDirection="column" width="100%">
            {new Array(5).fill(0).map((_, i) => (
              <Box
                key={i}
                display="flex"
                gap={1}
                alignItems="center"
                width="100%"
              >
                <Skeleton variant="rectangular" width="55px" height="18px" />
                <Box width="100%">
                  <Skeleton
                    variant="rectangular"
                    width={`calc(100% - ${(i + 1) * 20}px)`}
                    height="18px"
                    sx={{ bgcolor: "grey.200" }}
                  />
                  <Skeleton
                    variant="rectangular"
                    width={`calc(80% - ${(i + 1) * 20}px)`}
                    height="18px"
                  />
                </Box>
              </Box>
            ))}
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
        <Box
          position="relative"
          height="387px"
          onMouseLeave={() => setTooltipModel(null)}
        >
          <Bar
            ref={chartRef}
            data={{
              labels: topDimensions?.map((dimension: any) =>
                dimension?.[1].value.split(" ")
              ),
              datasets: [
                {
                  label: dateRange0Label,
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
                  label: dateRange1Label,
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
              layout: {
                padding: {
                  top: 16,
                  bottom: 20,
                  right: 20,
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
              indexAxis: "y",
              scales: {
                y: {
                  grid: {
                    drawOnChartArea: false,
                    drawTicks: false,
                    drawBorder: false,
                  },
                  ticks: {
                    color: theme.palette.text.secondary,
                    font: {
                      size: 12,
                      family: "Mulish",
                    },
                    padding: 8,
                  },
                },
                x: {
                  grid: {
                    drawOnChartArea: true,
                    color: function (context) {
                      return context.tick.value % 1 === 0
                        ? theme.palette.grey[300]
                        : "transparent";
                    },
                    borderDash: [4, 4],
                    drawTicks: false,
                    drawBorder: false,
                  },
                  ticks: {
                    color: theme.palette.text.disabled,
                    font: {
                      size: 12,
                      family: "Mulish",
                    },
                    padding: 8,
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
              setTooltipModel(null);
            }}
          >
            <Box sx={{ p: 2 }}>
              <Typography variant="body1" fontWeight={600}>
                {topDimensions?.[tooltipModel?.dataIndex]?.[1]?.value}
              </Typography>
              <Typography
                variant="body1"
                color="text.secondary"
                sx={{ mt: 0.5 }}
              >
                {dateRange0Label} vs {dateRange1Label}
              </Typography>
              <Typography variant="h2" fontWeight={600}>
                {lastSet?.[tooltipModel?.dataIndex]?.toLocaleString()}
              </Typography>
              <Typography
                variant="body3"
                color="text.disabled"
                fontWeight={600}
                sx={{ mt: 1 }}
              >
                {priorSet?.[tooltipModel?.dataIndex]?.toLocaleString() + " "}
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
                </Typography>
              </Typography>
            </Box>
          </Paper>
        </Box>
      )}
    </>
  );
};
