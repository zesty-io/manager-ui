import { useState } from "react";
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
import { UsersDoughnutChart } from "../components/UsersDoughnutChart";
import { ByDayLineChart } from "../components/ByDayLineChart";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import {
  useGetAuditsQuery,
  useGetContentItemQuery,
  useGetInstanceSettingsQuery,
} from "../../../../../../../shell/services/instance";
import { UsersBarChart } from "../components/UsersBarChart";
import { useParams as useQueryParams } from "../../../../../../../shell/hooks/useParams";
import { useHistory, useParams } from "react-router-dom";
import { useGetAnalyticsPropertyDataByQueryQuery } from "../../../../../../../shell/services/cloudFunctions";
import {
  convertSecondsToMinutesAndSeconds,
  findValuesForDimensions,
  generateReportRequests,
  getDateRangeAndLabelsFromParams,
} from "../utils";
import { Metric } from "../components/Metric";
import { useGetAnalyticsPropertiesQuery } from "../../../../../../../shell/services/cloudFunctions";
import instanceZUID from "../../../../../../../utility/instanceZUID";
import { NotFound } from "../../../../../../../shell/components/NotFound";
import WarningRoundedIcon from "@mui/icons-material/WarningRounded";
import CompareArrowsRoundedIcon from "@mui/icons-material/CompareArrowsRounded";
import { CompareDialog } from "../components/CompareDialog";
import { AnalyticsDateFilter } from "../components/AnalyticsDateFilter";
import { ContentItem } from "../../../../../../../shell/services/types";
import { PropertiesDialog } from "../components/PropertiesDialog";
import { AnalyticsPropertySelector } from "../components/AnalyticsPropertySelector";

type Props = {
  item: ContentItem;
  loading: boolean;
};

export const SinglePageAnalyticsView = ({ item, loading }: Props) => {
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

  const { data: auditData } = useGetAuditsQuery({
    // Start of content item version support in audit
    start_date: "05/25/2023",
    affectedZUID: itemZUID,
  });

  const isLoading =
    isFetching || instanceSettingsFetching || isFetchingCompare || loading;

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

  if (!instanceSettingsFetching && !propertyId) {
    return (
      <PropertiesDialog
        onClose={(shouldNavAway = false) =>
          shouldNavAway && history.push(`/content/${modelZUID}/${itemZUID}`)
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
            <AnalyticsDateFilter showSkeleton={isLoading} />
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
                sx={{ height: "28px" }}
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
          borderRadius={"8px"}
          gap={2}
          p={2}
          mt={2.5}
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
              compareItemZUID
                ? +comparedMetricsReport?.rows[0]?.metricValues?.[1]?.value || 0
                : +(
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
          <Box width="184px" height="100px">
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
        <Box display="flex" mt={2.5} gap={2}>
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
