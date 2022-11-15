import { FC, useState, useMemo } from "react";
import { Box, Typography, Card } from "@mui/material";
import {
  useGetUsageQuery,
  useGetRequestsQuery,
} from "../../../../../shell/services/metrics";
// @ts-ignore
import { WithLoader } from "@zesty-io/core/WithLoader";
// @ts-ignore
import { Notice } from "@zesty-io/core";

import { MetricCard } from "../../../../../shell/components/MetricsCard";
import LanguageRoundedIcon from "@mui/icons-material/LanguageRounded";
import CloudRoundedIcon from "@mui/icons-material/CloudRounded";

const iconStyles = {
  height: "32px",
  borderRadius: "16px",
  padding: 1,
};

const numberWithCommas = (x: any) => {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

const getDates = (numDays: any) => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  const start = new Date();
  start.setDate(start.getDate() - numDays);

  return { start, end: yesterday };
};

export const InsightsMedia = () => {
  const [timePeriod, setTimePeriod] = useState(30);
  const { start, end } = getDates(timePeriod);
  const dates = useMemo(() => {
    return [start.toISOString(), end.toISOString()];
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

  const bodyProps = {
    usageData,
    requestData,
    StartDisplay,
    EndDisplay,
    timePeriod,
    requestError,
    usageError,
  };

  return (
    <WithLoader
      width="100%"
      height="calc(100vh - 54px)"
      condition={!usageLoading && !requestsLoading}
      message="Loading metrics"
    >
      <Body {...bodyProps} />
    </WithLoader>
  );
};

const Body: FC<any> = ({
  requestData,
  usageData,
  requestError,
  usageError,
  ...rest
}) => {
  if (requestError)
    return (
      <Notice>
        An error occured while loading metrics: {requestError.message}
      </Notice>
    );
  else if (usageError)
    return (
      <Notice>
        An error occured while loading metrics: {usageError.message}
      </Notice>
    );
  else
    return (
      <Content requestData={requestData} usageData={usageData} {...rest} />
    );
};

export const Content: FC<any> = ({
  usageData,
  requestData,
  StartDisplay,
  EndDisplay,
  timePeriod,
}) => {
  const totalMediaThroughput = usageData.MediaConsumption.TotalGBs;
  const totalMediaRequests = usageData.MediaConsumption.TotalRequests;

  const totalRequestThroughput = requestData.TotalThroughputGB;
  const totalPageRequests = requestData.TotalRequests;

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
                backgroundColor: "deepOrange.50",
              }}
            >
              <ImageRoundedIcon
                color="primary"
                sx={{ width: "16px", height: "16px" }}
              />
            </Box>
          }
          delta={-0.5}
          deltaLabel={"VS PREV. 30 DAYS"}
        />
        <MetricCard
          title="Media Bandwidth"
          value={totalThroughput}
          symbol="GB"
          icon={
            <Box
              sx={{
                ...iconStyles,
                backgroundColor: "deepOrange.50",
              }}
            >
              <ImageRoundedIcon
                color="primary"
                sx={{ width: "16px", height: "16px" }}
              />
            </Box>
          }
          delta={-0.5}
          deltaLabel={"VS PREV. 30 DAYS"}
        />
      </Box>
    </Box>
  );
};
