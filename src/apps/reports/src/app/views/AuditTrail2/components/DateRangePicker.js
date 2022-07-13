import * as React from "react";
import { TextField, FormLabel, FormControl } from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers-pro";
import { DateRangePicker as MuiDateRangePicker } from "@mui/x-date-pickers-pro/DateRangePicker";
import { AdapterDateFns } from "@mui/x-date-pickers-pro/AdapterDateFns";
import Box from "@mui/material/Box";

export default function DateRangePicker(props) {
  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <MuiDateRangePicker
        renderInput={(startProps, endProps) => (
          <React.Fragment>
            <FormControl fullWidth>
              <FormLabel>From</FormLabel>
              <TextField
                {...startProps}
                size="small"
                sx={{ mr: 1.5 }}
                label=""
              />
            </FormControl>
            <FormControl fullWidth>
              <FormLabel>To</FormLabel>
              <TextField {...endProps} size="small" label="" />
            </FormControl>
          </React.Fragment>
        )}
        {...props}
      />
    </LocalizationProvider>
  );
}
