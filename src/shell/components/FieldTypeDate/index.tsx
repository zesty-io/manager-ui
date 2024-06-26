import {
  DatePicker,
  LocalizationProvider,
  DatePickerProps,
} from "@mui/x-date-pickers-pro";
import { AdapterDateFns } from "@mui/x-date-pickers-pro/AdapterDateFns";
import {
  memo,
  useEffect,
  useRef,
  useState,
  useImperativeHandle,
  forwardRef,
} from "react";
import Button from "@mui/material/Button";
import { Typography, Stack, Box, TextField } from "@mui/material";
import format from "date-fns/format";
import CalendarTodayRoundedIcon from "@mui/icons-material/CalendarTodayRounded";
import moment from "moment";

export interface FieldTypeDateProps extends DatePickerProps<Date> {
  name: string;
  required?: boolean;
  error?: boolean;
  slots?: DatePickerProps<Date>["slots"] & {
    timePicker?: React.ReactNode;
    timezonePicker?: React.ReactNode;
  };
  onClear?: () => void;
  showClearButton?: boolean;
  valueFormatPreview?: string;
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

  let [monthInput, dayInput, yearInput] = dateParts;
  yearInput = yearInput?.slice(0, 4);
  dayInput = dayInput?.slice(0, 2);
  let month = months[monthInput.toLowerCase()?.slice(0, 3)];

  if (isNaN(month)) {
    month = currentMonth;
    if (!isNaN(parseInt(monthInput))) {
      month = parseInt(monthInput) - 1;
    }
  }

  const isValidMonth = month >= 0 && month <= 11;
  let day = isNaN(parseInt(dayInput)) ? 1 : parseInt(dayInput);
  let year = parseInt(yearInput);

  if (isNaN(year)) {
    const isNotInPast =
      new Date(
        currentYear,
        isValidMonth ? month : currentMonth,
        day
      ).getTime() >= new Date().getTime();

    if (isNotInPast) {
      year = currentYear;
    } else {
      year = currentYear + 1;
    }
  }

  return new Date(year, isValidMonth ? month : currentMonth, day);
};

export const FieldTypeDate = memo(
  forwardRef(
    (
      {
        required,
        error,
        slots,
        onClear,
        showClearButton = true,
        valueFormatPreview,
        ...props
      }: FieldTypeDateProps,
      ref
    ) => {
      const textFieldRef = useRef<HTMLInputElement>(null);
      const [isOpen, setIsOpen] = useState(false);

      /**
       * Clear the input value
       */
      const handleClear = () => {
        if (props.onChange) props.onChange(null, null);
        if (textFieldRef.current) textFieldRef.current.value = "";
        onClear && onClear();
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
           * This Perform a check if there's no value set
           * When the user clicks on the input field, set the value to the current date
           */
          if (props.value === null) {
            props.onChange(new Date(), null);
            textFieldRef.current.value = format(new Date(), "MMM dd, yyyy");
            textFieldRef.current.setSelectionRange(0, 3);
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
         * This handles the case when the user selects a date from the picker
         * directly and not use the input field to manually enter the date
         */
        if (!isOpen && props.value) {
          textFieldRef.current.value = format(props.value, "MMM dd, yyyy");
        }
        textFieldRef.current.blur();
      }, [isOpen]);

      /**
       * handles the case when the value is set from the parent component or db values
       */
      useEffect(() => {
        if (props.value) {
          textFieldRef.current.value = format(props.value, "MMM dd, yyyy");
        }
      }, []);

      useImperativeHandle(
        ref,
        () => {
          return {
            setDefaultDate() {
              textFieldRef.current.value = format(new Date(), "MMM dd, yyyy");
            },
          };
        },
        []
      );

      return (
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <Stack direction="row" gap={0.5} alignItems="center">
            <Box maxWidth={160} flexShrink={0}>
              <DatePicker
                reduceAnimations
                open={isOpen}
                onClose={() => {
                  setIsOpen(false);
                }}
                {...props}
                inputRef={textFieldRef}
                disableHighlightToday={!!props.value}
                slots={{
                  field: CustomField,
                  openPickerIcon: CalendarTodayRoundedIcon,
                  ...slots,
                }}
                slotProps={{
                  desktopPaper: {
                    sx: {
                      mt: 1,
                      "& .MuiDateCalendar-root .MuiPickersSlideTransition-root":
                        {
                          minHeight: 0,
                          pb: 2,
                          pt: 1.5,
                        },
                    },
                  },
                  field: {
                    //@ts-expect-error - OnClick type does not exist on fieldProps
                    onClick: handleOpen,
                    onFocus: handleOpen,
                    error,
                    onChange: (e: any) => {
                      const inputDate = e.target.value;
                      const parsedDate = parseDateInput(inputDate);

                      if (parsedDate) {
                        props.onChange(parsedDate, null);
                      }
                    },
                    onKeyDown: (evt: KeyboardEvent) => {
                      if (evt.key === "Enter") {
                        setIsOpen(false);
                        textFieldRef.current?.blur();
                      }

                      if (evt.key === "Tab") {
                        setIsOpen(false);
                      }
                    },
                  },
                  inputAdornment: {
                    position: "start",
                  },
                  openPickerButton: {
                    tabIndex: -1,
                    size: "small",
                  },
                  openPickerIcon: {
                    sx: {
                      fontSize: 20,
                    },
                  },
                }}
              />
            </Box>

            {!!slots?.timePicker && slots.timePicker}
            {!!slots?.timezonePicker && slots.timezonePicker}

            {showClearButton && (
              <Button
                data-cy="dateFieldClearButton"
                color="inherit"
                variant="text"
                size="small"
                sx={{ minWidth: 45 }}
                onClick={handleClear}
              >
                Clear
              </Button>
            )}
          </Stack>
          {(valueFormatPreview || props.value) && (
            <Typography variant="body3" color="text.secondary" sx={{ mt: 0.5 }}>
              {valueFormatPreview ??
                `Stored as ${moment(props.value).format("yyyy-MM-DD")}`}
            </Typography>
          )}
        </LocalizationProvider>
      );
    }
  )
);

function CustomField(props: any) {
  const [dateValue, setDateValue] = useState<string | null>(null);
  const { value, ...rest } = props;

  return (
    <TextField
      data-cy="datePickerInputField"
      value={dateValue}
      onChange={(e) => {
        setDateValue(e.target.value);
      }}
      placeholder="Mon DD YYYY"
      {...rest}
      type="text"
    />
  );
}
