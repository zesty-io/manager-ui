import { FC } from "react";
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
import CloseIcon from "@mui/icons-material/Close";

import { DateFilterModalType } from "./types";

interface SelectedDate {
  type: DateFilterModalType;
  date: Date;
}
interface DateFilterModalProps {
  onClose: () => void;
  type: DateFilterModalType;
  onDateChange: ({ type, date }: SelectedDate) => void;
}
export const DateFilterModal: FC<DateFilterModalProps> = ({
  onDateChange,
  type,
  onClose,
}) => {
  return (
    <Dialog open onClose={onClose}>
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant="h5" textTransform="capitalize" fontWeight={600}>
            {type}...
          </Typography>
          <IconButton size="small" onClick={onClose}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent sx={{ p: 0 }}>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <CalendarPicker
            date={new Date()}
            onChange={(newValue) => {
              onDateChange({
                type,
                date: newValue,
              });
              onClose();
            }}
          />
        </LocalizationProvider>
      </DialogContent>
    </Dialog>
  );
};
