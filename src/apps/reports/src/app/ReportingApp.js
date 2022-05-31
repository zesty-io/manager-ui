import { Route, Switch, Redirect } from "react-router";
import { Box, Typography } from "@mui/material";

import { ReportingNav } from "./components/ReportingNav";
import AuditTrail from "./views/AuditTrail";
import Analytics from "./views/Analytics";
import Metrics from "./views/Metrics";

export function ReportingApp() {
  return (
    <Box sx={{ display: "flex", height: "100%" }}>
      <Box sx={{ pt: 2, pl: 2, minWidth: 150 }}>
        <Typography sx={{ mb: 1 }}>REPORTS</Typography>
        <ReportingNav />
      </Box>
      <Box sx={{ boxShadow: 3, flex: 1, overflowY: "scroll" }}>
        <Switch>
          <Route path="/reports/audit-trail" component={AuditTrail} />
          <Route path="/reports/metrics" component={Metrics} />
          <Route path="/reports/analytics" component={Analytics} />
          <Redirect to="/reports/audit-trail" />
        </Switch>
      </Box>
    </Box>
  );
}
