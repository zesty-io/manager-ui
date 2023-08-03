import { useEffect, useMemo, useState } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  InputLabel,
  TextField,
  Autocomplete,
  createFilterOptions,
} from "@mui/material";
import {
  useGetBinGroupsQuery,
  useCreateGroupMutation,
} from "../../../../../shell/services/mediaManager";
import { Group } from "../../../../../shell/services/types";
import { useSessionStorage } from "react-use";
interface Props {
  open: boolean;
  onClose: () => void;
  id?: string;
  binId: string;
}

export const NewFolderDialog = ({ open, onClose, id, binId }: Props) => {
  const [name, setName] = useState("Untitled");
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [recentlyCreatedFolderId, setRecentlyCreatedFolderId] =
    useSessionStorage("recentlyCreatedFolder", "");

  const { data: binGroups } = useGetBinGroupsQuery(binId);

  const [createGroup, { isLoading, isSuccess, data }] =
    useCreateGroupMutation();

  useEffect(() => {
    if (isSuccess) {
      setRecentlyCreatedFolderId(data?.data?.[0]?.id);
      // Close dialog on task queue to allow storage to be set since it's async but not implemented as a promise
      setTimeout(() => onClose(), 0);
    }
  }, [isSuccess]);

  useEffect(() => {
    if (binGroups) {
      setSelectedGroup(
        binGroups?.find((group) => group.id === id) || {
          name: "None",
          bin_id: binId,
          group_id: binId,
          id: binId,
        }
      );
    }
  }, [binGroups, id]);

  const handleCreate = () => {
    createGroup({
      body: { name, group_id: selectedGroup?.id, bin_id: binId },
    });
  };

  const sortedBinGroups = useMemo(() => {
    if (!binGroups) return [];
    return [...binGroups].sort((a, b) => a?.name?.localeCompare(b?.name));
  }, [binGroups]);

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
          options={
            binGroups
              ? [
                  {
                    name: "None",
                    bin_id: binId,
                    group_id: binId,
                    id: binId,
                  },
                  ...sortedBinGroups,
                ]
              : []
          }
          renderInput={(params) => <TextField {...params} hiddenLabel />}
          renderOption={(props, option) => (
            <li {...props} key={option.id}>
              {option.name}
            </li>
          )}
          getOptionLabel={(option: any) => option.name}
          filterOptions={createFilterOptions({
            stringify: (option) => option.name,
          })}
          isOptionEqualToValue={(option, value) => option.id === value.id}
          onChange={(event, newValue) => setSelectedGroup(newValue as Group)}
          sx={{ mb: 3 }}
        />
        <InputLabel>Folder Name</InputLabel>
        <TextField
          autoFocus
          value={name}
          hiddenLabel
          size="small"
          fullWidth
          onChange={(evt) => setName(evt.target.value)}
          onFocus={(evt) => evt.target.select()}
          onKeyPress={(event) => event.key === "Enter" && handleCreate()}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
        <Button disabled={isLoading} variant="contained" onClick={handleCreate}>
          Create
        </Button>
      </DialogActions>
    </Dialog>
  );
};
