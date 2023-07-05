import { theme } from "@zesty-io/material";
import { useMemo, useRef, useState } from "react";
import { Doughnut } from "react-chartjs-2";
import { ChartEvent } from "chart.js";
import { Box, Paper, Typography, Skeleton, Divider } from "@mui/material";
import { isEqual } from "lodash";
import {
  calculatePercentageDifference,
  findValuesForDimensions,
} from "../../utils";

const SOURCE_LEGEND = [
  {
    label: "Organic",
    color: theme.palette.blue[500],
  },
  {
    label: "Referral",
    color: theme.palette.green[500],
  },
  {
    label: "Direct",
    color: theme.palette.pink[500],
  },
  {
    label: "Social",
    color: theme.palette.yellow[300],
  },
  {
    label: "Video",
    color: theme.palette.purple[500],
  },
  {
    label: "Other",
    color: theme.palette.grey[400],
  },
] as const;

export const UsersDoughnutChart = ({
  usersData,
  sourceData,
  dateRange1Label,
  dateRange0Label,
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

  const dataset = useMemo(() => {
    if (!sourceData) return [];
    const result = [
      +findValuesForDimensions(
        sourceData?.rows,
        ["Organic Search", "date_range_0"],
        0
      ) || 0,
      +findValuesForDimensions(
        sourceData?.rows,
        ["Referral", "date_range_0"],
        0
      ) || 0,
      +findValuesForDimensions(
        sourceData?.rows,
        ["Direct", "date_range_0"],
        0
      ) || 0,
      +findValuesForDimensions(
        sourceData?.rows,
        ["Organic Social", "date_range_0"],
        0
      ) || 0,
      +findValuesForDimensions(
        sourceData?.rows,
        ["Organic Video", "date_range_0"],
        0
      ) || 0,
    ];
    // Calculate Other
    const sum = result.reduce((a, b) => a + b, 0);
    result.push(
      (+findValuesForDimensions(
        sourceData?.totals,
        ["RESERVED_TOTAL", "date_range_0"],
        0
      ) || 0) - sum
    );
    return result;
  }, [sourceData]);

  const priorDataset = useMemo(() => {
    if (!sourceData) return [];
    const result = [
      +findValuesForDimensions(
        sourceData?.rows,
        ["Organic Search", "date_range_1"],
        0
      ) || 0,
      +findValuesForDimensions(
        sourceData?.rows,
        ["Referral", "date_range_1"],
        0
      ) || 0,
      +findValuesForDimensions(
        sourceData?.rows,
        ["Direct", "date_range_1"],
        0
      ) || 0,
      +findValuesForDimensions(
        sourceData?.rows,
        ["Organic Social", "date_range_1"],
        0
      ) || 0,
      +findValuesForDimensions(
        sourceData?.rows,
        ["Organic Video", "date_range_1"],
        0
      ) || 0,
    ];
    // Calculate Other
    const sum = result.reduce((a, b) => a + b, 0);
    result.push(
      (+findValuesForDimensions(
        sourceData?.totals,
        ["RESERVED_TOTAL", "date_range_1"],
        0
      ) || 0) - sum
    );
    return result;
  }, [sourceData]);

  // if (loading) return null;

  return (
    <>
      <Box
        position="relative"
        height="106px"
        width="110px"
        onMouseLeave={() => setTooltipModel(null)}
      >
        <Doughnut
          ref={chartRef}
          data={{
            labels: SOURCE_LEGEND.map((item) => item.label),
            datasets: [
              {
                data: !loading ? dataset : [30, 20, 20, 8, 7],
                backgroundColor: [
                  !loading ? theme.palette.blue[500] : theme.palette.grey[50],
                  !loading ? theme.palette.green[500] : theme.palette.grey[100],
                  !loading ? theme.palette.pink[500] : theme.palette.grey[200],
                  !loading
                    ? theme.palette.yellow[300]
                    : theme.palette.grey[300],
                  !loading
                    ? theme.palette.purple[500]
                    : theme.palette.grey[400],
                  theme.palette.grey[400],
                ],
                borderWidth: 0,
              },
            ],
          }}
          options={{
            maintainAspectRatio: false,
            onHover: handleHover,
            layout: {
              padding: 0,
            },
            plugins: {
              tooltip: {
                enabled: false,
              },
              legend: {
                display: false,
              },
            },
            cutout: "80%",
          }}
        />
        <Box
          textAlign="center"
          position="absolute"
          top="18px"
          left="27px"
          width="56px"
        >
          {loading ? (
            <Box>
              <Skeleton
                variant="rectangular"
                height="16px"
                width="100%"
                sx={{ mt: 2, mb: 1 }}
              />
              <Skeleton variant="rectangular" height="16px" width="100%" />
            </Box>
          ) : (
            <>
              <Typography fontSize={14} fontWeight={700} lineHeight="18px">
                {(
                  +findValuesForDimensions(
                    usersData?.rows,
                    ["new", "date_range_0"],
                    0
                  ) || 0
                )?.toLocaleString()}
              </Typography>

              <Typography
                fontWeight={600}
                fontSize={10}
                lineHeight="12px"
                color="text.secondary"
              >
                {isNaN(
                  Math.floor(
                    ((+findValuesForDimensions(
                      usersData?.rows,
                      ["new", "date_range_0"],
                      0
                    ) || 0) /
                      ((+findValuesForDimensions(
                        usersData?.rows,
                        ["new", "date_range_0"],
                        0
                      ) || 0) +
                        (+findValuesForDimensions(
                          usersData?.rows,
                          ["returning", "date_range_0"],
                          0
                        ) || 0))) *
                      100
                  )
                )
                  ? 0
                  : Math.floor(
                      ((+findValuesForDimensions(
                        usersData?.rows,
                        ["new", "date_range_0"],
                        0
                      ) || 0) /
                        ((+findValuesForDimensions(
                          usersData?.rows,
                          ["new", "date_range_0"],
                          0
                        ) || 0) +
                          (+findValuesForDimensions(
                            usersData?.rows,
                            ["returning", "date_range_0"],
                            0
                          ) || 0))) *
                        100
                    )}
                % New
              </Typography>
              <Divider
                sx={{
                  my: "3px",
                }}
              />
              <Typography fontSize={14} fontWeight={700} lineHeight="18px">
                {(
                  +findValuesForDimensions(
                    usersData?.rows,
                    ["returning", "date_range_0"],
                    0
                  ) || 0
                )?.toLocaleString()}
              </Typography>
              <Typography
                fontWeight={600}
                fontSize={10}
                lineHeight="12px"
                color="text.secondary"
              >
                Returning
              </Typography>
            </>
          )}
        </Box>
        <Paper
          sx={{
            visibility: tooltipModel ? "visible" : "hidden",
            position: "absolute",
            top: tooltipModel?.y,
            left: tooltipModel?.x,
            zIndex: theme.zIndex.tooltip,
            width: 258,
          }}
          onMouseLeave={() => {
            setTooltipModel(null);
          }}
        >
          <Box sx={{ p: 2 }}>
            <Typography variant="h6" fontWeight="600" sx={{ mb: 0.5 }}>
              {SOURCE_LEGEND[tooltipModel?.dataIndex]?.label}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {dateRange0Label} vs {dateRange1Label}
            </Typography>
            <Typography variant="h3" fontWeight="600" sx={{ mb: 1 }}>
              {dataset[tooltipModel?.dataIndex]?.toLocaleString()}
            </Typography>
            <Typography
              variant="body3"
              color="text.disabled"
              fontWeight={600}
              sx={{ mt: 1 }}
            >
              {priorDataset?.[tooltipModel?.dataIndex]?.toLocaleString() + " "}
              <Typography
                variant="body3"
                color={
                  calculatePercentageDifference(
                    priorDataset?.[tooltipModel?.dataIndex],
                    dataset?.[tooltipModel?.dataIndex]
                  ).startsWith("-")
                    ? "error.main"
                    : "success.main"
                }
                fontWeight={600}
              >
                {calculatePercentageDifference(
                  priorDataset?.[tooltipModel?.dataIndex],
                  dataset?.[tooltipModel?.dataIndex]
                )}
              </Typography>
            </Typography>
          </Box>
        </Paper>
      </Box>
      <Box width="100%">
        {loading ? (
          <Skeleton
            variant="rectangular"
            height="21px"
            sx={{ bgcolor: "grey.200" }}
            width="60%"
          />
        ) : (
          <Typography variant="h3" fontWeight={600}>
            {(
              (+findValuesForDimensions(
                usersData?.rows,
                ["new", "date_range_0"],
                0
              ) || 0) +
                +findValuesForDimensions(
                  usersData?.rows,
                  ["returning", "date_range_0"],
                  0
                ) || 0
            )?.toLocaleString()}
            <Typography display="inline" fontWeight={600}>
              {" "}
              users
            </Typography>
          </Typography>
        )}
        {loading ? (
          <Skeleton variant="rectangular" height="36px" sx={{ mb: 1 }} />
        ) : (
          <Typography
            sx={{ mb: 1 }}
            fontSize={10}
            color="text.secondary"
            fontWeight={600}
            lineHeight="12px"
          >
            Lorem ipsum
          </Typography>
        )}
        {loading ? (
          <Skeleton variant="rectangular" height="16px" width="50%" />
        ) : (
          <Box display="flex" flexWrap="wrap">
            {SOURCE_LEGEND.map((item, index) => (
              <Box
                key={index}
                display="flex"
                alignItems="center"
                gap={0.5}
                mr={1}
              >
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    backgroundColor: item.color,
                  }}
                />
                <Typography
                  variant="body3"
                  fontWeight={600}
                  color="text.secondary"
                >
                  {item.label}
                </Typography>
              </Box>
            ))}
          </Box>
        )}
      </Box>
    </>
  );
};
