import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
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
import discordIcon from "../../../../public/images/discordIcon.svg";
import ManageSearchIcon from "@mui/icons-material/ManageSearch";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import RefreshIcon from "@mui/icons-material/Refresh";
import CheckIcon from "@mui/icons-material/Check";
import DomainsMenu from "./DomainsMenu";
import DocsMenu from "./DocsMenu";
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

const InstanceFlyoutMenuModal = ({
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
}: Props) => {
  const [
    refreshCache,
    {
      data = {},
      isSuccess: isSuccessRefreshCache,
      isLoading: isLoadingRefreshCache,
    },
  ] = useRefreshCacheMutation();
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
      <Box sx={{ width: "48px", py: 2 }}>
        <Box>
          {favoriteInstances
            .slice(0, 8)
            .map((favInstance: any, key: number) => (
              <Box
                sx={favInstance.ZUID === instanceZUID && styledActiveInstance}
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
        </Box>
        <IconButton
          sx={{ mx: "auto", width: "100%" }}
          onClick={() => setShowInstancesListMenu(true)}
        >
          <ManageSearchIcon sx={{ mx: "auto" }} />
        </IconButton>
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
          width: "450px",
          height: "392px",
        },
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
              <Box sx={{ width: "200px", py: 1 }}>
                <ListItem>
                  <Avatar
                    src={instanceFaviconUrl}
                    sx={{ width: 32, height: 32 }}
                  />
                  <Typography variant="body2" sx={{ ml: 1.5, fontWeight: 700 }}>
                    {instanceName}
                  </Typography>
                </ListItem>
                <MenuItem onClick={onSetShowFaviconModal}>
                  <Typography variant="body2">Update Favicon</Typography>
                </MenuItem>
                <MenuItem onClick={() => setShowDomainsMenu(true)}>
                  <Typography variant="body2">Domains</Typography>
                </MenuItem>
                <Box sx={{ p: 1 }}>
                  <Button
                    variant="outlined"
                    color="inherit"
                    onClick={() => refreshCache()}
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
                <Box sx={{ p: 1 }}>
                  <Button
                    variant="outlined"
                    color="inherit"
                    onClick={() => handleCopyInstanceZUID()}
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
                  height: "100%",
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
              {/* @ts-ignore */}
              <Typography variant="body3" color="text.secondary">
                CONNECT WITH ZESTY
              </Typography>
              <Box
                display="flex"
                gap={2}
                sx={{
                  img: {
                    cursor: "pointer",
                  },
                }}
              >
                <img
                  src={slackIcon}
                  onClick={() =>
                    handleNavigation(
                      "https://join.slack.com/t/zestyiodevs/shared_invite/zt-1jv3ct6k4-uuDM5ZNLy3NgK2FCzK~xuw"
                    )
                  }
                />
                <img
                  src={youtubeIcon}
                  onClick={() =>
                    handleNavigation("https://www.youtube.com/c/Zestyio/videos")
                  }
                />
              </Box>
            </Box>
          </Box>
        </Box>
      )}
    </Dialog>
  );
};

export default InstanceFlyoutMenuModal;
