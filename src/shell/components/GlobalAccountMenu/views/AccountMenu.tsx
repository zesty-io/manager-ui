import { FC, useMemo } from "react";
import { useSelector } from "react-redux";
import {
  Stack,
  Avatar,
  MenuItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Divider,
  Typography,
  Skeleton,
  SvgIcon,
} from "@mui/material";

import { User } from "../../../services/types";
import { AppState } from "../../../store/types";
import { useGetUsersRolesQuery } from "../../../services/accounts";
import { MENU_ITEMS, ClickAction } from "../config";
import youtubeIcon from "../../../../../public/images/youtubeIcon.svg";
import slackIcon from "../../../../../public/images/slackIcon.svg";
import { View } from "../GlobalAccountMenu";

interface AccountMenuProps {
  onCloseMenu: () => void;
  onChangeView: (view: View) => void;
}
export const AccountMenu: FC<AccountMenuProps> = ({
  onCloseMenu,
  onChangeView,
}) => {
  const user: User = useSelector((state: AppState) => state.user);
  const { data: roles, isLoading: isLoadingRoles } = useGetUsersRolesQuery();

  const userRole = useMemo(() => {
    return roles?.find((role) => role.ZUID === user.ZUID)?.role?.name;
  }, [roles]);

  const handleOpenUrl = (url: string) => {
    onCloseMenu();
    window.open(url, "_blank", "noopener");
  };

  const handleClickAction = ([action, location]: ClickAction) => {
    switch (action) {
      case "openUrl":
        !!location && handleOpenUrl(location);
        break;

      case "openView":
        !!location && onChangeView(location as View);
        break;

      case "openEmail":
        handleOpenUrl("mailto:support@zesty.io");
        break;

      case "logOut":
        // @ts-ignore
        window.open(`${CONFIG.URL_ACCOUNTS}/logout`, "_self");
        break;

      default:
        break;
    }
  };

  return (
    <>
      <Stack direction="row" gap={1.5} py={2.5} px={2} alignItems="center">
        <Avatar
          alt={`${user?.firstName} ${user?.lastName} Avatar`}
          src={`https://www.gravatar.com/avatar/${user?.emailHash}.jpg?&s=40`}
          sx={{
            height: 32,
            width: 32,
          }}
        />
        <Stack>
          <Typography variant="body2" fontWeight={600}>
            {user?.firstName} {user?.lastName}
          </Typography>
          <Typography variant="body2" fontWeight={600} color="text.secondary">
            {isLoadingRoles ? <Skeleton /> : userRole}
          </Typography>
        </Stack>
      </Stack>
      <Divider sx={{ mb: 1 }} />
      {MENU_ITEMS.map((menuItem, index) => (
        <MenuItem
          key={index}
          onClick={() => handleClickAction(menuItem.action)}
        >
          <ListItemIcon>
            <SvgIcon component={menuItem.icon} />
          </ListItemIcon>
          <ListItemText>{menuItem.text}</ListItemText>
        </MenuItem>
      ))}
      <Divider />
      <Stack direction="row" gap={1} alignItems="center" px={2}>
        <IconButton
          size="small"
          onClick={() =>
            handleOpenUrl("https://www.youtube.com/c/Zestyio/videos")
          }
        >
          <img src={youtubeIcon} alt="youtube" />
        </IconButton>
        <IconButton size="small">
          <img
            src={slackIcon}
            alt="slack"
            onClick={() => handleOpenUrl("https://www.zesty.io/chat/")}
          />
        </IconButton>
      </Stack>
    </>
  );
};
