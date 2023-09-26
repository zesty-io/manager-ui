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
}

export const FieldTypeDateTime = ({
  required,
  ...props
}: FieldTypeDateTimeProps) => {
  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <DesktopDateTimePicker
        data-testid="zds-date-time-picker"
        renderInput={(params) => <TextField {...params} size="small" />}
        // Spread props at the end to allow prop overrides
        {...props}
      />
    </LocalizationProvider>
  );
};
