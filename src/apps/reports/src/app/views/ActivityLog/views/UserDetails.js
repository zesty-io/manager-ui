import { useState, useEffect, useMemo } from "react";
import { Box, Button, Stack } from "@mui/material";
import { useParams } from "shell/hooks/useParams";
import moment from "moment";
import { instanceApi } from "shell/services/instance";
import { Filters } from "../components/Filters";
import { ResourceList } from "../components/ResourceList";
import { ActivityByResource } from "../components/ActivityByResource";
import { accountsApi } from "shell/services/accounts";
import { filterByParams } from "utility/filterByParams";
import { notify } from "shell/store/notifications";
import { useDispatch } from "react-redux";
import EmailIcon from "@mui/icons-material/Email";
import { UserHeaderTitle } from "../components/UserHeaderTitle";
import { toUTC } from "../utils";

export const UserDetails = () => {
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
      setParams(moment().format("YYYY-MM-DD"), "to");
    }
    /*
      Initialized get sets to true after setting date params to then be utilized to determine 
      if API call is ready to be executed
    */
    setInitialized(true);
  }, [usersLoading, location.pathname]);

  const {
    data: actionsByZuid,
    isLoading,
    isFetching,
    isUninitialized,
  } = instanceApi.useGetAuditsQuery(
    {
      userZUID: zuid,
      ...(params.get("from") && {
        start_date: toUTC(params.get("from")),
      }),
      ...(params.get("to") && {
        end_date: toUTC(params.get("to")),
      }),
    },
    { skip: !initialized }
  );

  const filteredActions = useMemo(
    () => (actionsByZuid?.length ? filterByParams(actionsByZuid, params) : []),
    [actionsByZuid, params]
  );

  const actionCount = useMemo(() => {
    if (usersRoles) {
      return filteredActions?.filter(
        (action) => action.actionByUserZUID === zuid
      ).length;
    }

    return 0;
  }, [usersRoles, filteredActions]);

  return (
    <>
      <Stack
        px={4}
        pt={4}
        pb={2}
        flexDirection="row"
        justifyContent="space-between"
        alignItems="flex-start"
      >
        <UserHeaderTitle
          actionCount={actionCount}
          latestActionDateTime={actionsByZuid?.[0]?.updatedAt}
          isLoadingActions={isLoading}
        />
        <Stack flexDirection="row" gap={1}>
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
        </Stack>
      </Stack>
      <Box sx={{ px: 4, pt: 0.5, backgroundColor: "grey.50" }}>
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
    </>
  );
};
