import { ScheduleRounded, PieChartRounded } from "@mui/icons-material";

import {
  AppSideBar,
  SubMenu,
} from "../../../../../shell/components/AppSidebar";

export const ReportingNav = () => {
  const tree: SubMenu[] = [
    {
      name: "Activity Log",
      path: "/reports/activity-log/resources",
      icon: ScheduleRounded,
    },
    {
      name: "Metrics",
      path: "/reports/metrics",
      icon: PieChartRounded,
    },
  ];

  return (
    <AppSideBar
      data-cy="reports-nav"
      mode="dark"
      subMenus={tree}
      headerTitle="Reports"
      withSearch={false}
      withTitleButton={false}
    />
  );
};
