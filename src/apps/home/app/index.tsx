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
        }}
      >
        <Header dateRange={dateRange} onDateRangeChange={setDateRange} />
        <Box sx={{ mx: 3, mt: -7.5 }}>
          <Box sx={{ mb: 2 }}>
            <MetricCards dateRange={dateRange} />
          </Box>
          <Box display="flex" gap={3} sx={{ height: "calc(100vh - 286px)" }}>
            <ResourceTable dateRange={dateRange} />
            <Box
              sx={{
                minWidth: 327,
                maxWidth: 327,
                backgroundColor: "common.white",
                border: (theme) => `1px solid ${theme.palette.border}`,
                borderRadius: "8px",
                height: "fit-content",
              }}
            >
              <ResourcesCard />
            </Box>
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  );
};
