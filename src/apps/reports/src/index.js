import { Suspense } from "react";
import { Box } from "@mui/material";
import { useTranslation } from "react-i18next";
import { injectReducer, store } from "shell/store";
import { logsInView } from "./store/logsInView";
import { ReportingApp } from "./app/ReportingApp";

injectReducer(store, "logsInView", logsInView);

const ReportingAppInner = () => {
  useTranslation("reports");
  return <ReportingApp />;
};

const ReportsApp = () => (
  <Suspense
    fallback={<Box sx={{ height: "100%", backgroundColor: "grey.50" }} />}
  >
    <ReportingAppInner />
  </Suspense>
);

export default ReportsApp;
