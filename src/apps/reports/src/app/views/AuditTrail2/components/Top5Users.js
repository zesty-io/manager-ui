import { useMemo } from "react";
import { Box, Typography, useTheme } from "@mui/material";
import { Bar } from "react-chartjs-2";
import { uniqBy } from "lodash";
import { useSelector } from "react-redux";

export const Top5Users = (props) => {
  const theme = useTheme();

  const users = useSelector((state) => state.users);

  const top5Users = useMemo(
    () =>
      uniqBy(props.actions, "actionByUserZUID")
        .filter((action) =>
          users?.find((user) => user.ZUID === action.actionByUserZUID)
        )
        .map((user) => ({
          ZUID: user.actionByUserZUID,
          count: props.actions.filter(
            (action) => action.actionByUserZUID === user.actionByUserZUID
          ).length,
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5),
    [props.actions]
  );

  return (
    <>
      <Typography variant="overline">TOP 5 ACTIVE USERS</Typography>
      <Typography variant="h4">{props.actions.length}</Typography>
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
              const user = users.find((user) => user.ZUID === top5User.ZUID);
              return `${user.firstName} ${user.lastName.charAt(0)}.`;
            }),
            datasets: [
              {
                label: "",
                data: top5Users.map((user) => user.count),
                backgroundColor: theme.palette.primary.main,
                barThickness: 24,
                legend: {
                  display: false,
                },
              },
            ],
          }}
        />
      </Box>
    </>
  );
};
