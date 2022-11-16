import { useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  Typography,
  TextField,
  DialogActions,
  Button,
  CircularProgress,
  InputLabel,
  Autocomplete,
  createFilterOptions,
} from "@mui/material";
import { useGetBinGroupsQuery } from "../../../../../../shell/services/mediaManager";
import { Group } from "../../../../../../shell/services/types";

interface Props {
  handleGroupChange: (newGroupId: string) => void;
  onClose?: () => void;
  binId: string;
  fileCount?: number;
  isInFileModal?: boolean;
  isLoadingMultipleUpdate?: boolean;
}

export const MoveFileDialog = ({
  handleGroupChange,
  onClose,
  binId,
  fileCount,
  isInFileModal,
  isLoadingMultipleUpdate,
}: Props) => {
  const { data: binGroups } = useGetBinGroupsQuery(binId);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>({
    name: "None",
    bin_id: binId,
    group_id: binId,
    id: binId,
  });

  // console.log('testing binGroups', binGroups, [...(binGroups ? binGroups : [])]?.sort((a, b) => a?.name?.localeCompare(b?.name)))

  const sortedBinGroups = useMemo(() => {
    if (!binGroups) return [];
    return [...binGroups].sort((a, b) => a?.name?.localeCompare(b?.name));
  }, [binGroups]);

  return (
    <Dialog open={true} fullWidth maxWidth={"xs"} onClose={onClose}>
      <DialogTitle>
        <Typography fontWeight={600} variant="h5">
          Move {fileCount > 1 ? `${fileCount} Files` : "files"}
        </Typography>
      </DialogTitle>
      <DialogContent>
        <InputLabel>Destination Folder</InputLabel>
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
        />
      </DialogContent>
      <DialogActions>
        <Button color="inherit" onClick={() => onClose()}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={() => {
            handleGroupChange(selectedGroup.id);
            {
              isInFileModal && onClose();
            }
          }}
        >
          {isLoadingMultipleUpdate ? (
            <CircularProgress size="24px" color="inherit" />
          ) : (
            "Move"
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
