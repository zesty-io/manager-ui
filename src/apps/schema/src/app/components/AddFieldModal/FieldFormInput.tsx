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
  Stack,
} from "@mui/material";
import { SelectChangeEvent } from "@mui/material/Select";
import InfoRoundedIcon from "@mui/icons-material/InfoRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import { cloneDeep } from "lodash";

import { FormValue } from "./views/FieldForm";
import { FieldSettingsOptions } from "../../../../../../shell/services/types";
import { convertDropdownValue } from "../../utils";
import { withCursorPosition } from "../../../../../../shell/components/withCursorPosition";

const TextFieldWithCursorPosition = withCursorPosition(TextField);

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
  | "group_id"
  | "limit"
  | "tooltip"
  | "defaultValue"
  | "maxCharLimit"
  | "minCharLimit"
  | "regexMatchPattern"
  | "regexMatchErrorMessage"
  | "regexRestrictPattern"
  | "regexRestrictErrorMessage"
  | "minValue"
  | "maxValue";
type FieldType =
  | "input"
  | "checkbox"
  | "dropdown"
  | "autocomplete"
  | "options"
  | "toggle_options";
type InputType = "text" | "number";
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
  inputType?: InputType;
  autoFocus?: boolean;
}
export interface DropdownOptions {
  label: string;
  value: string;
}
interface FieldFormInputProps {
  fieldConfig: InputField;
  errorMsg?: string | [string, string][];
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
  const options =
    fieldConfig.type === "options" ||
    (fieldConfig.type === "toggle_options" && prefillData)
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

  const InputTextField =
    fieldConfig.name === "name" ? TextFieldWithCursorPosition : TextField;

  return (
    <Grid item xs={fieldConfig.gridSize}>
      {fieldConfig.type === "checkbox" && (
        <FormControlLabel
          control={
            <Checkbox
              name={fieldConfig.name}
              required={fieldConfig.required}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                onDataChange({
                  inputName: fieldConfig.name,
                  value: e.target.checked,
                });
              }}
              checked={Boolean(prefillData)}
              size="small"
            />
          }
          label={
            <Stack>
              <Typography variant="body2" fontWeight={600}>
                {fieldConfig.label}
              </Typography>
              {fieldConfig.subLabel && (
                <Typography variant="body3" color="text.secondary">
                  {fieldConfig.subLabel}
                </Typography>
              )}
            </Stack>
          }
          sx={{
            alignItems: "flex-start",
          }}
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
            data-cy={`Autocomplete_${fieldConfig.name}`}
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
                autoFocus={fieldConfig.autoFocus}
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
          {prefillData &&
            !dropdownOptions.find((option) => option.value === prefillData) && (
              <Typography
                noWrap
                color="error"
                variant="caption"
                ml={1.75}
                mt={0.5}
              >
                {fieldConfig.name === "group_id" &&
                  "The folder this was locked to has been deleted"}
                {fieldConfig.name === "relatedModelZUID" &&
                  "The model that this was related to has been deleted"}
              </Typography>
            )}
        </>
      )}

      {fieldConfig.type === "input" && (
        <>
          <Stack
            flexDirection="row"
            alignItems="center"
            mb={!!fieldConfig.subLabel ? 0 : 0.5}
            height={18}
          >
            <Typography component="span" variant="body2" fontWeight={600}>
              {fieldConfig.label}
            </Typography>
            {fieldConfig.label?.toLowerCase().includes("description") && (
              <Typography
                component="span"
                variant="body2"
                color="text.secondary"
                sx={{ whiteSpace: "pre" }}
              >
                {" "}
                (optional)
              </Typography>
            )}
            {fieldConfig.tooltip && (
              <Tooltip placement="right" title={fieldConfig.tooltip}>
                <InfoRoundedIcon
                  sx={{ ml: 1, width: "12px", height: "12px" }}
                  color="action"
                />
              </Tooltip>
            )}
          </Stack>
          {fieldConfig.subLabel && (
            <Typography
              component="p"
              variant="body3"
              color="text.secondary"
              mb={0.5}
            >
              {fieldConfig.subLabel}
            </Typography>
          )}
          <InputTextField
            autoFocus={fieldConfig.autoFocus}
            data-cy={`FieldFormInput_${fieldConfig.name}`}
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
            helperText={
              errorMsg && (
                <Typography
                  data-cy={`ErrorMsg_${fieldConfig.name}`}
                  variant="caption"
                >
                  {errorMsg}
                </Typography>
              )
            }
            type={fieldConfig.inputType || "text"}
            inputProps={{
              min: 1,
            }}
          />
        </>
      )}
      {(fieldConfig.type === "options" ||
        fieldConfig.type === "toggle_options") && (
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
                id={index}
                key={index}
                optionKey={key}
                optionValue={value}
                errorMsg={errorMsg[index] as [string, string]}
                onOptionChange={(newKeyValueData) =>
                  handleOptionValueChanged(newKeyValueData, index)
                }
                onDeleteOption={() => handleDeleteOption(index)}
                isDeletable={fieldConfig.type === "options"}
                disabledFields={
                  fieldConfig.type === "toggle_options" ? ["key"] : []
                }
              />
            );
          })}
          {fieldConfig.type === "options" && (
            <Button
              data-cy="DropdownAddOption"
              variant="outlined"
              startIcon={<AddRoundedIcon />}
              onClick={handleAddNewOption}
              size="small"
            >
              Add Option
            </Button>
          )}
        </>
      )}
    </Grid>
  );
};

