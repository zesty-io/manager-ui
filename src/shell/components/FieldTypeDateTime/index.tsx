import { useEffect, useState, useMemo, useRef } from "react";
import { TextField, Autocomplete, Typography } from "@mui/material";
import moment from "moment";

import { FieldTypeDate } from "../FieldTypeDate";
import { getTimeOptions } from "./util";

type FieldTypeDateTimeProps = {
  required?: boolean;
  name: string;
  error?: boolean;
  value: string;
  onChange: (date: string) => void;
};

const TIME_OPTIONS = getTimeOptions();

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
    if (!inputValue) {
      return TIME_OPTIONS;
    }

    const hourInput = +inputValue.split(":")?.[0];
    let minuteInput = inputValue?.split(":")?.[1]?.slice(0, 2);
    let periodOfTime = inputValue?.split(" ")?.[1];

    // const matchingTime = TIME_OPTIONS.filter((time) => {
    //   return time.inputValue.startsWith(inputValue);
    // });

    // Try to do direct matches from the options else find the closest time from the user's input
    // if (matchingTime.length) {
    // TODO: Is still still actually necessary??
    // return matchingTime;
    // } else if (minuteInput?.length && +minuteInput <= 59) {
    // Rounds off minutes so it's always 2 digits
    if (!minuteInput) {
      minuteInput = "00";
    } else if (minuteInput.length === 1) {
      minuteInput = `${minuteInput}0`;
    }

    // Determines wether we'll try to match am or pm times
    if (!periodOfTime) {
      periodOfTime = hourInput >= 7 && hourInput <= 11 ? "am" : "pm";
    } else if (periodOfTime === "a") {
      periodOfTime = "am";
    } else if (periodOfTime === "p") {
      periodOfTime = "pm";
    }

    const derivedTime = `${hourInput}:${minuteInput} ${periodOfTime}`;

    const closestTimeOptionIndex = TIME_OPTIONS.findIndex((time) => {
      return (
        Math.abs(
          new Date(`01/01/2024 ${time.inputValue}`).getTime() / 1000 -
            new Date(`01/01/2024 ${derivedTime}`).getTime() / 1000
        ) <= 420
      );
    });

    return TIME_OPTIONS.slice(
      closestTimeOptionIndex,
      closestTimeOptionIndex + 5
    );
    // } else {
    //   return [];
    // }
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
        }}
        error={error}
        slots={{
          timePicker: (
            <Autocomplete
              disableClearable
              key={timeKeyCount}
              open={isTimeFieldActive}
              value={TIME_OPTIONS?.find((time) => time.value === timeString)}
              forcePopupIcon={false}
              inputValue={inputValue}
              renderInput={(params) => (
                <TextField
                  ref={timeFieldRef}
                  placeholder="HH:MM"
                  onClick={() => {
                    setIsTimeFieldActive(true);
                    if (!dateString && !timeString) {
                      onChange(
                        `${moment().format("yyyy-MM-DD")} 00:00:00.000000`
                      );
                    }
                  }}
                  onBlur={() => setIsTimeFieldActive(false)}
                  {...params}
                />
              )}
              options={filteredTimeOptions}
              getOptionLabel={(option) => option.inputValue}
              filterOptions={(e) => e}
              onChange={(_, time) => {
                onChange(`${dateString} ${time.value}`);
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
