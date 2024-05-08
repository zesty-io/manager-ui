import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Stack,
  ButtonBaseActions,
} from "@mui/material";
import CloudUploadRoundedIcon from "@mui/icons-material/CloudUploadRounded";
import { useRef } from "react";

type ConfirmPublishModal = {
  contentTitle: string;
  onCancel: () => void;
  onConfirm: () => void;
  contentVersion: number;
};
export const ConfirmPublishModal = ({
  contentTitle,
  onCancel,
  onConfirm,
  contentVersion,
}: ConfirmPublishModal) => {
  const actionRef = useRef<ButtonBaseActions | null>(null);
  const onEntered = () => actionRef?.current?.focusVisible();
  return (
    <Dialog
      open
      data-cy="ConfirmPublishModal"
      PaperProps={{ sx: { width: 480 } }}
      TransitionProps={{ onEntered }}
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
          Publish Content Item:
          <Typography fontWeight={400} variant="h5" display="inline">
            {" "}
            {contentTitle}?
          </Typography>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary">
          This will immediately make v{contentVersion} of the item available on
          all of your platforms. You can always unpublish this item later if
          needed.
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button variant="text" color="inherit" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          action={(actions) => (actionRef.current = actions)}
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
