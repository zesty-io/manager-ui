import { useMemo } from "react";
import { List } from "@mui/material";
import { uniqBy } from "lodash";
import { accountsApi } from "shell/services/accounts";
import { useParams } from "shell/hooks/useParams";
import { UserListItem } from "./UserListItem";

export const UsersList = (props) => {
  const [params] = useParams();
  const sortBy = params.get("sortBy");
  const sortOrder = sortBy?.startsWith("+") ? "desc" : "asc";

  const { data: usersRoles } = accountsApi.useGetUsersRolesQuery();

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

  return (
    <List
      sx={{
        padding: 0,
        overflowY: "scroll",
        width: "100%",
        height: "calc(100vh - 292px)",
      }}
    >
      {sortedUserActions.map((action) => {
        return (
          <UserListItem
            key={action.actionByUserZUID}
            action={action}
            actions={props.actions}
            clickable
            divider
          />
        );
      })}
    </List>
  );
};
