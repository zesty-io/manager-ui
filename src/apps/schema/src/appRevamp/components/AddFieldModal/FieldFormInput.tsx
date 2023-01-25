import React from "react";
import {
  Box,
  Typography,
  FormControlLabel,
  Checkbox,
  InputBase,
} from "@mui/material";

import { FormValue } from "./views/FieldForm";

type FieldType = "input" | "checkbox" | "dropdown";
export interface InputField {
  name: string;
  type: FieldType;
  label: string;
  required: boolean;
  subLabel?: string;
  fullWidth?: boolean;
  multiline?: boolean;
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
}
export const FieldFormInput = ({
  fieldConfig,
  errorMsg,
  onDataChange,
  prefillData,
}: Props) => {
  return (
    <Box mb={2.5}>
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
              borderColor: errorMsg ? "red.500" : "grey.200",
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
