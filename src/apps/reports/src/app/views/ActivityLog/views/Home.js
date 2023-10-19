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
  SvgIcon,
} from "@mui/material";
import { useLocation, useHistory } from "react-router-dom";
import {
  CategoryRounded,
  GroupsRounded,
  ViewTimelineRounded,
  InsightsRounded,
} from "@mui/icons-material";

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
import { TopUsers } from "../components/TopUsers";
import { isEmpty, omitBy, uniqBy } from "lodash";
import { EmptyState } from "../components/EmptyState";
import { ApiErrorState } from "../components/ApiErrorState";

const tabPaths = ["resources", "users", "timeline", "insights"];

const filtersOnView = {
  resources: ["happenedAt", "resourceType", "actionByUserZUID"],
  users: ["sortByUsers", "userRole"],
  timeline: ["action", , "resourceType", "actionByUserZUID"],
  insights: ["action", "actionByUserZUID"],
};

const TABS = [
  {
    name: "Resources",
    icon: CategoryRounded,
  },
  {
    name: "Users",
    icon: GroupsRounded,
  },
  {
    name: "Timeline",
    icon: ViewTimelineRounded,
  },
  {
    name: "Insights",
    icon: InsightsRounded,
  },
];

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
  }, [location.pathname]);

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
    setParams(moment().format("YYYY-MM-DD"), "to");
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
              <TopUsers actions={filteredActions} showSkeletons={isFetching} />
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
                  setParams("", "resourceType");
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
              <TopUsers actions={filteredActions} showSkeletons={isFetching} />
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
            <Stack direction="row" gap={1.5} sx={{ pb: 2 }}>
              {cards.map((card) => (
                <Card
                  variant="outlined"
                  elevation={0}
                  sx={{ borderColor: "border", borderRadius: 2 }}
                >
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
                alignItems: "flex-start",
                gap: 2,
              }}
            >
              <Box
                sx={{
                  width: "100%",
                  backgroundColor: "background.paper",
                  border: 1,
                  borderColor: "border",
                  borderRadius: 2,
                  py: 1,
                  px: 2,
                }}
              >
                <ActivityByResource
                  actions={filteredActions}
                  showSkeletons={isFetching}
                />
              </Box>
              <Box
                sx={{
                  width: "100%",
                  backgroundColor: "background.paper",
                  border: 1,
                  borderColor: "border",
                  borderRadius: 2,
                  py: 1,
                  px: 2,
                }}
              >
                <TopUsers
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
      <Box px={4} pt={4} pb={2}>
        <Typography variant="h3" fontWeight={700} sx={{ mb: 0.25 }}>
          Activity Log
        </Typography>
        <Typography variant="subtitle2" color="text.secondary">
          Your instance timeline by resources and users
        </Typography>
      </Box>
      <Box sx={{ borderBottom: 2, borderColor: "border" }}>
        <Tabs
          value={tabPaths.indexOf(activeView)}
          onChange={handleTabChange}
          sx={{
            position: "relative",
            top: "2px",
            px: 4,
          }}
        >
          {TABS.map((tab) => (
            <Tab
              icon={<SvgIcon component={tab.icon} fontSize="small" />}
              iconPosition="start"
              label={tab.name}
              disableRipple
            />
          ))}
        </Tabs>
      </Box>
      <Box sx={{ px: 4, py: 0.5, backgroundColor: "grey.50" }}>
        <Filters
          actions={actions}
          filters={filtersOnView[activeView] || []}
          showSkeletons={isLoading}
        />
      </Box>
      <Box
        sx={{
          px: 4,
          height: "100%",
          overflow: "auto",
          backgroundColor: "grey.50",
        }}
      >
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
