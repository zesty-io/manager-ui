import { useMemo } from "react";
import { Box, Typography, useTheme } from "@mui/material";
import { Bar } from "react-chartjs-2";
import { uniqBy } from "lodash";
import { useParams } from "shell/hooks/useParams";
import { accountsApi } from "shell/services/accounts";

export const Top5Users = (props) => {
  const theme = useTheme();
  const [params] = useParams();
  const { data: usersRoles } = accountsApi.useGetUsersRolesQuery();

  // If userRole parameter exist use users data to filter
  const filteredUserActions = useMemo(
    () =>
      params.get("userRole")
        ? props.actions.filter(
            (action) =>
              usersRoles?.find(
                (userRole) => userRole.ZUID === action.actionByUserZUID
              )?.role?.name === params.get("userRole")
          )
        : props.actions,
    [props.actions, usersRoles, params]
  );

  const top5Users = useMemo(
    () =>
      uniqBy(filteredUserActions, "actionByUserZUID")
        .filter((action) =>
          usersRoles?.find(
            (userRole) => userRole.ZUID === action.actionByUserZUID
          )
        )
        .map((user) => ({
          ZUID: user.actionByUserZUID,
          count: filteredUserActions.filter(
            (action) => action.actionByUserZUID === user.actionByUserZUID
          ).length,
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5),
    [filteredUserActions, usersRoles]
  );

  return (
    <>
      <Typography variant="overline">TOP 5 ACTIVE USERS</Typography>
      <Typography variant="h4">{filteredUserActions.length}</Typography>
      <Typography variant="subtitle2">Actions</Typography>
      <Box sx={{ width: 238, height: 184, mt: 3, mb: 4 }}>
        <Bar
          width={"100%"}
          height={"100%"}
          options={{
            plugins: { legend: { display: false } },
            indexAxis: "y",
          }}
          data={{
            labels: top5Users.map((top5User) => {
              const user = usersRoles.find(
                (userRole) => userRole.ZUID === top5User.ZUID
              );
              return `${user.firstName} ${user.lastName.charAt(0)}.`;
            }),
            datasets: [
              {
                label: "",
                data: top5Users.map((user) => user.count),
                backgroundColor: theme.palette.primary.main,
                barThickness: 24,
              },
            ],
          }}
        />
      </Box>
    </>
  );
};
