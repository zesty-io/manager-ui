import React from "react";
import { Popper, Paper } from "@mui/material";
import { theme } from "@zesty-io/material";

type MentionListProps = {
  anchorEl: Element;
  onClose: () => void;
  onSelect: () => void;
};
export const MentionList = ({
  anchorEl,
  onClose,
  onSelect,
}: MentionListProps) => {
  return (
    <Popper
      open
      placement="bottom-start"
      anchorEl={anchorEl}
      sx={{
        zIndex: theme.zIndex.modal,
      }}
    >
      <Paper>Hello</Paper>
    </Popper>
  );
};
