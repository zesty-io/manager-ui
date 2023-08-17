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
  useCreateGroupMutation,
  useGetBinsQuery,
  useGetAllBinGroupsQuery,
} from "../../../../../shell/services/mediaManager";
import { Group } from "../../../../../shell/services/types";
import { useParams } from "../../../../../shell/hooks/useParams";
interface Props {
  open: boolean;
  onClose: () => void;
  id?: string;
  binId?: string;
}

export const NewFolderDialog = ({ open, onClose, id, binId }: Props) => {
  const [name, setName] = useState("Untitled");
  const [selectedGroup, setSelectedGroup] = useState<Group | null>({
    name: "None",
    id: null,
    group_id: null,
    bin_id: null,
  });
  const [params, setParams] = useParams();

  const [createGroup, { isLoading: isCreatingGroup, isSuccess, data }] =
    useCreateGroupMutation();

  const instanceId = useSelector((state: any) => state.instance.ID);
  const ecoId = useSelector((state: any) => state.instance.ecoID);
  const { data: bins, isLoading: isLoadingBins } = useGetBinsQuery({
    instanceId,
    ecoId,
  });
  const currentBin = bins?.find((bin) => bin.id === binId);
  const { data: allBinGroups, isLoading: isLoadingAllBinGroups } =
    useGetAllBinGroupsQuery(
      bins?.map((bin) => bin.id),
      {
        skip: !bins?.length,
      }
    );

  useEffect(() => {
    if (isSuccess) {
      setParams(data?.data?.[0]?.id, "newFolderId");
      onClose();
    }
  }, [isSuccess]);

  useEffect(() => {
    if (allBinGroups) {
      if (binId) {
        setSelectedGroup(
          allBinGroups?.flat()?.find((group) => group.id === id) || {
            name: currentBin?.name,
            id: binId,
            group_id: binId,
            bin_id: binId,
          }
        );
      }
    }
  }, [allBinGroups, id, currentBin, binId]);

  const handleCreate = () => {
    createGroup({
      body: {
        name,
        group_id: selectedGroup?.id,
        bin_id: binId ?? selectedGroup?.bin_id,
      },
    });
  };

  const sortedBinGroups = useMemo(() => {
    if (allBinGroups?.length && bins?.length) {
      if (binId) {
        return [
          {
            name: currentBin?.name ?? "None",
            bin_id: binId,
            group_id: binId,
            id: binId,
          },
          ...allBinGroups.flat(),
        ]
          .filter((group) => group.bin_id === binId)
          .sort((a, b) => a?.name?.localeCompare(b?.name));
      } else {
        const allBins = bins.map((bin) => ({
          name: bin.name,
          bin_id: bin.id,
          group_id: bin.id,
          id: bin.id,
        }));
        return [...allBins, ...allBinGroups.flat()].sort((a, b) =>
          a?.name?.localeCompare(b?.name)
        );
      }
    }

    return [];
  }, [allBinGroups, binId, bins]);

  const loading = isLoadingBins || isLoadingAllBinGroups;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth={"xs"}>
      <DialogTitle>New Folder</DialogTitle>
      <DialogContent>
        <InputLabel>Parent Folder</InputLabel>
        <Autocomplete
          data-cy="newFolderParentSelector"
          size="small"
          fullWidth
          loading={loading}
          value={selectedGroup}
          disableClearable
          options={
            sortedBinGroups?.length
              ? [
                  {
                    name: "None",
                    id: null,
                    group_id: null,
                    bin_id: null,
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
          disabled={loading || !selectedGroup || selectedGroup?.bin_id === null}
          variant="contained"
          onClick={handleCreate}
        >
          Create
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
};
