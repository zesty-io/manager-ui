import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  FormControlLabel,
  Checkbox,
  Grid,
  FormControl,
  Select,
  MenuItem,
  Autocomplete,
  TextField,
  Tooltip,
  Button,
  IconButton,
} from "@mui/material";
import { SelectChangeEvent } from "@mui/material/Select";
import InfoRoundedIcon from "@mui/icons-material/InfoRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import { VirtualizedAutocomplete } from "@zesty-io/material";
import { cloneDeep } from "lodash";

import { FormValue } from "./views/FieldForm";
import { FieldSettingsOptions } from "../../../../../../shell/services/types";
import { convertLabelValue } from "../../utils";
import { LockFolder, useMediaRules } from "./hooks/useMediaRules";

export type Validation = "length" | "required" | "unique";
export type FieldNames =
  | "name"
  | "label"
  | "description"
  | "required"
  | "list"
  | "options"
  | "relatedModelZUID"
  | "relatedFieldZUID"
  | "limit"
  | "allowMultipleFiles"
  | "lockToFolder"
  | "group_id";
type FieldType =
  | "input"
  | "checkbox"
  | "dropdown"
  | "autocomplete"
  | "options"
  | "number"
  | "virtualizedAutocomplete";
export interface InputField {
  name: FieldNames;
  type: FieldType;
  label: string;
  required: boolean;
  gridSize: number;
  subLabel?: string;
  fullWidth?: boolean;
  multiline?: boolean;
  maxLength?: number;
  placeholder?: string;
  tooltip?: string;
  validate?: Validation[];
}
export interface DropdownOptions {
  label: string;
  value: string;
}
interface FieldFormInputProps {
  fieldConfig: InputField;
  errorMsg?: string | [string, string][];
  lockFolder?: LockFolder;
  onDataChange: ({
    inputName,
    value,
  }: {
    inputName: string;
    value: FormValue;
  }) => void;
  prefillData?: FormValue;
  initialMediaFolderValue?: string;
  formData?: any;
  dropdownOptions?: DropdownOptions[];
  disabled?: boolean;
}
export const FieldFormInput = ({
  fieldConfig,
  errorMsg,
  formData,
  lockFolder,
  onDataChange,
  initialMediaFolderValue,
  prefillData,
  dropdownOptions,
  disabled,
}: FieldFormInputProps) => {
  const options =
    fieldConfig.type === "options" && prefillData
      ? (prefillData as FieldSettingsOptions[])
      : [];

  const handleOptionValueChanged = (
    newKeyValueData: { [key: string]: string },
    index: number
  ) => {
    if (!options[index]) {
      return;
    }

    const localOptionsCopy = cloneDeep(options);

    localOptionsCopy.splice(index, 1, newKeyValueData);
    onDataChange({
      inputName: fieldConfig.name,
      value: [...localOptionsCopy],
    });
  };

  const handleAddNewOption = () => {
    onDataChange({
      inputName: fieldConfig.name,
      value: [...options, { "": "" }],
    });
  };

  const handleDeleteOption = (index: number) => {
    if (!options[index]) {
      return;
    }

    const localOptionsCopy = cloneDeep(options);

    localOptionsCopy.splice(index, 1);
    onDataChange({
      inputName: fieldConfig.name,
      value: [...localOptionsCopy],
    });
  };

  const showAutocompleteField = () => {
    if (
      fieldConfig.type === "autocomplete" &&
      fieldConfig.name === "group_id" &&
      formData["lockToFolder"]
    ) {
      return true;
    } else if (
      fieldConfig.type === "autocomplete" &&
      fieldConfig.name !== "group_id"
    ) {
      return true;
    }
  };

  return (
    <Grid item xs={fieldConfig.gridSize}>
      {fieldConfig.type === "input" && (
        <>
          <Box mb={0.5}>
            <Typography component="span" variant="body2" fontWeight={600}>
              {fieldConfig.label}
            </Typography>
            {fieldConfig.label?.toLowerCase().includes("description") && (
              <Typography
                component="span"
                variant="body2"
                color="text.secondary"
              >
                {" "}
                (optional)
              </Typography>
            )}
            {fieldConfig.tooltip && (
              <Tooltip placement="top" title={fieldConfig.tooltip}>
                <InfoRoundedIcon
                  sx={{ ml: 1, width: "10px", height: "10px" }}
                  color="action"
                />
              </Tooltip>
            )}
            {fieldConfig.subLabel && (
              <Typography
                component="p"
                // @ts-expect-error body3 module augmentation required
                variant="body3"
                color="text.secondary"
              >
                {fieldConfig.subLabel}
              </Typography>
            )}
          </Box>
          <TextField
            name={fieldConfig.name}
            required={fieldConfig.required}
            fullWidth={fieldConfig.fullWidth}
            multiline={fieldConfig.multiline}
            minRows={fieldConfig.multiline && 2}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              onDataChange({
                inputName: fieldConfig.name,
                value: e.target.value,
              });
            }}
            value={prefillData}
            error={Boolean(errorMsg)}
            helperText={errorMsg}
          />
        </>
      )}

      {fieldConfig.type === "checkbox" && (
        <FormControlLabel
          control={
            <Checkbox
              name={fieldConfig.name}
              required={fieldConfig.required}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                if (fieldConfig.name === "allowMultipleFiles") {
                  onDataChange({
                    inputName: "limit",
                    value: !formData.limit && e.target.checked ? "1" : "",
                  });
                } else if (fieldConfig.name === "lockToFolder") {
                  onDataChange({
                    inputName: "group_id",
                    value:
                      !formData.group_id && e.target.checked
                        ? initialMediaFolderValue
                        : "",
                  });
                }
                onDataChange({
                  inputName: fieldConfig.name,
                  value: e.target.checked,
                });
              }}
              checked={Boolean(prefillData)}
              sx={{
                color: "grey.200",
              }}
            />
          }
          label={
            <>
              <Typography variant="body2" fontWeight={600}>
                {fieldConfig.label}
              </Typography>
              {fieldConfig.subLabel && (
                <Typography
                  // @ts-expect-error body3 module augmentation required
                  variant="body3"
                  color="text.secondary"
                >
                  {fieldConfig.subLabel}
                </Typography>
              )}
            </>
          }
        />
      )}

      {fieldConfig.type === "dropdown" && (
        <FormControl fullWidth size="small">
          <Typography variant="body2" mb={0.5} fontWeight={600}>
            {fieldConfig.label}
          </Typography>
          <Select
            value={prefillData || ""}
            displayEmpty
            onChange={(e: SelectChangeEvent) => {
              onDataChange({
                inputName: fieldConfig.name,
                value: e.target.value,
              });
            }}
          >
            <MenuItem disabled value="">
              {fieldConfig.placeholder}
            </MenuItem>
            {dropdownOptions?.map(({ label, value }) => (
              <MenuItem key={value} value={value}>
                {label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      )}

      {fieldConfig.type === "number" && formData["allowMultipleFiles"] && (
        <Box ml={4}>
          <Typography variant="body2">
            {fieldConfig.label}
            <Tooltip
              placement="top"
              title="Set the maximum number of files a user can upload"
            >
              <InfoRoundedIcon
                sx={{ ml: 1, width: "10px", height: "10px" }}
                color="action"
              />
            </Tooltip>
          </Typography>
          <TextField
            size="small"
            variant="outlined"
            type="number"
            inputProps={{ min: 1 }}
            value={prefillData || "1"}
            sx={{ mt: 1 }}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              onDataChange({
                inputName: fieldConfig.name,
                value: e.target.value,
              });
            }}
          />
        </Box>
      )}

      {showAutocompleteField() && (
        <Box sx={{ ml: fieldConfig.name === "group_id" ? 4 : 0 }}>
          <Typography variant="body2" mb={0.5} fontWeight={600}>
            {fieldConfig.label}
          </Typography>
          <Autocomplete
            size="small"
            disabled={disabled}
            value={
              dropdownOptions.find((option) => option.value === prefillData) ||
              null
            }
            options={dropdownOptions}
            renderOption={(props: any, option: DropdownOptions) => {
              return (
                <Box {...props} key={option.value}>
                  {option.label}
                </Box>
              );
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                placeholder={fieldConfig.placeholder}
                hiddenLabel
              />
            )}
            isOptionEqualToValue={(option, value) =>
              option.value === value.value
            }
            onChange={(_, newValue: DropdownOptions) => {
              onDataChange({
                inputName: fieldConfig.name,
                value: newValue?.value || "",
              });
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                height: "40px",
              },
            }}
          />
        </Box>
      )}

      {fieldConfig.type === "options" && (
        <>
          <Typography variant="body2" mb={2} fontWeight={600}>
            {fieldConfig.label}
          </Typography>
          {options?.map((option, index) => {
            let key,
              value = "";

            Object.entries(option).forEach(([k, v]) => {
              key = k;
              value = v;
            });

            return (
              <KeyValueInput
                key={index}
                optionKey={key}
                optionValue={value}
                errorMsg={errorMsg[index] as [string, string]}
                onOptionChange={(newKeyValueData) =>
                  handleOptionValueChanged(newKeyValueData, index)
                }
                onDeleteOption={() => handleDeleteOption(index)}
              />
            );
          })}
          <Button
            variant="outlined"
            startIcon={<AddRoundedIcon />}
            onClick={handleAddNewOption}
          >
            Add Option
          </Button>
        </>
      )}
    </Grid>
  );
};

