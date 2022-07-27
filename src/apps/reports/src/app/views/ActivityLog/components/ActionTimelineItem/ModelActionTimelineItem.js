import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchModel } from "shell/store/models";
import { TimelineItem } from "./TimelineItem";

export const ModelActionTimelineItem = (props) => {
  const dispatch = useDispatch();
  const [modelError, setModelError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const modelData = useSelector((state) =>
    Object.values(state.models).find(
      (item) => item.ZUID === props.action.affectedZUID
    )
  );

  useEffect(() => {
    if (!modelData && !modelError) {
      setIsLoading(true);
      dispatch(fetchModel(props.action.affectedZUID))
        .catch(() => setModelError(true))
        .finally(() => setIsLoading(false));
    }
  }, [modelData, modelError]);

  return (
    <TimelineItem
      action={props.action}
      itemName={`Field ${props.action.meta?.message?.split(" ")?.[2]}`}
      itemSubtext={
        modelError ? `${props.action.affectedZUID} (Deleted)` : modelData?.label
      }
      renderConnector={props.renderConnector}
      showSkeleton={isLoading}
    />
  );
};
