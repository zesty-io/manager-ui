import React from "react";
import { Box } from "@mui/material";
import { ThemeProvider } from "@mui/material/styles";
import { theme } from "@zesty-io/material";
import { AuthView } from "./components/AuthView";
import { useGetAnalyticsPropertiesQuery } from "../../../../../../shell/services/cloudFunctions";
import { SinglePageAnalyticsView } from "./views/SinglePageAnalyticsView";
import AnalyticsDashboard from "./views/AnalyticsDashboard";
import { ContentItem } from "../../../../../../shell/services/types";

type Props = {
  item?: ContentItem;
};

const Analytics = ({ item }: Props) => {
  const { isFetching, isError, refetch } = useGetAnalyticsPropertiesQuery();

  const validateAuth = () => {
    refetch();
  };

  return (
    <ThemeProvider theme={theme}>
      <Box
        px={3}
        py={2}
        sx={{
          boxSizing: "border-box",
          color: (theme) => theme.palette.text.primary,
        }}
        height="calc(100% - 65px)"
        overflow="auto"
      >
        {!isError ? (
          item ? (
            <SinglePageAnalyticsView item={item} loading={isFetching} />
          ) : (
            <AnalyticsDashboard loading={isFetching} />
          )
        ) : (
          <AuthView validateAuth={validateAuth} />
        )}
      </Box>
    </ThemeProvider>
  );
};

export default Analytics;
