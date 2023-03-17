import { FC } from "react";
import {
  Typography,
  Stack,
  Avatar,
  Divider,
  MenuItem,
  ListItemIcon,
  ListItemText,
  MenuList,
  Link,
} from "@mui/material";
import ArrowForwardIosRoundedIcon from "@mui/icons-material/ArrowForwardIosRounded";
import ManageSearchRoundedIcon from "@mui/icons-material/ManageSearchRounded";
import ImageRoundedIcon from "@mui/icons-material/ImageRounded";
import RemoveRedEyeRoundedIcon from "@mui/icons-material/RemoveRedEyeRounded";
import ContentCopyRoundedIcon from "@mui/icons-material/ContentCopyRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import PeopleRoundedIcon from "@mui/icons-material/PeopleRounded";
import GroupsRoundedIcon from "@mui/icons-material/GroupsRounded";
import LanguageRoundedIcon from "@mui/icons-material/LanguageRounded";
import BarChartRoundedIcon from "@mui/icons-material/BarChartRounded";
import TranslateRoundedIcon from "@mui/icons-material/TranslateRounded";
import ApiRoundedIcon from "@mui/icons-material/ApiRounded";
import WebhookRoundedIcon from "@mui/icons-material/WebhookRounded";

import { View } from "../DropdownMenu";
import { useGetInstanceQuery } from "../../../../../services/accounts";
import instanceZUID from "../../../../../../utility/instanceZUID";

interface NormalMenuProps {
  faviconURL: string;
  onChangeView: (view: View) => void;
}
export const NormalMenu: FC<NormalMenuProps> = ({ faviconURL }) => {
  const { data: instance } = useGetInstanceQuery();

  const handleOpenUrl = (url: string) => {
    window.open(url, "_blank", "noopener");
  };

  return (
    <>
      <Stack direction="row" gap={1.5} p={2} alignItems="center">
        <Avatar src={faviconURL} alt="favicon" sx={{ height: 32, width: 32 }} />
        <Stack>
          <Typography variant="body2" fontWeight={600}>
            {instance?.name}
          </Typography>
          <Link
            variant="body2"
            fontWeight={600}
            color="info.dark"
            href={`https://${instance?.domain}`}
            target="_blank"
            rel="noopener"
          >
            {instance?.domain}
          </Link>
        </Stack>
      </Stack>
      <Divider />
      <MenuList>
        <MenuItem>
          <ListItemIcon>
            <ManageSearchRoundedIcon />
          </ListItemIcon>
          <ListItemText>Switch Instance</ListItemText>
          <ArrowForwardIosRoundedIcon color="action" fontSize="small" />
        </MenuItem>
      </MenuList>
      <Divider />
      <MenuList>
        <MenuItem>
          <ListItemIcon>
            <ImageRoundedIcon />
          </ListItemIcon>
          <ListItemText>Update Favicon</ListItemText>
        </MenuItem>
        <MenuItem>
          <ListItemIcon>
            <RemoveRedEyeRoundedIcon />
          </ListItemIcon>
          <ListItemText>View Web Engine Preview (Stage)</ListItemText>
        </MenuItem>
        <MenuItem>
          <ListItemIcon>
            <ContentCopyRoundedIcon />
          </ListItemIcon>
          <ListItemText>Copy Instance ZUID</ListItemText>
        </MenuItem>
        <MenuItem>
          <ListItemIcon>
            <RefreshRoundedIcon />
          </ListItemIcon>
          <ListItemText>Refresh CDN Cache</ListItemText>
        </MenuItem>
      </MenuList>
      <Divider />
      <MenuList>
        <MenuItem
          onClick={() =>
            handleOpenUrl(
              `https://www.zesty.io/instances/${instanceZUID}/users`
            )
          }
        >
          <ListItemIcon>
            <PeopleRoundedIcon />
          </ListItemIcon>
          <ListItemText>Users</ListItemText>
        </MenuItem>
        <MenuItem
          onClick={() =>
            handleOpenUrl(
              `https://www.zesty.io/instances/${instanceZUID}/teams`
            )
          }
        >
          <ListItemIcon>
            <GroupsRoundedIcon />
          </ListItemIcon>
          <ListItemText>Teams</ListItemText>
        </MenuItem>
        <MenuItem>
          <ListItemIcon>
            <LanguageRoundedIcon />
          </ListItemIcon>
          <ListItemText>Domains</ListItemText>
          <ArrowForwardIosRoundedIcon color="action" fontSize="small" />
        </MenuItem>
        <MenuItem
          onClick={() =>
            handleOpenUrl(
              `https://www.zesty.io/instances/${instanceZUID}/usage`
            )
          }
        >
          <ListItemIcon>
            <BarChartRoundedIcon />
          </ListItemIcon>
          <ListItemText>Usage</ListItemText>
        </MenuItem>
        <MenuItem
          onClick={() =>
            handleOpenUrl(
              `https://www.zesty.io/instances/${instanceZUID}/locales`
            )
          }
        >
          <ListItemIcon>
            <TranslateRoundedIcon />
          </ListItemIcon>
          <ListItemText>Locales</ListItemText>
        </MenuItem>
        <MenuItem
          onClick={() =>
            handleOpenUrl(`https://www.zesty.io/instances/${instanceZUID}/apis`)
          }
        >
          <ListItemIcon>
            <ApiRoundedIcon />
          </ListItemIcon>
          <ListItemText>APIs</ListItemText>
        </MenuItem>
        <MenuItem
          onClick={() =>
            handleOpenUrl(
              `https://www.zesty.io/instances/${instanceZUID}/webhooks`
            )
          }
        >
          <ListItemIcon>
            <WebhookRoundedIcon />
          </ListItemIcon>
          <ListItemText>Webhooks</ListItemText>
        </MenuItem>
      </MenuList>
    </>
  );
};
