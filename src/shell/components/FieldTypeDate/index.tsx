import {
  DatePicker,
  LocalizationProvider,
  DatePickerProps,
} from "@mui/x-date-pickers-pro";
import { AdapterDateFns } from "@mui/x-date-pickers-pro/AdapterDateFns";

// export interface FieldTypeDateProps
//   extends Omit<DesktopDatePickerProps<Date, Date>, "renderInput"> {
//   name: string;
//   required?: boolean;
//   error?: boolean;
// }

// export const FieldTypeDate = ({
//   required,
//   error,
//   ...props
// }: FieldTypeDateProps) => {
//   return (
//     <LocalizationProvider dateAdapter={AdapterDateFns}>
//       <DesktopDatePicker
//         InputAdornmentProps={{ position: "start" }}
//         data-testid="zds-date-picker"
//         renderInput={(params) => {
//           params.inputProps.placeholder = "Mon DD YYYY";
//           return <TextField {...params} fullWidth size="small" error={error} />;
//         }}
//         // Spread props at the end to allow prop overrides
//         {...props}
//       />
//     </LocalizationProvider>
//   );
// };

export interface FieldTypeDateProps extends DatePickerProps<Date> {
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
      <DatePicker
        {...props}
        slotProps={{
          day: {
            sx: {
              "&.MuiPickersDay-root.Mui-selected": {
                backgroundColor: "red",
              },
              "&.Mui-selected": {
                backgroundColor: "red",
              },
            },
          },
          textField: {
            placeholder: "Mon DD YYYY",
          },
          inputAdornment: {
            position: "start",
          },
        }}
      />
    </LocalizationProvider>
  );
};
