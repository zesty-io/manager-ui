import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCog } from "@fortawesome/free-solid-svg-icons";
import { ListItem, ListItemAvatar, Avatar, ListItemText } from "@mui/material";
import moment from "moment";
import { useHistory } from "react-router";
import { useParams } from "shell/hooks/useParams";

export const SettingsResourceListItem = (props) => {
  const [params] = useParams();
  const history = useHistory();

  return (
    <ListItem
      divider={props.divider}
      sx={{ py: 2.5, cursor: props.clickable && "pointer" }}
      onClick={
        props.clickable
          ? () =>
              history.push({
                pathname: `resources/${props.affectedZUID}`,
                // Persist date selection
                search: new URLSearchParams({
                  ...(params.get("from") && {
                    from: params.get("from"),
                  }),
                  ...(params.get("to") && {
                    to: params.get("to"),
                  }),
                }).toString(),
              })
          : undefined
      }
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
        secondaryTypographyProps={{ variant: "caption" }}
        primary={props.message}
        secondary={`Last action @ ${moment(props.updatedAt).format(
          "hh:mm A"
        )} • Settings`}
      />
    </ListItem>
  );
};
