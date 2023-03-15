import { FC, useState } from "react";
import { Menu, MenuItem, ListItemText } from "@mui/material";

import { FilterButton } from "./FilterButton";

interface Option {
  text: string;
  value: string;
}
interface GenericFilterProps {
  defaultButtonText: string;
  options: Option[];
  value: string;
  onChange: (filter: string | number) => void;
  filterId?: string;
}
export const GenericFilter: FC<GenericFilterProps> = ({
  defaultButtonText,
  options,
  value,
  onChange,
  filterId = "genericFilter",
}) => {
  const [menuAnchorEl, setMenuAnchorEl] = useState<HTMLButtonElement | null>(
    null
  );

  const handleOpenMenuClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    setMenuAnchorEl(e.currentTarget);
  };

  const handleFilterSelect = (filter: string | number) => {
    setMenuAnchorEl(null);
    onChange(filter);
  };

  const buttonText = Boolean(value)
    ? options?.find((option) => option.value === value).text
    : defaultButtonText;

  return (
    <FilterButton
      isFilterActive={Boolean(value)}
      buttonText={buttonText}
      onOpenMenu={handleOpenMenuClick}
      onRemoveFilter={() => onChange("")}
      filterId={filterId}
    >
      <Menu
        open={Boolean(menuAnchorEl)}
        anchorEl={menuAnchorEl}
        onClose={() => setMenuAnchorEl(null)}
        PaperProps={{
          sx: {
            mt: 1,
          },
        }}
      >
        {options?.map((option, index) => (
          <MenuItem
            key={index}
            sx={{
              height: "40px",
            }}
            onClick={() => handleFilterSelect(option.value)}
            selected={Boolean(value) ? option.value === value : index === 0}
            data-cy={`filter_value_${option.value}`}
          >
            <ListItemText>{option.text}</ListItemText>
          </MenuItem>
        ))}
      </Menu>
    </FilterButton>
  );
};
