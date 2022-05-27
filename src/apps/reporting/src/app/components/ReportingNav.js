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
      path: "/reporting/audit-trail",
      icon: faHistory,
    },
    {
      label: "Analytics",
      path: "/reporting/analytics",
      icon: faChartLine,
    },
    {
      label: "Metrics",
      path: "/reporting/metrics",
      icon: faChartPie,
    },
  ];

  return <Nav lightMode="true" selected={selected} tree={tree} />;
}