interface KeyValueInputProps {
  optionKey: string;
  optionValue: string;
  errorMsg?: [string, string];
  onOptionChange: (newKeyValueData: { [key: string]: string }) => void;
  onDeleteOption: () => void;
}
const KeyValueInput = ({
  optionKey,
  optionValue,
  errorMsg,
  onOptionChange,
  onDeleteOption,
}: KeyValueInputProps) => {
  const handleDataChanged = (type: string, value: string) => {
    if (type === "key") {
      onOptionChange({ [convertLabelValue(value) || ""]: optionValue });
    }

    if (type === "value") {
      // When the value is changed, automatically change the key as well
      onOptionChange({ [convertLabelValue(value) || ""]: value });
    }
  };

  const [valueErrorMsg, labelErrorMsg] = errorMsg || [];

  return (
    <Box
      display="flex"
      justifyContent="space-between"
      alignItems="center"
      mb={2}
    >
      <Box display="flex" gap={2} width="480px">
        <TextField
          name="value"
          required
          fullWidth
          placeholder="Enter Label"
          value={optionValue}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            handleDataChanged("value", e.target?.value);
          }}
          helperText={labelErrorMsg}
          error={Boolean(labelErrorMsg)}
        />
        <TextField
          name="key"
          required
          fullWidth
          placeholder="Enter Value"
          value={optionKey}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            handleDataChanged("key", e.target?.value);
          }}
          helperText={valueErrorMsg}
          error={Boolean(valueErrorMsg)}
        />
      </Box>
      <IconButton size="small" onClick={onDeleteOption}>
        <DeleteRoundedIcon />
      </IconButton>
    </Box>
  );
};
