import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  ListItem as MuiListItem,
  ListItemAvatar,
  Avatar,
  ListItemText,
} from "@mui/material";
import { isEmpty, omitBy } from "lodash";
import { useHistory, useLocation } from "react-router";
import { useParams } from "shell/hooks/useParams";

export const ListItem = (props) => {
  const history = useHistory();
  const location = useLocation();
  const [params] = useParams();

  return (
    <MuiListItem
      disableGutters
      divider={props.divider}
      sx={{ py: 2, cursor: props.clickable && "pointer" }}
      onClick={
        props.clickable
          ? () =>
              history.push({
                pathname: `/reports/activity-log/resources/${props.affectedZUID}`,
                // Persist date selection
                search: new URLSearchParams(
                  omitBy(
                    {
                      from: params.get("from"),
                      to: params.get("to"),
                      // If we are in the user details view then push to resource detail page with user query param
                      ...(location.pathname.includes("users") && {
                        actionByUserZUID: location.pathname.split("/").pop(),
                      }),
                    },
                    isEmpty
                  )
                ).toString(),
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
          <FontAwesomeIcon icon={props.icon} />
        </Avatar>
      </ListItemAvatar>
      <ListItemText
        primaryTypographyProps={{
          ...(props.size === "large" && {
            variant: "h5",
            fontWeight: 600,
          }),
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
        secondaryTypographyProps={{
          variant: "caption",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
        primary={props.primary}
        secondary={props.secondary}
      />
    </MuiListItem>
  );
};
