import React, { useEffect, useMemo } from "react";
import { Button, Box, Typography, Divider, Paper } from "@mui/material";
import { ThemeProvider } from "@mui/material/styles";
import googleAnalyticsIcon from "../../../../../../../../public/images/googleAnalyticsIcon.svg";
import contentAnalytics from "../../../../../../../../public/images/contentAnalytics.svg";
import googleIcon from "../../../../../../../../public/images/googleIcon.svg";
import { theme } from "@zesty-io/material";
import { AnalyticsDialog } from "./AnalyticsDialog";
import { useSelector } from "react-redux";
import { AppState } from "../../../../../../../shell/store/types";
import { NotFound } from "../../../../../../../shell/components/NotFound";
import SupportAgentRoundedIcon from "@mui/icons-material/SupportAgentRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import { UsersDoughnutChart } from "./UsersDoughnutChart";
import { ByDayLineChart } from "./ByDayLineChart";
import { useGetAuditsQuery } from "../../../../../../../shell/services/instance";
import moment from "moment-timezone";
import { UsersBarChart } from "./UsersBarChart";
import { numberFormatter } from "../../../../../../../utility/numberFormatter";
import {
  DateFilter,
  DateRangeFilterValue,
} from "../../../../../../../shell/components/Filters";
import { useParams as useQueryParams } from "../../../../../../../shell/hooks/useParams";
import { DateFilterValue } from "../../../../../../../shell/components/Filters/DateFilter";
import { useParams } from "react-router-dom";
import { useGetGa4DataQuery } from "../../../../../../../shell/services/cloudFunctions";
import {
  calculatePercentageDifference,
  convertSecondsToMinutesAndSeconds,
  findValuesForDimensions,
} from "./utils";
import { Metric } from "./Metric";

const getDateRangeFromPreset = (preset: DateFilterValue) => {
  switch (preset.value) {
    case "last_14_days":
      return [moment().subtract(14, "days"), moment().subtract(1, "days")];
    default:
      return [moment().subtract(6, "days"), moment().subtract(1, "days")];
  }
};

const Analytics = ({ item }: any) => {
  return (
    <ThemeProvider theme={theme}>
      <Box
        px={3}
        py={2}
        height="100%"
        sx={{
          boxSizing: "border-box",
          color: (theme) => theme.palette.text.primary,
        }}
      >
        {/* <AuthView /> */}
        <AnalyticsView itemPath={item.web.path} />
      </Box>
    </ThemeProvider>
  );
};

export default Analytics;

const AuthView = () => {
  const user = useSelector((state: AppState) => state.user);
  return (
    <>
      <Box display="flex" gap={4} alignItems="center" height="100%">
        <Box flex={1}>
          <img src={googleAnalyticsIcon} alt="googleAnalyticsIcon" />
          <Typography variant="h4" fontWeight="600" mt={3}>
            Connect to Google Analytics
          </Typography>
          <Typography variant="body2" color="text.secondary" mt={1} mb={2}>
            Learn where your pages traffic comes from and how it changes based
            on changes made to content. To start, please authenticate with the
            Google account your Google Analytics is connected to.
          </Typography>
          <Box display="flex" gap={1}>
            <Button
              variant="outlined"
              color="inherit"
              startIcon={<img src={googleIcon} width="20" height="20" />}
            >
              Authenticate with Google
            </Button>
            <Button variant="outlined" color="inherit">
              Learn More
            </Button>
          </Box>
        </Box>
        <Box flex={1}>
          <img src={contentAnalytics} alt="contentAnalytics" />
        </Box>
      </Box>
      <AnalyticsDialog
        title={`Congratulations ${user.firstName}! You are successfully connected to Google Analytics`}
        subTitle="Get ready to gain insights on how your content changes have impacted your page traffic and more!"
        buttons={<Button variant="contained">Get Started</Button>}
      />
    </>
  );
};

