import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DesktopDatePicker, DesktopDatePickerProps } from "@mui/x-date-pickers";
import { TextField } from "@mui/material";

export interface FieldTypeDateProps
  extends Omit<DesktopDatePickerProps<Date, Date>, "renderInput"> {
  required?: boolean;
}

export const FieldTypeDate = ({ required, ...props }: FieldTypeDateProps) => {
  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <DesktopDatePicker
        data-testid="zds-date-picker"
        renderInput={(params) => (
          <TextField {...params} fullWidth size="small" />
        )}
        // Spread props at the end to allow prop overrides
        {...props}
      />
    </LocalizationProvider>
  );
};
