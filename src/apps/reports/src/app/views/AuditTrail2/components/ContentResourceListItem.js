import React, { useMemo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit } from "@fortawesome/free-solid-svg-icons";
import { ListItem, ListItemAvatar, Avatar, ListItemText } from "@mui/material";
import { useSelector } from "react-redux";
import moment from "moment";

const modelTypeName = {
  templateset: "Single Page Model",
  pageset: "Multi Page Model",
  dataset: "Headless Data Model",
};

export const ContentResourceListItem = (props) => {
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
  const parentContentData = useSelector((state) =>
    Object.values(state.content).find(
      (item) => item.meta.ZUID === contentData?.web?.parentZUID
    )
  );

  const secondaryText = useMemo(() => {
    const chips = [
      `Last action @ ${moment(props.updatedAt).format("hh:mm A")}`,
      modelTypeName[modelData?.type],
    ];
    if (contentData?.web?.parentZUID && contentData?.web?.parentZUID !== "0") {
      chips.push(parentContentData?.web?.metaTitle);
    }
    return chips.join(" • ");
  }, []);

  return (
    <ListItem divider>
      <ListItemAvatar>
        <Avatar>
          <FontAwesomeIcon icon={faEdit} />
        </Avatar>
      </ListItemAvatar>
      <ListItemText
        primary={contentData?.web?.metaTitle}
        secondary={secondaryText}
      />
    </ListItem>
  );
};
