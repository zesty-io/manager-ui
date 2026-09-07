import { Box } from "@mui/material";
import { Suspense, useState } from "react";
import { SubAppSkeleton } from "shell/components/SubAppSkeleton";
import { useTranslation } from "react-i18next";
import { Header } from "./components/Header";
import { MetricCards } from "./components/MetricCards";
import { ResourcesCard } from "./components/ResourcesCard";
import { ResourceTable } from "./components/ResourceTable";

export const HomeApp = () => {
  // Local Suspense boundary so lazy-loading the "dashboard" namespace shows a
  // fallback in the sub-app area only, instead of blanking the whole shell.
  return (
    <Suspense fallback={<SubAppSkeleton />}>
      <Home />
    </Suspense>
  );
};

const Home = () => {
  // Requesting the namespace here triggers its lazy load and suspends this
  // subtree until ready; child components use bare useTranslation() with
  // qualified keys (t("dashboard.key")) once it's in the store.
  useTranslation("dashboard");
  const [dateRange, setDateRange] = useState(30);

  return (
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
  );
};
