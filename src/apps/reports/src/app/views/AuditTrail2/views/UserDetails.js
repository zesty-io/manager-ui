import { useState, useEffect, useMemo } from "react";
import { Box, Button, Link, Breadcrumbs } from "@mui/material";
import { useParams } from "shell/hooks/useParams";
import moment from "moment";
import { instanceApi } from "shell/services/instance";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { omitBy, isEmpty } from "lodash";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope } from "@fortawesome/free-solid-svg-icons";
import { useHistory } from "react-router";
import { Filters } from "../components/Filters";
import { ResourceList } from "../components/ResourceList";
import { ActivityByResource } from "../components/ActivityByResource";
import { UserListItem } from "../components/UserListItem";
import { accountsApi } from "shell/services/accounts";
import { filterByParams } from "utility/filterByParams";
import { notify } from "shell/store/notifications";
import { useDispatch } from "react-redux";

export const UserDetails = () => {
  const history = useHistory();
  const dispatch = useDispatch();
  const [params, setParams] = useParams();
  const [initialized, setInitialized] = useState(false);
  const { data: usersRoles } = accountsApi.useGetUsersRolesQuery();

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

  const zuid = useMemo(
    () => location.pathname.split("/").pop(),
    [location.pathname]
  );

  const {
    data: actionsByZuid,
    isLoading,
    isUninitialized,
  } = instanceApi.useGetAuditsQuery(
    {
      userZUID: zuid,
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
    () => (actionsByZuid ? filterByParams(actionsByZuid, params) : []),
    [actionsByZuid, params]
  );

  return (
    <Box sx={{ pt: 1.75 }}>
      <Breadcrumbs
        separator={<ChevronRightIcon fontSize="small" />}
        sx={{ px: 3 }}
      >
        <Link
          underline="none"
          variant="caption"
          color="text.secondary"
          href="#"
          onClick={(e) => {
            e.preventDefault();
            history.push({
              pathname: `/reports/activity-log/resources`,
              // Persist date selection
              search: new URLSearchParams(
                omitBy(
                  { from: params.get("from"), to: params.get("to") },
                  isEmpty
                )
              ).toString(),
            });
          }}
        >
          Activity Log
        </Link>
        <Link
          underline="none"
          variant="caption"
          color="text.secondary"
          href="#"
          onClick={(e) => {
            e.preventDefault();
            history.push({
              pathname: `/reports/activity-log/users`,
              // Persist date selection
              search: new URLSearchParams(
                omitBy(
                  { from: params.get("from"), to: params.get("to") },
                  isEmpty
                )
              ).toString(),
            });
          }}
        >
          Users
        </Link>
      </Breadcrumbs>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          px: 1,
          borderBottom: "1px solid rgba(0, 0, 0, 0.12)",
        }}
      >
        <UserListItem
          action={actionsByZuid?.[0]}
          actions={actionsByZuid}
          size="large"
          showSkeletons={isLoading}
        />
        <Box>
          <Button
            sx={{ height: "max-content" }}
            startIcon={<FontAwesomeIcon icon={faEnvelope} />}
            variant="contained"
            size="small"
            onClick={() =>
              navigator?.clipboard
                ?.writeText(
                  usersRoles?.find(
                    (userRole) =>
                      userRole.ZUID === actionsByZuid[0].actionByUserZUID
                  )?.email
                )
                .then(() =>
                  dispatch(
                    notify({
                      kind: "success",
                      message: `User email copied to the clipboard`,
                    })
                  )
                )
            }
          >
            Message
          </Button>
        </Box>
      </Box>
      <Box sx={{ px: 3, mt: 3 }}>
        <Filters
          actions={actionsByZuid}
          filters={["happenedAt", "resourceType"]}
          showSkeletons={isLoading}
        />
        <Box sx={{ display: "flex", gap: 17 }}>
          <ResourceList actions={filteredActions} showSkeletons={isLoading} />
          <Box sx={{ px: 4, py: 2.5, minWidth: 298, boxSizing: "border-box" }}>
            <ActivityByResource
              actions={filteredActions}
              showSkeletons={isLoading}
            />
          </Box>
        </Box>
      </Box>
    </Box>
  );
};
