import { useMemo } from "react";
import { FixedSizeList as List } from "react-window";
import moment from "moment";
import { useWindowSize } from "react-use";
import { Typography } from "@mui/material";
import { ActionTimelineItem } from "./ActionTimelineItem";

export const ActionsTimeline = (props) => {
  const { width, height } = useWindowSize();

  const actionsWithHeaders = useMemo(() => {
    let arr = [];
    props.actions.forEach((action) => {
      const formattedDate = moment(action.happenedAt).format("LL");
      if (!arr.includes(formattedDate)) {
        arr.push(formattedDate);
      }

      arr.push(action);
    });
    return arr;
  });

  const Row = ({ index, data, style }) => {
    const action = data[index];

    if (typeof action === "string") {
      return (
        <div style={style}>
          <Typography sx={{ py: 5 }} variant="h5" fontWeight={600}>
            {moment().isSame(action, "day")
              ? "Today"
              : moment().add(-1, "days").isSame(action, "day")
              ? "Yesterday"
              : action}
          </Typography>
        </div>
      );
    }

    return (
      <div style={style} key={action.ZUID}>
        <ActionTimelineItem
          action={action}
          renderConnector={
            actionsWithHeaders[index + 1] &&
            typeof actionsWithHeaders[index + 1] !== "string"
          }
        />
      </div>
    );
  };

  return (
    <List
      height={height - 292}
      itemCount={actionsWithHeaders.length}
      itemSize={110}
      width={"100%"}
      itemData={actionsWithHeaders}
    >
      {Row}
    </List>
  );
};
