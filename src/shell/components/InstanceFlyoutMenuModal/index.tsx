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
  CircularProgress,
} from "@mui/material";
import { useRefreshCacheMutation } from "../../services/cloudFunctions";
import slackIcon from "../../../../public/images/slackIcon.svg";
import youtubeIcon from "../../../../public/images/youtubeIcon.svg";
import discordIcon from "../../../../public/images/discordIcon.svg";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import RefreshIcon from "@mui/icons-material/Refresh";
import CheckIcon from "@mui/icons-material/Check";
import DomainsMenu from "./DomainsMenu";
import DocsMenu from "./DocsMenu";
interface Props {
  instanceFaviconUrl?: string;
  instanceName?: string;
  instanceZUID?: string;
  userFaviconUrl?: string;
  userFullname?: string;
  onSetShowFaviconModal?: any;
  favoriteInstances?: any;
  onClose?: () => void;
}

const InstanceFlyoutMenuModal = ({
  instanceFaviconUrl,
  instanceName,
  instanceZUID,
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
  const [showDocsMenu, setShowDocsMenu] = useState(false);

  useEffect(() => {
    console.log("favoriteInstances", favoriteInstances);
  }, [favoriteInstances]);

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
  ];

  return (
    <Dialog
      PaperProps={{
        style: {
          position: "absolute",
          bottom: 0,
          left: 0,
          width: "448px",
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
          onClose={() => setShowDocsMenu(false)}
          instanceZUID={instanceZUID}
        />
      ) : (
        <Box sx={{ display: "flex" }}>
          {favoriteInstances.map((favInstance: any) => (
            <Box
              sx={{
                width: "48px",
                p: "10px 4px",
              }}
            >
              <Avatar
                sx={{
                  textTransform: "uppercase",
                  backgroundColor:
                    instanceAvatarColors[
                      Math.floor(Math.random() * instanceAvatarColors.length)
                    ],
                }}
              >
                {favInstance?.name.charAt(0)}
              </Avatar>
            </Box>
          ))}

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
                  <Avatar src={instanceFaviconUrl} />
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
                <MenuItem onClick={() => setShowDocsMenu(true)}>
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
                <img
                  src={discordIcon}
                  onClick={() =>
                    handleNavigation("https://discord.gg/uqDqeX8RXE")
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
