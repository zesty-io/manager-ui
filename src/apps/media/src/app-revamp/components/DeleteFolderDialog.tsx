import { useEffect } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  DialogContentText,
  IconButton,
} from "@mui/material";
import { useDeleteGroupMutation } from "../../../../../shell/services/mediaManager";
import DeleteIcon from "@mui/icons-material/Delete";
import { useHistory } from "react-router";

interface Props {
  open: boolean;
  onClose: () => void;
  id: string;
  groupId: string;
}

export const DeleteFolderDialog = ({ open, onClose, id, groupId }: Props) => {
  const [deleteGroup, { isLoading, isSuccess }] = useDeleteGroupMutation();
  const history = useHistory();
  useEffect(() => {
    if (isSuccess) {
      onClose();
      history.push(`/media/${groupId}`);
    }
  }, [isSuccess]);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth={"xs"}>
      <DialogTitle>
        <DeleteIcon
          color="error"
          sx={{
            padding: "8px",
            borderRadius: "20px",
            backgroundColor: "red.100",
            display: "block",
            mb: 2,
          }}
        />
        Delete Folder?
      </DialogTitle>
      <DialogContent>
        <DialogContentText>
          Are you sure you want to delete this group? All the files within the
          group will be lost.
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
        <Button
          disabled={isLoading}
          variant="contained"
          color="error"
          onClick={() => {
            deleteGroup({ id, groupId });
          }}
        >
          Delete Folder
        </Button>
      </DialogActions>
    </Dialog>
  );
};
