import { FC, useState, useMemo } from "react";
import { Box, Typography, Card } from "@mui/material";
import {
  useGetUsageQuery,
  useGetRequestsQuery,
} from "../../../../../shell/services/metrics";

import { MetricCard } from "../../../../../shell/components/MetricsCard";
import LanguageRoundedIcon from "@mui/icons-material/LanguageRounded";
import CloudRoundedIcon from "@mui/icons-material/CloudRounded";
import moment from "moment";

const iconStyles = {
  height: "32px",
  borderRadius: "16px",
  padding: 1,
};

const getDates = (numDays: any) => {
  const start = new Date();
  start.setDate(start.getDate() - numDays);

  const end = moment().subtract(30, "days").toISOString();

  return { start, end };
};

export const InsightsMedia: FC<any> = ({}) => {
  const [timePeriod, setTimePeriod] = useState(30);
  const { start, end } = getDates(timePeriod);
  const dates = useMemo(() => {
    return [start.toISOString(), end];
  }, [timePeriod]);

  const StartDisplay = start.toString().split(" ").slice(0, 3).join(" ");
  const EndDisplay = end.toString().split(" ").slice(0, 3).join(" ");

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
      <Box sx={{ display: "flex" }}>
        <MetricCard
          title="Media Requests"
          value={totalRequests}
          icon={
            <Box
              sx={{
                ...iconStyles,
                backgroundColor: "purple.50",
              }}
            >
              <LanguageRoundedIcon
                color="primary"
                sx={{ width: "16px", height: "16px", color: "purple.500" }}
              />
            </Box>
          }
          deltaLabel={"from last 30 days"}
        />
        <MetricCard
          title="Media Bandwidth"
          value={totalThroughput}
          symbol="GB"
          icon={
            <Box
              sx={{
                ...iconStyles,
                backgroundColor: "blue.50",
              }}
            >
              <CloudRoundedIcon
                color="primary"
                sx={{ width: "16px", height: "16px", color: "info.main" }}
              />
            </Box>
          }
          deltaLabel={"from last 30 days"}
        />
      </Box>
    </Box>
  );
};
