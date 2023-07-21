import React from "react";
import { Box, CircularProgress } from "@mui/material";
import { ThemeProvider } from "@mui/material/styles";
import { lightTheme as theme } from "@zesty-io/material";
import { AuthView } from "./components/AuthView";
import { useGetAnalyticsPropertiesQuery } from "../../../../../../../shell/services/cloudFunctions";
import { SinglePageAnalyticsView } from "./views/SinglePageAnalyticsView";

const Analytics = ({ item }: any) => {
  const { isFetching, isSuccess, refetch } = useGetAnalyticsPropertiesQuery();

  const validateAuth = () => {
    refetch();
  };

  return (
    <ThemeProvider theme={theme}>
      {isFetching ? (
        <Box
          height="100%"
          display="flex"
          justifyContent="center"
          alignItems="center"
        >
          <CircularProgress />
        </Box>
      ) : (
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
          {isSuccess ? (
            <SinglePageAnalyticsView item={item} />
          ) : (
            <AuthView validateAuth={validateAuth} />
          )}
        </Box>
      )}
    </ThemeProvider>
  );
};

export default Analytics;
