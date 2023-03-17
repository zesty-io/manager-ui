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

interface NormalMenuProps {
  faviconURL: string;
  instanceName: string;
  onChangeView: (view: View) => void;
}
export const NormalMenu: FC<NormalMenuProps> = ({
  faviconURL,
  instanceName,
}) => {
  return (
    <>
      <Stack direction="row" gap={1.5} p={2} alignItems="center">
        <Avatar src={faviconURL} alt="favicon" sx={{ height: 32, width: 32 }} />
        <Stack>
          <Typography variant="body2" fontWeight={600}>
            {instanceName}
          </Typography>
          <Typography variant="body2" fontWeight={600} color="info.dark">
            www.something.com
          </Typography>
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
        <MenuItem>
          <ListItemIcon>
            <PeopleRoundedIcon />
          </ListItemIcon>
          <ListItemText>Users</ListItemText>
        </MenuItem>
        <MenuItem>
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
        <MenuItem>
          <ListItemIcon>
            <BarChartRoundedIcon />
          </ListItemIcon>
          <ListItemText>Usage</ListItemText>
        </MenuItem>
        <MenuItem>
          <ListItemIcon>
            <TranslateRoundedIcon />
          </ListItemIcon>
          <ListItemText>Locales</ListItemText>
        </MenuItem>
        <MenuItem>
          <ListItemIcon>
            <ApiRoundedIcon />
          </ListItemIcon>
          <ListItemText>APIs</ListItemText>
        </MenuItem>
        <MenuItem>
          <ListItemIcon>
            <WebhookRoundedIcon />
          </ListItemIcon>
          <ListItemText>Webhooks</ListItemText>
        </MenuItem>
      </MenuList>
    </>
  );
};
