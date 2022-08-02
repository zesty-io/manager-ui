import { useEffect, useMemo, useState } from "react";
import moment from "moment";
import { faEdit } from "@fortawesome/free-solid-svg-icons";
import { useSelector, useDispatch } from "react-redux";
import { searchItems } from "shell/store/content";
import { fetchModel } from "shell/store/models";
import { ListItem } from "./ListItem";

const modelTypeName = {
  templateset: "Single Page Item",
  pageset: "Multi Page Item",
  dataset: "Headless Data Item",
};

export const ContentResourceListItem = (props) => {
  const dispatch = useDispatch();
  const [contentError, setContentError] = useState(false);
  const [modelError, setModelError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const contentData = useSelector((state) =>
    Object.values(state.content).find(
      (item) => item.meta.ZUID === props.affectedZUID
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
      dispatch(searchItems(props.affectedZUID))
        .then((res) => !res?.data?.length && setContentError(true))
        .finally(() => setIsLoading(false));
    }
  }, [contentData, contentError]);

  useEffect(() => {
    if (!modelData && contentData && !modelError) {
      setIsLoading(true);
      dispatch(fetchModel(contentData.meta.contentModelZUID))
        .catch(() => setModelError(true))
        .finally(() => setIsLoading(false));
    }
  }, [contentData, modelData, modelError]);

  const secondaryText = useMemo(() => {
    const chips = [
      `Last action @ ${
        moment(props.updatedAt).isSame(new Date(), "year")
          ? moment(props.updatedAt).format("MMM D, h:mm A")
          : moment(props.updatedAt).format("ll, h:mm A")
      }`,
    ];
    if (modelData) {
      chips.push(modelTypeName[modelData?.type]);
    }
    if (contentData?.web?.metaTitle !== modelData?.label) {
      chips.push(modelData?.label);
    }
    return chips.join(" • ");
  }, [contentData, modelData]);

  return (
    <ListItem
      divider={props.divider}
      size={props.size}
      clickable={props.clickable}
      affectedZUID={props.affectedZUID}
      icon={faEdit}
      primary={
        contentError
          ? `${props.affectedZUID} (Deleted)`
          : contentData?.web?.metaTitle
          ? contentData?.web?.metaTitle
          : `${props.affectedZUID} (Missing Meta Title)`
      }
      secondary={secondaryText}
      showSkeletons={isLoading}
    />
  );
};
