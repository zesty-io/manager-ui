import { useSelector } from "react-redux";
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Link,
  Typography,
  Divider,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  ListItem,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import LanguageIcon from "@mui/icons-material/Language";
import RemoveRedEyeIcon from "@mui/icons-material/RemoveRedEye";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import EmailIcon from "@mui/icons-material/Email";
import ChatIcon from "@mui/icons-material/Chat";
import { AppState } from "../../store/types";

interface Props {
  onClose?: () => void;
  instanceZUID?: string;
}

const DocsMenu = ({ onClose, instanceZUID }: Props) => {
  const instance = useSelector((state: AppState) => state.instance);

  return (
    <>
      <Box sx={{ display: "flex", justifyContent: "space-between", p: 2 }}>
        <ListItem sx={{ p: 0, width: 0 }}>
          <ListItemIcon sx={{ minWidth: "30px" }}>
            <IconButton onClick={() => onClose()}>
              <ArrowBackIcon fontSize="small" />
            </IconButton>
          </ListItemIcon>
          <Typography variant="h5" fontWeight={600}>
            Docs
          </Typography>
        </ListItem>
        <Box>
          <Link
            title="Support"
            href="mailto:support@zesty.io"
            color="secondary"
            underline="none"
          >
            <Button
              variant="contained"
              color="inherit"
              size="small"
              startIcon={<EmailIcon fontSize="small" />}
            >
              support@zesty.io
            </Button>
          </Link>
          <Button
            variant="contained"
            color="inherit"
            size="small"
            sx={{ ml: 1 }}
            onClick={() => {
              window.open(`https://www.zesty.io/chat/`, "_blank");
            }}
            startIcon={<ChatIcon fontSize="small" />}
          >
            Get Help
          </Button>
        </Box>
      </Box>
    </>
  );
};

export default DocsMenu;
