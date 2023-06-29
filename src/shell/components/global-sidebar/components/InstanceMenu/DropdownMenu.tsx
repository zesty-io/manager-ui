import { FC, useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import {
  Typography,
  Stack,
  Divider,
  MenuItem,
  ListItemIcon,
  ListItemText,
  MenuList,
  Link,
  Menu,
  Popper,
  Paper,
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
import SupportAgentRoundedIcon from "@mui/icons-material/SupportAgentRounded";
import { theme } from "@zesty-io/material";

import { InstanceAvatar } from "../InstanceAvatar";
import { InstancesList } from "./Flyouts/InstancesList";
import { GlobalDomainsMenu } from "../../../GlobalDomainsMenu";
import { useGetInstanceQuery } from "../../../../services/accounts";
import { useRefreshCacheMutation } from "../../../../services/cloudFunctions";
import { useDomain } from "../../../../hooks/use-domain";
import { notify } from "../../../../store/notifications";
import instanceZUID from "../../../../../utility/instanceZUID";
import { actions } from "../../../../store/ui";

export const rotateAnimation = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;

export type View = "normal" | "instances" | "domains";
interface DropdownMenuProps {
  anchorEl: HTMLElement;
  onClose: () => void;
}
export const DropdownMenu: FC<DropdownMenuProps> = ({ anchorEl, onClose }) => {
  const [instanceSwitcherAnchorEl, setInstanceSwitcherAnchorEl] =
    useState<HTMLElement | null>(null);
  const [domainSwitcherAnchorEl, setDomainSwitcherAnchorEl] =
    useState<HTMLElement | null>(null);
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
  const domain = useDomain();

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
    onClose();
    window.open(url, "_blank", "noopener");
  };

  const handleCopyInstanceZUID = async () => {
    try {
      await navigator?.clipboard.writeText(instanceZUID);

      setIsInstanceZuidCopied(true);
    } catch (error) {
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
      <Menu
        open
        anchorEl={anchorEl}
        onClose={onClose}
        PaperProps={{
          sx: {
            pt: 0,
            mt: 1.5,
            width: 340,
            borderRadius: "8px",
            elevation: 8,
            overflow: "hidden",
          },
        }}
        MenuListProps={{
          sx: {
            p: 0,
            height: 591,
          },
        }}
      >
        <Stack direction="row" gap={1.5} p={2} alignItems="center">
          <InstanceAvatar onFaviconModalOpen={() => onClose()} />
          <Stack>
            <Typography variant="body2" fontWeight={600}>
              {instance?.name}
            </Typography>
            <Link
              variant="body2"
              fontWeight={600}
              color="info.dark"
              href={domain}
              target="_blank"
              rel="noopener"
            >
              {domain.replace(/http:\/\/|https:\/\//gm, "")}
            </Link>
          </Stack>
        </Stack>
        <Divider />
        <MenuList>
          <MenuItem
            data-cy="InstanceSwitcher"
            onMouseEnter={(evt) => {
              setInstanceSwitcherAnchorEl(evt.currentTarget);
            }}
            onMouseLeave={(evt) => {
              setInstanceSwitcherAnchorEl(null);
            }}
            sx={{
              "&.MuiMenuItem-root": {
                backgroundColor: Boolean(instanceSwitcherAnchorEl)
                  ? "action.hover"
                  : "background.paper",
              },
            }}
          >
            <>
              <ListItemIcon>
                <ManageSearchRoundedIcon />
              </ListItemIcon>
              <ListItemText>Switch Instance</ListItemText>
              <ArrowForwardIosRoundedIcon color="action" fontSize="small" />
              {Boolean(instanceSwitcherAnchorEl) && (
                <InstancesList anchorEl={instanceSwitcherAnchorEl} />
              )}
            </>
          </MenuItem>
          <Divider />
          <MenuItem
            onClick={() => {
              onClose();
              dispatch(actions.toggleUpdateFaviconModal(true));
            }}
            data-cy="Favicon"
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
            data-cy="WebEnginePreviewLink"
          >
            <ListItemIcon>
              <RemoveRedEyeRoundedIcon />
            </ListItemIcon>
            <ListItemText>View WebEngine Preview (Stage)</ListItemText>
          </MenuItem>
          <MenuItem onClick={handleCopyInstanceZUID} data-cy="CopyInstanceZUID">
            <ListItemIcon>
              {isInstanceZuidCopied ? (
                <CheckRoundedIcon />
              ) : (
                <ContentCopyRoundedIcon />
              )}
            </ListItemIcon>
            <ListItemText>Copy Instance ZUID</ListItemText>
          </MenuItem>
          <MenuItem onClick={() => refreshCache()} data-cy="RefreshCache">
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
          <Divider />
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
          <MenuItem
            data-cy="DomainSwitcher"
            onMouseEnter={(evt) => {
              setDomainSwitcherAnchorEl(evt.currentTarget);
            }}
            onMouseLeave={(evt) => {
              setDomainSwitcherAnchorEl(null);
            }}
            sx={{
              "&.MuiMenuItem-root": {
                backgroundColor: Boolean(domainSwitcherAnchorEl)
                  ? "action.hover"
                  : "background.paper",
              },
            }}
          >
            <ListItemIcon>
              <LanguageRoundedIcon />
            </ListItemIcon>
            <ListItemText>Domains</ListItemText>
            <ArrowForwardIosRoundedIcon color="action" fontSize="small" />
            {Boolean(domainSwitcherAnchorEl) && (
              <Popper
                open
                anchorEl={domainSwitcherAnchorEl}
                placement="right-start"
                sx={{
                  zIndex: theme.zIndex.modal,
                }}
                popperOptions={{
                  modifiers: [
                    {
                      name: "offset",
                      options: {
                        offset: [-16, -8],
                      },
                    },
                  ],
                }}
              >
                <Paper elevation={8}>
                  <GlobalDomainsMenu withBackButton={false} />
                </Paper>
              </Popper>
            )}
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
              handleOpenUrl(
                `https://www.zesty.io/instances/${instanceZUID}/apis`
              )
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
          <MenuItem
            onClick={() =>
              handleOpenUrl(
                `https://www.zesty.io/instances/${instanceZUID}/support`
              )
            }
            data-cy="GetHelp"
          >
            <ListItemIcon>
              <SupportAgentRoundedIcon />
            </ListItemIcon>
            <ListItemText>Contact Support</ListItemText>
          </MenuItem>
        </MenuList>
      </Menu>
    </>
  );
};
