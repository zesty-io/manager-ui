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
import { format, parse, isValid } from "date-fns";

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

const parseYMDLocal = (s?: string | null) =>
  s ? parse(s, "yyyy-MM-dd", new Date()) : null;

export const DateRangeFilter: FC<DateRangeFilterProps> = ({
  value,
  onChange,
  headerTitle = "Select a date range...",
  inactiveButtonText = "Date range",
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDateRange, setSelectedDateRange] = useState<DateRange<Date>>([
    null,
    null,
  ]);
  const [dateRangeState, setDateRangeState] = useState("");

  useEffect(() => {
    if (dateRangeState === "finish") {
      onChange({
        from: selectedDateRange[0]
          ? format(selectedDateRange[0], "yyyy-MM-dd")
          : null,
        to: selectedDateRange[1]
          ? format(selectedDateRange[1], "yyyy-MM-dd")
          : null,
      });

      setDateRangeState("");
      setIsModalOpen(false);
    }
  }, [dateRangeState, onChange, selectedDateRange]);

  useEffect(() => {
    if (value.from && value.to) {
      const from = parseYMDLocal(value.from);
      const to = parseYMDLocal(value.to);
      setSelectedDateRange([
        from && isValid(from) ? from : null,
        to && isValid(to) ? to : null,
      ]);
    } else {
      setSelectedDateRange([null, null]);
    }
  }, [value]);

  const isFilterActive = Boolean(value?.from && value?.to);
  const buttonText = isFilterActive
    ? `${format(parseYMDLocal(value.from)!, "MMM d, yyyy")} to ${format(
        parseYMDLocal(value.to)!,
        "MMM d, yyyy"
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
