import { Button, Box, Typography, Tooltip } from "@mui/material";
import { ThemeProvider } from "@mui/material/styles";
import { theme } from "@zesty-io/material";
import { AddRounded } from "@mui/icons-material";
import {
  useGetAllPublishingsQuery,
  useGetAuditsQuery,
  useGetContentModelQuery,
  useGetInstanceSettingsQuery,
} from "../../../../../../shell/services/instance";
import moment from "moment-timezone";
import { useHistory } from "react-router";
import { useState } from "react";
import { CreateContentItemDialog } from "../../../../../../shell/components/CreateContentItemDialog";
import { AnalyticsDateFilter } from "../../components/AnalyticsDateFilter";
import { useSelector } from "react-redux";
import { AppState } from "../../../../../../shell/store/types";
import { AnalyticsPropertySelector } from "../../components/AnalyticsPropertySelector";
import { Metric } from "../ItemEdit/Analytics/components/Metric";
import { useGetAnalyticsPropertyDataByQueryQuery } from "../../../../../../shell/services/cloudFunctions";
import {
  findValuesForDimensions,
  getDateRangeAndLabelsFromParams,
} from "./utils";
import { ByDayLineChart } from "./ByDayLineChart";
import { useParams as useQueryParams } from "../../../../../../shell/hooks/useParams";

