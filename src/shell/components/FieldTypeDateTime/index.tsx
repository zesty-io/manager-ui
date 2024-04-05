import { useEffect, useState, useMemo, useRef } from "react";
import { TextField, Autocomplete, Typography, Tooltip } from "@mui/material";
import moment from "moment";

import { FieldTypeDate } from "../FieldTypeDate";
import { TIME_OPTIONS, getFilteredTimeOptions } from "./util";

const TIME_FORMAT_REGEX = /^((1[0-2]|0?[1-9]):([0-5][0-9]) ?([ap][m]))$/gi;

type FieldTypeDateTimeProps = {
  required?: boolean;
  name: string;
  error?: boolean;
  value: string;
  onChange: (date: string) => void;
};

export const FieldTypeDateTime = ({
  required,
  error,
  name,
  value,
  onChange,
}: FieldTypeDateTimeProps) => {
  const timeFieldRef = useRef<HTMLDivElement>(null);
  const [timeKeyCount, setTimeKeyCount] = useState(0);
  const [isTimeFieldActive, setIsTimeFieldActive] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [invalidInput, setInvalidInput] = useState(false);

  const [dateString, timeString] = value?.split(" ") ?? [null, null];

  useEffect(() => {
    setTimeKeyCount(timeKeyCount + 1);

    if (isTimeFieldActive) {
      setTimeout(() => {
        timeFieldRef.current?.querySelector("input").focus();
      });
    }
  }, [value]);

  const filteredTimeOptions = useMemo(() => {
    const timeOptions = getFilteredTimeOptions(inputValue.trim());

    if (!timeOptions?.length) {
      setInvalidInput(!TIME_FORMAT_REGEX.test(inputValue));
    } else {
      setInvalidInput(false);
    }

    return timeOptions;
  }, [inputValue]);

  return (
    <>
      <FieldTypeDate
        name={name}
        required={required}
        value={dateString ? new Date(dateString) : null}
        onChange={(date) => {
          if (date) {
            onChange(
              `${moment(date).format("yyyy-MM-DD")} ${
                timeString ?? "00:00:00.000000"
              }`
            );
          } else {
            onChange(null);
          }
        }}
        onClear={() => {
          onChange(null);
          setInputValue("");
        }}
        error={error}
        slots={{
          timePicker: (
            <Tooltip
              open={invalidInput}
              title="Invalid Time"
              placement="top-start"
            >
              <Autocomplete
                disableClearable
                freeSolo
                key={timeKeyCount}
                open={isTimeFieldActive}
                value={timeString}
                forcePopupIcon={false}
                inputValue={inputValue}
                renderInput={(params) => (
                  <TextField
                    ref={timeFieldRef}
                    placeholder="HH:MM"
                    error={invalidInput}
                    onClick={() => {
                      setIsTimeFieldActive(true);
                      if (!dateString && !timeString) {
                        onChange(
                          `${moment().format("yyyy-MM-DD")} 00:00:00.000000`
                        );
                      }
                    }}
                    onBlur={() => {
                      setIsTimeFieldActive(false);
                      // If user types in 1 or 1: convert to 1:00
                      // Else if user types in 1:2 convert to 1:20
                      // Else if user types in 1:29 save as is
                      // Else if user types in invalid format ie 1:99 revert to last valid time

                      // Check what's the closest match to the user input then select that on blur
                      // const matchedTimeOption =
                      //   getFilteredTimeOptions(inputValue);

                      // if (matchedTimeOption?.length) {
                      //   onChange(`${dateString} ${matchedTimeOption[0].value}`);
                      // }
                    }}
                    sx={{
                      "& .Mui-focused.MuiAutocomplete-inputRoot fieldset.MuiOutlinedInput-notchedOutline":
                        {
                          borderColor: invalidInput
                            ? (theme) => theme.palette.error.main
                            : (theme) => theme.palette.primary.main,
                        },
                    }}
                    {...params}
                  />
                )}
                options={filteredTimeOptions}
                getOptionLabel={(option) => {
                  if (typeof option === "object") {
                    return option.inputValue;
                  } else {
                    return moment(`01/01/2024 ${option}`).format("h:mm a");
                  }
                }}
                filterOptions={(e) => e}
                onChange={(_, time) => {
                  const isValidTimeFormat = TIME_FORMAT_REGEX.test(inputValue);

                  if (typeof time === "string" && isValidTimeFormat) {
                    onChange(
                      `${dateString} ${moment(`01-01-2024 ${time}`).format(
                        "HH:mm:ss.SSSSSS"
                      )}`
                    );
                  } else if (typeof time === "object") {
                    onChange(`${dateString} ${time.value}`);
                  }

                  setIsTimeFieldActive(false);
                }}
                onInputChange={(_, value) => {
                  setInputValue(value);
                }}
                sx={{
                  width: 96,
                  "& .MuiAutocomplete-inputRoot": {
                    py: 0.75,
                    px: 1,

                    "& input.MuiOutlinedInput-input.MuiAutocomplete-input": {
                      p: 0,
                      height: 28,
                    },
                  },
                }}
                slotProps={{
                  paper: {
                    sx: {
                      width: 184,
                    },
                  },
                }}
              />
            </Tooltip>
          ),
        }}
      />
      {dateString && timeString && (
        <Typography variant="body3" color="text.secondary" sx={{ mt: 0.5 }}>
          Stored as {dateString} {timeString}
        </Typography>
      )}
    </>
  );
};
