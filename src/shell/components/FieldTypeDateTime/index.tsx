import { useEffect, useState, useRef, useMemo } from "react";
import { TextField, Autocomplete, Tooltip, ListItem } from "@mui/material";
import { parse, format, isValid, formatISO } from "date-fns";
import { zonedTimeToUtc } from "date-fns-tz";

import { FieldTypeDate } from "../FieldTypeDate";
import {
  getClosestTimeSuggestion,
  getDerivedTime,
  toISOString,
  to12HrTime,
  TIME_OPTIONS,
  TIMEZONES,
} from "./util";

type FieldTypeDateTimeProps = {
  required?: boolean;
  name: string;
  error?: boolean;
  value: string; // "YYYY-MM-DD HH:mm:ss.SSSSSS"
  onChange: (date: string) => void;
  showClearButton?: boolean;
  showTimezonePicker?: boolean;
  selectedTimezone?: string;
  onTimezoneChange?: (timezone: string) => void;
  disablePast?: boolean;
};

// --- helpers (local) ---

/** Parse "YYYY-MM-DD" -> Date (local) */
const parseYMD = (s?: string | null) =>
  s ? parse(s, "yyyy-MM-dd", new Date()) : null;

/** Parse "HH:mm:ss.SSSSSS" or "HH:mm:ss" -> { h, m } */
const parseIsoTimeToHM = (
  iso?: string | null
): { h: number; m: number } | null => {
  if (!iso) return null;
  // strip fractional if present
  const core = iso.replace(/^(\d{2}:\d{2}:\d{2})\.\d+$/, "$1");
  const d = parse(core, "HH:mm:ss", new Date(0));
  if (!isValid(d)) return null;
  return { h: d.getHours(), m: d.getMinutes() };
};

/** Build a UTC Date from dateString ("YYYY-MM-DD"), isoTime ("HH:mm:ss.SSSSSS"), and a TZ id */
const toUtcDate = (
  dateString: string,
  isoTime: string,
  tz: string
): Date | null => {
  const base = parseYMD(dateString);
  const hm = parseIsoTimeToHM(isoTime);
  if (!base || !isValid(base) || !hm) return null;

  const localWallTime = new Date(
    base.getFullYear(),
    base.getMonth(),
    base.getDate(),
    hm.h,
    hm.m,
    0,
    0
  );

  return zonedTimeToUtc(localWallTime, tz);
};

/** Format "YYYY-MM-DD HH:mm:ss.SSSSSS" (in timezone) as ISO UTC preview */
const toUtcIsoPreview = (value: string, tz: string) => {
  if (!value) return null;
  const [dStr, tStr] = value.split(" ");
  if (!dStr || !tStr) return null;
  const utcDate = toUtcDate(dStr, tStr, tz);
  return utcDate ? formatISO(utcDate) : null;
};

