import { useMemo, FC } from "react";
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
import { accountsApi } from "../../../../../../../shell/services/accounts";
import { notify } from "../../../../../../../shell/store/notifications";
import { MD5 } from "../../../../../../../utility/md5";
import { Audit } from "../../../../../../../shell/services/types";

import { useHistory } from "react-router";

interface ActionsByUsersProps {
  showSkeletons: boolean;
  actions: Audit[];
}
export const ActionsByUsers: FC<ActionsByUsersProps> = ({
  showSkeletons,
  actions,
}) => {
  const dispatch = useDispatch();
  const history = useHistory();
  const { data: usersRoles } = accountsApi.useGetUsersRolesQuery();

  const uniqueUserActions = useMemo(
    () => uniqBy(actions, "actionByUserZUID"),
    [actions]
  );

  return (
    <>
      <Typography variant="overline" sx={{ pl: 2 }}>
        {showSkeletons ? (
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
                <IconButton
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
                  edge="end"
                >
                  <EmailIcon />
                </IconButton>
              }
            >
              <ListItemButton
                onClick={() =>
                  history.push("/reports/activity-log/users/" + user.ZUID)
                }
              >
                <ListItemAvatar>
                  {showSkeletons ? (
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
                    showSkeletons ? (
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
                    showSkeletons ? (
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
