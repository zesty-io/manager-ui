import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import {
  DesktopDateTimePicker,
  DesktopDateTimePickerProps,
} from "@mui/x-date-pickers";
import { TextField } from "@mui/material";

export interface FieldTypeDateTimeProps
  extends Omit<DesktopDateTimePickerProps<Date, Date>, "renderInput"> {
  required?: boolean;
  name: string;
  error?: boolean;
}

export const FieldTypeDateTime = ({
  required,
  error,
  ...props
}: FieldTypeDateTimeProps) => {
  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <DesktopDateTimePicker
        data-testid="zds-date-time-picker"
        renderInput={(params) => (
          <TextField {...params} fullWidth size="small" error={error} />
        )}
        // Spread props at the end to allow prop overrides
        {...props}
      />
    </LocalizationProvider>
  );
};
