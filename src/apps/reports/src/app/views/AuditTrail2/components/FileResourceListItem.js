import React, { useMemo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCode } from "@fortawesome/free-solid-svg-icons";
import { ListItem, ListItemAvatar, Avatar, ListItemText } from "@mui/material";
import { useSelector } from "react-redux";
import moment from "moment";

const fileTypeName = {
  templateset: "Single Page Model",
  pageset: "Multi Page Model",
  dataset: "Headless Data Model",
};

export const FileResourceListItem = (props) => {
  const fileData = useSelector((state) =>
    Object.values(state.files).find((item) => item.ZUID === props.affectedZUID)
  );

  return (
    <ListItem divider sx={{ py: 2.5 }}>
      <ListItemAvatar>
        <Avatar>
          <FontAwesomeIcon icon={faCode} />
        </Avatar>
      </ListItemAvatar>
      <ListItemText
        primary={
          !fileData ? `${props.affectedZUID} + (Deleted)` : fileData?.fileName
        }
        secondary={`Last action @ ${moment(props.updatedAt).format(
          "hh:mm A"
        )} • ${fileTypeName?.[fileData?.type] || fileData?.type}`}
      />
    </ListItem>
  );
};
