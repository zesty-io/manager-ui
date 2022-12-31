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
interface Props {
  instanceFaviconUrl?: string;
  instanceName?: string;
  instanceZUID?: string;
  onClose?: () => void;
}

const InstanceFlyoutMenuModal = ({
  instanceFaviconUrl,
  instanceName,
  instanceZUID,
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
      ) : (
        <>
          <Box sx={{ py: 1 }}>
            <ListItem>
              <Avatar src={instanceFaviconUrl} />
              <Typography variant="body2" sx={{ ml: 1.5, fontWeight: 700 }}>
                {instanceName}
              </Typography>
            </ListItem>
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
            display="flex"
            justifyContent="space-between"
            padding={2}
            sx={{
              backgroundColor: "grey.100",
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
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
        </>
      )}
    </Dialog>
  );
};

export default InstanceFlyoutMenuModal;
