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
import { accountsApi } from "shell/services/accounts";
import { MD5 } from "utility/md5";

export const ActionsByUsers = (props) => {
  const users = useSelector((state) => state.users);

  const { data: userRoles, isLoading } = accountsApi.useGetUsersRolesQuery();

  const uniqueUserResources = useMemo(
    () => uniqBy(props.actions, "actionByUserZUID"),
    [props.actions]
  );

  return (
    <>
      <Typography variant="overline" sx={{ pl: 2 }}>
        ACTIONS BY
      </Typography>
      <List>
        {uniqueUserResources.map((resource) => {
          const user = users.find(
            (user) => user.ZUID === resource.actionByUserZUID
          );
          if (!user) return null;
          return (
            <ListItem divider>
              <ListItemAvatar>
                <Avatar
                  alt={`${user?.firstName} ${user?.lastName} Avatar`}
                  src={`https://www.gravatar.com/avatar/${MD5(
                    user?.email
                  )}.jpg?s=40`}
                ></Avatar>
              </ListItemAvatar>
              <ListItemText
                primaryTypographyProps={{ variant: "body2" }}
                primary={`${user?.firstName} ${user?.lastName}`}
                secondary={
                  userRoles?.find((userRole) => user?.ID === userRole?.ID)?.role
                    ?.name
                }
              />
              <ListItemIcon
                sx={{ justifyContent: "flex-end", cursor: "pointer" }}
                onClick={() => navigator?.clipboard?.writeText(user?.email)}
              >
                <FontAwesomeIcon icon={faEnvelope} style={{ fontSize: 20 }} />
              </ListItemIcon>
            </ListItem>
          );
        })}
      </List>
    </>
  );
};
