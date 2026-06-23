import { ScheduleRounded, PieChartRounded } from "@mui/icons-material";
import { useTranslation } from "react-i18next";

import {
  AppSideBar,
  SubMenu,
} from "../../../../../shell/components/AppSidebar";

export const ReportingNav = () => {
  const { t } = useTranslation();

  const tree: SubMenu[] = [
    {
      name: t("reports.activityLog"),
      path: "/reports/activity-log",
      icon: ScheduleRounded,
      substringPathMatch: true,
    },
    {
      name: t("reports.metrics"),
      path: "/reports/metrics",
      icon: PieChartRounded,
    },
  ];

  return (
    <AppSideBar
      data-cy="reports-nav"
      mode="dark"
      subMenus={tree}
      headerTitle={t("shell.navReports")}
      withSearch={false}
      withTitleButton={false}
    />
  );
};
