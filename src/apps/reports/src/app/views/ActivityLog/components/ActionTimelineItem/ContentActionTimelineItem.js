import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { searchItems } from "shell/store/content";
import { TimelineItem } from "./TimelineItem";

export const ContentActionTimelineItem = (props) => {
  const dispatch = useDispatch();
  const [contentError, setContentError] = useState(false);

  const contentData = useSelector((state) =>
    Object.values(state.content).find(
      (item) => item.meta.ZUID === props.action.affectedZUID
    )
  );

  useEffect(() => {
    if (!contentData && !contentError) {
      dispatch(searchItems(props.action.affectedZUID))
        .then((res) => !res.data.length && setContentError(true))
        .catch(() => setContentError(true));
    }
  }, [contentData, contentError]);

  return (
    <TimelineItem
      action={props.action}
      itemName={
        contentError
          ? `${props.action.affectedZUID} (Deleted)`
          : contentData?.web?.metaTitle
          ? contentData?.web?.metaTitle
          : "(No Meta Title)"
      }
      renderConnector={props.renderConnector}
    />
  );
};
