import { useEffect, useMemo, useState } from "react";
import moment from "moment";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit } from "@fortawesome/free-solid-svg-icons";
import { ListItem, ListItemAvatar, Avatar, ListItemText } from "@mui/material";
import { useSelector, useDispatch } from "react-redux";
import { searchItems } from "shell/store/content";
import { fetchModel } from "shell/store/models";

const modelTypeName = {
  templateset: "Single Page Model",
  pageset: "Multi Page Model",
  dataset: "Headless Data Model",
};

export const ContentResourceListItem = (props) => {
  const dispatch = useDispatch();
  const [contentError, setContentError] = useState(false);
  const [modelError, setModelError] = useState(false);

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
      dispatch(searchItems(props.affectedZUID))
        .then((res) => !res.data && setContentError(true))
        .catch(() => setContentError(true));
    }

    if (!modelData && contentData && !modelError) {
      dispatch(fetchModel(contentData.meta.contentModelZUID)).catch(() =>
        setModelError(true)
      );
    }
  }, [contentData, modelData, contentError, modelError]);

  const secondaryText = useMemo(() => {
    const chips = [
      `Last action @ ${moment(props.updatedAt).format("hh:mm A")}`,
      modelTypeName[modelData?.type],
    ];
    if (contentData?.web?.metaTitle !== modelData?.label) {
      chips.push(modelData?.label);
    }
    return chips.join(" • ");
  }, [contentData, modelData]);

  return (
    <ListItem divider sx={{ py: 2.5 }}>
      <ListItemAvatar>
        <Avatar>
          <FontAwesomeIcon icon={faEdit} />
        </Avatar>
      </ListItemAvatar>
      <ListItemText
        primary={
          contentError
            ? `${props.affectedZUID} + (Deleted)`
            : contentData?.web?.metaTitle
        }
        secondary={secondaryText}
      />
    </ListItem>
  );
};
