import { FC, useEffect } from "react";
import { useDispatch } from "react-redux";
import { keyframes } from "@mui/system";
import {
  IconButton,
  Typography,
  Button,
  Chip,
  Stack,
  Divider,
  MenuList,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Tooltip,
} from "@mui/material";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import LanguageRoundedIcon from "@mui/icons-material/LanguageRounded";
import RemoveRedEyeRoundedIcon from "@mui/icons-material/RemoveRedEyeRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import SettingsRoundedIcon from "@mui/icons-material/SettingsRounded";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import AutoSizer from "react-virtualized-auto-sizer";

import instanceZUID from "../../../utility/instanceZUID";
import { useRefreshCacheMutation } from "../../services/cloudFunctions";
import { notify } from "../../store/notifications";
import {
  useGetInstanceQuery,
  useGetDomainsQuery,
} from "../../services/accounts";

const rotateAnimation = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;

interface GlobalDomainsMenuProps {
  onCloseDropdownMenu: () => void;
  onChangeView?: (view: string) => void;
  withBackButton?: boolean;
}
export const GlobalDomainsMenu: FC<GlobalDomainsMenuProps> = ({
  onCloseDropdownMenu,
  onChangeView,
  withBackButton = true,
}) => {
  const dispatch = useDispatch();
  const { data: domains } = useGetDomainsQuery();
  const { data: instance } = useGetInstanceQuery();
  const [refreshCache, { isSuccess, isLoading, isError }] =
    useRefreshCacheMutation();

  const stageDomainText = `
    ${instance?.randomHashID}
    ${
      // @ts-ignore
      CONFIG.URL_PREVIEW
    }
  `;

  useEffect(() => {
    if (isError) {
      dispatch(
        notify({
          message: "Failed to refresh the CDN cache",
          kind: "error",
        })
      );
    }
  }, [isError]);

  const handleOpenUrl = (url: string) => {
    onCloseDropdownMenu();
    window.open(url, "_blank", "noopener");
  };

  return (
    <Stack height="inherit">
      <Stack direction="row" gap={1.5} p={2}>
        {withBackButton && (
          <IconButton size="small" onClick={() => onChangeView("normal")}>
            <ArrowBackRoundedIcon fontSize="small" />
          </IconButton>
        )}
        <Typography variant="h5" fontWeight={600}>
          Domains
        </Typography>
      </Stack>
      <Divider />
      <MenuList>
        <Stack direction="row" alignItems="center" gap={1.5} px={2} py={0.75}>
          <Button
            variant="outlined"
            color="inherit"
            size="small"
            startIcon={<SettingsRoundedIcon />}
            onClick={() =>
              handleOpenUrl(
                `https://www.zesty.io/instances/${instanceZUID}/domains`
              )
            }
          >
            Manage
          </Button>
          <Button
            variant="outlined"
            color="inherit"
            size="small"
            startIcon={
              isSuccess ? (
                <CheckRoundedIcon />
              ) : (
                <RefreshRoundedIcon
                  sx={{
                    animation: isLoading
                      ? `${rotateAnimation} 1s infinite ease`
                      : "none",
                  }}
                />
              )
            }
            onClick={() => refreshCache()}
          >
            Refresh CDN Cache
          </Button>
        </Stack>
      </MenuList>
      <Divider />
      <MenuList
        sx={{
          height: "100%",
          overflowY: "auto",
        }}
      >
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
          <Tooltip
            title={stageDomainText}
            enterDelay={500}
            enterNextDelay={500}
          >
            <ListItemText primaryTypographyProps={{ noWrap: true }}>
              {stageDomainText}
            </ListItemText>
          </Tooltip>
          <Chip size="small" label="Stage" />
        </MenuItem>
        {domains?.map((domain) => (
          <MenuItem
            key={domain.ZUID}
            onClick={() => handleOpenUrl(`https://${domain.domain}`)}
          >
            <ListItemIcon>
              <LanguageRoundedIcon />
            </ListItemIcon>
            <Tooltip
              title={domain.domain}
              enterDelay={500}
              enterNextDelay={500}
            >
              <ListItemText primaryTypographyProps={{ noWrap: true }}>
                {domain.domain}
              </ListItemText>
            </Tooltip>
          </MenuItem>
        ))}
      </MenuList>
    </Stack>
  );
};
