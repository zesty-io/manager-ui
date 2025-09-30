import { Box, Skeleton, Typography } from "@mui/material";
import { useSearchContentQuery } from "../../../../../../../../../shell/services/instance";
import { numberFormatter } from "../../../../../../../../../utility/numberFormatter";
import { useHistory } from "react-router";

const formatMMSS = (totalSeconds: number) => {
  const m = Math.floor((totalSeconds || 0) / 60);
  const s = Math.floor((totalSeconds || 0) % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
};

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

  if (isFetching || !path) {
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
  }

  return (
    <Box
      onClick={() => {
        if (foundItem) {
          history.push(
            `/content/${foundItem.meta.contentModelZUID}/${foundItem.meta.ZUID}`
          );
        }
      }}
      sx={{ cursor: foundItem ? "pointer" : "default" }}
    >
      <Typography variant="body1" fontSize="12px">
        {numberFormatter.format(users)} users
      </Typography>
      <Typography variant="body1" fontSize="12px">
        {formatMMSS(avgSessionDuration)} avg. time
      </Typography>
    </Box>
  );
};
