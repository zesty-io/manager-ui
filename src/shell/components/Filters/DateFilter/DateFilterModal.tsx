import { FC, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Box,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
} from "@mui/material";
import {
  DateCalendar,
  DateView,
  LocalizationProvider,
} from "@mui/x-date-pickers-pro";
import { AdapterDateFns } from "@mui/x-date-pickers-pro/AdapterDateFns";
import CloseIcon from "@mui/icons-material/Close";

import { DateFilterModalType } from "./types";
import { getDateFnsLocale } from "../../../i18n/dates";

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
  const { t, i18n } = useTranslation();
  const [calendarView, setCalendarView] = useState<DateView | "">("");

  // `type` (on/before/after) is the logic discriminator; map it to a
  // pre-cased translated title rather than CSS-capitalizing the raw value.
  const titleByType: Record<string, string> = {
    on: t("shell.dateOn"),
    before: t("shell.dateBefore"),
    after: t("shell.dateAfter"),
  };

  return (
    <Dialog open onClose={onClose}>
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant="h5" fontWeight={600}>
            {titleByType[type] ?? `${type}...`}
          </Typography>
          <IconButton size="small" onClick={onClose}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent sx={{ p: 0 }}>
        <LocalizationProvider
          dateAdapter={AdapterDateFns}
          adapterLocale={getDateFnsLocale(i18n.language)}
        >
          <DateCalendar
            value={date.length ? new Date(date) : new Date()}
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
