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
import { LoadingButton } from "@mui/lab";
import { useSelector } from "react-redux";

import {
  useGetBinGroupsQuery,
  useCreateGroupMutation,
  useGetBinsQuery,
} from "../../../../../shell/services/mediaManager";
import { Group } from "../../../../../shell/services/types";
import { useParams } from "../../../../../shell/hooks/useParams";
interface Props {
  open: boolean;
  onClose: () => void;
  id?: string;
  binId: string;
}

export const NewFolderDialog = ({ open, onClose, id, binId }: Props) => {
  const [name, setName] = useState("Untitled");
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [params, setParams] = useParams();

  const { data: binGroups, isLoading: isLoadingBinGroups } =
    useGetBinGroupsQuery(binId);

  const [createGroup, { isLoading: isCreatingGroup, isSuccess, data }] =
    useCreateGroupMutation();

  const instanceId = useSelector((state: any) => state.instance.ID);
  const ecoId = useSelector((state: any) => state.instance.ecoID);
  const { data: bins, isLoading: isLoadingBins } = useGetBinsQuery({
    instanceId,
    ecoId,
  });
  const currentBin = bins?.find((bin) => bin.id === binId);

  useEffect(() => {
    if (isSuccess) {
      setParams(data?.data?.[0]?.id, "newFolderId");
      onClose();
    }
  }, [isSuccess]);

  useEffect(() => {
    if (binGroups) {
      setSelectedGroup(
        binGroups?.find((group) => group.id === id) || {
          name: currentBin?.name ?? "None",
          bin_id: binId,
          group_id: binId,
          id: binId,
        }
      );
    }
  }, [binGroups, id, currentBin]);

  const handleCreate = () => {
    createGroup({
      body: { name, group_id: selectedGroup?.id, bin_id: binId },
    });
  };

  const sortedBinGroups = useMemo(() => {
    if (!binGroups) return [];
    return [...binGroups].sort((a, b) => a?.name?.localeCompare(b?.name));
  }, [binGroups]);

  const loading = isLoadingBinGroups || isLoadingBins;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth={"xs"}>
      <DialogTitle>New Folder</DialogTitle>
      <DialogContent>
        <InputLabel>Parent Folder</InputLabel>
        <Autocomplete
          size="small"
          fullWidth
          loading={loading}
          value={selectedGroup}
          disableClearable
          options={
            binGroups
              ? [
                  {
                    name: currentBin?.name ?? "None",
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
        <LoadingButton
          loading={isCreatingGroup}
          disabled={loading}
          variant="contained"
          onClick={handleCreate}
        >
          Create
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
};
