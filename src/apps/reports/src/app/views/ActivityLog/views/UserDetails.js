import { useState, useEffect, useMemo } from "react";
import { Box, Button, Link, Breadcrumbs } from "@mui/material";
import { useParams } from "shell/hooks/useParams";
import moment from "moment";
import { instanceApi } from "shell/services/instance";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { useHistory } from "react-router";
import { Filters } from "../components/Filters";
import { ResourceList } from "../components/ResourceList";
import { ActivityByResource } from "../components/ActivityByResource";
import { UserListItem } from "../components/UserListItem";
import { accountsApi } from "shell/services/accounts";
import { filterByParams } from "utility/filterByParams";
import { notify } from "shell/store/notifications";
import { useDispatch } from "react-redux";
import EmailIcon from "@mui/icons-material/Email";

export const UserDetails = () => {
  const history = useHistory();
  const dispatch = useDispatch();
  const [params, setParams] = useParams();
  const [initialized, setInitialized] = useState(false);
  const { data: usersRoles, isLoading: usersLoading } =
    accountsApi.useGetUsersRolesQuery();

  const zuid = useMemo(
    () => location.pathname.split("/").pop(),
    [location.pathname]
  );

  useEffect(() => {
    // If there are no date parameters set, sets date parameters from when the user was created
    if (!params.get("from") && !params.get("to") && !usersLoading) {
      const userCreatedDate = usersRoles?.find(
        (userRole) => userRole.ZUID === zuid
      )?.createdAt;
      setParams(moment(userCreatedDate).format("YYYY-MM-DD"), "from");
      setParams(moment().add(1, "days").format("YYYY-MM-DD"), "to");
    }
    /*
      Initialized get sets to true after setting date params to then be utilized to determine 
      if API call is ready to be executed
    */
    setInitialized(true);
  }, [usersLoading]);

  const {
    data: actionsByZuid,
    isLoading,
    isFetching,
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
    () => (actionsByZuid?.length ? filterByParams(actionsByZuid, params) : []),
    [actionsByZuid, params]
  );

  return (
    <Box sx={{ pt: 3 }}>
      <Breadcrumbs
        separator={
          <ChevronRightIcon fontSize="small" sx={{ color: "action.active" }} />
        }
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
          px: 3,
          borderBottom: "1px solid",
          borderColor: "divider",
          pb: 1,
        }}
      >
        <UserListItem
          action={actionsByZuid?.[0]}
          actions={actionsByZuid}
          size="large"
          showSkeletons={isLoading}
        />
        <Box sx={{ pt: 2 }}>
          <Button
            startIcon={<EmailIcon />}
            variant="contained"
            size="small"
            onClick={() =>
              navigator?.clipboard
                ?.writeText(
                  usersRoles?.find((userRole) => userRole.ZUID === zuid)?.email
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
      <Box sx={{ px: 3 }}>
        <Filters
          actions={actionsByZuid}
          filters={["happenedAt", "resourceType"]}
          showSkeletons={isLoading}
        />
        <Box sx={{ display: "flex", justifyContent: "space-between" }}>
          <ResourceList actions={filteredActions} showSkeletons={isLoading} />
          <Box sx={{ pl: 8, minWidth: 298, boxSizing: "border-box" }}>
            <ActivityByResource
              actions={filteredActions}
              showSkeletons={isFetching}
            />
          </Box>
        </Box>
      </Box>
    </Box>
  );
};
