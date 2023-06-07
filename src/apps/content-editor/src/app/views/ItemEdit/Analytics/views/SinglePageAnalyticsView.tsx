import React, { useEffect, useMemo, useState } from "react";
import {
  Button,
  Box,
  ButtonGroup,
  Divider,
  CircularProgress,
  Link,
  Typography,
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
} from "../../../../../../../../shell/services/instance";
import moment, { Moment } from "moment-timezone";
import { UsersBarChart } from "../components/UsersBarChart";
import {
  DateFilter,
  DateRangeFilterValue,
} from "../../../../../../../../shell/components/Filters";
import { useParams as useQueryParams } from "../../../../../../../../shell/hooks/useParams";
import { DateFilterValue } from "../../../../../../../../shell/components/Filters/DateFilter";
import { useHistory, useParams } from "react-router-dom";
import { useGetAnalyticsPropertyDataByQueryQuery } from "../../../../../../../../shell/services/cloudFunctions";
import {
  convertSecondsToMinutesAndSeconds,
  findValuesForDimensions,
  generateReportRequests,
} from "../utils";
import { Metric } from "../components/Metric";
import { useGetAnalyticsPropertiesQuery } from "../../../../../../../../shell/services/cloudFunctions";
import { PropertiesDialog } from "../components/PropertiesDialog";
import instanceZUID from "../../../../../../../../utility/instanceZUID";
import { NotFound } from "../../../../../../../../shell/components/NotFound";
import SettingsIcon from "@mui/icons-material/Settings";
import WarningRoundedIcon from "@mui/icons-material/WarningRounded";
import CompareArrowsRoundedIcon from "@mui/icons-material/CompareArrowsRounded";
import { CompareDialog } from "../components/CompareDialog";

const getDateRangeAndLabelsFromPreset = (
  preset: DateFilterValue
): [Moment, Moment, string, string] => {
  if (preset.type === "daterange") {
    const value = preset.value as DateRangeFilterValue;
    return [
      moment(value.from, "YYYY-MM-DD"),
      moment(value.to, "YYYY-MM-DD"),
      moment(value.from).format("ddd D MMM"),
      moment(value.to).format("ddd D MMM"),
    ];
  } else {
    switch (preset.value) {
      case "today":
        return [moment(), moment(), "Today", "Yesterday"];
      case "yesterday":
        return [
          moment().subtract(1, "days"),
          moment().subtract(1, "days"),
          "Yesterday",
          "Day Before Yesterday",
        ];
      case "last_7_days":
        return [
          moment().subtract(7, "days"),
          moment().subtract(1, "days"),
          "Last 7 Days",
          "Prior 7 Days",
        ];
      case "last_14_days":
        return [
          moment().subtract(14, "days"),
          moment().subtract(1, "days"),
          "Last 14 Days",
          "Prior 14 Days",
        ];
      case "last_30_days":
        return [
          moment().subtract(30, "days"),
          moment().subtract(1, "days"),
          "Last 30 Days",
          "Prior 30 Days",
        ];
      case "last_3_months":
        return [
          moment().subtract(90, "days"),
          moment().subtract(1, "days"),
          "Last 3 Months",
          "Prior 3 Months",
        ];
      case "last_12_months":
        return [
          moment().subtract(365, "days"),
          moment().subtract(1, "days"),
          "Last 12 Months",
          "Prior 12 Months",
        ];
      default:
        return [
          moment().subtract(14, "days"),
          moment().subtract(1, "days"),
          "Last 14 Days",
          "Prior 14 Days",
        ];
    }
  }
};

type Props = {
  item: any;
};

