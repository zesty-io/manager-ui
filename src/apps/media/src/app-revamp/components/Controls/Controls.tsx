import { FC } from "react";
import { Box } from "@mui/material";
import { Sort } from "./Sort";
import { FiletypeFilter } from "./FiletypeFilter";

// The final product will always show all controls in all views, but for now
// we're only showing the filetype filter in the all media view
export type Controls = { showFiletypeFilter?: boolean };
export const Controls: FC<Controls> = ({ showFiletypeFilter = false }) => {
  return (
    <Box
      sx={{
        px: 3,
        mb: 1.5,
        // Set static height to avoid fractional pixel visual issues with media grid caused by default MUI small buttons
        height: "28px",
      }}
    >
      <Box
        sx={{
          gap: 1.5,
          display: "flex",
        }}
      >
        <Sort />
        {showFiletypeFilter && <FiletypeFilter />}
      </Box>
    </Box>
  );
};
