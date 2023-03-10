import { Dispatch, FC, useState, useMemo } from "react";
import { Menu, MenuItem, ListItemText, Divider } from "@mui/material";

import { FilterButton } from "../FilterButton";
import { DateFilterModal } from "./DateFilterModal";
import { PresetType, DateFilterModalType, DateFilterValue } from "./types";
import moment from "moment-timezone";

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
  {
    text: "Custom date range",
    value: "daterange",
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
  value: Date | PresetType;
}
interface DateFilterProps {
  value: DateFilterValue;
  onChange: (filter: DateFilterValue) => void;
}
export const DateFilter: FC<DateFilterProps> = ({ onChange, value }) => {
  const [calendarModalType, setCalendarModalType] =
    useState<DateFilterModalType>("");
  const [menuAnchorEl, setMenuAnchorEl] = useState<HTMLButtonElement | null>(
    null
  );
  const isFilterMenuOpen = Boolean(menuAnchorEl);

  const activeFilterText = useMemo(() => {
    switch (value?.type) {
      case "preset":
        const match = PRESET_DATES.find((date) => date.value === value?.value);
        return match?.text;

      case "on":
        return `On ${moment(value?.value).format("MMM D, YYYY")}`;

      case "before":
        return `Before ${moment(value?.value).format("MMM D, YYYY")}`;

      case "after":
        return `After ${moment(value?.value).format("MMM D, YYYY")}`;

      default:
        return "Last Updated";
    }
  }, [value]);

  const handleOpenMenuClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    setMenuAnchorEl(e.currentTarget);
  };

  const handleFilterSelect = ({ type, value }: FilterSelectParam) => {
    if (menuAnchorEl) {
      setMenuAnchorEl(null);
    }

    onChange({
      type,
      value:
        typeof value === "object" ? moment(value).format("YYYY-MM-DD") : value,
    });
  };

  const handleOpenCalendarModal = (type: DateFilterModalType) => {
    setMenuAnchorEl(null);
    setCalendarModalType(type);
  };

  return (
    <>
      <FilterButton
        isFilterActive={Boolean(activeFilterText !== "Last Updated")}
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
          {CUSTOM_DATES.map((date) => {
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
        </Menu>
      </FilterButton>
      {Boolean(calendarModalType) && (
        <DateFilterModal
          onClose={() => setCalendarModalType("")}
          onDateChange={({ type, date }) => {
            handleFilterSelect({
              type: type,
              value: date,
            });
          }}
          type={calendarModalType}
          date={value?.type !== "preset" ? value?.value : ""}
        />
      )}
    </>
  );
};
