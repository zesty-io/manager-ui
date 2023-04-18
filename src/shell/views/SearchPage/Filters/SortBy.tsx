import { FC, useState } from "react";
import { Menu, MenuItem } from "@mui/material";

import { FilterButton } from "../../../components/Filters";

export type FilterValues = "modified" | "created" | "AtoZ" | "ZtoA";
const OPTIONS: { [key in FilterValues]: string } = Object.freeze({
  modified: "Most Recently Modified",
  created: "Most Recently Created",
  AtoZ: "Name (A to Z)",
  ZtoA: "Name (Z to A)",
});

interface SortBy {
  onChange: (value: FilterValues) => void;
  activeFilter?: FilterValues;
}
export const SortBy: FC<SortBy> = ({ onChange, activeFilter = "modified" }) => {
  const [anchorRef, setAnchorRef] = useState<HTMLElement | null>(null);

  return (
    <>
      <FilterButton
        isFilterActive={false}
        buttonText={`Sort: ${OPTIONS[activeFilter]}`}
        onOpenMenu={(e: React.MouseEvent<HTMLButtonElement>) =>
          setAnchorRef(e.currentTarget)
        }
        onRemoveFilter={() => {}} // Setting to empty as this is required by the component but not needed here
      />
      <Menu
        anchorEl={anchorRef}
        open={Boolean(anchorRef)}
        onClose={() => setAnchorRef(null)}
        PaperProps={{
          sx: {
            mt: 1,
          },
        }}
      >
        {Object.entries(OPTIONS).map(([key, value]) => (
          <MenuItem
            sx={{
              height: 40,
            }}
            onClick={() => onChange(key as FilterValues)}
          >
            {value}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};
