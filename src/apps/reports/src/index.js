import { Suspense } from "react";
import { SubAppSkeleton } from "shell/components/SubAppSkeleton";
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
  <Suspense fallback={<SubAppSkeleton />}>
    <ReportingAppInner />
  </Suspense>
);

export default ReportsApp;
