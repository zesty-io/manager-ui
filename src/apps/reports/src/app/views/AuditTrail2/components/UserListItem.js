import moment from "moment";
import { accountsApi } from "shell/services/accounts";
import { MD5 } from "utility/md5";
import { Avatar, ListItem, ListItemText, ListItemAvatar } from "@mui/material";
import { useHistory } from "react-router";
import { useParams } from "shell/hooks/useParams";
import { isEmpty, omitBy } from "lodash";

export const UserListItem = (props) => {
  const history = useHistory();
  const [params] = useParams();
  const { data: usersRoles } = accountsApi.useGetUsersRolesQuery();

  const user = usersRoles?.find(
    (userRole) => userRole.ZUID === props.action.actionByUserZUID
  );

  if (!user) return null;

  return (
    <ListItem
      divider={props.divider}
      sx={{ py: 2.5, cursor: props.clickable && "pointer" }}
      onClick={
        props.clickable
          ? () =>
              history.push({
                pathname: `users/${props.action.actionByUserZUID}`,
                // Persist date selection
                search: new URLSearchParams(
                  omitBy(
                    { from: params.get("from"), to: params.get("to") },
                    isEmpty
                  )
                ).toString(),
              })
          : undefined
      }
    >
      <ListItemAvatar>
        <Avatar
          alt={`${user?.firstName} ${user?.lastName} Avatar`}
          src={`https://www.gravatar.com/avatar/${MD5(user?.email)}.jpg?s=40`}
        ></Avatar>
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
        primary={`${user?.firstName} ${user?.lastName}`}
        secondary={`
        ${user?.role?.name} • ${
          props.actions.filter(
            (action) => action.actionByUserZUID === user?.ZUID
          ).length
        } actions • Last action @ ${moment(props.action.updatedAt).format(
          "hh:mm A"
        )}
          `}
      />
    </ListItem>
  );
};
