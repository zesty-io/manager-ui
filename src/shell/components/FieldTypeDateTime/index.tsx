import { useEffect, useState } from "react";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import {
  DesktopDateTimePicker,
  DesktopDateTimePickerProps,
} from "@mui/x-date-pickers";
import { TextField, Autocomplete } from "@mui/material";
import moment from "moment";

import { FieldTypeDate } from "../FieldTypeDate";
import { getTimeOptions } from "./util";

// export interface FieldTypeDateTimeProps
//   extends Omit<DesktopDateTimePickerProps<Date, Date>, "renderInput"> {
//   required?: boolean;
//   name: string;
//   error?: boolean;
// }
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
}: // ...props
FieldTypeDateTimeProps) => {
  const [dateString, setDateString] = useState(value?.split(" ")?.[0] ?? null);
  const [timeString, setTimeString] = useState(value?.split(" ")?.[1] ?? null);

  useEffect(() => {
    const dateTimeString =
      dateString && timeString ? `${dateString} ${timeString}` : null;

    if (dateString !== value) {
      onChange(dateTimeString);
    }
  }, [dateString, timeString]);

  return (
    <FieldTypeDate
      name={name}
      required={required}
      value={dateString ? new Date(dateString) : null}
      // format="MMM dd, yyyy"
      // onChange={(date) => onDateChange(date, name, datatype)}
      onChange={(date) => {
        setDateString(date ? moment(date).format("yyyy-MM-DD") : null);

        if (date && timeString === null) {
          setTimeString("00:00:00.000000");
        }
      }}
      onClear={() => {
        setDateString(null);
        setTimeString(null);
      }}
      error={error}
      slots={{
        timePicker: (
          <Autocomplete
            disableClearable
            // open
            // freeSolo
            forcePopupIcon={false}
            renderInput={(params) => (
              <TextField placeholder="HH:MM" {...params} />
            )}
            options={TIME_OPTIONS}
            getOptionLabel={(option) => option.inputValue}
            onChange={(_, time) => {
              console.log(time);
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
