import React from "react";
import { Button, Box, Typography, Divider } from "@mui/material";
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
import formatNumberWithSuffix from "../../../../../../../utility/formatNumberWithSuffix";
import { Doughnut } from "react-chartjs-2";

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

const AnalyticsView = () => {
  const instance = useSelector((state: AppState) => state.instance);
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
          <Doughnut
            data={{
              labels: ["New", "Returning"],
              datasets: [
                {
                  label: "First Dataset",
                  data: [500, 3000],
                  backgroundColor: [
                    theme.palette.info.light,
                    theme.palette.info.main,
                  ],
                  borderWidth: 0,
                },
                {
                  label: "Second Dataset",
                  data: [500 + 3000, 1500],
                  backgroundColor: [
                    theme.palette.grey[200],
                    theme.palette.grey[500],
                  ],
                  borderWidth: 0,
                },
              ],
            }}
            options={{
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  display: true,
                  position: "right",
                  labels: {
                    usePointStyle: true,
                    pointStyle: "circle",
                    boxWidth: 12,
                    font: {
                      family: "Mulish",
                      size: 12,
                    },
                    color: theme.palette.text.secondary,
                    padding: 14,
                  },
                },
              },
              cutout: "65%",
            }}
            plugins={[
              {
                id: "users-chart",
                beforeDatasetsDraw: (chart) => {
                  const ctx = chart.ctx;
                  ctx.save();
                  ctx.textAlign = "center";
                  ctx.textBaseline = "middle";

                  ctx.font = "bold 12px Mulish";
                  ctx.fillStyle = theme.palette.text.secondary;
                  const xCoor = chart.getDatasetMeta(0).data[0].x;
                  const yCoor = chart.getDatasetMeta(0).data[0].y;
                  const title = "Users";

                  ctx.fillText(title, xCoor, yCoor - 14);

                  ctx.font = "bold 20px Mulish";
                  ctx.fillStyle = theme.palette.text.primary;
                  // ADD TOTAL USERS FROM SECONDARY DATASET
                  const subtitle = formatNumberWithSuffix(
                    chart.data.datasets[0].data.reduce(
                      (a: number, b: number) => a + b,
                      0
                    ) as number
                  );
                  ctx.fillText(subtitle, xCoor, yCoor + 6);
                  ctx.restore();
                },
              },
            ]}
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
        {formatNumberWithSuffix(13000)}
      </Typography>
      <Typography variant="body3" color="text.disabled">
        {formatNumberWithSuffix(10000)}{" "}
        <Typography variant="body3" color="success.main">
          + 13.74%
        </Typography>
      </Typography>
    </Box>
  );
};