const AnalyticsView = ({ itemPath }: any) => {
  const [params, setParams] = useQueryParams();
  const { itemZUID } = useParams<{ itemZUID: string }>();

  const activeDateFilter: DateFilterValue = useMemo(() => {
    const isPreset = Boolean(params.get("datePreset"));
    const isBefore = Boolean(params.get("to")) && !Boolean(params.get("from"));
    const isAfter = Boolean(params.get("from")) && !Boolean(params.get("to"));
    const isOn =
      Boolean(params.get("to")) &&
      Boolean(params.get("from")) &&
      params.get("to") === params.get("from");
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

    if (isBefore) {
      return {
        type: "before",
        value: params.get("to"),
      };
    }

    if (isAfter) {
      return {
        type: "after",
        value: params.get("from"),
      };
    }

    if (isOn) {
      return {
        type: "on",
        value: params.get("from"),
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

  const [startDate, endDate] = getDateRangeFromPreset(activeDateFilter);

  const { data: ga4Data, isFetching } = useGetGa4DataQuery(
    {
      property: "properties/331638550",
      requests: [
        {
          dimensions: [
            {
              name: "pagePath",
            },
          ],
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
              startDate: startDate?.format("YYYY-MM-DD"),
              endDate: endDate?.format("YYYY-MM-DD"),
            },
            {
              startDate: startDate
                ?.clone()
                ?.subtract(endDate.diff(startDate, "days"), "days")
                ?.format("YYYY-MM-DD"),
              endDate: startDate?.format("YYYY-MM-DD"),
            },
          ],
          dimensionFilter: {
            filter: {
              stringFilter: {
                matchType: "EXACT",
                value: itemPath,
              },
              fieldName: "pagePath",
            },
          },
        },
        {
          dimensions: [
            {
              name: "pagePath",
            },
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
              startDate: startDate?.format("YYYY-MM-DD"),
              endDate: endDate?.format("YYYY-MM-DD"),
            },
            {
              startDate: startDate
                ?.clone()
                ?.subtract(endDate.diff(startDate, "days"), "days")
                ?.format("YYYY-MM-DD"),
              endDate: startDate?.format("YYYY-MM-DD"),
            },
          ],
          dimensionFilter: {
            filter: {
              stringFilter: {
                matchType: "EXACT",
                value: itemPath,
              },
              fieldName: "pagePath",
            },
          },
        },
        {
          dimensions: [
            {
              name: "pagePath",
            },
            {
              name: "firstUserDefaultChannelGroup",
            },
          ],
          metrics: [
            {
              name: "totalUsers",
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
                ?.subtract(endDate.diff(startDate, "days"), "days")
                ?.format("YYYY-MM-DD"),
              endDate: startDate?.format("YYYY-MM-DD"),
            },
          ],
          dimensionFilter: {
            filter: {
              stringFilter: {
                matchType: "EXACT",
                value: itemPath,
              },
              fieldName: "pagePath",
            },
          },
          orderBys: [
            {
              metric: {
                metricName: "totalUsers",
              },
              desc: true,
            },
          ],
        },
        {
          dimensions: [
            {
              name: "pagePath",
            },
            {
              name: "country",
            },
          ],
          metrics: [
            {
              name: "totalUsers",
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
                ?.subtract(endDate.diff(startDate, "days"), "days")
                ?.format("YYYY-MM-DD"),
              endDate: startDate?.format("YYYY-MM-DD"),
            },
          ],
          dimensionFilter: {
            filter: {
              stringFilter: {
                matchType: "EXACT",
                value: itemPath,
              },
              fieldName: "pagePath",
            },
          },
          orderBys: [
            {
              metric: {
                metricName: "totalUsers",
              },
              desc: true,
            },
          ],
        },
        {
          dimensions: [
            {
              name: "pagePath",
            },
            {
              name: "date",
            },
          ],
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
              name: "totalUsers",
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
                ?.subtract(endDate.diff(startDate, "days"), "days")
                ?.format("YYYY-MM-DD"),
              endDate: startDate?.format("YYYY-MM-DD"),
            },
          ],
          dimensionFilter: {
            filter: {
              stringFilter: {
                matchType: "EXACT",
                value: itemPath,
              },
              fieldName: "pagePath",
            },
          },
          orderBys: [
            {
              dimension: {
                dimensionName: "date",
              },
            },
          ],
        },
      ],
    },
    {
      skip: !startDate || !endDate,
    }
  );
  const [
    metricsReport,
    totalUsersReport,
    usersBySourceReport,
    usersByCountryReport,
    usersByDayReport,
  ] = ga4Data?.[0]?.reports || [];

  const { data: auditData } = useGetAuditsQuery({
    // Start of content item version support in audit
    start_date: "05/18/2023",
    end: moment().format("L"),
    affectedZUID: itemZUID,
  });

  useEffect(() => {
    if (
      !params.get("datePreset") ||
      (!params.get("from") && !params.get("to"))
    ) {
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

      case "on": {
        const value = dateFilter.value as string;

        setParams(value, "to");
        setParams(value, "from");
        setParams(null, "datePreset");
        return;
      }
      case "before": {
        const value = dateFilter.value as string;

        setParams(value, "to");
        setParams(null, "from");
        setParams(null, "datePreset");
        return;
      }
      case "after": {
        const value = dateFilter.value as string;

        setParams(value, "from");
        setParams(null, "to");
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

  if (isFetching) {
    return <div>loading...</div>;
  }

  return (
    <Box height="100%">
      <DateFilter
        clearable={false}
        value={activeDateFilter}
        onChange={handleDateFilterChanged}
      />
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
            findValuesForDimensions(metricsReport?.rows, ["date_range_0"])[0]
          }
          priorValue={
            findValuesForDimensions(metricsReport?.rows, ["date_range_1"])[0]
          }
        />
        <Divider orientation="vertical" flexItem />
        <Metric
          title="Avg. Duration"
          formatter={convertSecondsToMinutesAndSeconds}
          value={
            findValuesForDimensions(metricsReport?.rows, ["date_range_0"])[1]
          }
          priorValue={
            findValuesForDimensions(metricsReport?.rows, ["date_range_1"])[1]
          }
        />
        <Divider orientation="vertical" flexItem />
        <Metric
          inverse
          title="Bounce Rate"
          formatter={(value: number) => `${Math.floor(value * 100)}%`}
          value={
            findValuesForDimensions(metricsReport?.rows, ["date_range_0"])[2]
          }
          priorValue={
            findValuesForDimensions(metricsReport?.rows, ["date_range_1"])[2]
          }
        />
        <Divider orientation="vertical" flexItem />
        <Metric
          title="Conversions"
          value={
            findValuesForDimensions(metricsReport?.rows, ["date_range_0"])[3]
          }
          priorValue={
            findValuesForDimensions(metricsReport?.rows, ["date_range_1"])[3]
          }
        />
        <Box width="184px" height="100px">
          <UsersDoughnutChart data={totalUsersReport} />
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
            startDate={startDate}
            endDate={endDate}
            usersBySourceReport={usersBySourceReport}
            usersByCountryReport={usersByCountryReport}
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
            dateLabel={(activeDateFilter.value as string).replace("_", " ")}
            data={usersByDayReport}
          />
        </Box>
      </Box>
      {/* <NotFound
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
                  `https://www.zesty.io/instances/${instance.ZUID}/support/`
                )
              }
            >
              Contact Support
            </Button>
            <Button startIcon={<RefreshRoundedIcon />} variant="contained">
              Try Again
            </Button>
          </>
        }
      /> */}
    </Box>
  );
};
