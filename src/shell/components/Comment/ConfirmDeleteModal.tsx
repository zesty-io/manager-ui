import {
  Dialog,
  DialogTitle,
  DialogActions,
  Button,
  Stack,
  Box,
  Typography,
  DialogContent,
} from "@mui/material";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import { LoadingButton } from "@mui/lab";

type ConfirmDeleteModalProps = {
  onClose: () => void;
  onConfirmDelete: () => void;
  isDeletingComment: boolean;
};
export const ConfirmDeleteModal = ({
  onClose,
  onConfirmDelete,
  isDeletingComment,
}: ConfirmDeleteModalProps) => (
  <Dialog open onClose={onClose}>
    <DialogTitle sx={{ pb: 1 }}>
      <Stack gap={1.5}>
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
          <DeleteRoundedIcon color="error" />
        </Box>
        <Typography variant="h5" display="inline" fontWeight={700}>
          Delete Comment?
        </Typography>
      </Stack>
    </DialogTitle>
    <DialogContent>
      <Typography variant="body2" color="text.secondary">
        Deleting this comment will also remove all replies associated with it.
      </Typography>
    </DialogContent>
    <DialogActions>
      <Button variant="text" color="inherit" onClick={onClose}>
        Cancel
      </Button>
      <LoadingButton
        variant="contained"
        color="error"
        onClick={onConfirmDelete}
        loading={isDeletingComment}
      >
        Delete Forever
      </LoadingButton>
    </DialogActions>
  </Dialog>
);
