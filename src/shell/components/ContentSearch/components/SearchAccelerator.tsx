import React from "react";
import { ListItem, ListSubheader, Button, SvgIcon } from "@mui/material";

import { SEARCH_ACCELERATORS } from "./config";

export const SearchAccelerator = () => {
  return (
    <>
      <ListSubheader
        sx={{
          fontSize: "12px",
          fontWeight: 600,
          lineHeight: "18px",
          letterSpacing: "0.15px",
        }}
      >
        I'm looking for...
      </ListSubheader>
      <ListItem
        sx={{
          gap: 1,
        }}
      >
        {Object.entries(SEARCH_ACCELERATORS)?.map(([key, value]) => (
          <Button
            variant="contained"
            size="small"
            sx={{
              height: "24px",
              letterSpacing: "0.16px",
              lineHeight: "18px",
              fontSize: "13px",
              fontWeight: 400,
            }}
            startIcon={<SvgIcon component={value.icon} />}
          >
            {value.text}
          </Button>
        ))}
      </ListItem>
    </>
  );
};
