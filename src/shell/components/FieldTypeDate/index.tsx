import {
  DatePicker,
  LocalizationProvider,
  DatePickerProps,
} from "@mui/x-date-pickers-pro";
import { AdapterDateFns } from "@mui/x-date-pickers-pro/AdapterDateFns";
import { memo, useCallback, useRef } from "react";
import Button from "@mui/material/Button";
import { Typography, Stack, Box } from "@mui/material";

export interface FieldTypeDateProps extends DatePickerProps<Date> {
  name: string;
  required?: boolean;
  error?: boolean;
}

export const FieldTypeDate = memo(
  ({ required, error, ...props }: FieldTypeDateProps) => {
    const triggerPickerRef = useRef<HTMLButtonElement>(null);
    const textFieldRef = useRef<HTMLInputElement>(null);

    const handleClear = () => {
      /**
       * Clear the input value
       */
      if (props.onChange) props.onChange(null, null);
    };

    /**
     * This function is used to open the date picker when the input field is clicked
     * and refocus the input field when the date picker is opened
     */
    const handleOpen = useCallback(() => {
      /**
       * Step 1: Open the date picker
       */

      if (triggerPickerRef.current) triggerPickerRef.current?.click();
      /**
       * Step 2: Refocus the input field
       */

      if (textFieldRef.current) {
        /**
         * Add delay to ensure the picker is rendered before refocusing the input field
         */
        setTimeout(() => {
          textFieldRef.current.focus();
        }, 0);
      }
    }, [triggerPickerRef, textFieldRef]);

    return (
      <LocalizationProvider
        localeText={{
          /**
           * This Enforce the placeholder to be in the format of "Mon DD YYYY"
           */
          fieldMonthPlaceholder: () => {
            return "Mon";
          },
          fieldDayPlaceholder: () => {
            return "DD";
          },
          fieldYearPlaceholder: () => {
            return "YYYY";
          },
        }}
        dateAdapter={AdapterDateFns}
      >
        <Stack direction={"row"} gap={1}>
          <Box maxWidth={160}>
            <DatePicker
              {...props}
              inputRef={textFieldRef}
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
                  onClick: handleOpen,
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
            color="inherit"
            variant="text"
            size="small"
            sx={{ minWidth: 45 }}
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
  }
);
