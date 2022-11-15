import { FC, useState, useMemo } from "react";
import { Box, Typography, Card } from "@mui/material";
import {
  useGetUsageQuery,
  useGetRequestsQuery,
} from "../../../../../shell/services/metrics";

import { MetricCard } from "../../../../../shell/components/MetricsCard";
import SendRoundedIcon from "@mui/icons-material/SendRounded";
import CloudRoundedIcon from "@mui/icons-material/CloudRounded";
import moment from "moment";

const iconStyles = {
  height: "32px",
  borderRadius: "16px",
  padding: 1,
};

const getDates = (numDays: number) => {
  const start = new Date();
  start.setDate(start.getDate() - numDays);

  const end = moment().subtract(30, "days").toISOString();

  return { start, end };
};

export const InsightsMedia: FC = () => {
  const [timePeriod, setTimePeriod] = useState(30);
  const { start, end } = getDates(timePeriod);
  const dates = useMemo(() => {
    return [start.toISOString(), end];
  }, [timePeriod]);

  const {
    data: usageData,
    isLoading: usageLoading,
    error: usageError,
    // @ts-ignore
  } = useGetUsageQuery(dates);
  const {
    data: requestData,
    isLoading: requestsLoading,
    error: requestError,
    // @ts-ignore
  } = useGetRequestsQuery(dates);

  const totalMediaThroughput = usageData?.MediaConsumption.TotalGBs;
  const totalMediaRequests = usageData?.MediaConsumption.TotalRequests;

  const totalRequestThroughput = requestData?.TotalThroughputGB;
  const totalPageRequests = requestData?.TotalRequests;

  const totalRequests = totalPageRequests + totalMediaRequests;
  const totalThroughput = totalMediaThroughput + totalRequestThroughput;

  return (
    <Box
      component="main"
      sx={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        height: "100%",
        py: 2,
        px: 3,
      }}
    >
      <Box sx={{ height: "64px" }}>
        <Typography variant="h4" fontWeight={600}>
          Insights
        </Typography>
      </Box>
      <Box sx={{ display: "flex", gap: 2 }}>
        <MetricCard
          title="Media Requests"
          value={totalRequests || 0}
          icon={
            <Box
              sx={{
                ...iconStyles,
                backgroundColor: "blue.50",
              }}
            >
              <SendRoundedIcon
                color="info"
                sx={{
                  width: "16px",
                  height: "16px",
                }}
              />
            </Box>
          }
          deltaLabel={"VS PRIOR 30 DAYS"}
        />
        <MetricCard
          title="Media Bandwidth"
          value={totalThroughput || 0}
          symbol="GB"
          icon={
            <Box
              sx={{
                ...iconStyles,
                backgroundColor: "deepOrange.50",
              }}
            >
              <CloudRoundedIcon
                color="primary"
                sx={{ width: "16px", height: "16px", color: "primary" }}
              />
            </Box>
          }
          deltaLabel={"VS PRIOR 30 DAYS"}
        />
      </Box>
    </Box>
  );
};
