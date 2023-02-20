import { Dispatch, FC, useState, useMemo } from "react";
import { Menu, MenuItem, ListItemText, Divider } from "@mui/material";

import { FilterButton } from "./FilterButton";

const PRESET_DATES = [
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
const CUSTOM_DATES = [
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

interface DateFilter {
  lastUpdated: string;
}
interface UserFilterProps {
  value: string;
  onChange: Dispatch<DateFilter>;
}
export const DateFilter: FC<UserFilterProps> = () => {
  const [filter, setFilter] = useState("");
  const [menuAnchorEl, setMenuAnchorEl] = useState<HTMLButtonElement | null>(
    null
  );
  const isFilterMenuOpen = Boolean(menuAnchorEl);

  const handleOpenMenuClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    setMenuAnchorEl(e.currentTarget);
  };

  return (
    <FilterButton
      isFilterActive={false}
      buttonText="Last Updated"
      onOpenMenu={handleOpenMenuClick}
      onRemoveFilter={() => {}}
    >
      <Menu
        open={isFilterMenuOpen}
        anchorEl={menuAnchorEl}
        onClose={() => setMenuAnchorEl(null)}
      >
        {PRESET_DATES.map((date) => {
          return (
            <MenuItem key={date.value}>
              <ListItemText>{date.text}</ListItemText>
            </MenuItem>
          );
        })}
        <Divider />
        {CUSTOM_DATES.map((date) => {
          return (
            <MenuItem key={date.value}>
              <ListItemText>{date.text}</ListItemText>
            </MenuItem>
          );
        })}
      </Menu>
    </FilterButton>
  );
};
