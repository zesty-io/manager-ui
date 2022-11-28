import { Box, ThemeProvider } from "@mui/material";
import { theme } from "@zesty-io/material";
import { useState } from "react";
import { Header } from "./components/Header";
import { MetricCards } from "./components/MetricCards";
import { ResourcesCard } from "./components/ResourcesCard";
import { ResourceTable } from "./components/ResourceTable";

export const HomeApp = () => {
  const [dateRange, setDateRange] = useState(30);
  return (
    <ThemeProvider theme={theme}>
      <Box
        sx={{
          color: "text.primary",
          backgroundColor: "grey.50",
          height: "100%",
          "*": {
            boxSizing: "border-box",
          },
          "*::-webkit-scrollbar-track-piece": {
            backgroundColor: `${theme.palette.grey[100]} !important`,
          },
          "*::-webkit-scrollbar-thumb": {
            backgroundColor: `${theme.palette.grey[300]} !important`,
          },
        }}
      >
        <Header dateRange={dateRange} onDateRangeChange={setDateRange} />
        <Box sx={{ mx: 3, mt: -7.5 }}>
          <MetricCards dateRange={dateRange} />
          <Box
            display="flex"
            gap={3}
            sx={{ height: "calc(100vh - 286px)", mt: 2 }}
          >
            <ResourceTable dateRange={dateRange} />
            <ResourcesCard />
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  );
};
