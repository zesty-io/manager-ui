import {
  Button,
  Box,
  Typography,
  Tooltip,
  Divider,
  Skeleton,
} from "@mui/material";
import { ThemeProvider } from "@mui/material/styles";
import { theme } from "@zesty-io/material";
import { AddRounded } from "@mui/icons-material";
import {
  useGetAuditsQuery,
  useGetContentModelQuery,
  useGetInstanceSettingsQuery,
} from "../../../../../../../../shell/services/instance";
import moment from "moment-timezone";
import { useHistory } from "react-router";
import { useState } from "react";
import { CreateContentItemDialog } from "../../../../../../../../shell/components/CreateContentItemDialog";
import { AnalyticsDateFilter } from "../../components/AnalyticsDateFilter";
import { useSelector } from "react-redux";
import { AppState } from "../../../../../../../../shell/store/types";
import { Metric } from "../../components/Metric";
import { useGetAnalyticsPropertyDataByQueryQuery } from "../../../../../../../../shell/services/cloudFunctions";
import {
  convertSecondsToMinutesAndSeconds,
  findValuesForDimensions,
  generateDateRangesForReport,
  getDateRangeAndLabelsFromParams,
} from "../../utils";
import { ByDayLineChart } from "./ByDayLineChart";
import { useParams as useQueryParams } from "../../../../../../../../shell/hooks/useParams";
import { UsersDoughnutChart } from "./UsersDoughutChart";
import { AnalyticsPropertySelector } from "../../components/AnalyticsPropertySelector";
import { ItemsTable } from "./ItemsTable/ItemsTable";
import SupportAgentRoundedIcon from "@mui/icons-material/SupportAgentRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import instanceZUID from "../../../../../../../../utility/instanceZUID";
import { NotFound } from "../../../../../../../../shell/components/NotFound";

type Props = {
  loading: boolean;
};

