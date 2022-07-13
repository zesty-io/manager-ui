import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCog } from "@fortawesome/free-solid-svg-icons";
import { ListItem, ListItemAvatar, Avatar, ListItemText } from "@mui/material";
import { useSelector } from "react-redux";
import moment from "moment";

export const SettingsResourceListItem = (props) => {
  return (
    <ListItem divider sx={{ py: 2.5 }}>
      <ListItemAvatar>
        <Avatar>
          <FontAwesomeIcon icon={faCog} />
        </Avatar>
      </ListItemAvatar>
      <ListItemText
        primary={props.message}
        secondary={`Last action @ ${moment(props.updatedAt).format(
          "hh:mm A"
        )} • Settings`}
      />
    </ListItem>
  );
};
