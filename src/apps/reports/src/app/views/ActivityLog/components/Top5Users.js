import { useMemo } from "react";
import { Box, Typography, useTheme, Skeleton } from "@mui/material";
import { Bar } from "react-chartjs-2";
import { uniqBy } from "lodash";
import ChartDataLabels from "chartjs-plugin-datalabels";
import { useParams } from "shell/hooks/useParams";
import { accountsApi } from "shell/services/accounts";

export const Top5Users = (props) => {
  const theme = useTheme();
  const [params] = useParams();
  const { data: usersRoles } = accountsApi.useGetUsersRolesQuery();

  // If userRole parameter is present use users data to filter
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
      <Typography variant="overline">
        {props.showSkeletons ? (
          <Skeleton
            variant="reactangular"
            width={159}
            height={16}
            sx={{ mb: 2.75 }}
          />
        ) : (
          "TOP 5 ACTIVE USERS"
        )}
      </Typography>
      <Typography variant="h4" fontWeight={600}>
        {props.showSkeletons ? (
          <Skeleton
            variant="reactangular"
            width={44}
            height={20}
            sx={{ mb: 1.75 }}
          />
        ) : (
          filteredUserActions.length
        )}
      </Typography>
      <Typography variant="subtitle2">
        {props.showSkeletons ? (
          <Skeleton variant="reactangular" width={52} height={12} />
        ) : (
          "Actions"
        )}
      </Typography>
      <Box sx={{ height: 184, mt: 3, mb: 4 }}>
        {props.showSkeletons ? (
          Array(5)
            .fill({})
            .map((_, idx) => (
              <Box
                key={idx}
                sx={{ display: "flex", alignItems: "center", mb: 2 }}
              >
                <Skeleton
                  variant="reactangular"
                  height={12}
                  width={52}
                  sx={{ mr: 1 }}
                />
                <Skeleton
                  variant="reactangular"
                  height={24}
                  width={`${80 - 16 * idx}%`}
                />
              </Box>
            ))
        ) : (
          <Bar
            width={"100%"}
            height={"100%"}
            plugins={[ChartDataLabels]}
            options={{
              plugins: {
                legend: { display: false },
                datalabels: {
                  color: "#fff",
                  anchor: "start",
                  align: "end",
                  padding: 8,
                  clip: true,
                },
              },
              maintainAspectRatio: false,
              indexAxis: "y",
              scales: {
                x: {
                  display: false,
                },
                y: {
                  grid: {
                    display: false,
                    drawBorder: false,
                  },
                },
              },
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
        )}
      </Box>
    </>
  );
};
