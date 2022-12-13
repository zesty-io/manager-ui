import { FC } from "react";
import { Box } from "@mui/material";
import { Sort } from "./Sort";
import { FiletypeFilter } from "./FiletypeFilter";
import { DateRangeFilter } from "./DateFilter";
import { ToggleViews } from "./ToggleViews";

export type ControlsProps = {
  showFilters?: boolean;
};
export const Controls: FC<ControlsProps> = ({ showFilters = true }) => {
  return (
    <Box
      sx={{
        px: 3,
        mb: 3,
        // Set static height to avoid fractional pixel visual issues with media grid caused by default MUI small buttons
        height: "28px",
      }}
    >
      <Box sx={{ display: "flex", justifyContent: "space-between" }}>
        <Box
          sx={{
            gap: 1.5,
            display: "flex",
          }}
        >
          {showFilters && (
            <>
              <Sort />
              <FiletypeFilter />
              <DateRangeFilter />
            </>
          )}
        </Box>
        <ToggleViews />
      </Box>
    </Box>
  );
};
