import { Route, Switch, Redirect } from "react-router";
import { Box, Typography } from "@mui/material";

import { ReportingNav } from "./components/ReportingNav";
import { ActivityLog } from "./views/ActivityLog";
import Metrics from "./views/Metrics";
import { ResizableContainer } from "../../../../shell/components/ResizeableContainer";

export function ReportingApp() {
  return (
    <Box sx={{ display: "flex", height: "100%" }}>
      <ResizableContainer
        id="reportsNav"
        defaultWidth={300}
        minWidth={220}
        maxWidth={360}
      >
        <ReportingNav />
      </ResizableContainer>
      <Box sx={{ flex: 1, overflowY: "scroll" }}>
        <Switch>
          <Route path="/reports/activity-log" component={ActivityLog} />
          <Route path="/reports/metrics" component={Metrics} />
          <Redirect to="/reports/activity-log" />
        </Switch>
      </Box>
    </Box>
  );
}
