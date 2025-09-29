import { useMemo, FC, CSSProperties } from "react";
import { FixedSizeList as List } from "react-window";
import { Typography, Skeleton, Box } from "@mui/material";
import AutoSizer, { Size } from "react-virtualized-auto-sizer";
import { format, subDays } from "date-fns";

import { ActionTimelineItem } from "./ActionTimelineItem";
import { TimelineItem } from "./ActionTimelineItem/TimelineItem";
import { Audit } from "../../../../../../../shell/services/types";

const skeletonDataset = ["-", {}, {}, {}, "-", {}, {}, {}];

type ActionsWithHeaders = (string | Audit)[];
interface ListRowProps {
  index: number;
  data: ActionsWithHeaders;
  style: CSSProperties;
}
interface ActionsTimelineProps {
  showSkeletons: boolean;
  actions: Audit[];
}
export const ActionsTimeline: FC<ActionsTimelineProps> = ({
  showSkeletons,
  actions,
}) => {
  const actionsWithHeaders = useMemo(() => {
    const arr: ActionsWithHeaders = [];
    const seen = new Set<string>();

    actions?.forEach((action) => {
      const d = new Date(action.happenedAt);
      const formattedDate = format(d, "MMMM d, yyyy");

      if (!seen.has(formattedDate)) {
        arr.push(formattedDate);
        seen.add(formattedDate);
      }

      arr.push(action);
    });

    return arr;
  }, [actions]);

  const todayLabel = format(new Date(), "MMMM d, yyyy");
  const yesterdayLabel = format(subDays(new Date(), 1), "MMMM d, yyyy");

  const Row = ({ index, data, style }: ListRowProps) => {
    const action = data[index];

    if (typeof action === "string") {
      const headerText = showSkeletons
        ? null
        : action === todayLabel
        ? "Today"
        : action === yesterdayLabel
        ? "Yesterday"
        : action;

      return (
        <Box sx={style}>
          <Typography variant="h5" fontWeight={600}>
            {showSkeletons ? (
              <Skeleton variant="rectangular" width={120} />
            ) : (
              headerText
            )}
          </Typography>
        </Box>
      );
    }

    if (showSkeletons) {
      return (
        <Box sx={style}>
          <TimelineItem
            showSkeletons
            divider
            renderConnector={
              skeletonDataset[index + 1] &&
              typeof skeletonDataset[index + 1] !== "string"
            }
          />
        </Box>
      );
    }

    return (
      <Box sx={style} key={action.ZUID}>
        <ActionTimelineItem
          action={action}
          renderConnector={
            actionsWithHeaders[index + 1] &&
            typeof actionsWithHeaders[index + 1] !== "string"
          }
        />
      </Box>
    );
  };

  return (
    <Box data-cy="resource_list" flex={1}>
      <AutoSizer>
        {({ height, width }: Size) => (
          <List
            height={height}
            itemCount={showSkeletons ? 10 : actionsWithHeaders.length}
            itemSize={79}
            width={width}
            itemData={showSkeletons ? skeletonDataset : actionsWithHeaders}
          >
            {Row}
          </List>
        )}
      </AutoSizer>
    </Box>
  );
};
