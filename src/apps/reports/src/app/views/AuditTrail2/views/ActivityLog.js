import { useMemo, useEffect, useState } from "react";
import { Typography, Box, Tabs, Tab } from "@mui/material";
import { useLocation, useHistory } from "react-router-dom";
import { instanceApi } from "shell/services/instance";
import { useParams } from "shell/hooks/useParams";
import moment from "moment";
import { ActionsTimeline } from "../components/ActionsTimeline";
import { filterByParams } from "utility/filterByParams";
import { Filters } from "../components/Filters";
import { ResourceList } from "../components/ResourceList";
import { ActivityByResource } from "../components/ActivityByResource";
import { UsersList } from "../components/UsersList";
import { Top5Users } from "../components/Top5Users";
import { isEmpty, omitBy } from "lodash";

const tabPaths = ["resources", "users", "timeline", "insights"];

const filtersOnView = {
  resources: ["happenedAt", "resourceType", "actionByUserZUID"],
  users: ["happenedAt", "userRole"],
};

export const ActivityLog = () => {
  const history = useHistory();
  const location = useLocation();
  const activeView = location.pathname.split("/").pop();
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
    data: actions,
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

  const filteredActions = useMemo(
    () => (actions ? filterByParams(actions, params) : []),
    [actions, params]
  );

  const handleTabChange = (evt, newValue) => {
    history.push({
      pathname: `/reports/activity-log/${tabPaths[newValue]}`,
      // Persist date selection
      search: new URLSearchParams(
        omitBy({ from: params.get("from"), to: params.get("to") }, isEmpty)
      ).toString(),
    });
  };

  const getView = () => {
    switch (activeView) {
      case "resources":
        return (
          <Box sx={{ display: "flex", gap: 17 }}>
            <ResourceList actions={filteredActions} />
            <Box
              sx={{ px: 4, py: 2.5, minWidth: 298, boxSizing: "border-box" }}
            >
              <ActivityByResource actions={filteredActions} />
            </Box>
          </Box>
        );
      case "users":
        return (
          <Box sx={{ display: "flex", gap: 17 }}>
            <UsersList actions={filteredActions} />
            <Box
              sx={{ px: 4, py: 2.5, minWidth: 298, boxSizing: "border-box" }}
            >
              <Top5Users actions={filteredActions} />
            </Box>
          </Box>
        );
      case "timeline":
        return <ActionsTimeline actions={actions} />;
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
      <Box sx={{ px: 3 }}>
        <Filters actions={actions} filters={filtersOnView[activeView]} />
        {getView()}
      </Box>
    </>
  );
};
