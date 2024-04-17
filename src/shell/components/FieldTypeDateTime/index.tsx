import { useEffect, useState, useMemo, useRef } from "react";
import {
  TextField,
  Autocomplete,
  Typography,
  Tooltip,
  ListItem,
} from "@mui/material";
import moment from "moment";

import { FieldTypeDate } from "../FieldTypeDate";
import {
  getClosestTimeSuggestion,
  getDerivedTime,
  toISOString,
  to12HrTime,
  TIME_OPTIONS,
  TIMEZONES,
} from "./util";

const TIME_FORMAT_REGEX = /^((1[0-2]|0?[1-9]):([0-5][0-9]) ?([ap][m]))$/gi;

type FieldTypeDateTimeProps = {
  required?: boolean;
  name: string;
  error?: boolean;
  value: string;
  onChange: (date: string) => void;
  showClearButton?: boolean;
  showTimezonePicker?: boolean;
};

export const FieldTypeDateTime = ({
  required,
  error,
  name,
  value,
  onChange,
  showClearButton = true,
  showTimezonePicker,
}: FieldTypeDateTimeProps) => {
  const timeFieldRef = useRef<HTMLDivElement>(null);
  const optionsRef = useRef<HTMLDivElement>(null);
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
    const { time, index } = getClosestTimeSuggestion(inputValue);

    setInvalidInput(!!inputValue ? !time : false);

    const timeOptionElements = optionsRef.current?.querySelectorAll(
      "li.MuiAutocomplete-option"
    );

    // For closest time suggestion just scroll it into view, no highlighting needed
    if (index > 0) {
      timeOptionElements?.[index]?.scrollIntoView({
        block: "center",
      });
    }
  }, [inputValue]);

  useEffect(() => {
    setTimeout(() => {
      optionsRef.current
        ?.querySelector("li[aria-selected='true']")
        ?.scrollIntoView({ block: "center" });
    });
  }, [isTimeFieldActive]);

  return (
    <>
      <FieldTypeDate
        name={name}
        required={required}
        value={dateString ? moment(dateString).toDate() : null}
        showClearButton={showClearButton}
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
                options={TIME_OPTIONS}
                getOptionLabel={(option) => {
                  if (typeof option === "object") {
                    return option.inputValue;
                  } else {
                    return to12HrTime(option);
                  }
                }}
                filterOptions={(e) => e}
                isOptionEqualToValue={(option) => {
                  return option.inputValue === getDerivedTime(inputValue);
                }}
                onChange={(_, time, reason) => {
                  if (reason === "createOption") {
                    if (typeof time !== "string") {
                      setInputValue(to12HrTime(timeString));
                      return;
                    }

                    const derivedTime = toISOString(getDerivedTime(time));

                    if (derivedTime.toLowerCase() === "invalid date") {
                      setInputValue(to12HrTime(timeString));
                    } else {
                      onChange(`${dateString} ${derivedTime}`);
                      setIsTimeFieldActive(false);
                    }
                  } else if (reason === "selectOption") {
                    if (typeof time === "object") {
                      onChange(`${dateString} ${time.value}`);
                      setIsTimeFieldActive(false);
                    }
                  }
                }}
                onInputChange={(_, value) => {
                  setInputValue(value);
                }}
                sx={{
                  width: 96,
                  flexShrink: 0,
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
                ListboxProps={{
                  ref: optionsRef,
                  sx: {
                    maxHeight: 180,
                  },
                }}
                renderInput={(params) => (
                  <TextField
                    data-cy="dateTimeInputField"
                    ref={timeFieldRef}
                    placeholder="HH:MM"
                    error={invalidInput || error}
                    onClick={() => {
                      setIsTimeFieldActive(true);
                      if (!dateString && !timeString) {
                        onChange(
                          `${moment().format("yyyy-MM-DD")} 00:00:00.000000`
                        );
                      }
                    }}
                    onBlur={() => {
                      if (!inputValue) {
                        setInputValue(
                          to12HrTime(timeString ?? "00:00:00.000000")
                        );
                      }

                      setIsTimeFieldActive(false);

                      const derivedTime = toISOString(
                        getDerivedTime(inputValue)
                      );

                      if (derivedTime.toLowerCase() === "invalid date") {
                        // Reset to whatever the last valid time was set to
                        setInputValue(to12HrTime(timeString));
                      } else {
                        onChange(`${dateString} ${derivedTime}`);
                      }
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
          timezonePicker: showTimezonePicker && (
            <Autocomplete
              fullWidth
              size="small"
              options={TIMEZONES}
              renderInput={(params) => <TextField {...params} />}
              renderOption={(props, option) => (
                <ListItem
                  {...props}
                  key={option.id}
                  sx={{
                    "&.MuiListItem-root": {
                      color: "text.primary",
                    },
                  }}
                >
                  {option.label}
                </ListItem>
              )}
            />
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
