import React from "react";
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

const Analytics = () => {
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
        <AnalyticsView />
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

const startDate = moment().subtract(13, "days");
// const endDate = moment(). subtract(1, "days");
const endDate = moment();

const AnalyticsView = () => {
  const instance = useSelector((state: AppState) => state.instance);
  const { data: auditData } = useGetAuditsQuery({
    start_date: startDate.format("L"),
    end: endDate.format("L"),
  });
  return (
    <Box height="100%">
      <Box>FILTERS</Box>
      <Box
        display="flex"
        justifyContent={"space-between"}
        borderRadius={"8px"}
        gap={2}
        p={2}
        mt={2.5}
        border={(theme) => `1px solid ${theme.palette.border}`}
      >
        <Metric />
        <Divider orientation="vertical" flexItem />
        <Metric />
        <Divider orientation="vertical" flexItem />
        <Metric />
        <Divider orientation="vertical" flexItem />
        <Metric />
        <Box width="184px" height="100px">
          <UsersDoughnutChart />
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
            auditData={auditData}
            startDate={startDate}
            endDate={endDate}
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

const Metric = () => {
  return (
    <Box py={0.5}>
      <Typography variant="body1" color="text.secondary">
        Sessions
      </Typography>
      <Typography variant="h2" fontWeight={600} sx={{ mb: 1 }}>
        {numberFormatter.format(13000)}
      </Typography>
      <Typography variant="body3" color="text.disabled">
        {numberFormatter.format(10000)}{" "}
        <Typography variant="body3" color="success.main">
          + 13.74%
        </Typography>
      </Typography>
    </Box>
  );
};
