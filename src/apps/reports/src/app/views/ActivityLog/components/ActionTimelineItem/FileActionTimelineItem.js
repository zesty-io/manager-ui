import { useSelector } from "react-redux";
import { TimelineItem } from "./TimelineItem";

export const FileActionTimelineItem = (props) => {
  const fileData = useSelector((state) =>
    Object.values(state.files).find(
      (item) => item.ZUID === props.action.affectedZUID
    )
  );

  return (
    <TimelineItem
      action={props.action}
      itemName={
        !fileData
          ? `${props.action.affectedZUID} (Deleted)`
          : fileData?.fileName
      }
      itemSubtext="Code"
      renderConnector={props.renderConnector}
    />
  );
};
