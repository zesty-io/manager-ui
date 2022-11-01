import { FC, useState } from "react";
import { Button, Box, Select, InputLabel, MenuItem, Menu } from "@mui/material";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import { useSelector, useDispatch } from "react-redux";
import { AppState } from "../../../../../../shell/store/types";
import { theme } from "@zesty-io/material";
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
        padding: "12px 24px 12px 24px",
      }}
    >
      <Box
        sx={{
          gap: "12px",
          left: "24px",
          display: "flex",
          flexDirection: "row",
          alignItems: "flex-start",
          padding: "0px",
          height: "28px",
          flex: "none",
        }}
      >
        <Button
          endIcon={<ArrowDropDownIcon />}
          onClick={handleClick}
          variant="outlined"
          disableTouchRipple
          disableFocusRipple
          disableRipple
          sx={{
            color: "grey.600",
            border: `1px solid ${theme.palette.grey[100]}`,
            borderRadius: "4px",
          }}
        >
          Sort By
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
    </Box>
  );
};
