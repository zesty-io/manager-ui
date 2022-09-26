import { useEffect, useState } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  InputLabel,
  TextField,
  Autocomplete,
} from "@mui/material";
import {
  useGetBinGroupsQuery,
  useCreateGroupMutation,
} from "../../../../../shell/services/mediaManager";
import { Group } from "../../../../../shell/services/types";
interface Props {
  open: boolean;
  onClose: () => void;
  id?: string;
  binId: string;
}

export const NewFolderDialog = ({ open, onClose, id, binId }: Props) => {
  const [name, setName] = useState("Untitled");
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);

  const { data: binGroups } = useGetBinGroupsQuery(binId);

  const [createGroup, { isLoading, isSuccess }] = useCreateGroupMutation();

  useEffect(() => {
    if (isSuccess) onClose();
  }, [isSuccess]);

  useEffect(() => {
    if (binGroups) {
      setSelectedGroup(
        binGroups.find((group) => group.id === id) || {
          name: "None",
          bin_id: binId,
          group_id: binId,
          id: binId,
        }
      );
    }
  }, [binGroups, id]);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth={"xs"}>
      <DialogTitle>New Folder</DialogTitle>
      <DialogContent>
        <InputLabel>Parent Folder</InputLabel>
        <Autocomplete
          size="small"
          fullWidth
          value={selectedGroup}
          disableClearable
          options={[
            {
              name: "None",
              bin_id: binId,
              group_id: binId,
              id: binId,
            },
            ...(binGroups ? binGroups : []),
          ]}
          renderInput={(params) => <TextField {...params} hiddenLabel />}
          getOptionLabel={(option: Group) => option.name}
          onChange={(event, newValue) => setSelectedGroup(newValue as Group)}
          sx={{ mb: 3 }}
        />
        <InputLabel>Folder Name</InputLabel>
        <TextField
          value={name}
          hiddenLabel
          size="small"
          fullWidth
          onChange={(evt) => setName(evt.target.value)}
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
            createGroup({
              body: { name, group_id: selectedGroup?.id, bin_id: binId },
            });
            setName("Untitled");
          }}
        >
          Create
        </Button>
      </DialogActions>
    </Dialog>
  );
};
