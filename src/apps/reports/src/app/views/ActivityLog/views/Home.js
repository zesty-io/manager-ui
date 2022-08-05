import { useMemo, useEffect, useState } from "react";
import {
  Typography,
  Box,
  Tabs,
  Tab,
  Card,
  CardHeader,
  CardContent,
  Stack,
  Skeleton,
} from "@mui/material";
import { useLocation, useHistory } from "react-router-dom";
import { instanceApi } from "shell/services/instance";
import { useParams } from "shell/hooks/useParams";
import moment from "moment";
import { accountsApi } from "shell/services/accounts";
import { ActionsTimeline } from "../components/ActionsTimeline";
import { filterByParams } from "utility/filterByParams";
import { Filters } from "../components/Filters";
import { ResourceList } from "../components/ResourceList";
import { ActivityByResource } from "../components/ActivityByResource";
import { UsersList } from "../components/UsersList";
import { Top5Users } from "../components/Top5Users";
import { isEmpty, omitBy, uniqBy } from "lodash";
import { EmptyState } from "../components/EmptyState";
import { ApiErrorState } from "../components/ApiErrorState";

const tabPaths = ["resources", "users", "timeline", "insights"];

const filtersOnView = {
  resources: ["happenedAt", "resourceType", "actionByUserZUID"],
  users: ["happenedAt", "userRole"],
  timeline: ["action", , "resourceType", "actionByUserZUID"],
  insights: ["action", "actionByUserZUID"],
};

