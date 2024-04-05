import { useEffect, useState, useMemo, useRef } from "react";
import { TextField, Autocomplete, Typography, Tooltip } from "@mui/material";
import moment from "moment";

import { FieldTypeDate } from "../FieldTypeDate";
import {
  getClosestTimeSuggestion,
  toISOString,
  to12HrTime,
  TIME_OPTIONS,
} from "./util";

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

  useEffect(() => {
    const closestTime = getClosestTimeSuggestion(inputValue);

    setInvalidInput(!closestTime);
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
                autoHighlight
                key={timeKeyCount}
                open={isTimeFieldActive}
                // open
                value={timeString}
                forcePopupIcon={false}
                inputValue={inputValue}
                options={TIME_OPTIONS}
                getOptionLabel={(option) => {
                  if (typeof option === "object") {
                    return option.inputValue;
                  } else {
                    return to12HrTime(option);
                  }
                }}
                filterOptions={(e) => e}
                onChange={(_, time, reason, details) => {
                  console.log(time, reason, details);
                  const isValidTimeFormat = TIME_FORMAT_REGEX.test(inputValue);

                  if (typeof time === "string" && isValidTimeFormat) {
                    onChange(`${dateString} ${toISOString(time)}`);
                    setIsTimeFieldActive(false);
                  } else if (typeof time === "object") {
                    onChange(`${dateString} ${time.value}`);
                    setIsTimeFieldActive(false);
                  } else {
                    setInputValue(to12HrTime(timeString));
                  }
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

                      let periodOfTime = inputValue?.split(" ")?.[1];
                      const timeInput = inputValue?.split(" ")?.[0];
                      const hourInput = timeInput?.split(":")?.[0];
                      let minuteInput = timeInput?.split(":")?.[1];

                      if (!minuteInput) {
                        minuteInput = "00";
                      } else if (minuteInput.length === 1) {
                        minuteInput = `${minuteInput}0`;
                      } else if (minuteInput.length > 2) {
                        return [];
                      }

                      if (!periodOfTime) {
                        periodOfTime =
                          +hourInput >= 7 && +hourInput <= 11 ? "am" : "pm";
                      } else if (periodOfTime === "a") {
                        periodOfTime = "am";
                      } else if (periodOfTime === "p") {
                        periodOfTime = "pm";
                      }

                      const derivedTime = toISOString(
                        `${hourInput}:${minuteInput} ${periodOfTime}`
                      );

                      if (derivedTime.toLowerCase() === "invalid date") {
                        // Reset to whatever the last valid time was set to
                        setInputValue(to12HrTime(timeString));
                      } else {
                        onChange(`${dateString} ${derivedTime}`);
                      }
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
