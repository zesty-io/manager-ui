import { FC, useState, useEffect } from "react";
import { useDispatch } from "react-redux";
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
import { keyframes } from "@mui/system";
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
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";

import { View } from "../DropdownMenu";
import { useGetInstanceQuery } from "../../../../../services/accounts";
import instanceZUID from "../../../../../../utility/instanceZUID";
import { actions } from "../../../../../store/ui";
import { notify } from "../../../../../store/notifications";
import { useRefreshCacheMutation } from "../../../../../services/cloudFunctions";

const rotateAnimation = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;

interface NormalMenuProps {
  faviconURL: string;
  onChangeView: (view: View) => void;
  onCloseDropdownMenu: () => void;
}
export const NormalMenu: FC<NormalMenuProps> = ({
  faviconURL,
  onChangeView,
  onCloseDropdownMenu,
}) => {
  const dispatch = useDispatch();
  const [isInstanceZuidCopied, setIsInstanceZuidCopied] = useState(false);
  const { data: instance } = useGetInstanceQuery();
  const [
    refreshCache,
    {
      data,
      isSuccess: isCacheRefreshed,
      isLoading: isCacheRefreshing,
      isError: isCacheRefreshFailed,
    },
  ] = useRefreshCacheMutation();

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    if (isInstanceZuidCopied) {
      timeoutId = setTimeout(() => setIsInstanceZuidCopied(false), 1500);
    }

    return () => {
      clearTimeout(timeoutId);
    };
  }, [isInstanceZuidCopied]);

  useEffect(() => {
    if (isCacheRefreshFailed) {
      dispatch(
        notify({
          message: "Failed to refresh the CDN cache",
          kind: "error",
        })
      );
    }
  }, [isCacheRefreshFailed]);

  const handleOpenUrl = (url: string) => {
    onCloseDropdownMenu();
    window.open(url, "_blank", "noopener");
  };

  const handleCopyInstanceZUID = async () => {
    try {
      await navigator?.clipboard.writeText(instanceZUID);

      setIsInstanceZuidCopied(true);
    } catch (error) {
      console.error("Failed to copy instance ZUID", error);

      dispatch(
        notify({
          message: "Failed to copy instance ZUID",
          kind: "error",
        })
      );
    }
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
      <MenuList
        onClick={() => {
          onChangeView("instances");
        }}
      >
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
        <MenuItem
          onClick={() => {
            onCloseDropdownMenu();
            dispatch(actions.toggleUpdateFaviconModal(true));
          }}
        >
          <ListItemIcon>
            <ImageRoundedIcon />
          </ListItemIcon>
          <ListItemText>Update Favicon</ListItemText>
        </MenuItem>
        <MenuItem
          onClick={() =>
            handleOpenUrl(
              // @ts-ignore
              `${CONFIG.URL_PREVIEW_PROTOCOL}${instance.randomHashID}${CONFIG.URL_PREVIEW}`
            )
          }
        >
          <ListItemIcon>
            <RemoveRedEyeRoundedIcon />
          </ListItemIcon>
          <ListItemText>View Web Engine Preview (Stage)</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleCopyInstanceZUID}>
          <ListItemIcon>
            {isInstanceZuidCopied ? (
              <CheckRoundedIcon />
            ) : (
              <ContentCopyRoundedIcon />
            )}
          </ListItemIcon>
          <ListItemText>Copy Instance ZUID</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => refreshCache()}>
          <ListItemIcon>
            {isCacheRefreshed ? (
              <CheckRoundedIcon />
            ) : (
              <RefreshRoundedIcon
                sx={{
                  animation: isCacheRefreshing
                    ? `${rotateAnimation} 1s infinite ease`
                    : "none",
                }}
              />
            )}
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
