import { useMemo, FC, CSSProperties } from "react";
import { FixedSizeList as List } from "react-window";
import moment from "moment";
import { useWindowSize } from "react-use";
import { Typography, Skeleton, Box } from "@mui/material";
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
  const { width, height } = useWindowSize();

  const actionsWithHeaders = useMemo(() => {
    let arr: ActionsWithHeaders = [];

    actions?.forEach((action) => {
      const formattedDate = moment(action.happenedAt).format("LL");

      if (!arr.includes(formattedDate)) {
        arr.push(formattedDate);
      }

      arr.push(action);
    });

    return arr;
  }, [actions]);

  const Row = ({ index, data, style }: ListRowProps) => {
    const action = data[index];

    if (typeof action === "string") {
      return (
        <Box sx={style}>
          <Typography variant="h5" fontWeight={600}>
            {showSkeletons ? (
              <Skeleton variant="rectangular" width={120} />
            ) : moment().isSame(action, "day") ? (
              "Today"
            ) : moment().add(-1, "days").isSame(action, "day") ? (
              "Yesterday"
            ) : (
              action
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
    <List
      height={height - 284}
      itemCount={showSkeletons ? 10 : actionsWithHeaders.length}
      itemSize={79}
      width={"100%"}
      itemData={showSkeletons ? skeletonDataset : actionsWithHeaders}
    >
      {Row}
    </List>
  );
};
