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

export const ActionsByUsers = (props) => {
  const users = useSelector((state) => state.users);

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
                <Avatar alt={`${user?.firstName} ${user?.lastName} Avatar`}>
                  {user?.firstName?.charAt(0)}
                  {user?.lastName?.charAt(0)}
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primaryTypographyProps={{ variant: "body2" }}
                primary={`${user?.firstName} ${user?.lastName}`}
                secondary={user?.ID}
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
