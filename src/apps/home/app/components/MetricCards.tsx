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

export const MetricCards = () => {
  const instanceCreatedAtDate = useSelector(
    (state: any) => state.instance.createdAt
  );
  const is2MonthsOld = moment(date).diff(instanceCreatedAtDate, "months") >= 2;
  const { data: priorRequests, isFetching: isPriorRequestsFetching } =
    metricsApi.useGetRequestsQuery([
      moment(date).subtract(2, "months").format(),
      moment(date).subtract(1, "months").format(),
    ]);
  const { data: requests, isFetching: isRequestsFetching } =
    metricsApi.useGetRequestsQuery([
      moment(date).subtract(1, "months").format(),
      moment(date).format(),
    ]);
  const { data: priorUsage, isFetching: isPriorUsageFetching } =
    metricsApi.useGetUsageQuery([
      moment(date).subtract(2, "months").format(),
      moment(date).subtract(1, "months").format(),
    ]);
  const { data: usage, isFetching: isUsageFetching } =
    metricsApi.useGetUsageQuery([
      moment(date).subtract(1, "months").format(),
      moment(date).format(),
    ]);
  const { data: priorAudit, isFetching: isPriorAuditFetching } =
    useGetAuditsQuery({
      start_date: moment(date).subtract(2, "months").format("L"),
      end_date: moment(date).subtract(1, "months").format("L"),
    });
  const { data: audit, isFetching: isAuditFetching } = useGetAuditsQuery({
    start_date: moment(date).subtract(1, "months").format("L"),
    end_date: moment(date).format("L"),
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
          is2MonthsOld
            ? getDelta(priorRequests?.TotalRequests, requests?.TotalRequests)
            : null
        }
        deltaLabel={"VS Prior 30 Days"}
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
          is2MonthsOld
            ? getDelta(
                priorUsage?.MediaConsumption?.TotalRequests,
                usage?.MediaConsumption?.TotalRequests
              )
            : null
        }
        deltaLabel={"VS Prior 30 Days"}
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
        deltaLabel={"VS Prior 30 Days"}
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
        delta={is2MonthsOld ? getDelta(priorPublishes, publishes) : null}
        deltaLabel={"VS Prior 30 Days"}
        loading={auditFetching}
      />
    </Box>
  );
};
