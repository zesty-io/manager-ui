import { useState, useEffect } from "react";
import moment from "moment";
import { faDatabase } from "@fortawesome/free-solid-svg-icons";
import { useSelector, useDispatch } from "react-redux";
import { fetchModel } from "shell/store/models";
import { ListItem } from "./ListItem";

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
      secondary={`Last action @ ${moment(props.updatedAt).format(
        "hh:mm A"
      )} • Content Model`}
      showSkeletons={isLoading}
    />
  );
};
