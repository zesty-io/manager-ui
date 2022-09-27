import { useEffect, useState } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  InputLabel,
  TextField,
} from "@mui/material";
import { mediaManagerApi } from "../../../../../shell/services/mediaManager";

interface Props {
  open: boolean;
  onClose: () => void;
  name: string;
  id: string;
  groupId?: string;
}

export const RenameFolderDialog = ({
  open,
  onClose,
  name,
  id,
  groupId,
}: Props) => {
  const [newName, setNewName] = useState(name);

  const [
    updateGroup,
    { isLoading: updateGroupIsLoading, isSuccess: updateGroupIsSuccess },
  ] = mediaManagerApi.useUpdateGroupMutation();
  const [
    updateBin,
    { isLoading: updateBinIsLoading, isSuccess: updateBinIsSuccess },
  ] = mediaManagerApi.useUpdateBinMutation();

  const isLoading = updateGroupIsLoading || updateBinIsLoading;
  const isSuccess = updateGroupIsSuccess || updateBinIsSuccess;

  useEffect(() => {
    setNewName(name);
  }, [name]);

  useEffect(() => {
    if (isSuccess) onClose();
  }, [isSuccess]);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth={"xs"}>
      <DialogTitle>Rename Folder</DialogTitle>
      <DialogContent>
        <InputLabel>New Folder Name</InputLabel>
        <TextField
          value={newName}
          hiddenLabel
          size="small"
          fullWidth
          onChange={(evt) => setNewName(evt.target.value)}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
        <Button
          disabled={isLoading}
          variant="contained"
          onClick={() => {
            if (groupId) {
              updateGroup({ id, body: { name: newName, group_id: groupId } });
            } else {
              updateBin({ id, body: { name: newName } });
            }
          }}
        >
          Update
        </Button>
      </DialogActions>
    </Dialog>
  );
};
