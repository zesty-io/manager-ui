import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  Typography,
  TextField,
  DialogActions,
  Button,
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
}

export const MoveFileDialog = ({
  handleGroupChange,
  onClose,
  binId,
}: Props) => {
  const { data: binGroups } = useGetBinGroupsQuery(binId);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>({
    name: "None",
    bin_id: binId,
    group_id: binId,
    id: binId,
  });

  return (
    <Dialog open={true} fullWidth maxWidth={"xs"}>
      <DialogTitle>
        <Typography fontWeight={600} variant="h5">
          Move File
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
                  ...binGroups,
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
            onClose();
          }}
        >
          Move
        </Button>
      </DialogActions>
    </Dialog>
  );
};
