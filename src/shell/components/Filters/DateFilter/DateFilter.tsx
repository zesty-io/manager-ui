import { Dispatch, FC, useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Menu, MenuItem, ListItemText, Divider } from "@mui/material";
import ChevronRightOutlinedIcon from "@mui/icons-material/ChevronRightOutlined";
import { format, parse } from "date-fns";

import { FilterButton } from "../FilterButton";
import { DateFilterModal } from "./DateFilterModal";
import {
  PresetType,
  DateFilterModalType,
  DateFilterValue,
  DateRangeFilterValue,
} from "./types";
import { DateRangeFilterModal } from "./DateRangeFilterModal";

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
  defaultButtonText,
  clearable = true,
  hideCustomDates = false,
  extraPresets = [],
}) => {
  const { t } = useTranslation();
  const [calendarModalType, setCalendarModalType] =
    useState<DateFilterModalType>("");
  const [menuAnchorEl, setMenuAnchorEl] = useState<HTMLButtonElement | null>(
    null
  );
  const isFilterMenuOpen = Boolean(menuAnchorEl);

  const resolvedDefaultText = defaultButtonText ?? t("shell.dateUpdated");

  const PRESET_DATES: PresetDate[] = [
    { text: t("shell.dateToday"), value: "today" },
    { text: t("shell.dateYesterday"), value: "yesterday" },
    { text: t("shell.dateLast7Days"), value: "last_7_days" },
    { text: t("shell.dateLast14Days"), value: "last_14_days" },
    { text: t("shell.dateLast30Days"), value: "last_30_days" },
    { text: t("shell.dateLast3Months"), value: "last_3_months" },
    { text: t("shell.dateLast12Months"), value: "last_12_months" },
  ];

  const CUSTOM_DATES: CustomDate[] = [
    { text: t("shell.dateOn"), value: "on" },
    { text: t("shell.dateBefore"), value: "before" },
    { text: t("shell.dateAfter"), value: "after" },
  ];

  const fmt = (yyyyMmDd: string) =>
    format(parse(yyyyMmDd, "yyyy-MM-dd", new Date()), "MMM d, yyyy");

  const activeFilterText = useMemo(() => {
    switch (value?.type) {
      case "preset": {
        const match = [...PRESET_DATES, ...extraPresets].find(
          (date) => date.value === value?.value
        );
        return match?.text;
      }
      case "on":
        return t("shell.dateOnValue", { date: fmt(value?.value as string) });
      case "before":
        return t("shell.dateBeforeValue", {
          date: fmt(value?.value as string),
        });
      case "after":
        return t("shell.dateAfterValue", { date: fmt(value?.value as string) });
      case "daterange": {
        const dateRange = value?.value as DateRangeFilterValue;
        return t("shell.dateRangeValue", {
          from: fmt(dateRange?.from),
          to: fmt(dateRange?.to),
        });
      }
      default:
        return resolvedDefaultText;
    }
  }, [value, resolvedDefaultText, extraPresets, t]);

  const handleOpenMenuClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    setMenuAnchorEl(e.currentTarget);
  };

  const handleFilterSelect = ({ type, value }: FilterSelectParam) => {
    if (menuAnchorEl) setMenuAnchorEl(null);

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
            ? format(value as Date, "yyyy-MM-dd")
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
        isFilterActive={Boolean(activeFilterText !== resolvedDefaultText)}
        buttonText={activeFilterText}
        onOpenMenu={handleOpenMenuClick}
        onRemoveFilter={() => {
          onChange({ type: "", value: "" });
        }}
      >
        <Menu
          data-cy="DateFilterMenu"
          open={isFilterMenuOpen}
          anchorEl={menuAnchorEl}
          onClose={() => setMenuAnchorEl(null)}
          PaperProps={{ sx: { mt: 1 } }}
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
                onClick={() =>
                  handleFilterSelect({ type: "preset", value: date.value })
                }
                sx={{ height: ITEM_HEIGHT }}
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
                    sx={{ height: ITEM_HEIGHT }}
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
                    onClick={() =>
                      handleFilterSelect({ type: "preset", value: date.value })
                    }
                    sx={{ height: ITEM_HEIGHT }}
                  >
                    <ListItemText>{date.text}</ListItemText>
                  </MenuItem>
                );
              })
            : null}
          {withDateRange && (
            <MenuItem
              selected={value?.type === "daterange"}
              sx={{ height: ITEM_HEIGHT }}
              onClick={() => handleOpenCalendarModal("daterange")}
            >
              <ListItemText>{t("shell.customDateRange")}</ListItemText>
              <ChevronRightOutlinedIcon color="action" />
            </MenuItem>
          )}
        </Menu>
      </FilterButton>

      {Boolean(calendarModalType) && calendarModalType !== "daterange" && (
        <DateFilterModal
          onClose={() => setCalendarModalType("")}
          onDateChange={({ type, date }) => {
            handleFilterSelect({ type, value: date });
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
            handleFilterSelect({ type, value: date });
          }}
        />
      )}
    </>
  );
};
