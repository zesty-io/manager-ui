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

import { FilterButton } from "./FilterButton";

export interface DateRangeFilterValue {
  from: string | null;
  to: string | null;
}
interface DateRangeFilterProps {
  value: DateRangeFilterValue;
  onChange: (filter: DateRangeFilterValue) => void;
  headerTitle?: string;
  inactiveButtonText?: string;
}
export const DateRangeFilter: FC<DateRangeFilterProps> = ({
  value,
  onChange,
  headerTitle = "Select a date range...",
  inactiveButtonText = "Date range",
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDateRange, setSelectedDateRange] = useState<DateRange<any>>([
    value.from ? new Date(value.from) : null,
    value.to ? new Date(value.to) : null,
  ]);
  const [dateRangeState, setDateRangeState] = useState("");

  useEffect(() => {
    if (dateRangeState === "finish") {
      onChange({
        from: moment(selectedDateRange[0]).isValid()
          ? moment(selectedDateRange[0]).format("YYYY-MM-DD")
          : null,
        to: moment(selectedDateRange[1]).isValid()
          ? moment(selectedDateRange[1]).format("YYYY-MM-DD")
          : null,
      });

      setDateRangeState("");
      setIsModalOpen(false);
    }
  }, [dateRangeState]);

  const isFilterActive = Boolean(value?.from && value?.to);
  const buttonText = isFilterActive
    ? `${moment(value.from).format("MMM D, YYYY")} to ${moment(value.to).format(
        "MMM D, YYYY"
      )}`
    : inactiveButtonText;

  return (
    <>
      <FilterButton
        isFilterActive={isFilterActive}
        buttonText={buttonText}
        onOpenMenu={() => setIsModalOpen(true)}
        onRemoveFilter={() => {
          setSelectedDateRange([null, null]);
          setDateRangeState("finish");
        }}
        filterId="dateRange"
      />
      {isModalOpen && (
        <Dialog open onClose={() => setIsModalOpen(false)} maxWidth="md">
          <DialogTitle>
            <Box
              display="flex"
              alignItems="center"
              justifyContent="space-between"
            >
              <Typography
                variant="h5"
                textTransform="capitalize"
                fontWeight={600}
              >
                {headerTitle}
              </Typography>
              <IconButton size="small" onClick={() => setIsModalOpen(false)}>
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
      )}
    </>
  );
};
