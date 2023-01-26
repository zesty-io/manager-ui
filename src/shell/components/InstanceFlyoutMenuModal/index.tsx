import { useState } from "react";
import { useSelector } from "react-redux";
import {
  Link,
  Dialog,
  Avatar,
  Box,
  Typography,
  MenuItem,
  Button,
  ListItem,
  Tooltip,
  IconButton,
  CircularProgress,
} from "@mui/material";

import { useRefreshCacheMutation } from "../../services/cloudFunctions";
import slackIcon from "../../../../public/images/slackIcon.svg";
import youtubeIcon from "../../../../public/images/youtubeIcon.svg";
import ManageSearchIcon from "@mui/icons-material/ManageSearch";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import RefreshIcon from "@mui/icons-material/Refresh";
import CheckIcon from "@mui/icons-material/Check";
import DomainsMenu from "./DomainsMenu";
import DocsMenu from "./DocsMenu";
import { AppState } from "../../../shell/store/types";
import InstancesListMenu from "./InstancesListMenu";

interface Props {
  instanceFaviconUrl?: string;
  instanceName?: string;
  instanceZUID?: string;
  userFaviconUrl?: string;
  userFullname?: string;
  onSetShowFaviconModal?: any;
  showDocsMenu?: boolean;
  onSetShowDocsMenu?: any;
  favoriteInstances?: any;
  onClose?: () => void;
}

