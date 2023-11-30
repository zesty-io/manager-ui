import { useState, useMemo } from "react";
import {
  Button,
  Box,
  ButtonGroup,
  Divider,
  Typography,
  Skeleton,
} from "@mui/material";
import SupportAgentRoundedIcon from "@mui/icons-material/SupportAgentRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import { UsersDoughnutChart } from "./UsersDoughnutChart";
import { ByDayLineChart } from "./ByDayLineChart";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import {
  useGetAuditsQuery,
  useGetContentItemQuery,
  useGetInstanceSettingsQuery,
} from "../../../../../../../../shell/services/instance";
import { UsersBarChart } from "./UsersBarChart";
import { useParams as useQueryParams } from "../../../../../../../../shell/hooks/useParams";
import { useHistory, useParams } from "react-router-dom";
import { useGetAnalyticsPropertyDataByQueryQuery } from "../../../../../../../../shell/services/cloudFunctions";
import {
  convertSecondsToMinutesAndSeconds,
  findValuesForDimensions,
  generateReportRequests,
  getDateRangeAndLabelsFromParams,
} from "../../utils";
import { Metric } from "../../components/Metric";
import { useGetAnalyticsPropertiesQuery } from "../../../../../../../../shell/services/cloudFunctions";
import instanceZUID from "../../../../../../../../utility/instanceZUID";
import { NotFound } from "../../../../../../../../shell/components/NotFound";
import WarningRoundedIcon from "@mui/icons-material/WarningRounded";
import CompareArrowsRoundedIcon from "@mui/icons-material/CompareArrowsRounded";
import { CompareDialog } from "../../components/CompareDialog";
import { AnalyticsDateFilter } from "../../components/AnalyticsDateFilter";
import { ContentItem } from "../../../../../../../../shell/services/types";
import { AnalyticsPropertySelector } from "../../components/AnalyticsPropertySelector";

type Props = {
  item: ContentItem;
  loading: boolean;
};

