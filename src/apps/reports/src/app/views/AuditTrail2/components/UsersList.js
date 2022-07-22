import { useMemo } from "react";
import {
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
} from "@mui/material";
import { uniqBy } from "lodash";
import moment from "moment";
import { accountsApi } from "shell/services/accounts";
import { MD5 } from "utility/md5";
import { useParams } from "shell/hooks/useParams";

export const UsersList = (props) => {
  const [params] = useParams();
  const { data: usersRoles } = accountsApi.useGetUsersRolesQuery();
  const sortBy = params.get("sortBy");
  const sortOrder = sortBy?.startsWith("+") ? "desc" : "asc";

  // If userRole parameter exist use users data to filter
  const uniqueUserActions = useMemo(
    () =>
      params.get("userRole")
        ? uniqBy(props.actions, "actionByUserZUID").filter(
            (action) =>
              usersRoles?.find(
                (userRole) => userRole.ZUID === action.actionByUserZUID
              )?.role?.name === params.get("userRole")
          )
        : uniqBy(props.actions, "actionByUserZUID"),
    [props.actions, usersRoles, params]
  );

  const sortedUserActions = useMemo(
    () =>
      uniqueUserActions.sort((a, b) => {
        if (sortOrder === "asc") {
          return new Date(a?.[sortBy]) - new Date(b?.[sortBy]);
        } else {
          return new Date(b?.[sortBy]) - new Date(a?.[sortBy]);
        }
      }),
    [uniqueUserActions]
  );

  console.log("tesing", props.actions, uniqueUserActions, sortedUserActions);

  return (
    <List
      sx={{ overflowY: "scroll", width: "100%", height: "calc(100vh - 306px)" }}
    >
      {sortedUserActions.map((action) => {
        const user = usersRoles?.find(
          (userRole) => userRole.ZUID === action.actionByUserZUID
        );
        if (!user) return null;
        return (
          <ListItem divider sx={{ py: 2.5 }}>
            <ListItemAvatar>
              <Avatar
                alt={`${user?.firstName} ${user?.lastName} Avatar`}
                src={`https://www.gravatar.com/avatar/${MD5(
                  user?.email
                )}.jpg?s=40`}
              ></Avatar>
            </ListItemAvatar>
            <ListItemText
              primary={`${user?.firstName} ${user?.lastName}`}
              secondary={`
                ${user?.role?.name} • ${
                props.actions.filter(
                  (action) => action.actionByUserZUID === user?.ZUID
                ).length
              } actions • Last action @ ${moment(action.updatedAt).format(
                "hh:mm A"
              )}
                  `}
            />
          </ListItem>
        );
      })}
    </List>
  );
};