export default function InstanceFlyoutMenuModal({
  instanceFaviconUrl,
  instanceName,
  instanceZUID,
  showDocsMenu,
  onSetShowDocsMenu,
  userFaviconUrl,
  favoriteInstances,
  userFullname,
  onSetShowFaviconModal,
  onClose,
}: Props) {
  const [
    refreshCache,
    {
      data = {},
      isSuccess: isSuccessRefreshCache,
      isLoading: isLoadingRefreshCache,
    },
  ] = useRefreshCacheMutation();
  const instance = useSelector((state: AppState) => state.instance);
  const [isCopiedZuid, setIsCopiedZuid] = useState(false);
  const [showDomainsMenu, setShowDomainsMenu] = useState(false);
  const [showInstancesListMenu, setShowInstancesListMenu] = useState(false);

  const handleNavigation = (url: string) => {
    window.open(url, "_blank");
  };

  const handleCopyInstanceZUID = () => {
    navigator?.clipboard
      ?.writeText(instanceZUID)
      .then(() => {
        setIsCopiedZuid(true);
        setTimeout(() => {
          setIsCopiedZuid(false);
        }, 1500);
      })
      .catch((err) => {
        console.error(err);
      });
  };

  const instanceAvatarColors = [
    "green.500",
    "blue.500",
    "red.500",
    "purple.500",
    "pink.500",
    "deepOrange.500",
    "deepPurple.500",
    "blue.900",
    "deepOrange.900",
  ];

  const FavoriteInstances = () => {
    const styledActiveInstance = {
      borderWidth: "1px",
      borderStyle: "solid",
      borderRadius: 100,
      mx: "auto",
      width: 32,
      mb: 1,
      p: "2px",
      height: 32,
      borderColor: "primary.main",
    };

    return (
      <Box sx={{ width: "48px" }}>
        <Box sx={{ pt: 2 }}>
          {favoriteInstances.length > 0 ? (
            <>
              {favoriteInstances
                .slice(0, 8)
                .map((favInstance: any, key: number) => (
                  <Box
                    sx={
                      favInstance.ZUID === instanceZUID && styledActiveInstance
                    }
                    onClick={() => {
                      // @ts-ignore
                      window.location.href = `${CONFIG.URL_MANAGER_PROTOCOL}${favInstance.ZUID}${CONFIG.URL_MANAGER}`;
                    }}
                  >
                    <Tooltip title={favInstance.name} placement="right">
                      <Avatar
                        sx={{
                          textTransform: "uppercase",
                          cursor: "pointer",
                          mx: "auto",
                          mb: 1,
                          width: 32,
                          height: 32,
                          backgroundColor: instanceAvatarColors[key],
                        }}
                      >
                        {favInstance?.name.charAt(0)}
                      </Avatar>
                    </Tooltip>
                  </Box>
                ))}
            </>
          ) : (
            <Box
              sx={styledActiveInstance}
              onClick={() => {
                // @ts-ignore
                window.location.href = `${CONFIG.URL_MANAGER_PROTOCOL}${instanceZUID}${CONFIG.URL_MANAGER}`;
              }}
            >
              <Tooltip title={instanceName} placement="right">
                <Avatar
                  sx={{
                    textTransform: "uppercase",
                    cursor: "pointer",
                    mx: "auto",
                    mb: 1,
                    width: 32,
                    height: 32,
                    backgroundColor: instanceAvatarColors[0],
                  }}
                >
                  {instanceName.charAt(0)}
                </Avatar>
              </Tooltip>
            </Box>
          )}
        </Box>
        {/* <IconButton
          sx={{
            mx: "auto",
            width: "100%",
          }}
          onClick={() => setShowInstancesListMenu(true)}
        >
          <ManageSearchIcon fontSize="small" sx={{ mx: "auto" }} />
        </IconButton> */}
      </Box>
    );
  };

  return (
    <Dialog
      PaperProps={{
        style: {
          position: "absolute",
          bottom: 0,
          left: 0,
          overflow: "hidden",
          width: "450px",
          height: "392px",
          borderRadius: "8px",
        },
      }}
      sx={{
        boxShadow: 8,
      }}
      open={true}
      fullWidth
      maxWidth={"xs"}
      onClose={onClose}
    >
      {showDomainsMenu ? (
        <DomainsMenu
          onClose={() => setShowDomainsMenu(false)}
          instanceZUID={instanceZUID}
        />
      ) : showDocsMenu ? (
        <DocsMenu
          onClose={() => onSetShowDocsMenu(false)}
          instanceZUID={instanceZUID}
        />
      ) : showInstancesListMenu ? (
        <InstancesListMenu
          onClose={() => setShowInstancesListMenu(false)}
          instanceZUID={instanceZUID}
          instanceAvatarColors={instanceAvatarColors}
        />
      ) : (
        <Box sx={{ display: "flex" }}>
          <FavoriteInstances />

          <Box>
            <Box
              sx={{
                height: "340px",
                display: "flex",
                borderLeftColor: "grey.100",
                borderLeftStyle: "solid",
                borderLeftWidth: "1px",
              }}
            >
              <Box sx={{ width: "200px", py: "12px" }}>
                <ListItem>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>
                    {instanceName}
                  </Typography>
                </ListItem>
                <MenuItem onClick={onSetShowFaviconModal}>
                  <Typography variant="body2">Update Favicon</Typography>
                </MenuItem>
                <MenuItem
                  onClick={() =>
                    handleNavigation(
                      `https://www.zesty.io/instances/${instanceZUID}`
                    )
                  }
                >
                  <Typography variant="body2">Configure Instance</Typography>
                </MenuItem>
                <MenuItem
                  onClick={() =>
                    handleNavigation(
                      `https://www.zesty.io/instances/${instanceZUID}/users`
                    )
                  }
                >
                  <Typography variant="body2">Users</Typography>
                </MenuItem>
                <MenuItem
                  onClick={() =>
                    handleNavigation(
                      `https://www.zesty.io/instances/${instanceZUID}/apis`
                    )
                  }
                >
                  <Typography variant="body2">APIs</Typography>
                </MenuItem>
                <MenuItem onClick={() => setShowDomainsMenu(true)}>
                  <Typography variant="body2">Domains</Typography>
                </MenuItem>
                <MenuItem
                  onClick={() =>
                    handleNavigation(
                      // @ts-ignore
                      `${CONFIG.URL_PREVIEW_PROTOCOL}${instance.randomHashID}${CONFIG.URL_PREVIEW}`
                    )
                  }
                >
                  <Typography variant="body2">Go to Live Site</Typography>
                </MenuItem>
                <Box sx={{ px: 1, py: "5px" }}>
                  <Button
                    variant="outlined"
                    color="inherit"
                    size="small"
                    onClick={refreshCache}
                    startIcon={
                      <>
                        {isLoadingRefreshCache ? (
                          <CircularProgress size="18px" color="inherit" />
                        ) : !isLoadingRefreshCache && isSuccessRefreshCache ? (
                          <CheckIcon fontSize="small" />
                        ) : (
                          <RefreshIcon fontSize="small" />
                        )}
                      </>
                    }
                  >
                    Refresh Cache
                  </Button>
                </Box>
                <Box sx={{ px: 1, py: "5px" }}>
                  <Button
                    variant="outlined"
                    color="inherit"
                    size="small"
                    onClick={handleCopyInstanceZUID}
                    startIcon={
                      <>
                        {isCopiedZuid ? (
                          <CheckIcon fontSize="small" />
                        ) : (
                          <ContentCopyIcon fontSize="small" />
                        )}
                      </>
                    }
                  >
                    Get Instance ZUID
                  </Button>
                </Box>
              </Box>

              <Box
                sx={{
                  width: "200px",
                  borderLeftColor: "grey.100",
                  borderLeftStyle: "solid",
                  borderLeftWidth: "1px",
                  py: 1,
                }}
              >
                <ListItem>
                  <Avatar
                    alt={`${userFullname} Avatar`}
                    src={`https://www.gravatar.com/avatar/${userFaviconUrl}?d=mm&s=40`}
                    sx={{ width: 32, height: 32 }}
                  />
                  <Typography variant="body2" sx={{ ml: 1.5, fontWeight: 700 }}>
                    {userFullname}
                  </Typography>
                </ListItem>
                <MenuItem
                  onClick={() =>
                    handleNavigation("https://www.zesty.io/profile/")
                  }
                >
                  <Typography variant="body2">User Settings</Typography>
                </MenuItem>
                <MenuItem
                  onClick={() =>
                    handleNavigation("https://www.zesty.io/instances/")
                  }
                >
                  <Typography variant="body2">See All Instances</Typography>
                </MenuItem>
                <MenuItem onClick={() => onSetShowDocsMenu(true)}>
                  <Typography variant="body2">Docs</Typography>
                </MenuItem>
                <MenuItem
                  onClick={() => handleNavigation("https://www.zesty.io/chat/")}
                >
                  <Typography variant="body2">Get Help</Typography>
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    // @ts-ignore
                    window.open(`${CONFIG.URL_ACCOUNTS}/logout`, "_self");
                  }}
                >
                  <Typography variant="body2">Log Out</Typography>
                </MenuItem>
              </Box>
            </Box>

            {/* Footer */}
            <Box
              display="flex"
              justifyContent="space-between"
              padding={2}
              sx={{
                backgroundColor: "grey.100",
              }}
            >
              <Link
                underline="none"
                color="secondary"
                target="_blank"
                title="Connect with Zesty"
                href="https://www.zesty.io/meet/"
              >
                {/* @ts-ignore */}
                <Typography variant="body3" color="text.secondary">
                  CONNECT WITH ZESTY
                </Typography>
              </Link>

              <Box display="flex" gap={2}>
                <Link
                  target="_blank"
                  title="Subscribe to Zesty Youtube Channel"
                  href="https://www.youtube.com/c/Zestyio/videos"
                >
                  <img src={youtubeIcon} />
                </Link>
                <Link
                  target="_blank"
                  title="Join Zesty Slack Community"
                  href="https://www.zesty.io/chat/"
                >
                  <img src={slackIcon} />
                </Link>
              </Box>
            </Box>
          </Box>
        </Box>
      )}
    </Dialog>
  );
}
