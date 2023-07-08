import { theme } from "@zesty-io/material";
import { useMemo, useRef, useState } from "react";
import { Doughnut } from "react-chartjs-2";
import { ChartEvent } from "chart.js";
import { Box, Paper, Typography, Skeleton, Divider } from "@mui/material";
import { isEqual } from "lodash";
import {
  calculatePercentageDifference,
  findTopDimensions,
  findValuesForDimensions,
} from "../../utils";

const SOURCE_LEGEND_COLORS = [
  theme.palette.blue[500],
  theme.palette.green[500],
  theme.palette.pink[500],
  theme.palette.yellow[300],
  theme.palette.purple[500],
  theme.palette.grey[400],
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
    const topSources = findTopDimensions(
      sourceData?.rows,
      ["date_range_0"],
      5
    )?.map((item) => item?.[0]?.value);
    if (!sourceData) return [];
    const result = [
      +findValuesForDimensions(
        sourceData?.rows,
        [topSources[0], "date_range_0"],
        0
      ) || 0,
      +findValuesForDimensions(
        sourceData?.rows,
        [topSources[1], "date_range_0"],
        0
      ) || 0,
      +findValuesForDimensions(
        sourceData?.rows,
        [topSources[2], "date_range_0"],
        0
      ) || 0,
      +findValuesForDimensions(
        sourceData?.rows,
        [topSources[3], "date_range_0"],
        0
      ) || 0,
      +findValuesForDimensions(
        sourceData?.rows,
        [topSources[4], "date_range_0"],
        0
      ) || 0,
    ];
    const sum = result.reduce((a, b) => a + b, 0);
    const totalSum = findValuesForDimensions(sourceData?.rows, ["date_range_0"])
      ?.map((item) => +(item || 0))
      .reduce((a, b) => a + b, 0);

    result.push(totalSum - sum);

    return result;
  }, [sourceData]);

  const priorDataset = useMemo(() => {
    const topSources = findTopDimensions(
      sourceData?.rows,
      ["date_range_1"],
      5
    )?.map((item) => item?.[0]?.value);
    if (!sourceData) return [];
    const result = [
      +findValuesForDimensions(
        sourceData?.rows,
        [topSources[0], "date_range_1"],
        0
      ) || 0,
      +findValuesForDimensions(
        sourceData?.rows,
        [topSources[1], "date_range_1"],
        0
      ) || 0,
      +findValuesForDimensions(
        sourceData?.rows,
        [topSources[2], "date_range_1"],
        0
      ) || 0,
      +findValuesForDimensions(
        sourceData?.rows,
        [topSources[3], "date_range_1"],
        0
      ) || 0,
      +findValuesForDimensions(
        sourceData?.rows,
        [topSources[4], "date_range_1"],
        0
      ) || 0,
    ];
    const sum = result.reduce((a, b) => a + b, 0);
    const totalSum = findValuesForDimensions(sourceData?.rows, ["date_range_1"])
      ?.map((item) => +(item || 0))
      .reduce((a, b) => a + b, 0);

    result.push(totalSum - sum);

    return result;
  }, [sourceData]);

  const topSources = findTopDimensions(
    sourceData?.rows,
    ["date_range_0"],
    5
  )?.map((item) => item?.[0]?.value);

  const topSourceIncreased = useMemo(() => {
    if (!sourceData) return null;
    const topSources = findTopDimensions(
      sourceData?.rows,
      ["date_range_0"],
      5
    )?.map((item) => item?.[0]?.value);

    const percentageIncreases = topSources
      .map((source) => {
        const current = +findValuesForDimensions(
          sourceData?.rows,
          [source, "date_range_0"],
          0
        );
        const prior = +findValuesForDimensions(
          sourceData?.rows,
          [source, "date_range_1"],
          0
        );
        return {
          source,
          percentage:
            current && prior
              ? Math.floor(
                  (Math.abs(current - prior) / ((current + prior) / 2)) * 100
                )
              : 0,
        };
      })
      .sort((a, b) => b.percentage - a.percentage);

    return percentageIncreases?.[0];
  }, [sourceData]);

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
            labels: topSources,
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
            visibility: tooltipModel && !loading ? "visible" : "hidden",
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
              {topSources?.[tooltipModel?.dataIndex]}
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
        ) : topSourceIncreased?.source && topSourceIncreased?.percentage ? (
          <Typography
            sx={{ mb: 1 }}
            fontSize={10}
            color="text.secondary"
            fontWeight={600}
            lineHeight="12px"
          >
            {topSourceIncreased?.source} users increased by{" "}
            {topSourceIncreased?.percentage}%{" "}
            {dateRange0Label?.startsWith("Last") ? "in the" : ""}{" "}
            {dateRange0Label?.toLowerCase()}
          </Typography>
        ) : null}
        {loading ? (
          <Skeleton variant="rectangular" height="16px" width="50%" />
        ) : (
          <Box display="flex" flexWrap="wrap">
            {topSources?.map((item, index) => (
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
                    backgroundColor: SOURCE_LEGEND_COLORS[index],
                  }}
                />
                <Typography
                  variant="body3"
                  fontWeight={600}
                  color="text.secondary"
                >
                  {item}
                </Typography>
              </Box>
            ))}
            {topSources?.length ? (
              <Box key={5} display="flex" alignItems="center" gap={0.5} mr={1}>
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    backgroundColor: SOURCE_LEGEND_COLORS[5],
                  }}
                />
                <Typography
                  variant="body3"
                  fontWeight={600}
                  color="text.secondary"
                >
                  Other
                </Typography>
              </Box>
            ) : null}
          </Box>
        )}
      </Box>
    </>
  );
};
