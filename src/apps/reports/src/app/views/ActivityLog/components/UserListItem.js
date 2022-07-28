import moment from "moment";
import { accountsApi } from "shell/services/accounts";
import { MD5 } from "utility/md5";
import {
  Avatar,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Skeleton,
} from "@mui/material";
import { useHistory } from "react-router";

export const UserListItem = (props) => {
  const history = useHistory();
  const { data: usersRoles } = accountsApi.useGetUsersRolesQuery();

  const user = usersRoles?.find(
    (userRole) => userRole.ZUID === props.action?.actionByUserZUID
  );

  // If no user data exists then don't attempt to render the user
  if (!user && !props.showSkeletons) return null;

  return (
    <ListItem
      disableGutters
      divider={props.divider}
      sx={{
        py: 2,
        cursor: props.clickable && "pointer",
        maxWidth: 720,
        alignItems: "flex-start",
      }}
      onClick={
        props.clickable
          ? () =>
              history.push({
                pathname: `users/${props.action?.actionByUserZUID}`,
              })
          : undefined
      }
    >
      <ListItemAvatar>
        {props.showSkeletons ? (
          <Skeleton variant="circular" width={40} height={40} />
        ) : (
          <Avatar
            alt={`${user?.firstName} ${user?.lastName} Avatar`}
            src={`https://www.gravatar.com/avatar/${MD5(user?.email)}.jpg?s=40`}
          ></Avatar>
        )}
      </ListItemAvatar>
      <ListItemText
        sx={{ margin: props.size === "large" && 0 }}
        primaryTypographyProps={{
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
          ...(props.size === "large" && {
            variant: "h5",
            fontWeight: 600,
            mb: 0.5,
          }),
        }}
        secondaryTypographyProps={{
          variant: "body2",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
          ...(props.size === "large" && {
            variant: "caption",
          }),
        }}
        primary={
          props.showSkeletons ? (
            <Skeleton
              variant="rectangular"
              height={16}
              width={224}
              sx={{ mb: 2 }}
            />
          ) : (
            `${user?.firstName} ${user?.lastName}`
          )
        }
        secondary={
          props.showSkeletons ? (
            <Skeleton variant="rectangular" height={12} width={360} />
          ) : (
            `
        ${user?.role?.name} • ${
              props.actions?.filter(
                (action) => action.actionByUserZUID === user?.ZUID
              ).length
            } actions • Last action @ ${moment(props.action?.updatedAt).format(
              "hh:mm A"
            )}
          `
          )
        }
      />
    </ListItem>
  );
};
