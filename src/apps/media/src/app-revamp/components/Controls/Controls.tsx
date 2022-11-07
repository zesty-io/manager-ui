import { FC } from "react";
import { Box } from "@mui/material";
import { Sort } from "./Sort";
import { FiletypeFilter } from "./FiletypeFilter";

export const Controls: FC = () => {
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
        <FiletypeFilter />
      </Box>
    </Box>
  );
};
