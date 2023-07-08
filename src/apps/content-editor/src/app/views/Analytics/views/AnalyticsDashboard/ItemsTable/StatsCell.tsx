import { Box, Skeleton, Typography } from "@mui/material";
import { useSearchContentQuery } from "../../../../../../../../../shell/services/instance";
import moment from "moment-timezone";
import { numberFormatter } from "../../../../../../../../../utility/numberFormatter";
import { useHistory } from "react-router";

export const StatsCell = ({
  path,
  users,
  avgSessionDuration,
}: {
  path?: string;
  users: number;
  avgSessionDuration: number;
}) => {
  const history = useHistory();
  const { data: item, isFetching } = useSearchContentQuery({
    query: path,
    limit: 1,
  });
  const foundItem = item?.[0]?.web?.path === path ? item?.[0] : null;
  if (isFetching || !path)
    return (
      <Box width="100%">
        <Skeleton
          height="12px"
          width="100%"
          variant="rectangular"
          sx={{ mb: 0.5 }}
        />
        <Skeleton height="12px" width="100%" variant="rectangular" />
      </Box>
    );
  return (
    <Box
      onClick={() =>
        history.push(
          `/content/${foundItem.meta.contentModelZUID}/${foundItem.meta.ZUID}`
        )
      }
    >
      <Typography variant="body1" fontSize="12px">
        {numberFormatter.format(users)} users
      </Typography>
      <Typography variant="body1" fontSize="12px">
        {Math.floor(
          moment.duration(avgSessionDuration, "seconds").asMinutes()
        ) +
          ":" +
          moment
            .duration(avgSessionDuration, "seconds")
            .seconds()
            .toString()
            .padStart(2, "0")}{" "}
        avg. time
      </Typography>
    </Box>
  );
};
