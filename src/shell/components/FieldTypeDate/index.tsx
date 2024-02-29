import {
  DatePicker,
  LocalizationProvider,
  DatePickerProps,
} from "@mui/x-date-pickers-pro";
import { AdapterDateFns } from "@mui/x-date-pickers-pro/AdapterDateFns";
import { Ref, useRef, useState } from "react";
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
  ...props
}: FieldTypeDateProps) => {
  const triggerPickerRef = useRef<HTMLButtonElement>(null);
  const textFieldRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);

  const handleClear = () => {
    /**
     * Clear the input value
     */
    if (props.onChange) props.onChange(null, null);
  };

  return (
    <LocalizationProvider
      localeText={{
        fieldMonthPlaceholder: () => {
          /**
           * Enforce the placeholder to be "Mon" instead of "MMM"
           */
          return "Mon";
        },
      }}
      dateAdapter={AdapterDateFns}
    >
      <Stack direction={"row"}>
        <Box maxWidth={160}>
          <DatePicker
            // open={open}
            // onClose={() => setOpen(false)}
            {...props}
            disableHighlightToday={!!props.value}
            slotProps={{
              desktopPaper: {
                sx: {
                  mt: 1,
                },
              },
              day: {
                /*
                 * Override the default today's background color to match with the theme
                 */
                sx: {
                  "&.MuiPickersDay-today": {
                    background: "#FF5D0A",
                    border: "none",
                    color: "white",
                  },
                },
              },
              textField: {
                ref: textFieldRef,
                onClick: () => {
                  triggerPickerRef.current?.click();
                  textFieldRef.current?.focus();
                },
                placeholder: "Mon DD YYYY",
              },
              openPickerButton: {
                ref: triggerPickerRef,
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
            minWidth: 45,
          }}
          variant="text"
          size="small"
          disableRipple
          onClick={handleClear}
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
