import React, { useState, useRef } from "react";
import {
  Box,
  Typography,
  TextField,
  FormControlLabel,
  Checkbox,
  OutlinedInput,
  InputBase,
  Grid,
  FormControl,
  Select,
  MenuItem,
} from "@mui/material";
import { SelectChangeEvent } from "@mui/material/Select";

import { FormValue } from "./views/FieldForm";

type FieldType = "input" | "checkbox" | "dropdown";
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
  dropdownOptions?: [string, string][];
}
export const FieldFormInput = ({
  fieldConfig,
  errorMsg,
  onDataChange,
  prefillData,
  dropdownOptions,
}: Props) => {
  const [selectValue, setSelectValue] = useState("");

  const handleOnSelectValueChanged = (e: SelectChangeEvent) => {
    setSelectValue(e.target?.value);

    // Forward value to parent
    onDataChange({
      inputName: fieldConfig.name,
      value: e.target?.value,
    });
  };

  return (
    <Grid item xs={fieldConfig.gridSize}>
      {fieldConfig.type === "input" && (
        <>
          <Box mb={0.5}>
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
            value={selectValue}
            displayEmpty
            onChange={handleOnSelectValueChanged}
          >
            <MenuItem disabled value="">
              {fieldConfig.placeholder}
            </MenuItem>
            {dropdownOptions?.map(([value, name]) => (
              <MenuItem key={value} value={value}>
                {name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      )}
    </Grid>
  );
};
