import { useRef } from "react";
import MuiTextField, { OutlinedTextFieldProps } from "@mui/material/TextField";
import {
  Button,
  FormControl,
  FormHelperText,
  FormLabel,
  InputAdornment,
} from "@mui/material";
import BrushIcon from "@mui/icons-material/Brush";

export interface FieldTypeColorProps
  extends Omit<OutlinedTextFieldProps, "variant"> {}

export const FieldTypeColor = ({
  InputProps,
  label,
  required,
  ...props
}: FieldTypeColorProps) => {
  return (
    <FormControl fullWidth required={required}>
      <FormLabel>{label}</FormLabel>
      <MuiTextField
        size="small"
        variant="outlined"
        type="color"
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <Button
                size="small"
                variant="contained"
                onClick={(e) => {
                  // References color input via event in order to open color picker
                  const input = e.currentTarget?.parentElement?.parentElement
                    ?.firstElementChild as HTMLInputElement;
                  input?.click();
                }}
              >
                <BrushIcon fontSize="small" />
              </Button>
            </InputAdornment>
          ),
          // Spread props at the end to allow Input prop overrides
          ...InputProps,
        }}
        // Spread props at the end to allow prop overrides
        {...props}
      />
    </FormControl>
  );
};
