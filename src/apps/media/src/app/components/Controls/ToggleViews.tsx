import { FC, useState } from "react";
import { Box, ToggleButton, ToggleButtonGroup } from "@mui/material";
import ListIcon from "@mui/icons-material/List";
import GridViewIcon from "@mui/icons-material/GridView";

export const ToggleViews = () => {
  const [currentDisplay, setCurrentDisplay] = useState("grid");

  return (
    <ToggleButtonGroup
      value={currentDisplay}
      size="small"
      exclusive
      onChange={(e, val) => setCurrentDisplay(val)}
    >
      <ToggleButton value="grid">
        <GridViewIcon />
      </ToggleButton>
      <ToggleButton value="list">
        <ListIcon />
      </ToggleButton>
    </ToggleButtonGroup>
  );
};
