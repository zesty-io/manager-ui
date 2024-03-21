import {
  DatePicker,
  LocalizationProvider,
  DatePickerProps,
} from "@mui/x-date-pickers-pro";
import { AdapterDateFns } from "@mui/x-date-pickers-pro/AdapterDateFns";
import { memo, useEffect, useRef, useState } from "react";
import Button from "@mui/material/Button";
import { Typography, Stack, Box, TextField } from "@mui/material";
import format from "date-fns/format";

export interface FieldTypeDateProps extends DatePickerProps<Date> {
  name: string;
  required?: boolean;
  error?: boolean;
}

const parseDateInput = (input: string): Date | null => {
  const months: { [key: string]: number } = {
    jan: 0,
    feb: 1,
    mar: 2,
    apr: 3,
    may: 4,
    jun: 5,
    jul: 6,
    aug: 7,
    sep: 8,
    oct: 9,
    nov: 10,
    dec: 11,
  };

  const dateParts = input.split(/[ ,/]/).filter((part) => part.trim() !== "");
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const currentDay = new Date().getDate();

  if (dateParts.length === 1) {
    const month = months[dateParts[0].toLowerCase().slice(0, 3)];
    const day = 1;
    const isValidMonth = month >= 0;
    return new Date(currentYear, isValidMonth ? month : currentMonth, day);
  }

  if (dateParts.length === 2) {
    const month = months[dateParts[0].toLowerCase().slice(0, 3)];
    const day = parseInt(dateParts[1]);
    const isValidMonth = month >= 0;
    return new Date(
      currentYear,
      isValidMonth ? month : currentMonth,
      !isNaN(day) ? day : 1
    );
  }

  if (dateParts.length === 3) {
    const month = months[dateParts[0].toLowerCase().slice(0, 3)];
    const day = parseInt(dateParts[1]);
    const year = parseInt(dateParts[2]);
    const isValidMonth = month >= 0;
    return new Date(
      !isNaN(year) ? year : currentYear,
      isValidMonth ? month : currentMonth,
      !isNaN(day) ? day : 1
    );
  }
};

export const FieldTypeDate = memo(
  ({ required, error, ...props }: FieldTypeDateProps) => {
    const textFieldRef = useRef<HTMLInputElement>(null);
    const [isOpen, setIsOpen] = useState(false);

    /**
     * Clear the input value
     */
    const handleClear = () => {
      if (props.onChange) props.onChange(null, null);
      if (textFieldRef.current) textFieldRef.current.value = "";
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
          textFieldRef.current.value = format(new Date(), "MMM dd, yyyy");
        }

        /**
         * Delay the focus to the input field to
         * ensure the picker is open before focusing to the field
         */
        setTimeout(() => {
          textFieldRef.current?.focus();
        });
      }

      /**
       * Set the input value to the selected date inside the picker
       */
      if (!isOpen && props.value) {
        textFieldRef.current.value = format(props.value, "MMM dd, yyyy");
      }

      textFieldRef.current.setSelectionRange(0, 3);
    }, [isOpen]);

    /**
     * Set the input value on initial render if the value is set
     */
    useEffect(() => {
      if (props.value) {
        textFieldRef.current.value = format(props.value, "MMM dd, yyyy");
      }
    }, []);

    return (
      <LocalizationProvider dateAdapter={AdapterDateFns}>
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
              slots={{
                field: CustomField,
                ...props.slots,
              }}
              slotProps={{
                desktopPaper: {
                  sx: {
                    mt: 1,
                  },
                },
                field: {
                  //@ts-expect-error - Fix this, Add the correct type
                  onClick: handleOpen,
                  onChange: (e: any) => {
                    const inputDate = e.target.value;
                    const parsedDate = parseDateInput(inputDate);

                    if (parsedDate) {
                      props.onChange(parsedDate, null);
                    }
                  },
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

function CustomField(props: any) {
  const [dateValue, setDateValue] = useState<string | null>(null);
  const { value, ...rest } = props;

  return (
    <TextField
      value={dateValue}
      onChange={(e) => {
        setDateValue(e.target.value);
      }}
      placeholder="Mon DD, YYYY"
      {...rest}
      type="text"
    />
  );
}
