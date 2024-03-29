import * as React from "react";
import { TextField, FormLabel, FormControl, Box } from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers-pro";
import { DesktopDateRangePicker as MuiDesktopDateRangePicker } from "@mui/x-date-pickers-pro/DesktopDateRangePicker";
import { AdapterDateFns } from "@mui/x-date-pickers-pro/AdapterDateFns";

// TODO: Move to zesty material package
export default function DateRangePicker(props) {
  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <MuiDesktopDateRangePicker
        renderInput={(startProps, endProps) => (
          <Box sx={{ display: "flex", gap: 1.75 }}>
            <FormControl fullWidth>
              <FormLabel>From</FormLabel>
              <TextField {...startProps} size="small" label="" />
            </FormControl>
            <FormControl fullWidth>
              <FormLabel>To</FormLabel>
              <TextField {...endProps} size="small" label="" />
            </FormControl>
          </Box>
        )}
        {...props}
      />
    </LocalizationProvider>
  );
}
