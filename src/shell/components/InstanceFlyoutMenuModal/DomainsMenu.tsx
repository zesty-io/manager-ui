import {
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Typography,
  ListItemButton,
  ListItem,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import LanguageIcon from "@mui/icons-material/Language";
import { useEffect } from "react";

interface Props {
  onClose?: () => void;
  instanceZUID?: string;
}

const DomainsMenu = ({ onClose, instanceZUID }: Props) => {
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
      onClose={onClose}
      fullWidth
      maxWidth={"xs"}
    >
      <Box sx={{ display: "flex", justifyContent: "space-between", p: 2 }}>
        <ListItem sx={{ p: 0, width: 0 }}>
          <IconButton sx={{ pl: 0 }}>
            <ArrowBackIcon fontSize="small" />
          </IconButton>
          <Typography variant="h5">Domains</Typography>
        </ListItem>
        <Button
          variant="outlined"
          color="inherit"
          sx={{ height: "32px", mt: 0.5 }}
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
    </Dialog>
  );
};

export default DomainsMenu;
