import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  ListItem as MuiListItem,
  ListItemAvatar,
  Avatar,
  ListItemText,
  Skeleton,
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
      sx={{
        py: 2,
        cursor: props.clickable && "pointer",
        maxWidth: 720,
        ...(props.clickable && {
          "&:hover": {
            " .MuiAvatar-root": {
              backgroundColor: "primary.main",
            },
          },
        }),
      }}
      onClick={
        props.clickable
          ? () =>
              history.push({
                pathname: `/reports/activity-log/resources/${props.affectedZUID}`,
                // Persist date selection
                search: new URLSearchParams(
                  omitBy(
                    {
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
        {props.showSkeletons ? (
          <Skeleton variant="circular" width={40} height={40} />
        ) : (
          <Avatar
            sx={{
              ...(props.size === "large" && {
                height: 48,
                width: 48,
                mr: 2,
              }),
            }}
          >
            <FontAwesomeIcon icon={props.icon} />
          </Avatar>
        )}
      </ListItemAvatar>
      <ListItemText
        sx={{ margin: props.size === "large" && 0 }}
        primaryTypographyProps={{
          ...(props.size === "large" && {
            variant: "h5",
            fontWeight: 600,
            mb: 0.5,
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
        primary={
          props.showSkeletons ? (
            <Skeleton
              variant="rectangular"
              height={16}
              width={555}
              sx={{ mb: 1 }}
            />
          ) : (
            props.primary
          )
        }
        secondary={
          props.showSkeletons ? (
            <Skeleton
              variant="rectangular"
              height={14}
              width={425}
              sx={{ mb: 0.75 }}
            />
          ) : (
            props.secondary
          )
        }
      ></ListItemText>
    </MuiListItem>
  );
};