export const Home = () => {
  const history = useHistory();
  const location = useLocation();
  const activeView = location.pathname.split("/").pop();
  const [params, setParams] = useParams();
  const [initialized, setInitialized] = useState(false);
  const { data: usersRoles } = accountsApi.useGetUsersRolesQuery();

  useEffect(() => {
    if (!params.get("from") && !params.get("to")) {
      setDefaultDateParams();
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
    isFetching,
    isUninitialized,
    status,
    refetch,
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

  // Sets date parameters to 3 months
  const setDefaultDateParams = () => {
    setParams(moment().add(-3, "months").format("YYYY-MM-DD"), "from");
    setParams(moment().add(1, "days").format("YYYY-MM-DD"), "to");
  };

  const filteredActions = useMemo(
    () => (actions?.length ? filterByParams(actions, params) : []),
    [actions, params]
  );

  // If userRole parameter exist use users data to filter
  const uniqueUserActions = useMemo(
    () =>
      params.get("userRole")
        ? uniqBy(filteredActions, "actionByUserZUID").filter(
            (action) =>
              usersRoles?.find(
                (userRole) => userRole.ZUID === action.actionByUserZUID
              )?.role?.name === params.get("userRole")
          )
        : uniqBy(filteredActions, "actionByUserZUID"),
    [filteredActions, usersRoles, params]
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
        if (!isLoading && !filteredActions?.length) {
          return (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                height: "100%",
              }}
            >
              <EmptyState
                title="No Resources Found"
                onReset={() => {
                  setParams("", "resourceType");
                  setParams("", "actionByUserZUID");
                  setDefaultDateParams();
                }}
              />
            </Box>
          );
        }
        return (
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              height: "100%",
            }}
          >
            <ResourceList actions={filteredActions} showSkeletons={isLoading} />
            <Box sx={{ pl: 8, minWidth: 298, boxSizing: "border-box" }}>
              <ActivityByResource
                actions={filteredActions}
                showSkeletons={isFetching}
              />
            </Box>
          </Box>
        );
      case "users":
        if (!isLoading && !uniqueUserActions?.length) {
          return (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                height: "100%",
              }}
            >
              <EmptyState
                title="No Users Found"
                onReset={() => {
                  setParams("", "userRole");
                  setDefaultDateParams();
                }}
              />
            </Box>
          );
        }
        return (
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              height: "100%",
            }}
          >
            <UsersList
              actions={filteredActions}
              uniqueUserActions={uniqueUserActions}
              showSkeletons={isLoading}
            />
            <Box sx={{ pl: 8, minWidth: 298, boxSizing: "border-box" }}>
              <Top5Users actions={filteredActions} showSkeletons={isFetching} />
            </Box>
          </Box>
        );
      case "timeline":
        if (!isLoading && !filteredActions?.length) {
          return (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                height: "100%",
              }}
            >
              <EmptyState
                title="No Logs Found"
                onReset={() => {
                  setParams("", "action");
                  setParams("", "actionByUserZUID");
                  setDefaultDateParams();
                }}
              />
            </Box>
          );
        }
        return (
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              height: "100%",
            }}
          >
            <ActionsTimeline
              actions={filteredActions}
              showSkeletons={isLoading}
            />
            <Box sx={{ pl: 8, minWidth: 298, boxSizing: "border-box" }}>
              <Top5Users actions={filteredActions} showSkeletons={isFetching} />
            </Box>
          </Box>
        );
      case "insights":
        if (!isLoading && !filteredActions?.length) {
          return (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                height: "100%",
              }}
            >
              <EmptyState
                title="No Insights Found"
                onReset={() => {
                  setParams("", "action");
                  setParams("", "actionByUserZUID");
                  setDefaultDateParams();
                }}
              />
            </Box>
          );
        }
        const cards = [
          {
            title: filteredActions?.length,
            content: "Actions",
          },
          {
            title: uniqBy(filteredActions, "affectedZUID")?.length,
            content: "Resources Impacted",
          },
          {
            title: filteredActions?.filter((action) => action.action === 4)
              ?.length,
            content: "Publishes",
          },
        ];
        return (
          <Box>
            <Stack direction="row" gap={1.5} sx={{ py: 3 }}>
              {cards.map((card) => (
                <Card>
                  <CardHeader
                    title={
                      isFetching ? (
                        <Skeleton variant="rectangular" height={28} />
                      ) : (
                        card.title
                      )
                    }
                    sx={{ width: 200, backgroundColor: "common.white" }}
                  />
                  <CardContent>
                    <Typography variant="body2" color="text.secondary">
                      {card.content}
                    </Typography>
                  </CardContent>
                </Card>
              ))}
            </Stack>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                gap: 7.5,
              }}
            >
              <Box sx={{ width: "100%" }}>
                <ActivityByResource
                  actions={filteredActions}
                  showSkeletons={isFetching}
                />
              </Box>
              <Box sx={{ width: "100%" }}>
                <Top5Users
                  actions={filteredActions}
                  showSkeletons={isFetching}
                />
              </Box>
            </Box>
          </Box>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <Box sx={{ px: 3, pt: 3, mb: 1 }}>
        <Typography variant="h4" fontWeight={600} sx={{ mb: 0.5 }}>
          Activity Log
        </Typography>
        <Typography variant="subtitle2" color="text.secondary">
          Your instance timeline by resources and users
        </Typography>
      </Box>
      <Box sx={{ display: "flex" }}>
        <Box sx={{ borderBottom: 2, borderColor: "grey.100", width: 16 }}></Box>
        <Tabs value={tabPaths.indexOf(activeView)} onChange={handleTabChange}>
          <Tab label="RESOURCES" />
          <Tab label="USERS" />
          <Tab label="TIMELINE" />
          <Tab label="INSIGHTS" />
        </Tabs>
        <Box sx={{ borderBottom: 2, borderColor: "grey.100", flex: 1 }}></Box>
      </Box>
      <Box sx={{ px: 3 }}>
        <Filters
          actions={actions}
          filters={filtersOnView[activeView] || []}
          showSkeletons={isLoading}
        />
      </Box>
      <Box sx={{ px: 3, height: "100%", overflow: "auto" }}>
        {status === "rejected" ? (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              height: "100%",
            }}
          >
            <ApiErrorState onRetry={refetch} />
          </Box>
        ) : (
          getView()
        )}
      </Box>
    </>
  );
};
