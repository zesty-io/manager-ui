import { FC } from "react";
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

interface DateRangeFilterModal {
  onClose: () => void;
  // onDateChange: ({ type, date }: SelectedDate) => void;
  // date: string;
}
export const DateRangeFilterModal: FC<DateRangeFilterModal> = ({ onClose }) => {
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
            // value={selectedDateRange}
            // onChange={(newValue, selectionState) => {
            //   setSelectedDateRange(newValue);
            //   setDateRangeState(selectionState);
            // }}
            data-cy="dateRange_picker"
          />
        </LocalizationProvider>
      </DialogContent>
    </Dialog>
  );
};
