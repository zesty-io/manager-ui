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

    /**
     * Clear the input value
     */
    const handleClear = () => {
      if (props.onChange) props.onChange(null, null);
    };

    /**
     *  Open the date picker
     */
    const handleOpen = () => {
      setIsOpen(true);
    };

    useEffect(() => {
      if (textFieldRef.current && isOpen) {
        /**
         * Check if the input field is empty, then set the value to today's date
         */
        if (props.value === null) {
          props.onChange(new Date(), null);
        }
        /**
         * Delay the focus to the input field to
         * ensure the picker is open before focusing to the field
         */
        setTimeout(() => {
          textFieldRef.current?.focus();
        });
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
              open={isOpen}
              onClose={() => {
                setIsOpen(false);
              }}
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
