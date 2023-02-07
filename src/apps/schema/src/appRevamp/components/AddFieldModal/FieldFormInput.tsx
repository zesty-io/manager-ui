import React, { useEffect } from "react";
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
} from "@mui/material";
import { SelectChangeEvent } from "@mui/material/Select";
import { VirtualizedAutocomplete } from "@zesty-io/material";
import InfoRoundedIcon from "@mui/icons-material/InfoRounded";

import { FormValue, FormData } from "./views/FieldForm";
import { MediaRules } from "./MediaRules";
import { useMediaRules, LockFolder } from "./hooks/useMediaRules";

type FieldType =
  | "input"
  | "checkbox"
  | "number"
  | "dropdown"
  | "autocomplete"
  | "virtualizedAutocomplete";
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
  tab?: string;
}
export interface DropdownOptions {
  label: string;
  value: string;
}
interface Props {
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
  formData?: any;
  dropdownOptions?: DropdownOptions[];
  disabled?: boolean;
}
export const FieldFormInput = ({
  fieldConfig,
  errorMsg,
  formData,
  onDataChange,
  prefillData,
  dropdownOptions,
  disabled,
}: Props) => {
  const { itemLimit, lockFolder, setItemLimit, setLockFolder, groups } =
    useMediaRules();

  return (
    <Grid item xs={fieldConfig.gridSize}>
      {fieldConfig.type === "input" && (
        <>
          <Box mb={0.5}>
            <Typography component="span" variant="body2">
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
                if (fieldConfig.name === "allowMultipleFiles") {
                  onDataChange({
                    inputName: "limit",
                    value: !formData.limit && e.target.checked ? "1" : "",
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
              <Typography variant="body2">{fieldConfig.label}</Typography>
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
          <Typography variant="body2" mb={0.5}>
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
        <>
          <Typography variant="body2" ml={4}>
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
            value={prefillData || "1"}
            sx={{ ml: 4, mt: 1 }}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              onDataChange({
                inputName: fieldConfig.name,
                value: e.target.value,
              });
            }}
          />
        </>
      )}

      {fieldConfig.type === "virtualizedAutocomplete" &&
        formData["lockToFolder"] && (
          <>
            <Typography variant="body2" ml={4}>
              {fieldConfig.label}
            </Typography>
            <VirtualizedAutocomplete
              value={lockFolder.value}
              sx={{
                ml: 4,
              }}
              onChange={(_, option) => {
                setLockFolder((prevData: LockFolder) => ({
                  ...prevData,
                  value: option,
                }));
                onDataChange({
                  inputName: fieldConfig.name,
                  value: option.value,
                });
              }}
              placeholder="Select media folder..."
              options={groups}
            />
          </>
        )}

      {fieldConfig.type === "autocomplete" && (
        <>
          <Typography variant="body2" mb={0.5}>
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
    </Grid>
  );
};
