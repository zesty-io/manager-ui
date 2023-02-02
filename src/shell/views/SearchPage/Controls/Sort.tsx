import { FC, useState } from "react";
import { Button, Box, MenuItem, Menu } from "@mui/material";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import { useSelector, useDispatch } from "react-redux";
import { AppState } from "../../../store/types";
import { useParams } from "../../../hooks/useParams";

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
  type SortOrder = "AtoZ" | "ZtoA" | "dateadded" | "datemodified";
  const sortOrder: SortOrder = params.get("sort") as SortOrder;
  const handleChange = (sortOrder: SortOrder) => {
    //dispatch(setSortOrder(sortOrder));
    setParams(sortOrder, "sort");
    handleClose();
  };

  const getDisplayName = (sortOrder: SortOrder) => {
    switch (sortOrder) {
      case "AtoZ":
        return "Name (A to Z)";
      case "ZtoA":
        return "Name (Z to A)";
      case "dateadded":
        return "Most Recently Added";
      case "datemodified":
      default:
        return "Most Recently Modified";
    }
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
          minWidth: "240px",
        }}
      >
        Sort: {getDisplayName(sortOrder)}
      </Button>
      <Menu open={open} onClose={handleClose} anchorEl={anchorEl}>
        <MenuItem onClick={() => handleChange("datemodified")}>
          Most Recently Modified
        </MenuItem>
        <MenuItem onClick={() => handleChange("dateadded")}>
          Most Recently Added
        </MenuItem>
        <MenuItem onClick={() => handleChange("AtoZ")}>Name (A to Z)</MenuItem>
        <MenuItem onClick={() => handleChange("ZtoA")}>Name (Z to A)</MenuItem>
      </Menu>
    </>
  );
};
