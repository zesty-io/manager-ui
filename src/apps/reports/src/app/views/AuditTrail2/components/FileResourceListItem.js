import React, { useMemo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCode } from "@fortawesome/free-solid-svg-icons";
import { ListItem, ListItemAvatar, Avatar, ListItemText } from "@mui/material";
import { useSelector } from "react-redux";
import moment from "moment";
import { useHistory } from "react-router";

const fileTypeName = {
  templateset: "Single Page Model",
  pageset: "Multi Page Model",
  dataset: "Headless Data Model",
};

export const FileResourceListItem = (props) => {
  const history = useHistory();

  const fileData = useSelector((state) =>
    Object.values(state.files).find((item) => item.ZUID === props.affectedZUID)
  );

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
          <FontAwesomeIcon icon={faCode} />
        </Avatar>
      </ListItemAvatar>
      <ListItemText
        primaryTypographyProps={{
          ...(props.size === "large" && {
            variant: "h5",
            fontWeight: 600,
          }),
        }}
        primary={
          !fileData ? `${props.affectedZUID} (Deleted)` : fileData?.fileName
        }
        secondary={`Last action @ ${moment(props.updatedAt).format("hh:mm A")}${
          fileData
            ? ` • ${fileTypeName?.[fileData?.type] || fileData?.type}`
            : ""
        }`}
      />
    </ListItem>
  );
};
