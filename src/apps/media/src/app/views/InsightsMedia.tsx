import { FC, useState, useMemo } from "react";
import { Box, Typography, Card } from "@mui/material";
import { useSelector } from "react-redux";
import {
  useGetUsageQuery,
  useGetRequestsQuery,
} from "../../../../../shell/services/metrics";

import { MetricCard } from "../../../../../shell/components/MetricsCard";
import SendRoundedIcon from "@mui/icons-material/SendRounded";
import CloudRoundedIcon from "@mui/icons-material/CloudRounded";
import moment from "moment";
import { InsightsTable } from "../components/InsightsTable";
import {
  useGetAllBinFilesQuery,
  useGetBinsQuery,
} from "../../../../../shell/services/mediaManager";
import { AppState } from "../../../../../shell/store/types";
import { uniqBy } from "lodash";

const iconStyles = {
  height: "32px",
  borderRadius: "16px",
  padding: 1,
};

const date = new Date();

export const InsightsMedia: FC = () => {
  const instanceId = useSelector((state: AppState) => state.instance.ID);
  const ecoId = useSelector((state: AppState) => state.instance.ecoID);
  const instanceCreatedAtDate = useSelector(
    (state: any) => state.instance.createdAt
  );
  const is2MonthsOld = moment(date).diff(instanceCreatedAtDate, "months") >= 2;
  const { data: bins, isFetching: isBinsFetching } = useGetBinsQuery({
    instanceId,
    ecoId,
  });
  const { data: files, isFetching: isFilesFetching } = useGetAllBinFilesQuery(
    bins?.map((bin) => bin.id),
    { skip: !bins?.length }
  );
  const { data: priorUsage, isFetching: isPriorUsageFetching } =
    useGetUsageQuery([
      moment(date).subtract(2, "months").format(),
      moment(date).subtract(1, "months").format(),
    ]);
  const { data: usage, isFetching: isUsageFetching } = useGetUsageQuery([
    moment(date).subtract(1, "months").format(),
    moment(date).format(),
  ]);

  const getDelta = (prior: number, current: number) =>
    (current - prior) / ((current + prior) / 2);

  const usageFetching = isPriorUsageFetching || isUsageFetching;

  const totalMediaThroughput = usage?.MediaConsumption.TotalGBs;
  const totalMediaRequests = usage?.MediaConsumption.TotalRequests;

  return (
    <Box
      component="main"
      sx={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        height: "100%",
      }}
    >
      <Box sx={{ height: "64px", py: 2, px: 3 }}>
        <Typography variant="h4" fontWeight={600}>
          Insights
        </Typography>
      </Box>
      <Box sx={{ display: "flex", gap: 2, py: 2, px: 3 }}>
        <MetricCard
          title="Media Requests"
          value={totalMediaRequests || 0}
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
          delta={
            is2MonthsOld
              ? getDelta(
                  priorUsage?.MediaConsumption?.TotalRequests,
                  usage?.MediaConsumption?.TotalRequests
                )
              : null
          }
          deltaLabel={"from last 30 days"}
          loading={usageFetching}
        />
        <MetricCard
          title="Media Bandwidth"
          value={totalMediaThroughput || 0}
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
          delta={
            is2MonthsOld
              ? getDelta(
                  priorUsage?.MediaConsumption?.TotalGBs,
                  usage?.MediaConsumption?.TotalGBs
                )
              : null
          }
          deltaLabel={"from last 30 days"}
          loading={usageFetching}
        />
      </Box>
      <InsightsTable
        files={uniqBy(
          usage?.TopMedia?.map((file: any, key: number) => ({
            id: key,
            ...file,
            ...(files?.find((f) => f.url === file.FullPath?.split("?")?.[0]) ||
              {}),
          })),
          "id"
        ).filter((file: any) =>
          files?.find((f) => f.url === file.FullPath?.split("?")?.[0])
        )}
        loading={isFilesFetching || usageFetching || isBinsFetching}
      />
    </Box>
  );
};
