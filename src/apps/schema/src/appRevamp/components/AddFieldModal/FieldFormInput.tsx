import React, { useState, useRef } from "react";
import {
  Box,
  Typography,
  TextField,
  FormControlLabel,
  Checkbox,
  OutlinedInput,
  InputBase,
} from "@mui/material";

type FieldType = "input" | "checkbox" | "dropdown";
export interface InputField {
  name: string;
  type: FieldType;
  label: string;
  required: boolean;
  subLabel?: string;
  errorMsg?: string;
  fullWidth?: boolean;
  multiline?: boolean;
}
interface Props {
  fieldConfig: InputField;
  error?: boolean;
  onDataChange: ({
    name,
    value,
  }: {
    name: string;
    value: string | boolean;
  }) => void;
}
export const FieldFormInput = ({ fieldConfig, error, onDataChange }: Props) => {
  return (
    <Box mb={2.5}>
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
              borderColor: error ? "red.500" : "grey.200",
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
                name: fieldConfig.name,
                value: e.target.value,
              });
            }}
          />
          {error && (
            <Typography mt={0.5} variant="body2" color="error.dark">
              {fieldConfig.errorMsg}
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
                  name: fieldConfig.name,
                  value: e.target.checked,
                });
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
    </Box>
  );
};
