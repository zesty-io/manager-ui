import { FC, useState } from "react";
import { Button, Box, MenuItem, Menu } from "@mui/material";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import { useSelector, useDispatch } from "react-redux";
import { AppState } from "../../../../../../shell/store/types";
import { MediaSortOrder } from "../../../../../../shell/store/media-revamp";
import { useParams } from "../../../../../../shell/hooks/useParams";

export const Sort: FC = () => {
  const dispatch = useDispatch();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const [params, setParams] = useParams();
  const handleClose = () => {
    setAnchorEl(null);
  };
  type SortOrder = "AtoZ" | "ZtoA" | "dateadded";
  const handleChange = (sortOrder: SortOrder) => {
    //dispatch(setSortOrder(sortOrder));
    setParams(sortOrder, "sort");
    handleClose();
  };
  return (
    <>
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
        <MenuItem onClick={() => handleChange("dateadded")}>
          Date Added
        </MenuItem>
        <MenuItem onClick={() => handleChange("AtoZ")}>Name (A to Z)</MenuItem>
        <MenuItem onClick={() => handleChange("ZtoA")}>Name (Z to A)</MenuItem>
      </Menu>
    </>
  );
};
