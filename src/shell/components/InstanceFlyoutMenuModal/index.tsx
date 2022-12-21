import {
  Dialog,
  DialogContent,
  Avatar,
  Box,
  Typography,
  MenuItem,
  Button,
  ListItem,
} from "@mui/material";
import slackIcon from "../../../../public/images/slackIcon.svg";
import youtubeIcon from "../../../../public/images/youtubeIcon.svg";
import discordIcon from "../../../../public/images/discordIcon.svg";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import RefreshIcon from "@mui/icons-material/Refresh";
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
  const handleNavigation = (url: string) => {
    window.open(url, "_blank");
  };

  return (
    <Dialog open={true} fullWidth maxWidth={"xs"} onClose={onClose}>
      <Box sx={{ py: 1 }}>
        <ListItem>
          <Avatar src={instanceFaviconUrl} />
          <Typography variant="body2" sx={{ ml: 1.5, fontWeight: 700 }}>
            {instanceName}
          </Typography>
        </ListItem>
        <Box sx={{ p: 1 }}>
          <Button
            variant="outlined"
            color="inherit"
            // onClick={() => {
            //   return request(
            //     `${CONFIG.CLOUD_FUNCTIONS_DOMAIN}/fastlyPurge?zuid=${instanceZUID}&instance=${instanceZUID}`
            //   ).catch((err: any) => {
            //   })
            //   .finally(() => {
            //     // setPurge(false);
            //   });
            // }}
            startIcon={<RefreshIcon fontSize="small" />}
          >
            Refresh Cache
          </Button>
        </Box>
        <Box sx={{ p: 1 }}>
          <Button
            variant="outlined"
            color="inherit"
            startIcon={<ContentCopyIcon fontSize="small" />}
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
            onClick={() => handleNavigation("https://discord.gg/uqDqeX8RXE")}
          />
        </Box>
      </Box>
    </Dialog>
  );
};

export default InstanceFlyoutMenuModal;
