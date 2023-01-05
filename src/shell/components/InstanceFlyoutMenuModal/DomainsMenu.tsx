import { DefaultRootState, RootStateOrAny, useSelector } from "react-redux";
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
import { AppState } from "../../../shell/store/types";
interface Props {
  onClose?: () => void;
  instanceZUID?: string;
}

const DomainsMenu = ({ onClose, instanceZUID }: Props) => {
  const instance = useSelector((state: AppState) => state.instance);

  return (
    <>
      <Box sx={{ display: "flex", justifyContent: "space-between", p: 2 }}>
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <IconButton onClick={() => onClose()}>
            <ArrowBackIcon fontSize="small" />
          </IconButton>
          <Typography variant="h5" fontWeight={600}>
            Domains
          </Typography>
        </Box>
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
        <Button
          variant="outlined"
          size="small"
          sx={{
            mx: 2,
            my: 1,
          }}
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
