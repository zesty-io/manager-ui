import { useMemo } from "react";
import {
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  ListItemIcon,
  Typography,
  Skeleton,
} from "@mui/material";
import { uniqBy } from "lodash";
import { useDispatch } from "react-redux";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope } from "@fortawesome/free-solid-svg-icons";
import { accountsApi } from "shell/services/accounts";
import { notify } from "shell/store/notifications";
import { MD5 } from "utility/md5";

export const ActionsByUsers = (props) => {
  const dispatch = useDispatch();
  const { data: usersRoles } = accountsApi.useGetUsersRolesQuery();

  const uniqueUserActions = useMemo(
    () => uniqBy(props.actions, "actionByUserZUID"),
    [props.actions]
  );

  return (
    <>
      <Typography variant="overline" sx={{ pl: 2 }}>
        {props.showSkeletons ? (
          <Skeleton variant="rectangular" width={159} />
        ) : (
          "ACTIONS BY"
        )}
      </Typography>
      <List>
        {uniqueUserActions?.map((action) => {
          const user = usersRoles?.find(
            (user) => user.ZUID === action.actionByUserZUID
          );
          if (!user) return null;
          return (
            <ListItem key={user.ZUID} divider>
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
                secondary={user?.role?.name}
              />
              <ListItemIcon
                sx={{ justifyContent: "flex-end", cursor: "pointer" }}
                onClick={() =>
                  navigator?.clipboard?.writeText(user?.email).then(() =>
                    dispatch(
                      notify({
                        kind: "success",
                        message: `User email copied to the clipboard`,
                      })
                    )
                  )
                }
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
