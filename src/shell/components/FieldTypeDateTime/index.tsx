import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import {
  DesktopDateTimePicker,
  DesktopDateTimePickerProps,
} from "@mui/x-date-pickers";
import { TextField, FormControl, FormLabel } from "@mui/material";

export interface FieldTypeDateTimeProps
  extends Omit<DesktopDateTimePickerProps<Date, Date>, "renderInput"> {
  helperText?: string;
  error?: boolean;
  required?: boolean;
}

export const FieldTypeDateTime = ({
  label,
  helperText,
  error,
  required,
  ...props
}: FieldTypeDateTimeProps) => {
  return (
    <FormControl fullWidth required={required}>
      <FormLabel>{label}</FormLabel>
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <DesktopDateTimePicker
          data-testid="zds-date-time-picker"
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
