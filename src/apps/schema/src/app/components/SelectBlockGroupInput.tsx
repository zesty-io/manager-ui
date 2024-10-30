import { useState } from "react";
import {
  Box,
  InputLabel,
  Tooltip,
  Autocomplete,
  TextField,
  Radio,
  RadioGroup,
  FormControlLabel,
} from "@mui/material";
import { InfoRounded } from "@mui/icons-material";

type GroupType = "available" | "new";
type SelectBlockGroupInputProps = {};
export const SelectBlockGroupInput = ({}: SelectBlockGroupInputProps) => {
  const [type, setType] = useState<GroupType>("available");

  // TODO: Wire the changes here once api is finalized
  return (
    <Box>
      <InputLabel>
        Block Group
        <Tooltip
          placement="top"
          title="Add your block model to an existing group"
        >
          <InfoRounded
            sx={{ ml: 1, width: "10px", height: "10px" }}
            color="action"
          />
        </Tooltip>
      </InputLabel>
      <RadioGroup
        row
        value={type}
        onChange={(evt) => setType(evt.target.value as GroupType)}
        sx={{
          ml: 1,
          mb: 0.5,
        }}
      >
        <FormControlLabel
          value="available"
          control={<Radio size="small" />}
          label="Available Groups"
          slotProps={{
            typography: {
              variant: "body2",
            },
          }}
        />
        <FormControlLabel
          value="new"
          control={<Radio size="small" />}
          label="New Group"
          slotProps={{
            typography: {
              variant: "body2",
            },
          }}
        />
      </RadioGroup>
      {type === "available" && (
        <Autocomplete
          options={[]}
          renderInput={(params) => (
            <TextField {...params} placeholder="Select" />
          )}
        />
      )}
      {type === "new" && <TextField placeholder="e.g. Hero" fullWidth />}
    </Box>
  );
};
