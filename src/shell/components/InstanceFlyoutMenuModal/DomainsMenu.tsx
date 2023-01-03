import { useSelector } from "react-redux";
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
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
interface Props {
  onClose?: () => void;
  instanceZUID?: string;
}

const DomainsMenu = ({ onClose, instanceZUID }: Props) => {
  // @ts-ignore
  const instance = useSelector((RootState) => RootState.instance);

  return (
    <>
      <Box sx={{ display: "flex", justifyContent: "space-between", p: 2 }}>
        <ListItem sx={{ p: 0, width: 0 }}>
          <ListItemIcon sx={{ minWidth: "30px" }}>
            <IconButton onClick={() => onClose()}>
              <ArrowBackIcon fontSize="small" />
            </IconButton>
          </ListItemIcon>
          <Typography variant="h5">Domains</Typography>
        </ListItem>
        <Button
          variant="outlined"
          color="inherit"
          size="small"
          onClick={() =>
            window.open(
              `https://www.zesty.io/instances/${instanceZUID}/domains/`,
              "_blank"
            )
          }
          startIcon={<LanguageIcon fontSize="small" />}
        >
          Manage Domains
        </Button>
      </Box>
      <Box>
        <ListItem>
          <Button
            variant="outlined"
            size="small"
            onClick={() =>
              window.open(
                // @ts-ignore
                `${CONFIG.URL_PREVIEW_PROTOCOL}${instance.randomHashID}${CONFIG.URL_PREVIEW}`,
                "_blank"
              )
            }
            startIcon={<RemoveRedEyeIcon fontSize="small" />}
          >
            View Web Engine Preview
          </Button>
        </ListItem>
        {instance.domains.map((domain: any) => (
          <>
            <ListItem
              sx={{
                cursor: "pointer",
              }}
              onClick={() => window.open(`http://${domain.domain}`, "_blank")}
            >
              <ListItemIcon sx={{ minWidth: "35px" }}>
                <OpenInNewIcon />
              </ListItemIcon>
              <ListItemText>{domain.domain}</ListItemText>
            </ListItem>
            <Divider />
          </>
        ))}
      </Box>
    </>
  );
};

export default DomainsMenu;
