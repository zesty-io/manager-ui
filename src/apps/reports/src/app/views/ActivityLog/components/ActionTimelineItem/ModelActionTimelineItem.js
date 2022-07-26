import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchModel } from "shell/store/models";
import { TimelineItem } from "./TimelineItem";

export const ModelActionTimelineItem = (props) => {
  const dispatch = useDispatch();
  const [modelError, setModelError] = useState(false);

  const modelData = useSelector((state) =>
    Object.values(state.models).find(
      (item) => item.ZUID === props.action.affectedZUID
    )
  );

  useEffect(() => {
    if (!modelData && !modelError) {
      dispatch(fetchModel(props.action.affectedZUID)).catch(() =>
        setModelError(true)
      );
    }
  }, [modelData, modelError]);

  return (
    <TimelineItem
      action={props.action}
      itemName={
        modelError ? `${props.action.affectedZUID} (Deleted)` : modelData?.label
      }
      renderConnector={props.renderConnector}
    />
  );
};