const AnalyticsDashboard = ({ loading }: Props) => {
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
              name: "eventCount",
            },
            {
              name: "conversions",
            },
          ],
          dateRanges: generateDateRangesForReport(startDate, endDate),
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
          dateRanges: generateDateRangesForReport(startDate, endDate),
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
          dateRanges: generateDateRangesForReport(startDate, endDate),
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
          dateRanges: generateDateRangesForReport(startDate, endDate),
        },
      ],
    },
    { skip: !propertyId }
  );

  const [
    metricsReport,
    dailySessionsReport,
    userSourcesReport,
    newVsReturningReport,
  ] = ga4Data?.reports || [];

  const isLoading = isFetching || instanceSettingsFetching || loading;

  if (isError) {
    return (
      <NotFound
        title="Unable to Load Analytics Data"
        message="This may be due to a bad internet connection so please try again. If you are still unable to resolve this issue, please contact support."
        button={
          <>
            <Button
              startIcon={<SupportAgentRoundedIcon color="action" />}
              variant="contained"
              color="inherit"
              sx={{ mr: 2 }}
              onClick={() =>
                window.open(
                  `https://www.zesty.io/instances/${instanceZUID}/support/`
                )
              }
            >
              Contact Support
            </Button>
            <Button
              startIcon={<RefreshRoundedIcon />}
              variant="contained"
              onClick={() => refetch()}
            >
              Try Again
            </Button>
          </>
        }
      />
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <Box
        color={theme.palette.text.primary}
        bgcolor={theme.palette.grey[50]}
        boxSizing="border-box"
        display="flex"
        flexDirection="column"
        height="100%"
      >
        <AnalyticsDashboardHeader />
        <Box pb={8} px={2} overflow="auto" height="100%">
          <Box display="flex" py={2} justifyContent="space-between">
            <AnalyticsDateFilter />
            <Typography variant="h6" fontWeight="600" maxWidth={304} noWrap>
              {instance.name}
            </Typography>
            <AnalyticsPropertySelector />
          </Box>
          <Box display="flex" gap={2}>
            <Box
              borderRadius={"8px"}
              gap={2}
              p={2}
              border={(theme) => `1px solid ${theme.palette.border}`}
              bgcolor="background.paper"
              display="flex"
              width="55%"
            >
              <Box minWidth="120px">
                {isLoading ? (
                  <Skeleton
                    variant="rectangular"
                    width="100%"
                    height="32px"
                    sx={{ bgcolor: "grey.200" }}
                  />
                ) : (
                  <>
                    <Typography variant="body2" fontWeight="600">
                      Total Sessions
                    </Typography>
                    <Typography
                      variant="body3"
                      fontWeight="600"
                      color="text.secondary"
                    >
                      {dateRange0Label}
                    </Typography>
                  </>
                )}
                <Box mt={2}>
                  <Metric
                    loading={isLoading}
                    valueProps={{
                      variant: "h3",
                    }}
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
                  />
                </Box>
              </Box>
              <ByDayLineChart
                startDate={startDate}
                endDate={endDate}
                dateRange0Label={dateRange0Label}
                dateRange1Label={dateRange1Label}
                data={dailySessionsReport}
                loading={isLoading}
              />
            </Box>
            <Box
              borderRadius={"8px"}
              gap={2}
              p={2}
              border={(theme) => `1px solid ${theme.palette.border}`}
              bgcolor="background.paper"
              display="flex"
              width="55%"
            >
              <UsersDoughnutChart
                startDate={startDate}
                endDate={endDate}
                dateRange0Label={dateRange0Label}
                dateRange1Label={dateRange1Label}
                usersData={newVsReturningReport}
                sourceData={userSourcesReport}
                loading={isLoading}
              />
            </Box>
          </Box>
          <Box
            display="flex"
            justifyContent={"space-between"}
            borderRadius={"8px"}
            gap={2}
            p={2}
            mt={2}
            bgcolor="background.paper"
            border={(theme) => `1px solid ${theme.palette.border}`}
          >
            <Metric
              loading={isLoading}
              title="Sessions"
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
            <Divider orientation="vertical" flexItem />
            <Metric
              loading={isLoading}
              title="Avg. Duration"
              formatter={convertSecondsToMinutesAndSeconds}
              value={
                +(
                  findValuesForDimensions(
                    metricsReport?.rows,
                    ["date_range_0"],
                    1
                  ) || 0
                )
              }
              priorValue={
                +(
                  findValuesForDimensions(
                    metricsReport?.rows,
                    ["date_range_1"],
                    1
                  ) || 0
                )
              }
              description="Session duration is the time frame during which there are users interactions occurring on the website."
            />
            <Divider orientation="vertical" flexItem />
            <Metric
              loading={isLoading}
              inverse
              title="Bounce Rate"
              formatter={(value: number) => `${Math.floor(value * 100)}%`}
              value={
                +(
                  findValuesForDimensions(
                    metricsReport?.rows,
                    ["date_range_0"],
                    2
                  ) || 0
                )
              }
              priorValue={
                +(
                  findValuesForDimensions(
                    metricsReport?.rows,
                    ["date_range_1"],
                    2
                  ) || 0
                )
              }
              description="Bounce rate is the percentage of people who land on a page and leave without performing a specific action."
            />
            <Divider orientation="vertical" flexItem />
            <Metric
              loading={isLoading}
              title="Events"
              value={
                +(
                  findValuesForDimensions(
                    metricsReport?.rows,
                    ["date_range_0"],
                    3
                  ) || 0
                )
              }
              priorValue={
                +(
                  findValuesForDimensions(
                    metricsReport?.rows,
                    ["date_range_1"],
                    3
                  ) || 0
                )
              }
              description="A conversion is a user action that you count because you consider it important, such as a purchase, game level completion, or website or app scroll activity."
            />
            <Divider orientation="vertical" flexItem />
            <Metric
              loading={isLoading}
              title="Conversions"
              value={
                +(
                  findValuesForDimensions(
                    metricsReport?.rows,
                    ["date_range_0"],
                    4
                  ) || 0
                )
              }
              priorValue={
                +(
                  findValuesForDimensions(
                    metricsReport?.rows,
                    ["date_range_1"],
                    4
                  ) || 0
                )
              }
              description="A conversion is a user action that you count because you consider it important, such as a purchase, game level completion, or website or app scroll activity."
            />
          </Box>
          <Box mt={2}>
            <ItemsTable
              propertyId={propertyId}
              startDate={startDate}
              endDate={endDate}
            />
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default AnalyticsDashboard;

const AnalyticsDashboardHeader = () => {
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