export const SinglePageAnalytics = ({ item, loading }: Props) => {
  const [showCompareDialog, setShowCompareDialog] = useState(false);
  const [params, setParams] = useQueryParams();
  const compareItemZUID = params.get("compare");
  const { data: compareItem } = useGetContentItemQuery(compareItemZUID, {
    skip: !compareItemZUID,
  });
  const { modelZUID, itemZUID } = useParams<{
    modelZUID: string;
    itemZUID: string;
  }>();
  const history = useHistory();

  const { data } = useGetAnalyticsPropertiesQuery();
  const { data: instanceSettings, isFetching: instanceSettingsFetching } =
    useGetInstanceSettingsQuery();
  const propertyId = instanceSettings?.find(
    (setting) => setting.key === "google_property_id"
  )?.value;

  const propertyData = data?.properties?.find(
    (property: any) => property.name === propertyId
  );

  const [startDate, endDate, dateRange0Label, dateRange1Label] =
    getDateRangeAndLabelsFromParams(params);

  const {
    data: ga4Data,
    isFetching,
    isError,
    refetch,
  } = useGetAnalyticsPropertyDataByQueryQuery(
    generateReportRequests(propertyId, item.web.path, startDate, endDate),
    {
      skip: !startDate || !endDate || !propertyId,
    }
  );
  const [
    metricsReport,
    totalUsersReport,
    usersBySourceReport,
    usersByCountryReport,
    usersByDayReport,
  ] = ga4Data?.reports || [];

  const { data: compareGa4Data, isFetching: isFetchingCompare } =
    useGetAnalyticsPropertyDataByQueryQuery(
      generateReportRequests(
        propertyId,
        compareItem?.web?.path,
        startDate,
        endDate,
        false
      ),
      {
        skip: !startDate || !endDate || !propertyId || !compareItem?.web?.path,
      }
    );

  const [
    comparedMetricsReport,
    comparedTotalUsersReport,
    comparedUsersBySourceReport,
    comparedUsersByCountryReport,
    comparedUsersByDayReport,
  ] = compareGa4Data?.reports || [];

  console.log("metrics", comparedMetricsReport);
  console.log("total", comparedTotalUsersReport);

  const { data: auditData } = useGetAuditsQuery({
    // Start of content item version support in audit
    start_date: "05/25/2023",
    affectedZUID: itemZUID,
  });

  const isLoading =
    isFetching || instanceSettingsFetching || isFetchingCompare || loading;

  const averageEngagementTime = useMemo(() => {
    // Get all user count
    const dr0New =
      +findValuesForDimensions(
        totalUsersReport?.rows,
        ["date_range_0", "new"],
        0
      ) ?? 0;
    const dr0Returning =
      +findValuesForDimensions(
        totalUsersReport?.rows,
        ["date_range_0", "returning"],
        0
      ) ?? 0;
    const dr1New =
      +findValuesForDimensions(
        totalUsersReport?.rows,
        ["date_range_1", "new"],
        0
      ) ?? 0;
    const dr1Returning =
      +findValuesForDimensions(
        totalUsersReport?.rows,
        ["date_range_1", "returning"],
        0
      ) ?? 0;
    const dr0TotalUsers = dr0New + dr0Returning ?? 0;
    const dr1TotalUsers = dr1New + dr1Returning ?? 0;

    // Get total engagement time
    const dr0EngagementTime =
      +findValuesForDimensions(metricsReport?.rows, ["date_range_0"], 4) ?? 0;
    const dr1EngagementTime =
      +findValuesForDimensions(metricsReport?.rows, ["date_range_1"], 4) ?? 0;

    // Calculate avg engagement time
    const dr0AvgEngagementTime =
      dr0TotalUsers !== 0 ? dr0EngagementTime / dr0TotalUsers : 0;
    const dr1AvgEngagementTime =
      dr1TotalUsers !== 0 ? dr1EngagementTime / dr1TotalUsers : 0;

    return [dr0AvgEngagementTime, dr1AvgEngagementTime];
  }, [
    metricsReport,
    totalUsersReport,
    comparedMetricsReport,
    comparedTotalUsersReport,
  ]);

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
    <>
      <Box height="100%">
        <Box
          display="flex"
          px={2}
          py={1}
          gap={1.5}
          borderRadius="8px"
          bgcolor="grey.100"
          mb={1.25}
          alignItems="center"
        >
          <WarningRoundedIcon color="action" />
          <Typography variant="body2" color="grey.700">
            Early preview to premium GA4 analytics integration. Inquire to your
            account manager for more details.
          </Typography>
        </Box>
        <Box display="flex" justifyContent="space-between">
          <Box display="flex" gap={1.5}>
            <AnalyticsDateFilter />
            {isLoading ? (
              <Skeleton variant="rectangular" width="137px" height="28px" />
            ) : compareItemZUID ? (
              <ButtonGroup variant="contained" sx={{ height: "28px" }}>
                <Button
                  size="small"
                  startIcon={
                    <CompareArrowsRoundedIcon
                      sx={{ width: "20px", height: "20px" }}
                    />
                  }
                  onClick={() => setShowCompareDialog(true)}
                >
                  {compareItem?.web?.metaTitle ||
                    compareItem?.web?.path ||
                    compareItemZUID}
                </Button>
                <Button size="small" onClick={() => setParams(null, "compare")}>
                  <CloseRoundedIcon fontSize="small" />
                </Button>
              </ButtonGroup>
            ) : (
              <Button
                variant="outlined"
                size="small"
                color="inherit"
                startIcon={<CompareArrowsRoundedIcon color="action" />}
                sx={{ height: "28px", bgcolor: "background.paper" }}
                onClick={() => setShowCompareDialog(true)}
              >
                Compare Page
              </Button>
            )}
          </Box>
          <AnalyticsPropertySelector path={item.web.path} />
        </Box>
        <Box
          display="flex"
          justifyContent={"space-between"}
          alignItems="center"
          borderRadius={"8px"}
          gap={2}
          p={2}
          mt={2.5}
          border={(theme) => `1px solid ${theme.palette.border}`}
          bgcolor="background.paper"
        >
          <Metric
            loading={isLoading}
            title="Views"
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
              compareItemZUID
                ? +comparedMetricsReport?.rows[0]?.metricValues?.[0]?.value || 0
                : +(
                    findValuesForDimensions(
                      metricsReport?.rows,
                      ["date_range_1"],
                      0
                    ) || 0
                  )
            }
            description="A pageview is defined as a view of a page on your site that is being tracked by the Analytics tracking code. If a user clicks reload after reaching the page or navigates to a different page and then returns to the original page, then this is counted as an additional page view."
          />
          <Divider orientation="vertical" flexItem />
          <Metric
            loading={isLoading}
            title="Average Engagement Time"
            formatter={convertSecondsToMinutesAndSeconds}
            value={averageEngagementTime[0]}
            priorValue={
              compareItemZUID
                ? +comparedMetricsReport?.rows[0]?.metricValues?.[1]?.value || 0
                : averageEngagementTime[1]
            }
            description="Average engagement time is the average time that your website was in focus in a user's browser or a mobile app was in the foreground on a user's device."
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
              compareItemZUID
                ? +comparedMetricsReport?.rows[0]?.metricValues?.[2]?.value || 0
                : +(
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
            title="Conversions"
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
              compareItemZUID
                ? +comparedMetricsReport?.rows[0]?.metricValues?.[3]?.value || 0
                : +(
                    findValuesForDimensions(
                      metricsReport?.rows,
                      ["date_range_1"],
                      3
                    ) || 0
                  )
            }
            description="A conversion is a user action that you count because you consider it important, such as a purchase, game level completion, or website or app scroll activity."
          />
          <Box width="184px" height="100px" bgcolor="background.paper">
            <UsersDoughnutChart
              loading={isLoading}
              data={totalUsersReport}
              dateRange0Label={
                compareItemZUID
                  ? item?.web?.metaTitle || item?.web?.path
                  : dateRange0Label
              }
              dateRange1Label={
                compareItemZUID
                  ? compareItem?.web?.metaTitle || item?.web?.path
                  : dateRange1Label
              }
              compareData={comparedTotalUsersReport}
              shouldCompare={!!compareItemZUID}
            />
          </Box>
        </Box>
        <Box display="flex" mt={2.5} gap={2} bgcolor="background.paper">
          <Box
            width="40%"
            borderRadius={"8px"}
            p={2}
            border={(theme) => `1px solid ${theme.palette.border}`}
          >
            <UsersBarChart
              loading={isLoading}
              dateRange0Label={
                compareItemZUID
                  ? item?.web?.metaTitle || item?.web?.path
                  : dateRange0Label
              }
              dateRange1Label={
                compareItemZUID
                  ? compareItem?.web?.metaTitle || item?.web?.path
                  : dateRange1Label
              }
              usersBySourceReport={usersBySourceReport}
              usersByCountryReport={usersByCountryReport}
              comparedUsersBySourceReport={comparedUsersBySourceReport}
              comparedUsersByCountryReport={comparedUsersByCountryReport}
              shouldCompare={!!compareItemZUID}
            />
          </Box>

          <Box
            width="60%"
            borderRadius={"8px"}
            p={2}
            border={(theme) => `1px solid ${theme.palette.border}`}
            bgcolor="background.paper"
          >
            <ByDayLineChart
              loading={isLoading}
              auditData={auditData}
              startDate={startDate}
              endDate={endDate}
              dateRange0Label={
                compareItemZUID
                  ? item?.web?.metaTitle || item?.web?.path
                  : dateRange0Label
              }
              dateRange1Label={
                compareItemZUID
                  ? compareItem?.web?.metaTitle || item?.web?.path
                  : dateRange1Label
              }
              data={usersByDayReport}
              compareData={comparedUsersByDayReport}
              shouldCompare={!!compareItemZUID}
            />
          </Box>
        </Box>
      </Box>
      {showCompareDialog && (
        <CompareDialog onClose={() => setShowCompareDialog(false)} />
      )}
    </>
  );
};

export default SinglePageAnalytics;
