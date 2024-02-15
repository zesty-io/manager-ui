import { AdapterDateFns } from "@mui/x-date-pickers-pro/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { TextField } from "@mui/material";
import {
  DesktopDatePicker,
  DesktopDatePickerProps,
} from "@mui/x-date-pickers/DesktopDatePicker";

export interface FieldTypeDateProps
  extends Omit<DesktopDatePickerProps<Date, Date>, "renderInput"> {
  name: string;
  required?: boolean;
  error?: boolean;
}

export const FieldTypeDate = ({
  required,
  error,
  ...props
}: FieldTypeDateProps) => {
  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <DesktopDatePicker
        InputAdornmentProps={{ position: "start" }}
        data-testid="zds-date-picker"
        renderInput={(params) => {
          params.inputProps.placeholder = "Mon DD YYYY";
          return <TextField {...params} fullWidth size="small" error={error} />;
        }}
        // Spread props at the end to allow prop overrides
        {...props}
      />
    </LocalizationProvider>
  );
};
