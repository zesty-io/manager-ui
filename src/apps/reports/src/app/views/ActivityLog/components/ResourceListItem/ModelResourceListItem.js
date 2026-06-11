import { useState, useEffect } from "react";
import { faDatabase } from "@fortawesome/free-solid-svg-icons";
import { useSelector, useDispatch } from "react-redux";
import { fetchModel } from "shell/store/models";
import { ListItem } from "./ListItem";
import { formatLocalized } from "shell/i18n-dates";
import { isValid, isSameYear } from "date-fns";

export const ModelResourceListItem = (props) => {
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const [modelError, setModelError] = useState(false);

  const modelData = useSelector((state) =>
    Object.values(state.models).find((item) => item.ZUID === props.affectedZUID)
  );

  useEffect(() => {
    if (!modelData && !modelError) {
      setIsLoading(true);
      dispatch(fetchModel(props.affectedZUID))
        .catch(() => setModelError(true))
        .finally(() => setIsLoading(false));
    }
  }, [modelData, modelError]);

  const d = new Date(props.updatedAt);
  const lastAction =
    isValid(d) && isSameYear(d, new Date())
      ? formatLocalized(d, "MMM d, h:mm a")
      : isValid(d)
      ? formatLocalized(d, "MMM d, yyyy, h:mm a")
      : "";

  const secondary = `Last action @ ${lastAction} • Content Model`;

  return (
    <ListItem
      divider={props.divider}
      size={props.size}
      clickable={props.clickable}
      affectedZUID={props.affectedZUID}
      icon={faDatabase}
      primary={
        modelError ? `${props.affectedZUID} (Deleted)` : modelData?.label
      }
      secondary={secondary}
      showSkeletons={isLoading}
    />
  );
};
