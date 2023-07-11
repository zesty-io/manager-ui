import { Box, Skeleton, Typography } from "@mui/material";
import { useSearchContentQuery } from "../../../../../../../../../shell/services/instance";
import moment from "moment-timezone";
import { numberFormatter } from "../../../../../../../../../utility/numberFormatter";
import { useHistory } from "react-router";
import { ContentItem } from "../../../../../../../../../shell/services/types";

export const StatsCell = ({
  item,
  users,
  avgSessionDuration,
}: {
  item: ContentItem;
  users: number;
  avgSessionDuration: number;
}) => {
  const history = useHistory();

  if (!item)
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
        history.push(`/content/${item.meta.contentModelZUID}/${item.meta.ZUID}`)
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
