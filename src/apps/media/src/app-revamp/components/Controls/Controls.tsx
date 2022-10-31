import { FC, useState } from "react";
import { Button, Box, Select, InputLabel, MenuItem, Menu } from "@mui/material";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import { useSelector, useDispatch } from "react-redux";
import { AppState } from "../../../../../../shell/store/types";
import {
  MediaSortOrder,
  setSortOrder,
} from "../../../../../../shell/store/media-revamp";

export const Controls: FC = () => {
  const dispatch = useDispatch();
  const sortOrder = useSelector(
    (state: AppState) => state.mediaRevamp.sortOrder
  );
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  const handleChange = (sortOrder: MediaSortOrder) => {
    dispatch(setSortOrder(sortOrder));
    handleClose();
  };

  return (
    <Box
      sx={{
        height: "64px",
        padding: "12px, 24px, 12px, 24px",
      }}
    >
      <Button endIcon={<ArrowDropDownIcon />} onClick={handleClick}>
        Sort by
      </Button>
      <Menu open={open} onClose={handleClose} anchorEl={anchorEl}>
        <MenuItem onClick={() => handleChange("createdDesc")}>
          Date Added
        </MenuItem>
        <MenuItem onClick={() => handleChange("alphaAsc")}>
          Name (A to Z)
        </MenuItem>
        <MenuItem onClick={() => handleChange("alphaDesc")}>
          Name (Z to A)
        </MenuItem>
      </Menu>
    </Box>
  );
};
