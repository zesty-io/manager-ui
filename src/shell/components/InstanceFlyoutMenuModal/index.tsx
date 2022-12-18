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
import { useSelector } from "react-redux";
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
  return (
    <Dialog open={true} fullWidth maxWidth={"xs"} onClose={onClose}>
      <Box sx={{ p: 2 }}>
        <ListItem sx={{}}>
          <Avatar src={instanceFaviconUrl} />
          <Typography variant="body2" sx={{ ml: 1.5, fontWeight: 700 }}>
            {instanceName}
          </Typography>
        </ListItem>
      </Box>
    </Dialog>
  );
};

export default InstanceFlyoutMenuModal;
