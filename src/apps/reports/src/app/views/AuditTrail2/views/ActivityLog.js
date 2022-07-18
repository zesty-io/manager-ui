import { useCallback, useMemo } from "react";
import { Typography, Box, Tabs, Tab } from "@mui/material";
import { useLocation, useHistory } from "react-router-dom";
import { Resources } from "./Resources";

const views = {
  resources: <Resources />,
  users: <div>Users</div>,
  timeline: <div>TIMELINE</div>,
  insights: <div>INSIGHTS</div>,
};

export const ActivityLog = () => {
  const history = useHistory();
  const location = useLocation();

  const handleTabChange = useCallback((evt, newValue) => {
    history.push(`/reports/activity-log/${Object.keys(views)[newValue]}`);
  }, []);

  const activeView = useMemo(
    () => views[location.pathname.split("/").pop()],
    [location.pathname]
  );

  return (
    <>
      <Box sx={{ px: 3, pt: 3 }}>
        <Typography variant="h4">Activity Log</Typography>
        <Typography variant="subtitle2" color="text.secondary">
          Your instance timeline by resources and users
        </Typography>
      </Box>
      <Box sx={{ borderBottom: 1, borderColor: "divider", px: 3 }}>
        <Tabs
          value={Object.values(views).indexOf(activeView)}
          onChange={handleTabChange}
        >
          <Tab label="RESOURCES" />
          <Tab label="USERS" />
          <Tab label="TIMELINE" />
          <Tab label="INSIGHTS" />
        </Tabs>
      </Box>
      {activeView}
    </>
  );
};