const AnalyticsDashboard = () => {
  const [params, setParams] = useQueryParams();
  const instance = useSelector((state: AppState) => state.instance);
  const { data: instanceSettings, isFetching: instanceSettingsFetching } =
    useGetInstanceSettingsQuery();
  const propertyId = instanceSettings?.find(
    (setting) => setting.key === "google_property_id"
  )?.value;

  const [startDate, endDate, dateRange0Label, dateRange1Label] =
    getDateRangeAndLabelsFromParams(params);

  const {
    data: ga4Data,
    isFetching,
    isError,
    refetch,
  } = useGetAnalyticsPropertyDataByQueryQuery(
    {
      property: propertyId,
      requests: [
        {
          // query for overall session, duration, bounce and conversion
          metrics: [
            {
              name: "sessions",
            },
            {
              name: "averageSessionDuration",
            },
            {
              name: "bounceRate",
            },
            {
              name: "conversions",
            },
          ],
          dateRanges: [
            {
              startDate: "2023-05-15",
              endDate: "2023-05-30",
            },
            {
              startDate: "2023-05-01",
              endDate: "2023-05-15",
            },
          ],
        },
        {
          // query for daily and total sessions
          dimensions: [
            {
              name: "date",
            },
          ],
          metrics: [
            {
              name: "sessions",
            },
          ],
          dateRanges: [
            {
              startDate: startDate?.format("YYYY-MM-DD"),
              endDate: endDate?.format("YYYY-MM-DD"),
            },
            {
              startDate: startDate
                ?.clone()
                ?.subtract(endDate.diff(startDate, "days") || 1, "days")
                ?.format("YYYY-MM-DD"),
              endDate: startDate?.format("YYYY-MM-DD"),
            },
          ],
          orderBys: [
            {
              dimension: {
                dimensionName: "date",
              },
            },
          ],
        },
        {
          // query user traffic default channel

          dimensions: [
            {
              name: "firstUserDefaultChannelGroup",
            },
          ],
          metrics: [
            {
              name: "sessions",
            },
          ],
          dateRanges: [
            {
              startDate: "2023-05-15",
              endDate: "2023-05-30",
            },
            {
              startDate: "2023-05-01",
              endDate: "2023-05-15",
            },
          ],
          metricAggregations: ["TOTAL"],
        },
        {
          // query for new vs returning
          dimensions: [
            {
              name: "newVsReturning",
            },
          ],
          metrics: [
            {
              name: "totalUsers",
            },
          ],
          dateRanges: [
            {
              startDate: "2023-05-15",
              endDate: "2023-05-30",
            },
            {
              startDate: "2023-05-01",
              endDate: "2023-05-15",
            },
          ],
          metricAggregations: ["TOTAL"],
        },
      ],
    },
    { skip: !propertyId }
  );

  const [
    metricsReport,
    dailySessionsReport,
    userTrafficReport,
    newVsReturningReport,
  ] = ga4Data?.reports || [];

  console.log("testing", metricsReport, dailySessionsReport);

  return (
    <ThemeProvider theme={theme}>
      <Box
        color={theme.palette.text.primary}
        bgcolor={theme.palette.grey[50]}
        boxSizing="border-box"
      >
        <AnalyticsDashboardHeader />
        <Box px={2}>
          <Box display="flex" py={2} justifyContent="space-between">
            <AnalyticsDateFilter showSkeleton={false} />
            <Typography variant="h6" fontWeight="600" maxWidth={304} noWrap>
              {instance.name}
            </Typography>
            <AnalyticsPropertySelector />
          </Box>
          <Box
            borderRadius={"8px"}
            gap={2}
            p={2}
            border={(theme) => `1px solid ${theme.palette.border}`}
            bgcolor="background.paper"
            display="flex"
          >
            <Metric
              title="Total Sessions"
              value={
                +(
                  findValuesForDimensions(
                    metricsReport?.rows,
                    ["date_range_0"],
                    0
                  ) || 0
                )
              }
              priorValue={
                +(
                  findValuesForDimensions(
                    metricsReport?.rows,
                    ["date_range_1"],
                    0
                  ) || 0
                )
              }
              description="A session in Google Analytics is a period of time in which a user interacts with your website."
            />
            <ByDayLineChart
              startDate={startDate}
              endDate={endDate}
              dateRange0Label={dateRange0Label}
              dateRange1Label={dateRange1Label}
              data={dailySessionsReport}
              loading={isFetching}
            />
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default AnalyticsDashboard;

const AnalyticsDashboardHeader = () => {
  const { data: publishings } = useGetAllPublishingsQuery();
  const { data: audit } = useGetAuditsQuery({
    start_date: moment().utc().subtract(1, "month").format("YYYY-MM-DD"),
    end_date: moment().utc().format("YYYY-MM-DD"),
  });
  const [showCreateContentItemDialog, setShowCreateContentItemDialog] =
    useState(false);

  const usedModelsCounts = audit
    ?.filter((a: any) => a.resourceType === "content" && a.action === 1)
    ?.map((a: any) => a?.meta?.uri?.split("/")[4])
    .reduce((acc, value) => {
      if (value in acc) {
        acc[value]++;
      } else {
        acc[value] = 1;
      }
      return acc;
    }, {});

  const topUsedModels = Object.entries(usedModelsCounts || {})
    ?.sort((a: any, b: any) => b[1] - a[1])
    ?.slice(0, 4);

  return (
    <>
      <Box
        display="flex"
        justifyContent="space-between"
        p={2}
        borderBottom={`1px inset ${theme.palette.border}`}
        bgcolor={theme.palette.background.paper}
      >
        <Typography variant="h5" fontWeight="600">
          Dashboard
        </Typography>
        <Box display="flex" gap={1.5}>
          {topUsedModels?.reverse()?.map((model: any) => (
            <CreateItemButton modelZUID={model[0]} />
          ))}
          <Button
            variant="contained"
            size="small"
            startIcon={<AddRounded />}
            onClick={() => setShowCreateContentItemDialog(true)}
          >
            Create
          </Button>
        </Box>
      </Box>
      {showCreateContentItemDialog && (
        <CreateContentItemDialog
          open
          onClose={() => setShowCreateContentItemDialog(false)}
        />
      )}
    </>
  );
};

const CreateItemButton = ({ modelZUID }: { modelZUID: string }) => {
  const { data: model, isError } = useGetContentModelQuery(modelZUID);
  const history = useHistory();

  return (
    <Button
      sx={{ display: isError && "none" }}
      variant="outlined"
      size="small"
      color="inherit"
      startIcon={<AddRounded color="action" />}
      onClick={() => history.push(`/content/${model.ZUID}/new`)}
    >
      <Tooltip title={model?.label} placement="bottom" arrow enterDelay={1000}>
        <Typography sx={{ maxWidth: "74px" }} variant="body2" noWrap>
          {model?.label}
        </Typography>
      </Tooltip>
    </Button>
  );
};
