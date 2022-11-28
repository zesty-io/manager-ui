import { Box } from "@mui/material";
import LanguageRoundedIcon from "@mui/icons-material/LanguageRounded";
import ImageRoundedIcon from "@mui/icons-material/ImageRounded";
import ScheduleRoundedIcon from "@mui/icons-material/ScheduleRounded";
import RemoveRedEyeRoundedIcon from "@mui/icons-material/RemoveRedEyeRounded";
import { metricsApi } from "../../../../shell/services/metrics";
import moment from "moment";
import { useGetAuditsQuery } from "../../../../shell/services/instance";
import { uniqBy } from "lodash";
import { MetricCard } from "../../../../shell/components/MetricsCard";
import { useSelector } from "react-redux";

const iconStyles = {
  height: "32px",
  borderRadius: "16px",
  padding: 1,
};

const date = new Date();

interface Props {
  dateRange: number;
}

export const MetricCards = ({ dateRange }: Props) => {
  const instanceCreatedAtDate = useSelector(
    (state: any) => state.instance.createdAt
  );
  const hasPriorData =
    moment(date).diff(instanceCreatedAtDate, "days") >= dateRange * 2;

  const startDate = moment(date).subtract(dateRange, "days");
  const endDate = moment(date);
  const priorStartDate = moment(date).subtract(dateRange * 2, "days");
  const priorEndDate = moment(date).subtract(dateRange, "days");

  const { data: priorRequests, isFetching: isPriorRequestsFetching } =
    metricsApi.useGetRequestsQuery([
      priorStartDate.format(),
      priorEndDate.format(),
    ]);
  const { data: requests, isFetching: isRequestsFetching } =
    metricsApi.useGetRequestsQuery([startDate.format(), endDate.format()]);
  const { data: priorUsage, isFetching: isPriorUsageFetching } =
    metricsApi.useGetUsageQuery([
      priorStartDate.format(),
      priorEndDate.format(),
    ]);
  const { data: usage, isFetching: isUsageFetching } =
    metricsApi.useGetUsageQuery([startDate.format(), endDate.format()]);
  const { data: priorAudit, isFetching: isPriorAuditFetching } =
    useGetAuditsQuery({
      start_date: priorStartDate.format("L"),
      end_date: priorEndDate.format("L"),
    });
  const { data: audit, isFetching: isAuditFetching } = useGetAuditsQuery({
    start_date: startDate.format("L"),
    end_date: endDate.format("L"),
  });
  const requestsFetching = isPriorRequestsFetching || isRequestsFetching;
  const usageFetching = isPriorUsageFetching || isUsageFetching;
  const auditFetching = isPriorAuditFetching || isAuditFetching;

  const getUniqueActions = (data: any, action: number) =>
    uniqBy(
      data?.filter((item: any) => item?.action === action),
      "affectedZUID"
    )?.length;

  const getDelta = (prior: number, current: number) =>
    (current - prior) / ((current + prior) / 2);

  const scheduledPublishes = getUniqueActions(audit, 6);
  const priorScheduledPublishes = getUniqueActions(priorAudit, 6);
  const publishes = getUniqueActions(audit, 4);
  const priorPublishes = getUniqueActions(priorAudit, 4);

  return (
    <Box display="flex" gap={2}>
      <MetricCard
        title="Web Requests"
        value={requests?.TotalRequests}
        icon={
          <Box
            sx={{
              ...iconStyles,
              backgroundColor: "blue.50",
            }}
          >
            <LanguageRoundedIcon
              color="info"
              sx={{ width: "16px", height: "16px" }}
            />
          </Box>
        }
        delta={
          hasPriorData
            ? getDelta(priorRequests?.TotalRequests, requests?.TotalRequests)
            : null
        }
        deltaLabel={`VS PRIOR ${dateRange} DAYS`}
        loading={requestsFetching}
      />
      <MetricCard
        title="Media Requests"
        value={usage?.MediaConsumption?.TotalRequests}
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
        delta={
          hasPriorData
            ? getDelta(
                priorUsage?.MediaConsumption?.TotalRequests,
                usage?.MediaConsumption?.TotalRequests
              )
            : null
        }
        deltaLabel={`VS PRIOR ${dateRange} DAYS`}
        loading={usageFetching}
      />
      {/* <MetricCard
        title="Items Scheduled"
        value={scheduledPublishes}
        icon={
          <Box
            sx={{
              ...iconStyles,
              backgroundColor: "purple.50",
            }}
          >
            <ScheduleRoundedIcon
              sx={{ width: "16px", height: "16px", color: "purple.500" }}
            />
          </Box>
        }
        delta={
          is2MonthsOld
            ? getDelta(priorScheduledPublishes, scheduledPublishes)
            : null
        }
        deltaLabel={`VS PRIOR ${dateRange} DAYS`}
        loading={auditFetching}
      /> */}
      <MetricCard
        title="Items Published"
        value={publishes}
        icon={
          <Box
            sx={{
              ...iconStyles,
              backgroundColor: "green.50",
            }}
          >
            <RemoveRedEyeRoundedIcon
              color="success"
              sx={{ width: "16px", height: "16px" }}
            />
          </Box>
        }
        delta={hasPriorData ? getDelta(priorPublishes, publishes) : null}
        deltaLabel={`VS PRIOR ${dateRange} DAYS`}
        loading={auditFetching}
      />
    </Box>
  );
};
