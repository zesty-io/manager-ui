import {
  DatePicker,
  LocalizationProvider,
  DatePickerProps,
} from "@mui/x-date-pickers-pro";
import { AdapterDateFns } from "@mui/x-date-pickers-pro/AdapterDateFns";
import { useEffect, useState } from "react";
import Button from "@mui/material/Button";
import { Typography, Stack, Box } from "@mui/material";

export interface FieldTypeDateProps extends DatePickerProps<Date> {
  name: string;
  required?: boolean;
  error?: boolean;
}

export const FieldTypeDate = ({
  required,
  error,
  value,
  ...props
}: FieldTypeDateProps) => {
  const [dateValue, setValue] = useState<Date | null>(null);

  useEffect(() => {
    setValue(value);
  }, [value]);

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Stack direction={"row"}>
        <Box maxWidth={160}>
          <DatePicker
            value={dateValue}
            {...props}
            disableHighlightToday={!!value}
            slotProps={{
              day: {
                // sx: {
                //   "&.MuiPickersDay-today": {
                //     background: "#FF5D0A",
                //     border: "none",
                //     color: "white",
                //   },
                // },
              },
              textField: {
                placeholder: "Mon DD YYYY",
              },
              inputAdornment: {
                position: "start",
              },
            }}
          />
        </Box>

        <Button
          sx={{
            "&:hover": {
              background: "transparent",
            },
            minWidth: 54,
          }}
          variant="text"
          size="small"
          disableRipple
          onClick={() => {
            setValue(null);
          }}
        >
          <Typography
            color={"text.secondary"}
            fontWeight={500}
            variant="caption"
          >
            Clear
          </Typography>
        </Button>
      </Stack>
    </LocalizationProvider>
  );
};

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
