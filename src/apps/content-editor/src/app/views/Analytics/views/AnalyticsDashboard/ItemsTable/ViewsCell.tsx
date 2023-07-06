import { Box, Skeleton, Typography } from "@mui/material";

import { useSearchContentQuery } from "../../../../../../../../../shell/services/instance";
import { calculatePercentageDifference } from "../../../utils";
import { numberFormatter } from "../../../../../../../../../utility/numberFormatter";
import { theme } from "@zesty-io/material";
import { Line } from "react-chartjs-2";
import { useHistory } from "react-router";

export const ViewsCell = ({
  path,
  totalSessions,
  totalPriorSessions,
  sessionsByDay,
}: {
  path?: string;
  totalSessions: number;
  totalPriorSessions: number;
  sessionsByDay: string[];
}) => {
  const history = useHistory();
  const { data: item } = useSearchContentQuery({
    query: path,
    limit: 1,
  });
  const foundItem = item?.[0]?.web?.path === path ? item?.[0] : null;
  if (!path) return <Skeleton width="100%" />;

  const paddedSessionsByDay = !sessionsByDay.length
    ? [0, 0]
    : sessionsByDay?.map((session) => +session)?.length === 1
    ? [0, +sessionsByDay[0]]
    : sessionsByDay?.map((session) => +session);
  return (
    <Box
      display="flex"
      gap={1.5}
      alignItems="center"
      onClick={() =>
        history.push(
          `/content/${foundItem.meta.contentModelZUID}/${foundItem.meta.ZUID}`
        )
      }
    >
      <Box>
        <Typography variant="body1" textAlign="right">
          {numberFormatter.format(totalSessions)}
        </Typography>
        <Box height="28px" width="73px">
          <Line
            data={{
              labels: paddedSessionsByDay?.map((_, i) => i),
              datasets: [
                {
                  backgroundColor: theme.palette.info.main,
                  borderColor: theme.palette.info.main,
                  pointRadius: 0,
                  data: paddedSessionsByDay,
                  borderWidth: 1,
                  tension: 0.1,
                },
              ],
            }}
            options={{
              layout: {
                padding: {
                  top: 8,
                  bottom: 8,
                  left: 0,
                  right: 0,
                },
              },
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  display: false,
                },
                tooltip: {
                  enabled: false,
                },
              },
              scales: {
                x: {
                  display: false,
                },
                y: {
                  display: false,
                  min:
                    Math.min(
                      ...paddedSessionsByDay?.map((session) => +session)
                    ) || -1,
                  max:
                    Math.max(
                      ...paddedSessionsByDay?.map((session) => +session)
                    ) || 1,
                },
              },
            }}
          />
        </Box>
      </Box>
      <Typography
        variant="body3"
        color={
          calculatePercentageDifference(
            totalPriorSessions,
            totalSessions
          ).startsWith("-")
            ? "error.main"
            : "success.main"
        }
        fontWeight={600}
      >
        {calculatePercentageDifference(totalPriorSessions, totalSessions)}
      </Typography>
    </Box>
  );
};
