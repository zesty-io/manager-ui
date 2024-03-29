import { Dispatch, FC, useState, useMemo } from "react";
import { Menu, MenuItem, ListItemText, Divider } from "@mui/material";
import ChevronRightOutlinedIcon from "@mui/icons-material/ChevronRightOutlined";
import moment from "moment-timezone";

import { FilterButton } from "../FilterButton";
import { DateFilterModal } from "./DateFilterModal";
import {
  PresetType,
  DateFilterModalType,
  DateFilterValue,
  DateRangeFilterValue,
} from "./types";
import { DateRangeFilterModal } from "./DateRangeFilterModal";

const PRESET_DATES: PresetDate[] = [
  {
    text: "Today",
    value: "today",
  },
  {
    text: "Yesterday",
    value: "yesterday",
  },
  {
    text: "Last 7 days",
    value: "last_7_days",
  },
  {
    text: "Last 14 days",
    value: "last_14_days",
  },
  {
    text: "Last 30 days",
    value: "last_30_days",
  },
  {
    text: "Last 3 months",
    value: "last_3_months",
  },
  {
    text: "Last 12 months",
    value: "last_12_months",
  },
];
const CUSTOM_DATES: CustomDate[] = [
  {
    text: "On...",
    value: "on",
  },
  {
    text: "Before...",
    value: "before",
  },
  {
    text: "After...",
    value: "after",
  },
];
const ITEM_HEIGHT = 40;

interface PresetDate {
  text: string;
  value: PresetType;
}
interface CustomDate {
  text: string;
  value: DateFilterModalType;
}
interface FilterSelectParam {
  type: "preset" | DateFilterModalType;
  value: Date | PresetType | DateRangeFilterValue;
}
interface DateFilterProps {
  value: DateFilterValue;
  onChange: (filter: DateFilterValue) => void;
  withDateRange?: boolean;
  defaultButtonText?: string;
  clearable?: boolean;
  hideCustomDates?: boolean;
  extraPresets?: PresetDate[];
}
export const DateFilter: FC<DateFilterProps> = ({
  onChange,
  value,
  withDateRange = false,
  defaultButtonText = "Date Updated",
  clearable = true,
  hideCustomDates = false,
  extraPresets = [],
}) => {
  const [calendarModalType, setCalendarModalType] =
    useState<DateFilterModalType>("");
  const [menuAnchorEl, setMenuAnchorEl] = useState<HTMLButtonElement | null>(
    null
  );
  const isFilterMenuOpen = Boolean(menuAnchorEl);

  const activeFilterText = useMemo(() => {
    switch (value?.type) {
      case "preset":
        const match = [...PRESET_DATES, ...extraPresets].find(
          (date) => date.value === value?.value
        );
        return match?.text;

      case "on":
        return `On ${moment(value?.value as string).format("MMM D, YYYY")}`;

      case "before":
        return `Before ${moment(value?.value as string).format("MMM D, YYYY")}`;

      case "after":
        return `After ${moment(value?.value as string).format("MMM D, YYYY")}`;

      case "daterange":
        const dateRange = value?.value as DateRangeFilterValue;

        return `${moment(dateRange?.from).format("MMM D, YYYY")} to ${moment(
          dateRange?.to
        ).format("MMM D, YYYY")}`;

      default:
        return defaultButtonText;
    }
  }, [value]);

  const handleOpenMenuClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    setMenuAnchorEl(e.currentTarget);
  };

  const handleFilterSelect = ({ type, value }: FilterSelectParam) => {
    if (menuAnchorEl) {
      setMenuAnchorEl(null);
    }

    if (type === "daterange") {
      onChange({
        type,
        value: value as DateRangeFilterValue,
      });
    } else {
      onChange({
        type,
        value:
          typeof value === "object"
            ? moment(value as Date).format("YYYY-MM-DD")
            : value,
      });
    }
  };

  const handleOpenCalendarModal = (type: DateFilterModalType) => {
    setMenuAnchorEl(null);
    setCalendarModalType(type);
  };

  return (
    <>
      <FilterButton
        clearable={clearable}
        filterId="date"
        isFilterActive={Boolean(activeFilterText !== defaultButtonText)}
        buttonText={activeFilterText}
        onOpenMenu={handleOpenMenuClick}
        onRemoveFilter={() => {
          onChange({
            type: "",
            value: "",
          });
        }}
      >
        <Menu
          data-cy="DateFilterMenu"
          open={isFilterMenuOpen}
          anchorEl={menuAnchorEl}
          onClose={() => setMenuAnchorEl(null)}
          PaperProps={{
            sx: {
              mt: 1,
            },
          }}
        >
          {PRESET_DATES.map((date, index) => {
            const isPresetSelected =
              value.type && value.value
                ? value.type === "preset" && value.value === date.value
                : index === 0;

            return (
              <MenuItem
                selected={isPresetSelected}
                key={date.value}
                onClick={() => {
                  handleFilterSelect({
                    type: "preset",
                    value: date.value,
                  });
                }}
                sx={{
                  height: ITEM_HEIGHT,
                }}
              >
                <ListItemText>{date.text}</ListItemText>
              </MenuItem>
            );
          })}
          <Divider />
          {hideCustomDates
            ? null
            : CUSTOM_DATES.map((date) => {
                const isCustomDateSelected = value.type === date.value;

                return (
                  <MenuItem
                    selected={isCustomDateSelected}
                    key={date.value}
                    onClick={() => handleOpenCalendarModal(date.value)}
                    sx={{
                      height: ITEM_HEIGHT,
                    }}
                  >
                    <ListItemText>{date.text}</ListItemText>
                  </MenuItem>
                );
              })}
          {extraPresets.length
            ? extraPresets.map((date, index) => {
                const isPresetSelected =
                  value.type && value.value
                    ? value.type === "preset" && value.value === date.value
                    : index === 0;

                return (
                  <MenuItem
                    selected={isPresetSelected}
                    key={date.value}
                    onClick={() => {
                      handleFilterSelect({
                        type: "preset",
                        value: date.value,
                      });
                    }}
                    sx={{
                      height: ITEM_HEIGHT,
                    }}
                  >
                    <ListItemText>{date.text}</ListItemText>
                  </MenuItem>
                );
              })
            : null}
          {withDateRange && (
            <MenuItem
              selected={value?.type === "daterange"}
              sx={{
                height: ITEM_HEIGHT,
              }}
              onClick={() => handleOpenCalendarModal("daterange")}
            >
              <ListItemText>Custom date range</ListItemText>
              <ChevronRightOutlinedIcon color="action" />
            </MenuItem>
          )}
        </Menu>
      </FilterButton>
      {Boolean(calendarModalType) && calendarModalType !== "daterange" && (
        <DateFilterModal
          onClose={() => setCalendarModalType("")}
          onDateChange={({ type, date }) => {
            handleFilterSelect({
              type: type,
              value: date,
            });
          }}
          type={calendarModalType}
          date={
            ["on", "before", "after"].includes(value?.type)
              ? (value?.value as string)
              : ""
          }
        />
      )}
      {Boolean(calendarModalType) && calendarModalType === "daterange" && (
        <DateRangeFilterModal
          date={
            value?.type === "daterange"
              ? (value?.value as DateRangeFilterValue)
              : { from: null, to: null }
          }
          onClose={() => setCalendarModalType("")}
          onDateChange={({ type, date }) => {
            handleFilterSelect({
              type,
              value: date,
            });
          }}
        />
      )}
    </>
  );
};
