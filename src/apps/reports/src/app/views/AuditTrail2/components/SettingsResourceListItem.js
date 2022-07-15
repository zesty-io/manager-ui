import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCog } from "@fortawesome/free-solid-svg-icons";
import { ListItem, ListItemAvatar, Avatar, ListItemText } from "@mui/material";
import moment from "moment";
import { useHistory } from "react-router";

export const SettingsResourceListItem = (props) => {
  const history = useHistory();

  return (
    <ListItem
      divider={props.divider}
      sx={{ py: 2.5, cursor: "pointer" }}
      onClick={() => history.push(`resources/${props.affectedZUID}`)}
    >
      <ListItemAvatar>
        <Avatar
          sx={{
            ...(props.size === "large" && {
              height: 48,
              width: 48,
            }),
          }}
        >
          <FontAwesomeIcon icon={faCog} />
        </Avatar>
      </ListItemAvatar>
      <ListItemText
        primaryTypographyProps={{
          ...(props.size === "large" && {
            variant: "h5",
            fontWeight: 600,
          }),
        }}
        primary={props.message}
        secondary={`Last action @ ${moment(props.updatedAt).format(
          "hh:mm A"
        )} • Settings`}
      />
    </ListItem>
  );
};
