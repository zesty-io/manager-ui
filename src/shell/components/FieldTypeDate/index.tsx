import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DesktopDatePicker, DesktopDatePickerProps } from "@mui/x-date-pickers";
import { FormControl, FormLabel, TextField } from "@mui/material";

export interface FieldTypeDateProps
  extends Omit<DesktopDatePickerProps<Date, Date>, "renderInput"> {
  helperText?: string;
  error?: boolean;
  required?: boolean;
}

export const FieldTypeDate = ({
  label,
  helperText,
  error,
  required,
  ...props
}: FieldTypeDateProps) => {
  return (
    <FormControl fullWidth required={required}>
      <FormLabel>{label}</FormLabel>
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <DesktopDatePicker
          data-testid="zds-date-picker"
          renderInput={(params) => (
            <TextField
              {...params}
              helperText={helperText}
              error={error}
              size="small"
            />
          )}
          // Spread props at the end to allow prop overrides
          {...props}
        />
      </LocalizationProvider>
    </FormControl>
  );
};