interface KeyValueInputProps {
  id: number;
  optionKey: string;
  optionValue: string;
  errorMsg?: [string, string];
  onOptionChange: (newKeyValueData: { [key: string]: string }) => void;
  onDeleteOption: () => void;
  isDeletable: boolean;
  disabledFields?: string[];
}
const KeyValueInput = ({
  id,
  optionKey,
  optionValue,
  errorMsg,
  onOptionChange,
  onDeleteOption,
  isDeletable,
  disabledFields,
}: KeyValueInputProps) => {
  const handleDataChanged = (type: string, value: string) => {
    if (type === "key") {
      onOptionChange({ [convertDropdownValue(value) || ""]: optionValue });
    }

    if (type === "value") {
      if (disabledFields.includes("key")) {
        onOptionChange({ [optionKey]: value });
      } else {
        // When the value is changed, automatically change the key as well
        onOptionChange({ [convertDropdownValue(value) || ""]: value });
      }
    }
  };

  const [valueErrorMsg, labelErrorMsg] = errorMsg || [];

  return (
    <Box
      display="flex"
      justifyContent="space-between"
      alignItems="center"
      mb={1}
    >
      <Box display="flex" gap={1} width="480px">
        <TextField
          data-cy={`OptionLabel_${id}`}
          name="value"
          required
          fullWidth
          placeholder="Enter Label"
          value={optionValue}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            handleDataChanged("value", e.target?.value);
          }}
          helperText={
            <Typography data-cy={`OptionLabelErrorMsg_${id}`} variant="caption">
              {labelErrorMsg}
            </Typography>
          }
          error={Boolean(labelErrorMsg)}
          disabled={disabledFields.includes("value")}
        />
        <TextFieldWithCursorPosition
          data-cy={`OptionValue_${id}`}
          name="key"
          required
          fullWidth
          placeholder="Enter Value"
          value={optionKey}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            handleDataChanged("key", e.target?.value);
          }}
          helperText={
            <Typography data-cy={`OptionValueErrorMsg_${id}`} variant="caption">
              {valueErrorMsg}
            </Typography>
          }
          error={Boolean(valueErrorMsg)}
          disabled={disabledFields.includes("key")}
        />
      </Box>
      {isDeletable && (
        <IconButton
          data-cy={`DeleteOption_${id}`}
          size="small"
          onClick={onDeleteOption}
        >
          <DeleteRoundedIcon />
        </IconButton>
      )}
    </Box>
  );
};
