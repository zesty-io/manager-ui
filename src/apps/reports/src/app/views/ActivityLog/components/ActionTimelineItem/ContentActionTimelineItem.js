import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { searchItems } from "shell/store/content";
import { TimelineItem } from "./TimelineItem";
import { fetchModel } from "shell/store/models";

export const ContentActionTimelineItem = (props) => {
  const dispatch = useDispatch();
  const [contentError, setContentError] = useState(false);
  const [modelError, setModelError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const contentData = useSelector((state) =>
    Object.values(state.content).find(
      (item) => item.meta.ZUID === props.action.affectedZUID
    )
  );

  const modelData = useSelector((state) =>
    Object.values(state.models).find(
      (item) => item.ZUID === contentData?.meta?.contentModelZUID
    )
  );

  useEffect(() => {
    if (!contentData && !contentError) {
      setIsLoading(true);
      dispatch(searchItems(props.action.affectedZUID))
        .then((res) => !res.data.length && setContentError(true))
        .finally(() => setIsLoading(false));
    }
    if (!modelData && contentData && !modelError) {
      setIsLoading(true);
      dispatch(fetchModel(contentData.meta.contentModelZUID))
        .catch(() => setModelError(true))
        .finally(() => setIsLoading(false));
    }
  }, [contentData, contentError, modelData, modelError]);

  return (
    <TimelineItem
      action={props.action}
      itemName={
        contentError
          ? `${props.action.affectedZUID} (Deleted)`
          : contentData?.web?.metaTitle
          ? contentData?.web?.metaTitle
          : `${props.action.affectedZUID} (Missing Meta Title)`
      }
      itemSubtext={modelData && modelData?.label}
      renderConnector={props.renderConnector}
      showSkeletons={isLoading}
    />
  );
};
