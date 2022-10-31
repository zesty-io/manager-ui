import { FC } from "react";
import { Button, Box, Select, InputLabel, MenuItem } from "@mui/material";
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

  return (
    <Box>
      <Button endIcon={<ArrowDropDownIcon />}>Sort by</Button>
      <InputLabel id="media-sort-by">Sort by</InputLabel>
      <Select
        labelId="media-sort-by"
        value={sortOrder}
        onChange={(evt) =>
          dispatch(setSortOrder(evt.target.value as MediaSortOrder))
        }
      >
        <MenuItem value="createdDesc">Date Added</MenuItem>
        <MenuItem value="alphaAsc">Name (A to Z)</MenuItem>
        <MenuItem value="alphaDesc">Name (Z to A)</MenuItem>
      </Select>
    </Box>
  );
};
