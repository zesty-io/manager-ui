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
        <Typography sx={{ mb: 1 }}>REPORTING</Typography>
        <ReportingNav />
      </Box>
      <Box sx={{ boxShadow: 3, flex: 1 }}>
        <Switch>
          <Route path="/reporting/audit-trail" component={AuditTrail} />
          <Route path="/reporting/analytics" component={Analytics} />
          <Route path="/reporting/metrics" component={Metrics} />
          <Redirect to="/reporting/audit-trail" />
        </Switch>
      </Box>
    </Box>
  );
}
