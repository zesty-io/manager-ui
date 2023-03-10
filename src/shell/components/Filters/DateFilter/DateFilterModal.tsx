import { FC, useState } from "react";
import {
  Box,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
} from "@mui/material";
import { CalendarPicker, LocalizationProvider } from "@mui/x-date-pickers-pro";
import { AdapterDateFns } from "@mui/x-date-pickers-pro/AdapterDateFns";
import { CalendarPickerView } from "@mui/x-date-pickers";
import CloseIcon from "@mui/icons-material/Close";
// import { DateRangeCalendar } from '@mui/x-date-pickers-pro';

import { DateFilterModalType } from "./types";

interface SelectedDate {
  type: DateFilterModalType;
  date: Date;
}
interface DateFilterModalProps {
  onClose: () => void;
  type: DateFilterModalType;
  onDateChange: ({ type, date }: SelectedDate) => void;
  date: string;
}
export const DateFilterModal: FC<DateFilterModalProps> = ({
  onDateChange,
  type,
  onClose,
  date,
}) => {
  const [calendarView, setCalendarView] = useState<CalendarPickerView | "">("");

  return (
    <Dialog open onClose={onClose}>
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant="h5" textTransform="capitalize" fontWeight={600}>
            {type === "daterange" ? "Custom date range" : `${type}...`}
          </Typography>
          <IconButton size="small" onClick={onClose}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent sx={{ p: 0 }}>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <CalendarPicker
            date={date.length ? new Date(date) : new Date()}
            onChange={(newValue) => {
              onDateChange({
                type,
                date: newValue,
              });

              /**
               * Prevents the calendar picker from auto closing when
               * user changes the year
               */
              if (calendarView !== "year") {
                onClose();
              }
            }}
            onViewChange={(view) => setCalendarView(view)}
          />
        </LocalizationProvider>
      </DialogContent>
    </Dialog>
  );
};
