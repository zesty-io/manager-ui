import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  Typography,
  Stack,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import AddIcon from "@mui/icons-material/Add";

type RowDialogProps = {
  onClose: () => void;
  name: string;
};
export const RowDialog = ({ onClose, name }: RowDialogProps) => {
  return (
    <Dialog
      open
      onClose={onClose}
      slotProps={{
        paper: { sx: { maxWidth: "unset", width: 640 } },
      }}
    >
      <DialogTitle
        component="div"
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          pb: 2,
        }}
      >
        <Typography variant="h5" fontWeight={700}>
          Add row to {name}
        </Typography>
        <IconButton size="small" onClick={onClose}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>
      <DialogContent
        dividers
        sx={{
          pt: 2.5,
          backgroundColor: "grey.50",
          "&.MuiDialogContent-dividers": {
            borderColor: "border",
          },
        }}
      >
        Test
      </DialogContent>
      <DialogActions
        sx={{
          justifyContent: "space-between",
          pt: 2,
        }}
      >
        <Button variant="outlined" onClick={onClose} color="inherit">
          Cancel
        </Button>
        <Stack direction="row" spacing={2}>
          <Button variant="outlined" onClick={onClose} startIcon={<AddIcon />}>
            Add another field
          </Button>
          <Button variant="contained" onClick={onClose}>
            Save
          </Button>
        </Stack>
      </DialogActions>
    </Dialog>
  );
};
