import { FC, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch } from "react-redux";
import { keyframes } from "@emotion/react";
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
  Skeleton,
} from "@mui/material";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import LanguageRoundedIcon from "@mui/icons-material/LanguageRounded";
import RemoveRedEyeRoundedIcon from "@mui/icons-material/RemoveRedEyeRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import SettingsRoundedIcon from "@mui/icons-material/SettingsRounded";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";

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
  onCloseDropdownMenu?: () => void;
  onChangeView?: (view: string) => void;
  withBackButton?: boolean;
}
export const GlobalDomainsMenu: FC<GlobalDomainsMenuProps> = ({
  onCloseDropdownMenu,
  onChangeView,
  withBackButton = true,
}) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { data: domains, isLoading: isLoadingDomains } = useGetDomainsQuery();
  const { data: instance } = useGetInstanceQuery();
  const [refreshCache, { isSuccess, isLoading, isError }] =
    useRefreshCacheMutation();

  const stageDomainText = `${instance?.randomHashID}${CONFIG.URL_PREVIEW}`;

  useEffect(() => {
    if (isError) {
      dispatch(
        notify({
          message: t("shell.failedRefreshCdnCache"),
          kind: "error",
        })
      );
    }
  }, [isError]);

  const handleOpenUrl = (url: string) => {
    onCloseDropdownMenu && onCloseDropdownMenu();
    window.open(url, "_blank", "noopener");
  };

  return (
    <Stack height="inherit" data-cy="DomainsList">
      <Stack direction="row" gap={1.5} p={2}>
        {withBackButton && (
          <IconButton size="small" onClick={() => onChangeView("normal")}>
            <ArrowBackRoundedIcon fontSize="small" />
          </IconButton>
        )}
        <Typography variant="h5" fontWeight={600}>
          {t("common.domains")}
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
            {t("common.manage")}
          </Button>
          <Button
            data-cy="RefreshCache"
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
            {t("shell.refreshCdnCache")}
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
              `${CONFIG.URL_PREVIEW_PROTOCOL}${instance.randomHashID}${CONFIG.URL_PREVIEW}`
            )
          }
          data-cy="WebEnginePreviewLink"
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
          <Chip size="small" label={t("common.stage")} sx={{ ml: 1 }} />
        </MenuItem>
        {isLoadingDomains
          ? [...Array(5)].map((_, index) => (
              <MenuItem key={index}>
                <Skeleton width="100%" height={24} />
              </MenuItem>
            ))
          : domains?.map((domain) => (
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
                <Chip
                  size="small"
                  label={
                    domain.branch === "live"
                      ? t("common.prod")
                      : t("common.stage")
                  }
                  sx={{ ml: 1 }}
                />
              </MenuItem>
            ))}
      </MenuList>
    </Stack>
  );
};
