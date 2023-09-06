import {
  Box,
  Button,
  Typography,
  Dialog,
  DialogTitle,
  DialogActions,
} from "@mui/material";
import { UnpublishedRounded } from "@mui/icons-material";
import { LoadingButton } from "@mui/lab";

type UnpublishDialogProps = {
  onClose: () => void;
  onConfirm: () => void;
  itemName: string;
  loading: boolean;
};

export const UnpublishDialog = ({
  onClose,
  onConfirm,
  itemName,
  loading,
}: UnpublishDialogProps) => {
  return (
    <Dialog open fullWidth maxWidth={"xs"} onClose={onClose}>
      <DialogTitle>
        <Box
          sx={{
            backgroundColor: "red.100",
            borderRadius: "100%",
            width: "40px",
            height: "40px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <UnpublishedRounded color="error" />
        </Box>
        <Typography variant="h5" sx={{ mt: 1.5 }}>
          <Typography variant="inherit" display="inline" fontWeight={600}>
            Unpublish Content Item:
          </Typography>{" "}
          {itemName}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          This will make the it immediately unavailable on all of your
          platforms. You can always republish this item by clicking on the
          publish button.
        </Typography>
      </DialogTitle>
      <DialogActions>
        <Button color="inherit" onClick={onClose}>
          Cancel
        </Button>
        <LoadingButton
          variant="contained"
          color="error"
          aria-label="Delete Button"
          onClick={onConfirm}
          loading={loading}
        >
          Unpublish Item
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
};
