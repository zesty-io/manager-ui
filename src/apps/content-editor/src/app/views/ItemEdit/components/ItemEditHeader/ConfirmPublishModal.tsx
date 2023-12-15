import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Stack,
} from "@mui/material";
import CloudUploadRoundedIcon from "@mui/icons-material/CloudUploadRounded";

type ConfirmPublishModal = {
  contentTitle: string;
  onCancel: () => void;
  onConfirm: () => void;
};
export const ConfirmPublishModal = ({
  contentTitle,
  onCancel,
  onConfirm,
}: ConfirmPublishModal) => {
  return (
    <Dialog
      open
      data-cy="ConfirmPublishModal"
      PaperProps={{ sx: { width: 480 } }}
    >
      <DialogTitle component="div" sx={{ pb: 1 }}>
        <Stack
          height={40}
          width={40}
          bgcolor="green.100"
          borderRadius="50%"
          justifyContent="center"
          alignItems="center"
          marginBottom={1.5}
        >
          <CloudUploadRoundedIcon color="success" />
        </Stack>
        <Box>
          <Typography fontWeight={700} variant="h5" display="inline">
            Publish Content Item:
          </Typography>{" "}
          <Typography variant="h5" display="inline">
            {contentTitle}?
          </Typography>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary">
          This will make the item immediately available on all of your
          platforms. You can always unpublish this item later if needed.
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button variant="text" color="inherit" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          variant="contained"
          color="success"
          sx={{ color: "common.white" }}
          onClick={onConfirm}
          data-cy="ConfirmPublishButton"
        >
          Publish Item
        </Button>
      </DialogActions>
    </Dialog>
  );
};
