import { FC, useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
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
import { format, isValid, parse } from "date-fns";

import { DateRangeFilterValue, DateFilterModalType } from "./types";
import { getDateFnsLocale } from "../../../i18n-dates";

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
  const [selectedDateRange, setSelectedDateRange] = useState<DateRange<Date>>([
    null,
    null,
  ]);
  const [dateRangeState, setDateRangeState] = useState("");
  const { t, i18n } = useTranslation();

  useEffect(() => {
    if (date?.from && date?.to) {
      setSelectedDateRange([
        date?.from ? parse(date.from, "yyyy-MM-dd", new Date()) : null,
        date?.to ? parse(date.to, "yyyy-MM-dd", new Date()) : null,
      ]);
    }
  }, [date]);

  useEffect(() => {
    if (dateRangeState === "finish") {
      const formatted: DateRangeFilterValue = {
        from:
          selectedDateRange[0] && isValid(selectedDateRange[0])
            ? format(selectedDateRange[0], "yyyy-MM-dd")
            : null,
        to:
          selectedDateRange[1] && isValid(selectedDateRange[1])
            ? format(selectedDateRange[1], "yyyy-MM-dd")
            : null,
      };

      onDateChange({
        type: "daterange",
        date: formatted,
      });
      setDateRangeState("");
      onClose();
    }
  }, [dateRangeState]);

  return (
    <Dialog open onClose={onClose} maxWidth="md">
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant="h5" fontWeight={600}>
            {t("shell.selectDateRange")}
          </Typography>
          <IconButton size="small" onClick={onClose}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent sx={{ px: 0, pb: 2.5 }}>
        <LocalizationProvider
          dateAdapter={AdapterDateFns}
          adapterLocale={getDateFnsLocale(i18n.language)}
        >
          <DateRangeCalendar
            disableHighlightToday
            value={selectedDateRange}
            onChange={(newValue, selectionState) => {
              setSelectedDateRange(newValue as DateRange<Date>);
              setDateRangeState(selectionState);
            }}
            data-cy="dateRange_picker"
            disableFuture
          />
        </LocalizationProvider>
      </DialogContent>
    </Dialog>
  );
};
