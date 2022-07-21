import { useCallback, useMemo, useEffect, useState } from "react";
import { Typography, Box, Tabs, Tab } from "@mui/material";
import { useLocation, useHistory } from "react-router-dom";
import { instanceApi } from "shell/services/instance";
import { useParams } from "utility/useParams";
import moment from "moment";
import { Resources } from "./Resources";
import { ActionsTimeline } from "../components/ActionsTimeline";
import { UsersList } from "../components/UsersList";
import { Users } from "./Users";

const tabPaths = ["resources", "users", "timeline", "insights"];

export const ActivityLog = () => {
  const history = useHistory();
  const location = useLocation();
  const [params, setParams] = useParams();
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    // If there are no date parameters set, sets date parameters to 1 week
    if (!params.get("from") && !params.get("to")) {
      setParams(moment().add(-6, "days").format("YYYY-MM-DD"), "from");
      setParams(moment().add(1, "days").format("YYYY-MM-DD"), "to");
    }
    /*
      Initialized get sets to true after setting date params to then be utilized to determine 
      if API call is ready to be executed
    */
    setInitialized(true);
  }, []);

  const {
    data: resources,
    isLoading,
    isUninitialized,
  } = instanceApi.useGetAuditsQuery(
    {
      ...(params.get("from") && {
        start_date: moment(params.get("from")).format("L"),
      }),
      ...(params.get("to") && {
        end_date: moment(params.get("to")).format("L"),
      }),
    },
    { skip: !initialized }
  );

  const handleTabChange = useCallback((evt, newValue) => {
    history.push(`/reports/activity-log/${tabPaths[newValue]}`);
  }, []);

  const activeView = useMemo(
    () => location.pathname.split("/").pop(),
    [location.pathname]
  );

  const getView = () => {
    switch (activeView) {
      case "resources":
        return <Resources resources={resources} />;
      case "users":
        return <Users resources={resources} />;
      case "timeline":
        return <ActionsTimeline actions={resources} />;
      case "insights":
        return <div>Insights</div>;
      default:
        return null;
    }
  };

  if (isLoading || isUninitialized) return <div>loading...</div>;

  return (
    <>
      <Box sx={{ px: 3, pt: 3, mb: 1 }}>
        <Typography variant="h4">Activity Log</Typography>
        <Typography variant="subtitle2" color="text.secondary">
          Your instance timeline by resources and users
        </Typography>
      </Box>
      <Box sx={{ borderBottom: 1, borderColor: "divider", px: 3 }}>
        <Tabs value={tabPaths.indexOf(activeView)} onChange={handleTabChange}>
          <Tab label="RESOURCES" />
          <Tab label="USERS" />
          <Tab label="TIMELINE" />
          <Tab label="INSIGHTS" />
        </Tabs>
      </Box>
      {getView()}
    </>
  );
};
