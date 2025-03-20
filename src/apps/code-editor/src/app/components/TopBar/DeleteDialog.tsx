import { memo, useState, useCallback } from "react";
import { useHistory } from "react-router";
import DeleteIcon from "@mui/icons-material/Delete";
import LoadingButton from "@mui/lab/LoadingButton";
import {
  Button,
  Dialog,
  DialogActions,
  DialogTitle,
  Typography,
  Stack,
  Box,
} from "@mui/material";
import { DeleteRounded } from "@mui/icons-material";
import { useDispatch } from "react-redux";
import { IconButton } from "@mui/material";
import { deleteFile } from "../../../store/files";

interface DeleteDialogProps {
  open: boolean;
  onClose: () => void;
  fileZUID: string;
  fileName: string;
  status: string;
}

export const DeleteDialog = memo(function DeleteDialog(
  props: DeleteDialogProps
) {
  const { open, onClose, fileZUID, fileName, status } = props;

  const [deleting, setDeleting] = useState(false);
  const history = useHistory();
  const dispatch = useDispatch();

  const handleDeleteFile = useCallback(async () => {
    if (!fileZUID || !status) return;
    setDeleting(true);

    try {
      const res: any = await dispatch(deleteFile(fileZUID, status));
      setDeleting(false);
      if (res.status === 200) {
        onClose();
        history.push("/code");
      }
    } catch (err) {
      setDeleting(false);
      console.error("Failed to delete file:", err);
    }
  }, [dispatch, fileZUID, status, history, onClose]);
  return (
    <Dialog open={open} fullWidth maxWidth="xs" onClose={onClose}>
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
          <DeleteRounded color="error" />
        </Box>
        <Stack
          mt={1.5}
          display="flex"
          justifyContent="flex-start"
          columnGap={1}
        >
          <Typography variant="inherit" fontWeight={700}>
            Delete File:
          </Typography>
          <Typography variant="inherit" fontWeight={400} noWrap>
            {`${fileName}`}
          </Typography>
        </Stack>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Deleting a file will remove it and trigger a CDN purge causing A
          production to update immediately.
        </Typography>
      </DialogTitle>
      <DialogActions>
        <Button
          size="small"
          variant="outlined"
          color="inherit"
          onClick={onClose}
        >
          Cancel
        </Button>
        <LoadingButton
          data-cy="DeleteContentItemConfirmButton"
          variant="contained"
          size="small"
          color="error"
          onClick={handleDeleteFile}
          loading={deleting}
        >
          Delete
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
});
