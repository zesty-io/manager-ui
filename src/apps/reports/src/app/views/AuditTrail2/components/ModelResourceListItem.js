import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDatabase } from "@fortawesome/free-solid-svg-icons";
import { ListItem, ListItemAvatar, Avatar, ListItemText } from "@mui/material";
import { useSelector } from "react-redux";
import moment from "moment";

export const ModelResourceListItem = (props) => {
  const modelData = useSelector((state) =>
    Object.values(state.models).find(
      // (item) => item.ZUID === props.uri.split('/')[4]
      (item) => item.ZUID === props.affectedZUID
    )
  );

  return (
    <ListItem divider sx={{ py: 2.5 }}>
      <ListItemAvatar>
        <Avatar>
          <FontAwesomeIcon icon={faDatabase} />
        </Avatar>
      </ListItemAvatar>
      <ListItemText
        primary={modelData?.label}
        secondary={`Last action @ ${moment(props.updatedAt).format(
          "hh:mm A"
        )} • Content Model`}
      />
    </ListItem>
  );
};
