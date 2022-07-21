import { useMemo } from "react";
import {
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  ListItemIcon,
  Typography,
} from "@mui/material";
import { uniqBy } from "lodash";
import { useSelector } from "react-redux";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope } from "@fortawesome/free-solid-svg-icons";
import moment from "moment";
import { accountsApi } from "shell/services/accounts";
import { MD5 } from "utility/md5";

export const UsersList = (props) => {
  const users = useSelector((state) => state.users);

  const { data: userRoles, isLoading } = accountsApi.useGetUsersRolesQuery();

  const uniqueUserResources = useMemo(
    () => uniqBy(props.actions, "actionByUserZUID"),
    [props.actions]
  );

  return (
    <List sx={{ width: "100%" }}>
      {uniqueUserResources.map((resource) => {
        const user = users.find(
          (user) => user.ZUID === resource.actionByUserZUID
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
                ${
                  userRoles?.find((userRole) => user?.ID === userRole?.ID)?.role
                    ?.name
                } • ${
                props.actions.filter(
                  (action) => action.actionByUserZUID === user.ZUID
                ).length
              } actions • Last action @ ${moment(resource.updatedAt).format(
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
