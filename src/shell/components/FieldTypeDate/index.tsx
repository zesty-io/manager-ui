import {
  DatePicker,
  LocalizationProvider,
  DatePickerProps,
} from "@mui/x-date-pickers-pro";
import { AdapterDateFns } from "@mui/x-date-pickers-pro/AdapterDateFns";
import { memo, useEffect, useRef, useState } from "react";
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
    const [isOpen, setIsOpen] = useState(false);

    const handleClear = () => {
      /**
       * Clear the input value
       */
      if (props.onChange) props.onChange(null, null);
    };

    const handleOpen = () => {
      /**
       *  Open the date picker
       */
      if (triggerPickerRef.current) triggerPickerRef.current?.click();
    };

    const onDatePickerOpen = () => {
      if (textFieldRef.current) {
        /**
         * Add timeout to ensure the datepicker is open before setting the value
         */
        setTimeout(() => {
          /**
           * Check if the input field is empty, then set the value to today's date
           */
          if (!textFieldRef.current.value && props.value === null) {
            props.onChange(new Date(), null);
          }
          setIsOpen(true);
        }, 0);
      }
    };

    useEffect(() => {
      /**
       * This is to ensure the input field is focused and the cursor is at the beginning of the input field
       */
      if (isOpen) {
        textFieldRef.current?.focus();
        textFieldRef.current?.setSelectionRange(0, 3);
      }
    }, [isOpen]);

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
              onClose={() => setIsOpen(false)}
              onOpen={onDatePickerOpen}
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
