import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
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

import { useGetGroupsQuery } from "../../../../../shell/services/instance";

export type GroupType = "available" | "new";
type SelectBlockGroupInputProps = {
  groupType: GroupType;
  onGroupTypeChange: (groupType: GroupType) => void;
  newGroupName: string;
  onNewGroupNameChange: (name: string) => void;
  groupZUID: string;
  onGroupZUIDChange: (zuid: string) => void;
  showGroupNameError?: boolean;
};
export const SelectBlockGroupInput = ({
  groupType = "available",
  onGroupTypeChange,
  newGroupName,
  onNewGroupNameChange,
  groupZUID,
  onGroupZUIDChange,
  showGroupNameError,
}: SelectBlockGroupInputProps) => {
  const { t } = useTranslation();
  const { data: groups } = useGetGroupsQuery();

  return (
    <Box>
      <InputLabel>
        {t("schema.blockGroup")}
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
        value={groupType}
        onChange={(evt) => onGroupTypeChange(evt.target.value as GroupType)}
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
      {groupType === "available" && (
        <Autocomplete
          options={[]}
          renderInput={(params) => (
            <TextField {...params} placeholder="Select" />
          )}
        />
      )}
      {groupType === "new" && (
        <TextField
          placeholder="e.g. Hero"
          fullWidth
          value={newGroupName}
          onChange={(evt) => onNewGroupNameChange(evt.target.value)}
          error={showGroupNameError}
          helperText={!!showGroupNameError && "Group name is required"}
        />
      )}
    </Box>
  );
};
