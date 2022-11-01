import { FC, useState } from "react";
import { Button, Box, MenuItem, Menu } from "@mui/material";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import { useSelector, useDispatch } from "react-redux";
import { AppState } from "../../../../../../shell/store/types";
import {
  MediaSortOrder,
  setSortOrder,
} from "../../../../../../shell/store/media-revamp";

export const Controls: FC = () => {
  const dispatch = useDispatch();
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
        px: 3,
        mb: 1.5,
      }}
    >
      <Box
        sx={{
          gap: 1.5,
          display: "flex",
        }}
      >
        <Button
          endIcon={<ArrowDropDownIcon />}
          onClick={handleClick}
          variant="outlined"
          size="small"
          color="inherit"
          sx={{
            py: "1px",
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
