import { useEffect, useState } from "react";
import { useLocation } from "react-router";
import { Nav } from "@zesty-io/core/Nav";

import {
  faChartLine,
  faChartPie,
  faHistory,
} from "@fortawesome/free-solid-svg-icons";

export function ReportingNav() {
  const location = useLocation();
  const [selected, setSelected] = useState(location.pathname);
  useEffect(() => {
    setSelected(location.pathname);
  }, [location]);

  const tree = [
    {
      label: "Audit Trail",
      path: "/reports/activity-log",
      icon: faHistory,
    },
    {
      label: "Metrics",
      path: "/reports/metrics",
      icon: faChartPie,
    },
    {
      label: "Analytics",
      path: "/reports/analytics",
      icon: faChartLine,
    },
  ];

  return <Nav lightMode="true" selected={selected} tree={tree} />;
}
