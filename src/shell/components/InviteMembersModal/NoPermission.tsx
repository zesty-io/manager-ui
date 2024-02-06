import { useMemo } from "react";
import {
  DialogTitle,
  DialogActions,
  DialogContent,
  Typography,
  Button,
  Box,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Dialog,
} from "@mui/material";
import ErrorRoundedIcon from "@mui/icons-material/ErrorRounded";

import { useGetUsersRolesQuery } from "../../services/accounts";
import { MD5 } from "../../../utility/md5";

type NoPermissionProps = {
  onClose: () => void;
};

export const NoPermission = ({ onClose }: NoPermissionProps) => {
  const { data: users } = useGetUsersRolesQuery();

  const ownersAndAdmins = useMemo(() => {
    if (users?.length) {
      const owners = users
        .filter((user) => user.role?.name?.toLowerCase() === "owner")
        .sort((a, b) => a.firstName.localeCompare(b.firstName));
      const admins = users
        .filter((user) => user.role?.name?.toLowerCase() === "admin")
        .sort((a, b) => a.firstName.localeCompare(b.firstName));

      return [...owners, ...admins];
    }
  }, [users]);

  return (
    <Dialog open onClose={onClose} maxWidth="xs">
      <DialogTitle>
        <ErrorRoundedIcon
          color="error"
          sx={{
            padding: 1,
            borderRadius: "20px",
            backgroundColor: "red.100",
            display: "block",
          }}
        />
        <Box fontWeight={700} mb={1} mt={1.5}>
          You do not have permission to invite users to this instance.
        </Box>
        <Typography color="text.secondary" variant="body2">
          Contact the instance owners or administrators listed below to upgrade
          your role to Admin or Owner for the invite capability.
        </Typography>
      </DialogTitle>
      <DialogContent>
        <List>
          {ownersAndAdmins?.map((user) => (
            <ListItem
              key={user.ZUID}
              dense
              disableGutters
              sx={{
                borderBottom: "1px solid",
                borderColor: "border",
              }}
            >
              <ListItemAvatar>
                <Avatar
                  alt={`${user.firstName} ${user.lastName}`}
                  src={`https://www.gravatar.com/avatar/${MD5(
                    user.email || ""
                  )}?s=40`}
                />
              </ListItemAvatar>
              <ListItemText
                primary={`${user.firstName} ${user.lastName}`}
                primaryTypographyProps={{
                  sx: {
                    color: "text.primary",
                  },
                }}
                secondary={`${user.role.name} • ${user.email}`}
              />
            </ListItem>
          ))}
        </List>
      </DialogContent>
      <DialogActions>
        <Button color="primary" variant="contained" onClick={onClose}>
          Done
        </Button>
      </DialogActions>
    </Dialog>
  );
};
