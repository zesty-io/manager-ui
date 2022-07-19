import { useState, useEffect } from "react";
import moment from "moment";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDatabase } from "@fortawesome/free-solid-svg-icons";
import { ListItem, ListItemAvatar, Avatar, ListItemText } from "@mui/material";
import { useSelector, useDispatch } from "react-redux";
import { fetchModel } from "shell/store/models";
import { useHistory } from "react-router";
import { useParams } from "utility/useParams";

export const ModelResourceListItem = (props) => {
  const [params] = useParams();
  const history = useHistory();
  const dispatch = useDispatch();
  const [modelError, setModelError] = useState(false);

  const modelData = useSelector((state) =>
    Object.values(state.models).find((item) => item.ZUID === props.affectedZUID)
  );

  useEffect(() => {
    if (!modelData && !modelError) {
      dispatch(fetchModel(props.affectedZUID)).catch(() => setModelError(true));
    }
  }, [modelData, modelError]);

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
          <FontAwesomeIcon icon={faDatabase} />
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
        primary={
          modelError ? `${props.affectedZUID} (Deleted)` : modelData?.label
        }
        secondary={`Last action @ ${moment(props.updatedAt).format(
          "hh:mm A"
        )} • Content Model`}
      />
    </ListItem>
  );
};
