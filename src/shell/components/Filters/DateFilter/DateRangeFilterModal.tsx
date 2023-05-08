import { FC, useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Box,
  Typography,
} from "@mui/material";
import {
  LocalizationProvider,
  DateRangeCalendar,
  DateRange,
} from "@mui/x-date-pickers-pro";
import { AdapterDateFns } from "@mui/x-date-pickers-pro/AdapterDateFns";
import CloseIcon from "@mui/icons-material/Close";
import moment from "moment";

import { DateRangeFilterValue, DateFilterModalType } from "./types";

interface DateRangeFilterModal {
  date: DateRangeFilterValue;
  onClose: () => void;
  onDateChange: ({
    type,
    date,
  }: {
    type: DateFilterModalType;
    date: DateRangeFilterValue;
  }) => void;
}
export const DateRangeFilterModal: FC<DateRangeFilterModal> = ({
  date,
  onClose,
  onDateChange,
}) => {
  const [selectedDateRange, setSelectedDateRange] = useState<DateRange<any>>([
    null,
    null,
  ]);
  const [dateRangeState, setDateRangeState] = useState("");

  useEffect(() => {
    if (date?.from && date?.to) {
      setSelectedDateRange([new Date(date.from), new Date(date.to)]);
    }
  }, [date]);

  useEffect(() => {
    if (dateRangeState === "finish") {
      const date = {
        from: moment(selectedDateRange[0]).isValid()
          ? moment(selectedDateRange[0]).format("YYYY-MM-DD")
          : null,
        to: moment(selectedDateRange[1]).isValid()
          ? moment(selectedDateRange[1]).format("YYYY-MM-DD")
          : null,
      };

      onDateChange({
        type: "daterange",
        date,
      });
      setDateRangeState("");
      onClose();
    }
  }, [dateRangeState]);

  return (
    <Dialog open onClose={onClose} maxWidth="md">
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant="h5" textTransform="capitalize" fontWeight={600}>
            Select date range...
          </Typography>
          <IconButton size="small" onClick={onClose}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent sx={{ px: 0, pb: 2.5 }}>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <DateRangeCalendar
            value={selectedDateRange}
            onChange={(newValue, selectionState) => {
              setSelectedDateRange(newValue);
              setDateRangeState(selectionState);
            }}
            data-cy="dateRange_picker"
          />
        </LocalizationProvider>
      </DialogContent>
    </Dialog>
  );
};
