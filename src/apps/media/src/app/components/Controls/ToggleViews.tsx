import { FC, useState } from "react";
import { Box, ToggleButton, ToggleButtonGroup } from "@mui/material";
import ListIcon from "@mui/icons-material/List";
import GridViewIcon from "@mui/icons-material/GridView";
import {
  State,
  setCurrentMediaView,
} from "../../../../../../shell/store/media-revamp";
import { useSelector, useDispatch } from "react-redux";

export const ToggleViews = () => {
  const dispatch = useDispatch();
  const currentMediaView = useSelector(
    (state: { mediaRevamp: State }) => state.mediaRevamp.currentMediaView
  );

  return (
    <ToggleButtonGroup
      value={currentMediaView}
      size="small"
      exclusive
      onChange={(e, val) => dispatch(setCurrentMediaView(val))}
      color="primary"
    >
      <ToggleButton value="grid">
        <GridViewIcon fontSize="inherit" />
      </ToggleButton>
      <ToggleButton value="list">
        <ListIcon fontSize="inherit" />
      </ToggleButton>
    </ToggleButtonGroup>
  );
};
