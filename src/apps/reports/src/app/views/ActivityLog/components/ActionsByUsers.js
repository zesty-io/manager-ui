import { useMemo } from "react";
import {
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  IconButton,
  ListItemButton,
  Typography,
  Skeleton,
} from "@mui/material";
import { uniqBy } from "lodash";
import { useDispatch } from "react-redux";
import EmailIcon from "@mui/icons-material/Email";
import { accountsApi } from "shell/services/accounts";
import { notify } from "shell/store/notifications";
import { MD5 } from "utility/md5";
import { useHistory } from "react-router";

export const ActionsByUsers = (props) => {
  const dispatch = useDispatch();
  const history = useHistory();
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
      <List sx={{ overflowY: "scroll", height: 340 }}>
        {uniqueUserActions?.map((action) => {
          const user = usersRoles?.find(
            (user) => user.ZUID === action.actionByUserZUID
          );
          if (!user) return null;
          return (
            <ListItem
              key={user.ZUID}
              divider
              sx={{ p: 0 }}
              secondaryAction={
                <IconButton edge="end">
                  <EmailIcon
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
                  />
                </IconButton>
              }
            >
              <ListItemButton
                onClick={() =>
                  history.push("/reports/activity-log/users/" + user.ZUID)
                }
              >
                <ListItemAvatar>
                  {props.showSkeletons ? (
                    <Skeleton variant="circular" width={40} height={40} />
                  ) : (
                    <Avatar
                      alt={`${user?.firstName} ${user?.lastName} Avatar`}
                      src={`https://www.gravatar.com/avatar/${MD5(
                        user?.email
                      )}.jpg?s=40`}
                    ></Avatar>
                  )}
                </ListItemAvatar>
                <ListItemText
                  primaryTypographyProps={{
                    variant: "body2",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                  primary={
                    props.showSkeletons ? (
                      <Skeleton
                        variant="rectangular"
                        height={16}
                        width={160}
                        sx={{ mb: 2 }}
                      />
                    ) : (
                      `${user?.firstName} ${user?.lastName}`
                    )
                  }
                  secondary={
                    props.showSkeletons ? (
                      <Skeleton variant="rectangular" height={12} width={224} />
                    ) : (
                      user?.role?.name
                    )
                  }
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
    </>
  );
};
