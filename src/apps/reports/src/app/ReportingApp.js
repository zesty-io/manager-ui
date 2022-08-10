import { Route, Switch, Redirect } from "react-router";
import { Box, Typography } from "@mui/material";

import { ReportingNav } from "./components/ReportingNav";
import { ActivityLog } from "./views/ActivityLog";
import Analytics from "./views/Analytics";
import Metrics from "./views/Metrics";

export function ReportingApp() {
  return (
    <Box sx={{ display: "flex", height: "100%" }}>
      <ReportingNav />
      <Box sx={{ flex: 1, overflowY: "scroll" }}>
        <Switch>
          <Route path="/reports/activity-log" component={ActivityLog} />
          <Route path="/reports/metrics" component={Metrics} />
          <Route path="/reports/analytics" component={Analytics} />
          <Redirect to="/reports/activity-log" />
        </Switch>
      </Box>
    </Box>
  );
}