export const FieldTypeDateTime = ({
  required,
  error,
  name,
  value,
  onChange,
  showClearButton = true,
  showTimezonePicker,
  selectedTimezone,
  onTimezoneChange,
  disablePast = false,
}: FieldTypeDateTimeProps) => {
  const timeFieldRef = useRef<HTMLDivElement>(null);
  const optionsRef = useRef<HTMLDivElement>(null);
  const dateFieldRef = useRef<any>(null);
  const [timeKeyCount, setTimeKeyCount] = useState(0);
  const [isTimeFieldActive, setIsTimeFieldActive] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [invalidInput, setInvalidInput] = useState(false);
  const [timezone, setTimezone] = useState(
    selectedTimezone ?? "America/Los_Angeles"
  );

  const [dateString, timeString] = value?.split(" ") ?? [null, null];
  const currentSystemTimezoneID =
    Intl.DateTimeFormat().resolvedOptions().timeZone ?? "America/Los_Angeles";

  useEffect(() => {
    setTimeKeyCount((n) => n + 1);

    if (isTimeFieldActive) {
      setTimeout(() => {
        timeFieldRef.current?.querySelector("input")?.focus();
      });
    }
  }, [value]);

  useEffect(() => {
    const { time, index } = getClosestTimeSuggestion(inputValue.trim());
    setInvalidInput(!!inputValue.trim() ? !time : false);

    const timeOptionElements = optionsRef.current?.querySelectorAll(
      "li.MuiAutocomplete-option"
    );

    if (index > 0) {
      timeOptionElements?.[index]?.scrollIntoView({ block: "center" });
    }
  }, [inputValue]);

  useEffect(() => {
    setTimeout(() => {
      optionsRef.current
        ?.querySelector("li[aria-selected='true']")
        ?.scrollIntoView({ block: "center" });
    });
  }, [isTimeFieldActive]);

  const timezoneOptionsWithSuggestions = useMemo(() => {
    const userTimezone = TIMEZONES.find(
      (tz) => tz.id === currentSystemTimezoneID
    );
    const timezoneSuggestions = [
      { ...userTimezone, type: "suggestion" as const },
      {
        label: "(GMT+00:00) Coordinated Universal Time",
        id: "UTC",
        type: "suggestion" as const,
      },
    ];
    return [...timezoneSuggestions, ...TIMEZONES];
  }, [currentSystemTimezoneID]);

  const generateValuePreview = () => {
    if (showTimezonePicker && value) {
      const iso = toUtcIsoPreview(value, timezone);
      return iso ? `Stored in UTC as ${iso}` : null;
    }
    if (dateString && timeString) {
      return `Stored as ${dateString} ${timeString}`;
    }
    return null;
  };

  return (
    <>
      <FieldTypeDate
        disablePast={disablePast}
        name={name}
        required={required}
        value={dateString ? parseYMD(dateString) : null}
        ref={dateFieldRef}
        showClearButton={showClearButton}
        valueFormatPreview={generateValuePreview()}
        onChange={(date) => {
          if (date) {
            onChange(
              `${format(date, "yyyy-MM-dd")} ${timeString ?? "00:00:00.000000"}`
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
                getOptionDisabled={(option) => {
                  if (!disablePast) return false;
                  if (!dateString) return false;

                  const utc = toUtcDate(dateString, option.value, timezone);
                  if (!utc) return false;
                  return utc.getTime() < Date.now();
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
                onInputChange={(_, v) => setInputValue(v)}
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
                    elevation: 8,
                    sx: { width: 184, mt: 1 },
                  },
                }}
                ListboxProps={{
                  ref: optionsRef,
                  sx: { maxHeight: 180 },
                }}
                renderInput={(params) => (
                  <TextField
                    data-cy="dateTimeInputField"
                    ref={timeFieldRef}
                    placeholder="HH:MM"
                    error={invalidInput || error}
                    onClick={() => {
                      if (!dateString && !timeString) {
                        onChange(
                          `${format(new Date(), "yyyy-MM-dd")} 00:00:00.000000`
                        );
                        dateFieldRef.current?.setDefaultDate?.();
                      }
                    }}
                    onFocus={() => setIsTimeFieldActive(true)}
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
              autoHighlight
              fullWidth
              disableClearable
              options={timezoneOptionsWithSuggestions}
              value={timezoneOptionsWithSuggestions.find(
                (tz: any) => tz.id === timezone
              )}
              renderInput={(params) => <TextField {...params} />}
              renderOption={(props, option: any) => (
                <ListItem
                  {...props}
                  key={
                    option.type === "suggestion"
                      ? `${option.id}_suggestion`
                      : option.id
                  }
                  sx={{
                    "&.MuiListItem-root": {
                      color: "text.primary",
                      borderBottom: (theme) =>
                        option.id === "UTC" && option.type === "suggestion"
                          ? `1px solid ${theme.palette.border}`
                          : "none",
                    },
                  }}
                >
                  {option.label}
                </ListItem>
              )}
              onChange={(_, v: any) => {
                setTimezone(v.id);
                onTimezoneChange && onTimezoneChange(v.id);
              }}
              filterOptions={(options: any[], state) => {
                if (state.inputValue) {
                  return options.filter(
                    (tz: any) =>
                      tz.label
                        .replace(" - ", " ")
                        .toLowerCase()
                        .includes(state.inputValue.toLowerCase().trim()) &&
                      tz.type !== "suggestion"
                  );
                }
                return options;
              }}
              ListboxProps={{ sx: { maxHeight: 320 } }}
            />
          ),
        }}
      />
    </>
  );
};