export const SinglePageAnalyticsView = ({ item }: Props) => {
  const [showPropertiesDialog, setShowPropertiesDialog] = useState(false);
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

  const activeDateFilter: DateFilterValue = useMemo(() => {
    const isPreset = Boolean(params.get("datePreset"));
    const isDateRange =
      Boolean(params.get("to")) &&
      Boolean(params.get("from")) &&
      params.get("to") !== params.get("from");

    if (isPreset) {
      return {
        type: "preset",
        value: params.get("datePreset"),
      };
    }

    if (isDateRange) {
      return {
        type: "daterange",
        value: {
          from: params.get("from"),
          to: params.get("to"),
        },
      };
    }

    return {
      type: "",
      value: "",
    };
  }, [params]);

  const [startDate, endDate, dateRange0Label, dateRange1Label] =
    getDateRangeAndLabelsFromPreset(activeDateFilter);

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

  useEffect(() => {
    if (!params.get("datePreset") && !params.get("from") && !params.get("to")) {
      handleDateFilterChanged({ type: "preset", value: "last_14_days" });
    }
  }, []);

  const handleDateFilterChanged = (dateFilter: DateFilterValue) => {
    switch (dateFilter.type) {
      case "daterange": {
        const value = dateFilter.value as DateRangeFilterValue;

        setParams(value.to, "to");
        setParams(value.from, "from");
        setParams(null, "datePreset");
        return;
      }
      case "preset": {
        const value = dateFilter.value as string;

        setParams(value, "datePreset");
        setParams(null, "to");
        setParams(null, "from");
        return;
      }

      default: {
        setParams(null, "to");
        setParams(null, "from");
        setParams(null, "datePreset");
        return;
      }
    }
  };

  if (isFetching || instanceSettingsFetching || isFetchingCompare) {
    return (
      <Box
        height="100%"
        display="flex"
        justifyContent="center"
        alignItems="center"
      >
        <CircularProgress />
      </Box>
    );
  }

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

  if (!propertyId) {
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
            <DateFilter
              clearable={false}
              value={activeDateFilter}
              onChange={handleDateFilterChanged}
              hideCustomDates
              withDateRange
            />
            {compareItemZUID ? (
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
          <Box display="flex" gap={0.5} alignItems="center">
            <Link
              href={`${propertyData?.dataStreams?.[0]?.webStreamData?.defaultUri}${item.web.path}`}
              target="__blank"
              sx={{
                maxWidth: "440px",
                direction: "rtl",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                display: "block",
              }}
            >
              {`${
                propertyData?.dataStreams?.[0]?.webStreamData?.defaultUri
              }${item.web.path?.slice(0, -1)}`}
            </Link>
            <Button
              onClick={() => setShowPropertiesDialog(true)}
              size="small"
              variant="outlined"
              color="inherit"
              sx={{
                height: "22px",
                width: "38px",
                minWidth: "unset",
              }}
            >
              <SettingsIcon
                color="action"
                sx={{ width: "18px", height: "18px" }}
              />
            </Button>
          </Box>
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
            title="Sessions"
            value={
              +(
                findValuesForDimensions(metricsReport?.rows, [
                  "date_range_0",
                ])[0] || 0
              )
            }
            priorValue={
              compareItemZUID
                ? +comparedMetricsReport?.rows[0]?.metricValues?.[0]?.value || 0
                : +(
                    findValuesForDimensions(metricsReport?.rows, [
                      "date_range_1",
                    ])[0] || 0
                  )
            }
            description="A session in Google Analytics is a period of time in which a user interacts with your website."
          />
          <Divider orientation="vertical" flexItem />
          <Metric
            title="Avg. Duration"
            formatter={convertSecondsToMinutesAndSeconds}
            value={
              +(
                findValuesForDimensions(metricsReport?.rows, [
                  "date_range_0",
                ])[1] || 0
              )
            }
            priorValue={
              compareItemZUID
                ? +comparedMetricsReport?.rows[0]?.metricValues?.[1]?.value || 0
                : +(
                    findValuesForDimensions(metricsReport?.rows, [
                      "date_range_1",
                    ])[1] || 0
                  )
            }
            description="Session duration is the time frame during which there are users interactions occurring on the website."
          />
          <Divider orientation="vertical" flexItem />
          <Metric
            inverse
            title="Bounce Rate"
            formatter={(value: number) => `${Math.floor(value * 100)}%`}
            value={
              +(
                findValuesForDimensions(metricsReport?.rows, [
                  "date_range_0",
                ])[2] || 0
              )
            }
            priorValue={
              compareItemZUID
                ? +comparedMetricsReport?.rows[0]?.metricValues?.[2]?.value || 0
                : +(
                    findValuesForDimensions(metricsReport?.rows, [
                      "date_range_1",
                    ])[2] || 0
                  )
            }
            description="Bounce rate is the percentage of people who land on a page and leave without performing a specific action."
          />
          <Divider orientation="vertical" flexItem />
          <Metric
            title="Conversions"
            value={
              +(
                findValuesForDimensions(metricsReport?.rows, [
                  "date_range_0",
                ])[3] || 0
              )
            }
            priorValue={
              compareItemZUID
                ? +comparedMetricsReport?.rows[0]?.metricValues?.[3]?.value || 0
                : +(
                    findValuesForDimensions(metricsReport?.rows, [
                      "date_range_1",
                    ])[3] || 0
                  )
            }
            description="A conversion is a user action that you count because you consider it important, such as a purchase, game level completion, or website or app scroll activity."
          />
          <Box width="184px" height="100px">
            <UsersDoughnutChart
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
            height="446px"
            borderRadius={"8px"}
            p={2}
            border={(theme) => `1px solid ${theme.palette.border}`}
          >
            <UsersBarChart
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
            height="446px"
            borderRadius={"8px"}
            p={2}
            border={(theme) => `1px solid ${theme.palette.border}`}
          >
            <ByDayLineChart
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

      {showPropertiesDialog && (
        <PropertiesDialog onClose={() => setShowPropertiesDialog(false)} />
      )}
      {showCompareDialog && (
        <CompareDialog onClose={() => setShowCompareDialog(false)} />
      )}
    </>
  );
};
