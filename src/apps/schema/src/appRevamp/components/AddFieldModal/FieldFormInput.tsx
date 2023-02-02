import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  FormControlLabel,
  Checkbox,
  InputBase,
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
import { cloneDeep } from "lodash";

import { FormValue } from "./views/FieldForm";
import { FieldSettingsOptions } from "../../../../../../shell/services/types";
import { convertLabelValue } from "../utils";

type FieldType =
  | "input"
  | "checkbox"
  | "dropdown"
  | "autocomplete"
  | "dropdown_options";
export interface InputField {
  name: string;
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
}
export interface DropdownOptions {
  label: string;
  value: string;
}
interface FieldFormInputProps {
  fieldConfig: InputField;
  errorMsg?: string;
  onDataChange: ({
    inputName,
    value,
  }: {
    inputName: string;
    value: FormValue;
  }) => void;
  prefillData?: FormValue;
  dropdownOptions?: DropdownOptions[];
  disabled?: boolean;
}
export const FieldFormInput = ({
  fieldConfig,
  errorMsg,
  onDataChange,
  prefillData,
  dropdownOptions,
  disabled,
}: FieldFormInputProps) => {
  /** Used to add options for dropdown and boolean fields */
  const [options, setOptions] = useState<FieldSettingsOptions[]>([{ "": "" }]);

  useEffect(() => {
    onDataChange({
      inputName: fieldConfig.name,
      value: options,
    });
  }, [options]);

  const handleOptionValueChanged = (
    newKeyValueData: { [key: string]: string },
    index: number
  ) => {
    if (!options[index]) {
      return;
    }

    const localOptionsCopy = cloneDeep(options);

    localOptionsCopy.splice(index, 1, newKeyValueData);
    setOptions([...localOptionsCopy]);
  };

  const handleAddNewOption = () => {
    setOptions((prevData) => [...prevData, { "": "" }]);
  };

  const handleDeleteOption = (index: number) => {
    if (!options[index]) {
      return;
    }

    const localOptionsCopy = cloneDeep(options);

    localOptionsCopy.splice(index, 1);
    setOptions([...localOptionsCopy]);
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
          <InputBase
            sx={{
              border: "1px solid",
              borderColor: errorMsg ? "red.500" : "grey.100",
              borderRadius: 2,
              py: 1.25,
              px: 1.5,
              boxSizing: "border-box",
            }}
            inputProps={{
              sx: {
                p: 0,
              },
            }}
            className="field-form-input"
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
          />
          {errorMsg && (
            <Typography mt={0.5} variant="body2" color="error.dark">
              {errorMsg}
            </Typography>
          )}
        </>
      )}

      {fieldConfig.type === "checkbox" && (
        <FormControlLabel
          control={
            <Checkbox
              className="field-form-input"
              name={fieldConfig.name}
              required={fieldConfig.required}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
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

      {fieldConfig.type === "autocomplete" && (
        <>
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
        </>
      )}

      {fieldConfig.type === "dropdown_options" && (
        <>
          <Typography variant="body2" mb={2} fontWeight={600}>
            {fieldConfig.label}
          </Typography>
          {options.map((option, index) => {
            let key,
              value = "";

            Object.entries(option).forEach(([k, v]) => {
              key = k;
              value = v;
            });

            return (
              <KeyValueInput
                optionKey={key}
                optionValue={value}
                showDeleteButton={options.length > 1}
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
  showDeleteButton: boolean;
  onOptionChange: (newKeyValueData: { [key: string]: string }) => void;
  onDeleteOption: () => void;
}
const KeyValueInput = ({
  optionKey,
  optionValue,
  showDeleteButton,
  onOptionChange,
  onDeleteOption,
}: KeyValueInputProps) => {
  const style = {
    border: "1px solid",
    borderColor: "grey.100",
    borderRadius: 2,
    py: 1.25,
    px: 1.5,
    boxSizing: "border-box",
  };
  const inputProps = {
    sx: {
      p: 0,
    },
  };

  const handleDataChanged = (type: string, value: string) => {
    if (type === "key") {
      onOptionChange({ [convertLabelValue(value)]: optionValue });
    }

    if (type === "value") {
      // When the value is changed, automatically change the key as well
      onOptionChange({ [convertLabelValue(value) || ""]: value });
    }
  };

  return (
    <Box
      display="flex"
      justifyContent="space-between"
      alignItems="center"
      mb={2}
    >
      <Box display="flex" gap={2}>
        <InputBase
          sx={style}
          inputProps={inputProps}
          name="value"
          required
          placeholder="Enter Label"
          value={optionValue}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            handleDataChanged("value", e.target?.value);
          }}
        />
        <InputBase
          sx={style}
          inputProps={inputProps}
          name="key"
          required
          placeholder="Enter Value"
          value={optionKey}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            handleDataChanged("key", e.target?.value);
          }}
        />
      </Box>
      {showDeleteButton && (
        <IconButton size="small" onClick={onDeleteOption}>
          <DeleteRoundedIcon />
        </IconButton>
      )}
    </Box>
  );
};
