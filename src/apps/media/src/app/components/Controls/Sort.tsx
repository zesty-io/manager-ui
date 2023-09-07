import { FC, useState } from "react";
import { Button, Box, MenuItem, Menu } from "@mui/material";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import { useSelector, useDispatch } from "react-redux";
import { AppState } from "../../../../../../shell/store/types";
import { MediaSortOrder } from "../../../../../../shell/store/media-revamp";
import { useParams } from "../../../../../../shell/hooks/useParams";
import { FilterButton } from "../../../../../../shell/components/Filters";

type SortOrder = "AtoZ" | "ZtoA" | "dateadded";
const SORT_ORDER: Record<SortOrder, string> = {
  dateadded: "Date Added",
  AtoZ: "Name (A to Z)",
  ZtoA: "Name (Z to A)",
} as const;
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
  const handleChange = (sortOrder: SortOrder) => {
    //dispatch(setSortOrder(sortOrder));
    setParams(sortOrder, "sort");
    handleClose();
  };

  return (
    <>
      <FilterButton
        filterId="sortBy"
        isFilterActive={false}
        buttonText={`Sort: ${
          SORT_ORDER[params.get("sort") as SortOrder] ?? SORT_ORDER.dateadded
        }`}
        onOpenMenu={handleClick}
        onRemoveFilter={() => {}}
      />
      <Menu open={open} onClose={handleClose} anchorEl={anchorEl}>
        {Object.entries(SORT_ORDER).map(([key, value]) => (
          <MenuItem
            onClick={() => handleChange(key as SortOrder)}
            selected={
              key === "dateadded"
                ? !params.get("sort") || params.get("sort") === key
                : params.get("sort") === key
            }
          >
            {value}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};
