import { Box } from "@mui/material";
import LanguageRoundedIcon from "@mui/icons-material/LanguageRounded";
import ImageRoundedIcon from "@mui/icons-material/ImageRounded";
import ScheduleRoundedIcon from "@mui/icons-material/ScheduleRounded";
import RemoveRedEyeRoundedIcon from "@mui/icons-material/RemoveRedEyeRounded";
import { metricsApi } from "../../../../shell/services/metrics";
import { subDays, differenceInCalendarDays, formatISO, format } from "date-fns";
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
    differenceInCalendarDays(date, new Date(instanceCreatedAtDate)) >=
    dateRange * 2;

  const startDate = subDays(date, dateRange);
  const endDate = date;
  const priorStartDate = subDays(date, dateRange * 2);
  const priorEndDate = subDays(date, dateRange);

  const { data: priorRequests, isFetching: isPriorRequestsFetching } =
    metricsApi.useGetRequestsQuery([
      formatISO(priorStartDate),
      formatISO(priorEndDate),
    ]);

  const { data: requests, isFetching: isRequestsFetching } =
    metricsApi.useGetRequestsQuery([formatISO(startDate), formatISO(endDate)]);
  const { data: priorUsage, isFetching: isPriorUsageFetching } =
    metricsApi.useGetUsageQuery([
      formatISO(priorStartDate),
      formatISO(priorEndDate),
    ]);
  const { data: usage, isFetching: isUsageFetching } =
    metricsApi.useGetUsageQuery([formatISO(startDate), formatISO(endDate)]);
  const { data: priorAudit, isFetching: isPriorAuditFetching } =
    useGetAuditsQuery({
      start_date: format(priorStartDate, "MM/dd/yyyy"),
      end_date: format(priorEndDate, "MM/dd/yyyy"),
    });
  const { data: audit, isFetching: isAuditFetching } = useGetAuditsQuery({
    start_date: format(startDate, "MM/dd/yyyy"),
    end_date: format(endDate, "MM/dd/yyyy"),
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
        deltaLabel={`VS Prior ${dateRange} Days`}
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
        deltaLabel={`VS Prior ${dateRange} Days`}
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
        deltaLabel={`VS Prior ${dateRange} Days`}
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
        deltaLabel={`VS Prior ${dateRange} Days`}
        loading={auditFetching}
      />
    </Box>
  );
};
