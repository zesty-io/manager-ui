import { useEffect, useState, useMemo, useRef } from "react";
import { TextField, Autocomplete, Typography } from "@mui/material";
import moment from "moment";

import { FieldTypeDate } from "../FieldTypeDate";
import { TIME_OPTIONS, getFilteredTimeOptions } from "./util";

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
    return getFilteredTimeOptions(inputValue);
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
                  onBlur={() => {
                    setIsTimeFieldActive(false);
                    // Check what's the closest match to the user input then select that on blur
                    const matchedTimeOption =
                      getFilteredTimeOptions(inputValue);

                    console.log("possible value on blur", matchedTimeOption);
                  }}
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
