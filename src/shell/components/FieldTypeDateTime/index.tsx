import { useEffect, useState, useMemo, useRef } from "react";
import { TextField, Autocomplete } from "@mui/material";
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
  const [timeKeyCount, setTimeKeyCount] = useState(0);
  const [isTimeFieldActive, setIsTimeFieldActive] = useState(false);
  const timeFieldRef = useRef<HTMLDivElement>(null);

  const [dateString, timeString] = value?.split(" ") ?? [null, null];

  useEffect(() => {
    setTimeKeyCount(timeKeyCount + 1);

    if (isTimeFieldActive) {
      console.log("auto focus");
      setTimeout(() => {
        timeFieldRef.current?.querySelector("input").focus();
      });
    }
  }, [value]);

  return (
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
            options={TIME_OPTIONS}
            getOptionLabel={(option) => option.inputValue}
            onChange={(_, time) => {
              onChange(`${dateString} ${time.value}`);
              setIsTimeFieldActive(false);
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
  );
  // return (
  //   <LocalizationProvider dateAdapter={AdapterDateFns}>
  //     <DesktopDateTimePicker
  //       data-testid="zds-date-time-picker"
  //       renderInput={(params) => (
  //         <TextField {...params} fullWidth size="small" error={error} />
  //       )}
  //       // Spread props at the end to allow prop overrides
  //       {...props}
  //     />
  //   </LocalizationProvider>
  // );
};
